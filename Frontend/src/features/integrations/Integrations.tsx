import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plug, CheckCircle2, AlertCircle, Clock, Settings, RefreshCw, Plus, Check, Globe, Database, FileText, Lock, Key, Server, Terminal, ShieldCheck } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface IntegrationType {
  id: string
  label: string
  emoji: string
  color: string
  description: string
  activeCount: number
  features: string[]
  timeoutSec: number
  rateLimitHr: number
  retries: number
  schedule: string
  delimiter?: string
  encoding?: string
}


export const Integrations: React.FC = () => {
  const [typesList, setTypesList] = useState<IntegrationType[]>([])
  const [configOpen, setConfigOpen] = useState(false)
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [selectedType, setSelectedType] = useState<IntegrationType | null>(null)
  
  // Test loading state per integration id
  const [testingId, setTestingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')

  // Form config state
  const [configForm, setConfigForm] = useState({
    timeoutSec: 30,
    rateLimitHr: 5000,
    retries: 3,
    schedule: 'Every 6 hours',
    delimiter: 'Comma (,)',
    encoding: 'UTF-8',
  })

  // Add Integration Form State
  const [newLabel, setNewLabel] = useState('')
  const [newType, setNewType] = useState('api')
  const [newDesc, setNewDesc] = useState('')

  // Recent events state
  const [events, setEvents] = useState<any[]>([])

  React.useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/integrations')
      const data = await res.json()
      if (data.typesList) setTypesList(data.typesList)
      if (data.events) setEvents(data.events)
    } catch (err) { console.error('Failed to fetch integrations', err) }
  }

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const openConfig = (type: IntegrationType) => {
    setSelectedType(type)
    setConfigForm({
      timeoutSec: type.timeoutSec,
      rateLimitHr: type.rateLimitHr,
      retries: type.retries,
      schedule: type.schedule,
      delimiter: type.delimiter || 'Comma (,)',
      encoding: type.encoding || 'UTF-8',
    })
    setConfigOpen(true)
  }

  const handleSaveConfig = async () => {
    if (!selectedType) return

    try {
      const res = await fetch(`http://localhost:5000/api/integrations/${selectedType.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeoutSec: Number(configForm.timeoutSec),
          rateLimitHr: Number(configForm.rateLimitHr),
          retries: Number(configForm.retries),
          schedule: configForm.schedule,
          delimiter: configForm.delimiter,
          encoding: configForm.encoding,
        })
      })
      const updated = await res.json()
      setTypesList(prev => prev.map(t => t.id === selectedType.id ? updated : t))
      setConfigOpen(false)
      showNotification(`${selectedType.label} global parameters saved successfully!`)
    } catch (err) {
      console.error(err)
      showNotification('Failed to save configuration')
    }
  }

  const handleTestProtocol = async (type: IntegrationType) => {
    setTestingId(type.id)
    try {
      const res = await fetch(`http://localhost:5000/api/integrations/${type.id}/test`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setEvents([data.event, ...events])
        showNotification(`${type.label} integration protocol test passed! Endpoint operational.`)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setTestingId(null)
    }
  }

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newLabel.trim()) return

    try {
      const res = await fetch('http://localhost:5000/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newLabel, newType, newDesc })
      })
      const data = await res.json()
      if (data.item) {
        setTypesList(prev => [data.item, ...prev])
      }
      if (data.event) {
        setEvents(prev => [data.event, ...prev])
      }
      setAddModalOpen(false)
      setNewLabel('')
      setNewDesc('')
      showNotification(`New integration protocol "${data.item?.label || newLabel}" created successfully!`)
    } catch (err) {
      console.error(err)
      showNotification('Failed to create integration')
    }
  }

  const filteredTypes = typesList.filter(t => {
    if (filterCategory === 'api') return t.id.startsWith('api') || t.id.startsWith('custom') // fallback for old custom_ ids
    if (filterCategory === 'ftp') return t.id.startsWith('ftp') || t.id.startsWith('sftp')
    if (filterCategory === 'file') return t.id.startsWith('csv') || t.id.startsWith('excel') || t.id.startsWith('xml')
    return true
  })

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Supplier Integration Protocols"
        subtitle="Configure REST APIs, FTP/SFTP server feeds, CSV/XML/Excel parsers, and connection parameters"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => {
                fetchIntegrations()
                showNotification('Integration status refreshed.')
              }}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              <RefreshCw size={14} /> <span className="hidden sm:inline">Refresh Status</span><span className="sm:hidden">Refresh</span>
            </button>
            <button
              onClick={() => setAddModalOpen(true)}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25"
            >
              <Plus size={14} /> <span className="hidden sm:inline">Add New Integration</span><span className="sm:hidden">Add Integration</span>
            </button>
          </div>
        }
      />

      {/* Summary Interactive Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { key: 'all',  label: 'Total Active', value: typesList.reduce((s, t) => s + t.activeCount, 0), color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50/40' },
          { key: 'api',  label: 'REST APIs',     value: typesList.filter(t => t.id.startsWith('api') || t.id.startsWith('custom')).reduce((sum, t) => sum + (t.activeCount || 0), 0),  color: 'text-violet-600 dark:text-violet-400',  bg: 'bg-violet-50/40' },
          { key: 'ftp',  label: 'FTP / SFTP',    value: typesList.filter(t => t.id.startsWith('ftp') || t.id.startsWith('sftp')).reduce((sum, t) => sum + (t.activeCount || 0), 0),  color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-50/40' },
          { key: 'file', label: 'File Feeds',     value: typesList.filter(t => t.id.startsWith('csv') || t.id.startsWith('excel') || t.id.startsWith('xml')).reduce((sum, t) => sum + (t.activeCount || 0), 0), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/40' },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setFilterCategory(s.key)}
            className={`card px-3 py-2.5 sm:px-5 sm:py-4 text-center sm:text-left cursor-pointer transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${filterCategory === s.key ? 'ring-2 ring-primary-500 dark:bg-slate-800 shadow-md' : 'hover:border-slate-300 dark:hover:border-slate-700'}`}
          >
            <p className={`text-xl sm:text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-2xs sm:text-xs text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration Type Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5">
        {filteredTypes.map(type => {
          const isTestingThis = testingId === type.id

          return (
            <div key={type.id} className="card p-4 sm:p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${type.color} flex items-center justify-center text-2xl shadow-sm text-white`}>
                    {type.emoji}
                  </div>
                  <Badge variant="success" dot>{type.activeCount} active</Badge>
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">{type.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">{type.description}</p>

                <div className="flex flex-wrap gap-1.5 mb-5">
                  {type.features.map(f => (
                    <span key={f} className="text-2xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md font-semibold border border-slate-200/60 dark:border-slate-700/60">{f}</span>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => openConfig(type)}
                  className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/25"
                >
                  <Settings size={13} /> Configure
                </button>
                <button
                  onClick={() => handleTestProtocol(type)}
                  disabled={isTestingThis}
                  className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
                >
                  <CheckCircle2 size={13} className={isTestingThis ? 'animate-spin text-emerald-600' : ''} />
                  {isTestingThis ? 'Testing...' : 'Test'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Integration Handshake Activity */}
      <div className="card p-4 sm:p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck size={16} className="text-primary-600 dark:text-primary-400 flex-shrink-0" /> <span className="hidden sm:inline">Recent Protocol Handshakes & Events</span><span className="sm:hidden">Recent Events</span>
          </h3>
          <button
            onClick={() => setEvents(events.slice(0, 2))}
            className="text-2xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex-shrink-0"
          >
            Clear
          </button>
        </div>
        <div className="space-y-2">
          {events.map(ev => (
            <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ev.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <Badge variant="info">{ev.type}</Badge>
              </div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex-1 break-words leading-relaxed">{ev.supplier} — <span className="text-slate-500 dark:text-slate-400 font-normal">{ev.event}</span></span>
              <span className="text-2xs text-slate-400 font-mono flex-shrink-0 self-end sm:self-auto">{ev.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ADD NEW INTEGRATION MODAL */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Supplier Integration Protocol"
        subtitle="Configure custom endpoints, FTP hosts, or REST API connections"
        size="lg"
      >
        <form onSubmit={handleAddSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Integration Protocol Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Custom GraphQL API"
              className="input"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Protocol Type</label>
            <select className="select" value={newType} onChange={e => setNewType(e.target.value)}>
              <option value="api">REST API / Webhook Endpoint</option>
              <option value="sftp">SFTP / SSH Encrypted Transfer</option>
              <option value="ftp">FTP Server Pull</option>
              <option value="csv">CSV Feed Parser</option>
              <option value="xml">XML XPath Feed</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Description & Purpose</label>
            <textarea
              rows={2}
              placeholder="Describe protocol requirements, authentication, or supplier mapping parameters..."
              className="input"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setAddModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5 shadow-md shadow-amber-500/25">
              <Plus size={14} /> Add Integration
            </button>
          </div>
        </form>
      </Modal>

      {/* CONFIGURE MODAL */}
      {selectedType && (
        <Modal
          open={configOpen}
          onClose={() => setConfigOpen(false)}
          title={`Configure ${selectedType.label}`}
          subtitle="Set global connection defaults & timeout parameters for this protocol"
          size="lg"
          footer={
            <>
              <button onClick={() => setConfigOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveConfig} className="btn-primary">Save Configuration</button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center text-xl text-white`}>
                {selectedType.emoji}
              </div>
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">{selectedType.label}</p>
                <p className="text-2xs text-slate-500">{selectedType.activeCount} active supplier connections using this protocol</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Connection Timeout (seconds)</label>
                <input
                  className="input"
                  type="number"
                  value={configForm.timeoutSec}
                  onChange={e => setConfigForm({ ...configForm, timeoutSec: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Rate Limit (requests/hour)</label>
                <input
                  className="input"
                  type="number"
                  value={configForm.rateLimitHr}
                  onChange={e => setConfigForm({ ...configForm, rateLimitHr: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Max Retry Attempts</label>
                <input
                  className="input"
                  type="number"
                  value={configForm.retries}
                  onChange={e => setConfigForm({ ...configForm, retries: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Automated Sync Schedule</label>
                <select
                  className="select"
                  value={configForm.schedule}
                  onChange={e => setConfigForm({ ...configForm, schedule: e.target.value })}
                >
                  <option>Every 6 hours</option>
                  <option>Every 12 hours</option>
                  <option>Daily at midnight</option>
                  <option>Manual trigger only</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
