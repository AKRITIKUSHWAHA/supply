import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, AlertTriangle, AlertCircle, CheckCircle2, Info, Search,
  RefreshCw, Terminal, Activity, Eye, X, FileSpreadsheet, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

export interface LogEntryItem {
  id: string
  timestamp: string
  logType: 'API Logs' | 'FTP Logs' | 'Import Logs' | 'Sync Logs' | 'User Activity Logs' | 'Error Logs'
  supplier: string
  store: string
  module: 'Catalog' | 'Inventory' | 'Pricing' | 'Validation' | 'Storefront' | 'System' | 'Images'
  severity: 'Info' | 'Warning' | 'Error'
  message: string
  status: 'Success' | 'Failed' | 'Pending' | 'Warning'
  details?: string
  ip?: string
  userId?: string
}

export interface ActivityFeedItem {
  id: string
  time: string
  timestamp: string
  message: string
  color: string
  category: string
}

const INITIAL_LOGS: LogEntryItem[] = []
const INITIAL_ACTIVITIES: ActivityFeedItem[] = []

export const Logs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentView = searchParams.get('view') === 'system' ? 'system' : 'activity'

  const [logsList, setLogsList] = useState<LogEntryItem[]>(INITIAL_LOGS)
  const [activitiesList, setActivitiesList] = useState<ActivityFeedItem[]>(INITIAL_ACTIVITIES)

  const fetchLogs = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/logs')
      const data = await res.json()
      if (Array.isArray(data)) {
        setLogsList(data)
        const mappedActivities: ActivityFeedItem[] = data.map((l: any) => ({
          id: `act-${l.id}`,
          time: l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : 'Just now',
          timestamp: l.timestamp ? new Date(l.timestamp).toISOString() : new Date().toISOString(),
          message: l.message || 'System activity recorded',
          color: l.severity === 'Error' ? 'rose' : l.severity === 'Warning' ? 'amber' : 'emerald',
          category: l.module || 'System',
        }))
        setActivitiesList(mappedActivities)
      }
    } catch (err) {
      console.error('Failed to fetch logs from backend:', err)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  // Independent Searches for Both Tabs
  const [activitySearch, setActivitySearch] = useState('')
  const [systemSearch, setSystemSearch] = useState('')

  // Filters
  const [activityFilter, setActivityFilter] = useState('All')
  const [logTypeFilter, setLogTypeFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [moduleFilter, setModuleFilter] = useState('all')

  // Selected Detail Modal & Pagination
  const [selectedLog, setSelectedLog] = useState<LogEntryItem | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Reload Backend Logs
  const handleRefresh = async () => {
    setIsRefreshing(true)
    showNotification('Refreshing live log data from backend...')
    await fetchLogs()
    setIsRefreshing(false)
    showNotification('Live logs refreshed successfully!')
  }

  // Clear All System Logs
  const handleClearLogs = async () => {
    try {
      await fetch('http://localhost:5000/api/logs/clear', { method: 'DELETE' })
      setLogsList([])
      setActivitiesList([])
      showNotification('All system logs cleared successfully!')
    } catch (err) {
      console.error('Failed to clear system logs:', err)
    }
  }

  // Export Filtered CSV Report
  const handleExportCSV = () => {
    showNotification('Exporting Log Audit Trail CSV...')
    const csvHeaders = 'Timestamp,Log Type,Supplier,Storefront,Module,Severity,Status,Message,Details\n'
    const csvRows = filteredSystemLogs.map(l =>
      `"${l.timestamp}","${l.logType}","${l.supplier}","${l.store}","${l.module}","${l.severity}","${l.status}","${l.message.replace(/"/g, '""')}","${(l.details || '').replace(/"/g, '""')}"`
    ).join('\n')

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_System_Logs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Log Audit CSV downloaded!')
  }

  // Top Tabs: Activity Feed vs System Logs
  const mainTabs = [
    { id: 'activity', label: 'Activity Feed' },
    { id: 'system',   label: 'System Logs' },
  ]

  // Filtered Activity Timeline (Sorted Newest-First)
  const filteredActivities = useMemo(() => {
    return activitiesList.filter(act => {
      const matchSearch = act.message.toLowerCase().includes(activitySearch.toLowerCase())
      if (activityFilter === 'All') return matchSearch
      if (activityFilter === 'Supplier') return matchSearch && (act.category === 'Supplier' || act.message.includes('Supplier'))
      if (activityFilter === 'Store') return matchSearch && (act.category === 'Store' || act.message.includes('Store'))
      if (activityFilter === 'Inventory') return matchSearch && (act.category === 'Inventory' || act.message.includes('inventory'))
      if (activityFilter === 'Pricing') return matchSearch && (act.category === 'Pricing' || act.message.includes('price'))
      if (activityFilter === 'Images') return matchSearch && (act.category === 'Images' || act.message.includes('image'))
      if (activityFilter === 'Errors') return matchSearch && (act.category === 'Errors' || act.color === 'rose')
      if (activityFilter === 'Warnings') return matchSearch && (act.category === 'Warnings' || act.color === 'amber')
      if (activityFilter === 'Manual Actions') return matchSearch && (act.category === 'Manual Actions' || act.color === 'violet')
      return matchSearch
    })
  }, [activitiesList, activitySearch, activityFilter])

  // Filtered System Logs (Sorted Newest-First)
  const filteredSystemLogs = useMemo(() => {
    return logsList
      .slice()
      .filter(l => {
        const matchSearch =
          l.message.toLowerCase().includes(systemSearch.toLowerCase()) ||
          l.supplier.toLowerCase().includes(systemSearch.toLowerCase()) ||
          l.store.toLowerCase().includes(systemSearch.toLowerCase()) ||
          (l.details || '').toLowerCase().includes(systemSearch.toLowerCase())

        const matchLogType = logTypeFilter === 'all' || l.logType === logTypeFilter
        const matchSeverity = severityFilter === 'all' || l.severity.toLowerCase() === severityFilter.toLowerCase()
        const matchModule = moduleFilter === 'all' || l.module.toLowerCase() === moduleFilter.toLowerCase()

        return matchSearch && matchLogType && matchSeverity && matchModule
      })
  }, [logsList, systemSearch, logTypeFilter, severityFilter, moduleFilter])

  // Pagination Math
  const totalPages = Math.ceil(filteredSystemLogs.length / pageSize) || 1
  const paginatedSystemLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredSystemLogs.slice(start, start + pageSize)
  }, [filteredSystemLogs, currentPage, pageSize])

  const handleTabChange = (tabId: string) => {
    setSearchParams({ view: tabId })
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Logs & Monitoring"
        subtitle="Real-time telemetry, audit trails, and execution logs across all data pipelines"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <FileSpreadsheet size={14} /> Export CSV Audit
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-primary btn-sm flex items-center gap-1.5"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} /> Refresh Logs
            </button>
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <Tabs tabs={mainTabs} active={currentView} onChange={handleTabChange} />

      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg flex items-center gap-2"
          >
            <CheckCircle2 size={14} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VIEW 1: ACTIVITY FEED */}
      {currentView === 'activity' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search activity timeline..."
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                className="input pl-9 text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
              {['All', 'Supplier', 'Store', 'Inventory', 'Pricing', 'Errors', 'Warnings'].map(filter => (
                <button
                  key={filter}
                  onClick={() => setActivityFilter(filter)}
                  className={`px-3 py-1 text-2xs font-semibold rounded-full transition-colors ${
                    activityFilter === filter
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            {filteredActivities.length > 0 ? (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {filteredActivities.map(act => (
                  <div key={act.id} className="relative flex items-start gap-3 group">
                    <span className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white dark:ring-slate-900 bg-${act.color}-500`} />
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-2xs font-bold text-slate-400 uppercase tracking-wider">{act.category}</span>
                        <span className="text-2xs text-slate-400">{act.time}</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-200 font-medium">{act.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <Activity size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">No activity items match your search filter</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: SYSTEM LOGS TABLE */}
      {currentView === 'system' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative col-span-1 sm:col-span-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search system logs message, supplier, storefront..."
                value={systemSearch}
                onChange={e => {
                  setSystemSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="input pl-9 text-xs"
              />
            </div>
            <select
              value={severityFilter}
              onChange={e => {
                setSeverityFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="select text-xs"
            >
              <option value="all">All Severities</option>
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={logTypeFilter}
              onChange={e => {
                setLogTypeFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="select text-xs"
            >
              <option value="all">All Log Types</option>
              <option value="API Logs">API Logs</option>
              <option value="FTP Logs">FTP Logs</option>
              <option value="Import Logs">Import Logs</option>
              <option value="Sync Logs">Sync Logs</option>
              <option value="User Activity Logs">User Activity Logs</option>
              <option value="Error Logs">Error Logs</option>
            </select>
          </div>

          <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Log Type</th>
                    <th>Supplier / Store</th>
                    <th>Module</th>
                    <th>Severity</th>
                    <th>Message</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSystemLogs.length > 0 ? (
                    paginatedSystemLogs.map(log => (
                      <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="text-2xs font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                        <td>
                          <span className="text-2xs font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {log.logType}
                          </span>
                        </td>
                        <td>
                          <div className="text-xs">
                            <span className="font-semibold text-slate-800 dark:text-slate-200 block">{log.supplier}</span>
                            <span className="text-2xs text-slate-400">{log.store}</span>
                          </div>
                        </td>
                        <td>
                          <span className="text-2xs font-medium text-slate-600 dark:text-slate-400">{log.module}</span>
                        </td>
                        <td>
                          <Badge
                            variant={
                              log.severity === 'Error' ? 'danger' : log.severity === 'Warning' ? 'warning' : 'info'
                            }
                          >
                            {log.severity}
                          </Badge>
                        </td>
                        <td className="max-w-xs truncate text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {log.message}
                        </td>
                        <td className="text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="btn-icon"
                            title="Inspect Log Details"
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Terminal size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm font-medium">No system logs found matching criteria</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {filteredSystemLogs.length > 0 && (
              <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <div>
                  Showing {Math.min((currentPage - 1) * pageSize + 1, filteredSystemLogs.length)} to{' '}
                  {Math.min(currentPage * pageSize, filteredSystemLogs.length)} of {filteredSystemLogs.length} entries
                </div>
                <div className="flex items-center gap-2">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="btn-secondary btn-sm p-1.5 disabled:opacity-40"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-semibold">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="btn-secondary btn-sm p-1.5 disabled:opacity-40"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Inspect Log Detail Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Log Telemetry Inspection"
        subtitle={`Log ID: ${selectedLog?.id}`}
        size="lg"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Timestamp</p>
                <p className="font-mono font-medium text-slate-800 dark:text-slate-200">{new Date(selectedLog.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Log Type</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedLog.logType}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Supplier / Integration</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedLog.supplier}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Storefront Endpoint</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedLog.store}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Origin IP Address</p>
                <p className="font-mono text-slate-800 dark:text-slate-200">{selectedLog.ip || '127.0.0.1'}</p>
              </div>
              <div>
                <p className="text-slate-400 font-semibold mb-0.5">Executor Identity</p>
                <p className="font-medium text-slate-800 dark:text-slate-200">{selectedLog.userId || 'system'}</p>
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Message</p>
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 font-medium">
                {selectedLog.message}
              </div>
            </div>

            <div>
              <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">Technical Payload & Stack Details</p>
              <pre className="p-3 bg-slate-950 text-slate-200 rounded-lg font-mono text-2xs overflow-x-auto whitespace-pre-wrap">
                {selectedLog.details || 'No detailed stack trace recorded for this telemetry event.'}
              </pre>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
