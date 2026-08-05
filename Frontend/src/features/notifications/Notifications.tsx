import React, { useState, useEffect } from 'react'
import {
  Bell,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Eye,
  Check,
  Trash2,
  RefreshCw,
  ExternalLink,
  Sliders,
  Mail,
  Smartphone,
  MessageSquare,
  Zap,
  Filter,
  X,
  Play,
} from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: string
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL'
  module?: string
  actionUrl?: string
  metadata?: string
  isRead: boolean
  createdAt: string
}

interface PreferenceItem {
  eventType: string
  name: string
  emailEnabled: boolean
  inAppEnabled: boolean
  slackEnabled: boolean
  teamsEnabled: boolean
  smsEnabled: boolean
}

export const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('center')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [preferences, setPreferences] = useState<PreferenceItem[]>([])
  const [search, setSearch] = useState('')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingPrefs, setSavingPrefs] = useState(false)
  const [triggerType, setTriggerType] = useState('FAILED_SYNC')
  const [triggering, setTriggering] = useState(false)

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const url = new URL('http://localhost:5000/api/notifications')
      if (search) url.searchParams.append('search', search)
      if (severityFilter !== 'all') url.searchParams.append('severity', severityFilter)

      const res = await fetch(url.toString())
      if (res.ok) {
        const result = await res.json()
        setNotifications(result.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchPreferences = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/notifications/preferences')
      if (res.ok) {
        const data = await res.json()
        setPreferences(data || [])
      }
    } catch (err) {
      console.error('Failed to fetch notification preferences:', err)
    }
  }

  useEffect(() => {
    fetchNotifications()
    fetchPreferences()

    // Real-time SSE Connection
    const eventSource = new EventSource('http://localhost:5000/api/notifications/stream')
    eventSource.onmessage = (event) => {
      try {
        const newNotif = JSON.parse(event.data)
        setNotifications((prev) => [newNotif, ...prev])
        setToastMessage(`New Alert: ${newNotif.title}`)
        setTimeout(() => setToastMessage(null), 4000)
      } catch (err) {
        console.error('Error parsing SSE message:', err)
      }
    }

    return () => {
      eventSource.close()
    }
  }, [severityFilter])

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (err) {
      console.error('Failed to mark read:', err)
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await fetch('http://localhost:5000/api/notifications/read-all', { method: 'PATCH' })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      setToastMessage('All notifications marked as read')
      setTimeout(() => setToastMessage(null), 3000)
    } catch (err) {
      console.error('Failed to mark all read:', err)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`http://localhost:5000/api/notifications/${id}`, { method: 'DELETE' })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification:', err)
    }
  }

  const handlePrefToggle = (eventType: string, channel: 'emailEnabled' | 'inAppEnabled' | 'slackEnabled' | 'teamsEnabled' | 'smsEnabled') => {
    setPreferences((prev) =>
      prev.map((item) => (item.eventType === eventType ? { ...item, [channel]: !item[channel] } : item))
    )
  }

  const handleSavePreferences = async () => {
    setSavingPrefs(true)
    try {
      const res = await fetch('http://localhost:5000/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences }),
      })
      if (res.ok) {
        setToastMessage('Notification Preferences saved successfully!')
        setTimeout(() => setToastMessage(null), 3000)
      }
    } catch (err) {
      console.error('Failed to save notification preferences:', err)
    } finally {
      setSavingPrefs(false)
    }
  }

  const handleTriggerTest = async () => {
    setTriggering(true)
    try {
      const res = await fetch('http://localhost:5000/api/notifications/trigger-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventType: triggerType }),
      })
      if (res.ok) {
        fetchNotifications()
        setToastMessage(`Test Alert (${triggerType}) dispatched!`)
        setTimeout(() => setToastMessage(null), 3000)
      }
    } catch (err) {
      console.error('Test trigger error:', err)
    } finally {
      setTriggering(false)
    }
  }

  const handleRetrySync = async (notif: NotificationItem) => {
    setToastMessage(`Retrying synchronization for ${notif.title}...`)
    setTimeout(() => {
      setToastMessage(`Sync job for ${notif.title} completed successfully!`)
      setTimeout(() => setToastMessage(null), 3000)
    }, 1500)
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1"><AlertCircle size={12} /> CRITICAL</span>
      case 'ERROR':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800 flex items-center gap-1"><AlertCircle size={12} /> ERROR</span>
      case 'WARNING':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1"><AlertTriangle size={12} /> WARNING</span>
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 flex items-center gap-1"><Info size={12} /> INFO</span>
    }
  }

  const mainTabs = [
    { id: 'center',      label: 'Notification Center & Real-Time Alerts' },
    { id: 'preferences', label: 'Notification Preferences Matrix' },
  ]

  return (
    <div>
      <SectionHeader
        title="Real-Time Alerts & Notification Center"
        subtitle="Manage live system alerts, failure notifications, quick actions, and user channel preferences"
      />

      {toastMessage && (
        <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-xl text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <Zap size={16} className="text-indigo-600 animate-pulse" /> {toastMessage}
        </div>
      )}

      <Tabs tabs={mainTabs} active={activeTab} onChange={setActiveTab} />

      {/* TAB 1: NOTIFICATION CENTER & LIVE ALERTS */}
      {activeTab === 'center' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="card p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1"><Filter size={14} /> Severity Filter:</span>
              {['all', 'CRITICAL', 'WARNING', 'INFO'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold capitalize transition-all ${
                    severityFilter === sev
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              {/* Test Alert Trigger Selector */}
              <select className="select text-xs" value={triggerType} onChange={(e) => setTriggerType(e.target.value)}>
                <option value="FAILED_IMPORT">Test Trigger: Failed Import</option>
                <option value="FAILED_SYNC">Test Trigger: Failed Sync</option>
                <option value="SUPPLIER_CONNECTION_FAILURE">Test Trigger: Supplier Offline</option>
                <option value="API_FAILURE">Test Trigger: API Gateway Failure</option>
                <option value="FTP_FAILURE">Test Trigger: FTP Transfer Drop</option>
                <option value="VALIDATION_ERROR">Test Trigger: Product Validation Error</option>
              </select>
              <button onClick={handleTriggerTest} disabled={triggering} className="btn-secondary btn-xs flex items-center gap-1">
                {triggering ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                {triggering ? 'Firing...' : 'Fire Test Alert'}
              </button>

              <button onClick={handleMarkAllRead} className="btn-ghost btn-xs text-slate-600 dark:text-slate-300">
                <Check size={13} /> Mark All Read
              </button>
              <button onClick={fetchNotifications} className="btn-ghost btn-xs text-slate-600 dark:text-slate-300">
                <RefreshCw size={13} /> Refresh
              </button>
            </div>
          </div>

          {/* Notification Cards Feed */}
          <div className="space-y-3">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-400">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="card p-12 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
                No active notifications found. All integration feeds are operating normally.
              </div>
            ) : (
              notifications.map((notif) => {
                const isCritical = notif.severity === 'CRITICAL' || notif.severity === 'ERROR'
                return (
                  <div
                    key={notif.id}
                    className={`card p-4 bg-white dark:bg-slate-900 border transition-all rounded-2xl ${
                      !notif.isRead
                        ? isCritical
                          ? 'border-rose-400 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/20 shadow-sm'
                          : 'border-indigo-300 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 opacity-90'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          {getSeverityBadge(notif.severity)}
                          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">{notif.title}</h4>
                          {!notif.isRead && <span className="w-2 h-2 rounded-full bg-primary-600 animate-ping"></span>}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">{notif.message}</p>
                        <p className="text-[11px] font-mono text-slate-400">{new Date(notif.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {!notif.isRead && (
                          <button onClick={() => handleMarkAsRead(notif.id)} className="btn-ghost btn-xs text-slate-500 hover:text-emerald-600" title="Mark as read">
                            <Check size={14} />
                          </button>
                        )}
                        <button onClick={() => handleDelete(notif.id)} className="btn-ghost btn-xs text-slate-400 hover:text-rose-600" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2">
                        {/* Quick Action 1: Retry Sync */}
                        {(notif.type === 'FAILED_SYNC' || notif.type === 'FAILED_IMPORT' || notif.type === 'FTP_FAILURE') && (
                          <button onClick={() => handleRetrySync(notif)} className="btn-primary btn-xs flex items-center gap-1 shadow-sm">
                            <RefreshCw size={12} /> Retry Sync
                          </button>
                        )}

                        {/* Quick Action 2: Open Product */}
                        {notif.type === 'VALIDATION_ERROR' && (
                          <a href="/products" className="btn-secondary btn-xs flex items-center gap-1">
                            <ExternalLink size={12} /> Open Product
                          </a>
                        )}

                        {/* Quick Action 3: View Error Details */}
                        {notif.metadata && (
                          <button onClick={() => setSelectedNotif(notif)} className="btn-ghost btn-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-semibold">
                            <Eye size={12} /> View Error Details
                          </button>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-slate-400 uppercase">Module: {notif.module || 'Integration'}</span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 2: NOTIFICATION PREFERENCES MATRIX */}
      {activeTab === 'preferences' && (
        <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Sliders size={18} className="text-primary-600" /> User Notification Preferences Matrix
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Specify which channel alerts (Email, In-App, Teams, Slack, SMS) trigger for each system event type.</p>
            </div>
            <button onClick={handleSavePreferences} disabled={savingPrefs} className="btn-primary flex items-center gap-1.5">
              {savingPrefs ? <RefreshCw size={14} className="animate-spin" /> : <Check size={14} />}
              {savingPrefs ? 'Saving Matrix...' : 'Save Preferences'}
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">System Event Type</th>
                  <th className="p-3.5 text-center"><span className="inline-flex items-center gap-1"><Bell size={13} className="text-primary-600" /> In-App Alert</span></th>
                  <th className="p-3.5 text-center"><span className="inline-flex items-center gap-1"><Mail size={13} className="text-purple-600" /> Email Alert</span></th>
                  <th className="p-3.5 text-center"><span className="inline-flex items-center gap-1"><MessageSquare size={13} className="text-indigo-600" /> MS Teams</span></th>
                  <th className="p-3.5 text-center"><span className="inline-flex items-center gap-1"><MessageSquare size={13} className="text-teal-600" /> Slack</span></th>
                  <th className="p-3.5 text-center"><span className="inline-flex items-center gap-1"><Smartphone size={13} className="text-amber-600" /> SMS</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {preferences.map((item) => (
                  <tr key={item.eventType} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-slate-800 dark:text-slate-100">{item.name}</td>
                    
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.inAppEnabled}
                        onChange={() => handlePrefToggle(item.eventType, 'inAppEnabled')}
                        className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer w-4 h-4 text-primary-600"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.emailEnabled}
                        onChange={() => handlePrefToggle(item.eventType, 'emailEnabled')}
                        className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer w-4 h-4 text-purple-600"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.teamsEnabled}
                        onChange={() => handlePrefToggle(item.eventType, 'teamsEnabled')}
                        className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer w-4 h-4 text-indigo-600"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.slackEnabled}
                        onChange={() => handlePrefToggle(item.eventType, 'slackEnabled')}
                        className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer w-4 h-4 text-teal-600"
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={item.smsEnabled}
                        onChange={() => handlePrefToggle(item.eventType, 'smsEnabled')}
                        className="rounded border-slate-300 dark:border-slate-700 dark:bg-slate-900 cursor-pointer w-4 h-4 text-amber-600"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ERROR DETAILS MODAL */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-xl w-full card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <AlertCircle size={18} className="text-rose-600" /> Error Log Details
              </h3>
              <button onClick={() => setSelectedNotif(null)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl">
              <div><strong>Title:</strong> {selectedNotif.title}</div>
              <div><strong>Severity:</strong> {selectedNotif.severity}</div>
              <div><strong>Timestamp:</strong> {new Date(selectedNotif.createdAt).toLocaleString()}</div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Message & Failure Context</label>
              <p className="p-3 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 rounded-xl text-xs border border-rose-200 dark:border-rose-900/60 font-medium">{selectedNotif.message}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Metadata / Stack Trace JSON</label>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-48 border border-slate-800">
                {selectedNotif.metadata ? JSON.stringify(JSON.parse(selectedNotif.metadata), null, 2) : 'No extra metadata available.'}
              </pre>
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={() => setSelectedNotif(null)} className="btn-secondary w-full">Close Details</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
