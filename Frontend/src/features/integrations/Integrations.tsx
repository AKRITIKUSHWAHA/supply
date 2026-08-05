import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plug, CheckCircle2, AlertCircle, Clock, Settings, RefreshCw, Plus, Check, Globe, Database, FileText, Lock, Key, Server, Terminal, ShieldCheck, Play, ArrowRight, Layers, ExternalLink, X, Zap } from 'lucide-react'
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

  // E2E Pipeline Test State
  const [runningE2E, setRunningE2E] = useState(false)
  const [e2eReport, setE2EReport] = useState<any | null>(null)
  const [showE2EModal, setShowE2EModal] = useState(false)
  const [activeStep, setActiveStep] = useState<number>(0)

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

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/integrations')
      const data = await res.json()
      if (data.typesList) setTypesList(data.typesList)
      if (data.events) setEvents(data.events)
    } catch (err) {
      console.error('Failed to fetch integrations', err)
    }
  }

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleRunE2EPipeline = async () => {
    setRunningE2E(true)
    setActiveStep(1)
    try {
      setTimeout(() => setActiveStep(2), 1200)
      setTimeout(() => setActiveStep(3), 2400)

      const res = await fetch('http://localhost:5000/api/integrations/e2e-pipeline-test', {
        method: 'POST',
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setE2EReport(data)
        setShowE2EModal(true)
        showNotification(`E2E Pipeline Test Passed in ${data.durationSeconds}s!`)
        fetchIntegrations()
      } else {
        alert(data.error || 'E2E Pipeline test failed')
      }
    } catch (err) {
      console.error('E2E Pipeline error:', err)
    } finally {
      setRunningE2E(false)
      setActiveStep(0)
    }
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
        }),
      })
      const updated = await res.json()
      setTypesList((prev) => prev.map((t) => (t.id === selectedType.id ? updated : t)))
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
      const res = await fetch(`http://localhost:5000/api/integrations/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: type.id }),
      })
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
        body: JSON.stringify({ newLabel, newType, newDesc }),
      })
      const data = await res.json()
      const createdItem = data.item || data
      if (createdItem && createdItem.id) {
        setTypesList((prev) => [createdItem, ...prev])
        if (data.event) setEvents((prev) => [data.event, ...prev])
        setAddModalOpen(false)
        setNewLabel('')
        setNewDesc('')
        showNotification(`New integration protocol "${createdItem.label}" created successfully!`)
      } else {
        showNotification('Failed to create integration')
      }
    } catch (err) {
      console.error(err)
      showNotification('Failed to create integration')
    }
  }

  const filteredTypes = typesList.filter((t) => {
    if (filterCategory === 'api') return t.id.startsWith('api') || t.id.startsWith('custom')
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
        title="Supplier Integration Protocols & E2E Pipeline"
        subtitle="Configure REST APIs, FTP/SFTP server feeds, CSV/XML parsers, and execute End-to-End System Pipeline tests"
        actions={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              onClick={() => {
                fetchIntegrations()
                showNotification('Integration status refreshed.')
              }}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer"
            >
              <RefreshCw size={14} /> Refresh Status
            </button>
            <button onClick={() => setAddModalOpen(true)} className="btn-primary btn-sm flex items-center justify-center gap-1.5 shadow-md">
              <Plus size={14} /> Add New Integration
            </button>
          </div>
        }
      />

      {/* END-TO-END SYSTEM PIPELINE TEST WIDGET (Step 4.2) */}
      <div className="card p-5 bg-slate-900 text-white border border-slate-800 shadow-xl space-y-4 rounded-2xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-md border border-emerald-800">
              End-to-End Pipeline Engine (Step 4.2)
            </span>
            <h3 className="text-base font-bold text-slate-100 mt-1 flex items-center gap-2">
              <Zap size={18} className="text-amber-400 animate-pulse" /> Full Integration Pipeline Runner
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Executes the complete flow: Supplier FTP Feed Import $\rightarrow$ Master Catalog PIM Processing $\rightarrow$ Multi-Storefront Direct Push Sync.</p>
          </div>

          <button
            onClick={handleRunE2EPipeline}
            disabled={runningE2E}
            className="btn-primary flex items-center gap-2 font-bold text-xs bg-emerald-600 hover:bg-emerald-500 border-none shadow-lg shadow-emerald-950/50"
          >
            {runningE2E ? <RefreshCw size={14} className="animate-spin" /> : <Play size={14} />}
            {runningE2E ? `Executing Step ${activeStep}/3...` : 'Run Full E2E Pipeline Test'}
          </button>
        </div>

        {/* Multi-Step Pipeline Visualizer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          <div className={`p-3.5 rounded-xl border transition-all ${activeStep === 1 ? 'bg-indigo-950/80 border-indigo-500 shadow-md ring-1 ring-indigo-400' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5 text-indigo-400"><Server size={14} /> STEP 1: Supplier FTP Import</span>
              {activeStep === 1 && <span className="text-[10px] bg-indigo-500 text-white px-2 py-0.5 rounded-full font-mono animate-pulse">Running</span>}
            </div>
            <p className="text-[11px] text-slate-400">Ingests raw catalog XML/CSV files from FTP/SFTP server hosts.</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${activeStep === 2 ? 'bg-amber-950/80 border-amber-500 shadow-md ring-1 ring-amber-400' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5 text-amber-400"><Layers size={14} /> STEP 2: Master Catalog PIM</span>
              {activeStep === 2 && <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-mono animate-pulse">Processing</span>}
            </div>
            <p className="text-[11px] text-slate-400">Validates SKUs, category mappings, prices, and variant attributes.</p>
          </div>

          <div className={`p-3.5 rounded-xl border transition-all ${activeStep === 3 ? 'bg-emerald-950/80 border-emerald-500 shadow-md ring-1 ring-emerald-400' : 'bg-slate-800/60 border-slate-700'}`}>
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1">
              <span className="flex items-center gap-1.5 text-emerald-400"><Globe size={14} /> STEP 3: Storefront Push Sync</span>
              {activeStep === 3 && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-mono animate-pulse">Pushing</span>}
            </div>
            <p className="text-[11px] text-slate-400">Directly pushes updates to Anchorage Medical & Unlimited Store APIs.</p>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {[
          { key: 'all',  label: 'Total Active', value: typesList.reduce((s, t) => s + t.activeCount, 0), color: 'text-primary-600 dark:text-primary-400' },
          { key: 'api',  label: 'REST APIs',     value: typesList.filter(t => t.id.startsWith('api') || t.id.startsWith('custom')).reduce((sum, t) => sum + (t.activeCount || 0), 0),  color: 'text-violet-600 dark:text-violet-400' },
          { key: 'ftp',  label: 'FTP / SFTP',    value: typesList.filter(t => t.id.startsWith('ftp') || t.id.startsWith('sftp')).reduce((sum, t) => sum + (t.activeCount || 0), 0),  color: 'text-cyan-600 dark:text-cyan-400' },
          { key: 'file', label: 'File Feeds',     value: typesList.filter(t => t.id.startsWith('csv') || t.id.startsWith('excel') || t.id.startsWith('xml')).reduce((sum, t) => sum + (t.activeCount || 0), 0), color: 'text-emerald-600 dark:text-emerald-400' },
        ].map(s => (
          <div
            key={s.key}
            onClick={() => setFilterCategory(s.key)}
            className={`card px-4 py-3 text-center sm:text-left cursor-pointer transition-all bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${filterCategory === s.key ? 'ring-2 ring-primary-500 shadow-md' : 'hover:border-slate-300'}`}
          >
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Integration Protocol Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTypes.map((type) => (
          <div key={type.id} className="card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">{type.emoji}</span>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{type.label}</h4>
                  <p className="text-[11px] text-slate-400">{type.activeCount} active connection</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleTestProtocol(type)}
                  disabled={testingId === type.id}
                  className="btn-ghost btn-xs text-emerald-600"
                  title="Test Protocol"
                >
                  {testingId === type.id ? <RefreshCw size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                </button>
                <button onClick={() => openConfig(type)} className="btn-ghost btn-xs text-slate-500">
                  <Settings size={14} />
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{type.description}</p>

            <div className="flex flex-wrap gap-1 pt-1">
              {type.features.map((f) => (
                <span key={f} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded font-mono">
                  {f}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* E2E PIPELINE REPORT MODAL */}
      {showE2EModal && e2eReport && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <CheckCircle2 size={20} /> E2E System Pipeline Execution Report
              </h3>
              <button onClick={() => setShowE2EModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center justify-between">
              <div><strong>Pipeline Status:</strong> PASSED</div>
              <div><strong>Execution Time:</strong> {e2eReport.durationSeconds} seconds</div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-slate-800 dark:text-slate-200">Pipeline Execution Steps:</h4>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1 text-slate-700 dark:text-slate-300">
                <div><strong>1. Supplier Ingestion:</strong> {e2eReport.summary?.step1_ftpImport}</div>
                <div><strong>2. Master PIM Processing:</strong> {e2eReport.summary?.step2_pimProcessing}</div>
                <div><strong>3. Storefront API Push:</strong> {e2eReport.summary?.step3_storefrontPush}</div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">Execution Log Console:</h4>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-40 border border-slate-800">
                {e2eReport.executionLogs?.join('\n')}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setShowE2EModal(false)} className="btn-primary w-full">Close Report</button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIG MODAL */}
      {configOpen && selectedType && (
        <Modal
          open
          onClose={() => setConfigOpen(false)}
          title={`Configure ${selectedType.label}`}
          subtitle="Adjust rate limits, connection timeouts, and retry policies"
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Timeout (seconds)</label>
              <input type="number" className="input" value={configForm.timeoutSec} onChange={(e) => setConfigForm({ ...configForm, timeoutSec: Number(e.target.value) })} />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Rate Limit (req/hour)</label>
              <input type="number" className="input" value={configForm.rateLimitHr} onChange={(e) => setConfigForm({ ...configForm, rateLimitHr: Number(e.target.value) })} />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Max Retries</label>
              <input type="number" className="input" value={configForm.retries} onChange={(e) => setConfigForm({ ...configForm, retries: Number(e.target.value) })} />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setConfigOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleSaveConfig} className="btn-primary">Save Parameters</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ADD INTEGRATION MODAL */}
      {addModalOpen && (
        <Modal
          open
          onClose={() => setAddModalOpen(false)}
          title="Add New Supplier Integration Protocol"
          subtitle="Configure a new REST API, SFTP feed, or File Parser"
          size="md"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Protocol Name *</label>
              <input className="input" placeholder="e.g. MedTech SFTP Feed" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} required />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Protocol Type *</label>
              <select className="select font-medium" value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="api">REST API Gateway</option>
                <option value="sftp">SFTP Secure File Pull</option>
                <option value="ftp">FTP Standard File Pull</option>
                <option value="csv">CSV File Parser</option>
                <option value="xml">XML Feed Parser</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Description</label>
              <textarea className="input" rows={3} placeholder="Describe protocol details..." value={newDesc} onChange={(e) => setNewDesc(e.target.value)} />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button type="button" onClick={() => setAddModalOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Create Protocol</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
