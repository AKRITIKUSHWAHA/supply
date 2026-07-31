import React, { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText, AlertTriangle, AlertCircle, CheckCircle2, Info, Search,
  RefreshCw, Terminal, Activity, Eye, X, FileSpreadsheet, ChevronLeft, ChevronRight
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

const INITIAL_LOGS: LogEntryItem[] = [
  {
    id: 'log-101',
    timestamp: '2026-07-27 16:15:22',
    logType: 'API Logs',
    supplier: 'TechParts Int.',
    store: 'SupplyBridge US Store',
    module: 'Inventory',
    severity: 'Info',
    message: 'TechParts REST API v2 inventory batch payload received (18,420 items processed).',
    status: 'Success',
    details: 'HTTP 200 OK — Payload size: 4.2 MB. Delta sync completed in 1.4s.',
    ip: '192.168.1.45',
    userId: 'system_daemon',
  },
  {
    id: 'log-102',
    timestamp: '2026-07-27 16:10:04',
    logType: 'Sync Logs',
    supplier: 'PrimeSupply Corp',
    store: 'EU Direct Commerce',
    module: 'Pricing',
    severity: 'Info',
    message: 'Storefront price synchronization completed dynamically (11,200 items updated).',
    status: 'Success',
    details: 'Pushed price updates to WooCommerce storefront. 0 API throttling errors.',
    ip: '10.0.0.12',
    userId: 'job_scheduler',
  },
  {
    id: 'log-103',
    timestamp: '2026-07-27 15:45:12',
    logType: 'Error Logs',
    supplier: 'Acme Distributors',
    store: 'Global',
    module: 'Images',
    severity: 'Error',
    message: 'High-res product image download timeout from AcmeDistributors SFTP server.',
    status: 'Failed',
    details: 'Connection timed out after 30000ms: sftp://acme.suppliertest.com:22/media/hq_img_4992.png',
    ip: '172.16.0.8',
    userId: 'image_downloader',
  },
  {
    id: 'log-104',
    timestamp: '2026-07-27 15:22:40',
    logType: 'FTP Logs',
    supplier: 'GlobalSource Ltd.',
    store: 'Global',
    module: 'Catalog',
    severity: 'Warning',
    message: 'FTP feed import file parsed with 12 validation warnings (Missing images).',
    status: 'Warning',
    details: 'FTP File: /feeds/daily_catalog_20260727.xml. 14,800 items total, 12 sent to Validation Center.',
    ip: '192.168.2.101',
    userId: 'ftp_worker',
  },
  {
    id: 'log-105',
    timestamp: '2026-07-27 14:50:00',
    logType: 'User Activity Logs',
    supplier: 'System',
    store: 'Global',
    module: 'Validation',
    severity: 'Info',
    message: 'User Alex Morrison approved 45 products in the Validation Center.',
    status: 'Success',
    details: 'Action: Mass Product Approval. Products moved to Ready for Approval state.',
    ip: '192.168.1.10',
    userId: 'alex_morrison',
  },
  {
    id: 'log-106',
    timestamp: '2026-07-27 14:15:30',
    logType: 'Import Logs',
    supplier: 'QuickShip Outlet Store',
    store: 'Global',
    module: 'Catalog',
    severity: 'Info',
    message: 'Catalog import job #job_84290 finished (7,300 SKUs successfully parsed).',
    status: 'Success',
    details: 'Import throughput: 5,200 SKUs/min. Validation pass rate: 99.8%.',
    ip: '10.0.0.5',
    userId: 'catalog_ingest',
  },
  {
    id: 'log-107',
    timestamp: '2026-07-27 13:40:18',
    logType: 'Sync Logs',
    supplier: 'TechParts Int.',
    store: 'Global Electronics Hub',
    module: 'Storefront',
    severity: 'Error',
    message: 'Rate limit HTTP 429 exceeded on Shopify storefront API endpoint.',
    status: 'Failed',
    details: 'HTTP 429 Too Many Requests. Retrying batch push in 600 seconds.',
    ip: '192.168.1.45',
    userId: 'store_pusher',
  },
]

const INITIAL_ACTIVITIES = [
  { id: 'act-1', time: '10 min ago', timestamp: '2026-07-27 16:15:00', message: 'TechParts International inventory feed sync completed (18,420 items).', color: 'emerald', category: 'Supplier' },
  { id: 'act-2', time: '25 min ago', timestamp: '2026-07-27 16:00:00', message: 'Storefront price push executed to EU Direct Commerce (11,200 items updated).', color: 'blue', category: 'Pricing' },
  { id: 'act-3', time: '45 min ago', timestamp: '2026-07-27 15:40:00', message: 'Acme Distributors SFTP connection timeout on product image download.', color: 'rose', category: 'Errors' },
  { id: 'act-4', time: '1 hr ago', timestamp: '2026-07-27 15:20:00', message: 'GlobalSource Ltd. FTP catalog feed imported with 12 validation warnings.', color: 'amber', category: 'Warnings' },
  { id: 'act-5', time: '2 hr ago', timestamp: '2026-07-27 14:20:00', message: 'Manual triggered re-validation action executed by Alex Morrison.', color: 'violet', category: 'Manual Actions' },
]

export const Logs: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const currentView = searchParams.get('view') === 'system' ? 'system' : 'activity'

  const [logsList, setLogsList] = useState<LogEntryItem[]>(INITIAL_LOGS)
  const [activitiesList] = useState(INITIAL_ACTIVITIES)

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
  const handleRefresh = () => {
    setIsRefreshing(true)
    showNotification('Refreshing live log data from backend...')

    setTimeout(() => {
      setLogsList(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
          logType: 'Sync Logs',
          supplier: 'TechParts Int.',
          store: 'SupplyBridge US Store',
          module: 'Inventory',
          severity: 'Info',
          message: 'Live background sync telemetry heartbeat verified (100% Synced).',
          status: 'Success',
          details: 'Automatic heartbeat probe. All operational pipelines online.',
          ip: '127.0.0.1',
          userId: 'system_daemon',
        },
        ...prev,
      ])
      setIsRefreshing(false)
      showNotification('Live logs refreshed successfully!')
    }, 800)
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
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter(log => {
        const query = systemSearch.toLowerCase()
        const matchSearch =
          log.message.toLowerCase().includes(query) ||
          log.supplier.toLowerCase().includes(query) ||
          log.store.toLowerCase().includes(query) ||
          (log.details && log.details.toLowerCase().includes(query)) ||
          log.logType.toLowerCase().includes(query)

        const matchLogType = logTypeFilter === 'all' || log.logType === logTypeFilter
        const matchSeverity = severityFilter === 'all' || log.severity.toLowerCase() === severityFilter.toLowerCase()
        const matchModule = moduleFilter === 'all' || log.module.toLowerCase() === moduleFilter.toLowerCase()

        return matchSearch && matchLogType && matchSeverity && matchModule
      })
  }, [logsList, systemSearch, logTypeFilter, severityFilter, moduleFilter])

  // Pagination Math
  const totalPages = Math.ceil(filteredSystemLogs.length / pageSize) || 1
  const paginatedLogs = filteredSystemLogs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // Badge Color Helper
  const getSeverityBadge = (severity: 'Info' | 'Warning' | 'Error') => {
    switch (severity) {
      case 'Error':   return <Badge variant="danger" dot>Error</Badge>
      case 'Warning': return <Badge variant="warning" dot>Warning</Badge>
      case 'Info':    return <Badge variant="info" dot>Info</Badge>
      default:        return <Badge variant="neutral">{severity}</Badge>
    }
  }

  const getStatusBadge = (status: 'Success' | 'Failed' | 'Pending' | 'Warning') => {
    switch (status) {
      case 'Success': return <Badge variant="success" dot>Success</Badge>
      case 'Failed':  return <Badge variant="danger" dot>Failed</Badge>
      case 'Warning': return <Badge variant="warning" dot>Warning</Badge>
      default:        return <Badge variant="neutral" dot>{status}</Badge>
    }
  }

  return (
    <div className="relative space-y-6">
      {/* Toast Notification */}
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
        title="Activity & Logs"
        subtitle="Real-time operational activity feed timeline and system execution audit logs"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer text-xs"
              title="Download Log Audit CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer text-xs shadow-md shadow-indigo-500/20"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin text-white" : ""} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
            </button>
          </div>
        }
      />

      {/* Main View Mode Tabs */}
      <Tabs
        tabs={mainTabs}
        active={currentView}
        onChange={v => setSearchParams({ view: v })}
      />

      {/* 1. ACTIVITY FEED VIEW */}
      {currentView === 'activity' && (
        <div className="space-y-4">
          <div className="card p-4 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search operational activity timeline..."
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                className="input pl-9 text-xs"
              />
              {activitySearch && (
                <button onClick={() => setActivitySearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {[
                'All', 'Supplier', 'Store', 'Inventory', 'Pricing', 'Images', 'Errors', 'Warnings', 'Manual Actions'
              ].map(f => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-2xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activityFilter === f
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            {filteredActivities.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No activity feed events match your search and filter criteria.
              </div>
            ) : (
              filteredActivities.map(act => {
                const colorMap: Record<string, string> = {
                  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
                  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800',
                  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200 dark:border-rose-800',
                  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800',
                  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400 border-violet-200 dark:border-violet-800',
                }
                return (
                  <div key={act.id} className="flex items-start gap-3.5 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors border border-slate-100 dark:border-slate-800">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorMap[act.color]}`}>
                      <Activity size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-snug">{act.message}</p>
                        <span className="text-2xs font-bold text-slate-400 font-mono flex-shrink-0">{act.time}</span>
                      </div>
                      <p className="text-2xs text-slate-400 font-mono mt-0.5">Timestamp: {act.timestamp}</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {/* 2. SYSTEM LOGS VIEW */}
      {currentView === 'system' && (
        <div className="space-y-4">
          {/* Search & Filters Bar */}
          <div className="card p-4 border border-slate-200/90 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search logs by message, supplier, store, or details..."
                value={systemSearch}
                onChange={e => {
                  setSystemSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="input pl-9 text-xs"
              />
              {systemSearch && (
                <button onClick={() => setSystemSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              <select
                className="select text-xs py-2 w-auto"
                value={logTypeFilter}
                onChange={e => {
                  setLogTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">All Log Types</option>
                <option value="API Logs">API Logs</option>
                <option value="FTP Logs">FTP Logs</option>
                <option value="Import Logs">Import Logs</option>
                <option value="Sync Logs">Sync Logs</option>
                <option value="User Activity Logs">User Activity Logs</option>
                <option value="Error Logs">Error Logs</option>
              </select>

              <select
                className="select text-xs py-2 w-auto"
                value={severityFilter}
                onChange={e => {
                  setSeverityFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">All Severities</option>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
              </select>

              <select
                className="select text-xs py-2 w-auto"
                value={moduleFilter}
                onChange={e => {
                  setModuleFilter(e.target.value)
                  setCurrentPage(1)
                }}
              >
                <option value="all">All Modules</option>
                <option value="catalog">Catalog</option>
                <option value="inventory">Inventory</option>
                <option value="pricing">Pricing</option>
                <option value="validation">Validation</option>
                <option value="storefront">Storefront</option>
              </select>
            </div>
          </div>

          {/* System Logs Table */}
          <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className="table-container w-full overflow-x-auto scrollbar-thin">
              <table className="table min-w-[980px] w-full">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                    <th className="whitespace-nowrap px-4 py-3.5">TIMESTAMP</th>
                    <th className="whitespace-nowrap px-4 py-3.5">LOG TYPE</th>
                    <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER</th>
                    <th className="whitespace-nowrap px-4 py-3.5">STORE</th>
                    <th className="whitespace-nowrap px-4 py-3.5">MODULE</th>
                    <th className="whitespace-nowrap px-4 py-3.5">SEVERITY</th>
                    <th className="whitespace-nowrap px-4 py-3.5">MESSAGE</th>
                    <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                    <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <FileText size={24} className="text-slate-300" />
                          <p className="font-medium text-xs">No system logs match your search and filter criteria.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map(log => (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <td data-label="Timestamp" className="whitespace-nowrap px-4 py-3.5 font-mono text-2xs text-slate-500 dark:text-slate-400">
                          {log.timestamp}
                        </td>
                        <td data-label="Log Type" className="whitespace-nowrap px-4 py-3.5">
                          <span className="px-2 py-0.5 rounded text-2xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                            {log.logType}
                          </span>
                        </td>
                        <td data-label="Supplier" className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {log.supplier}
                        </td>
                        <td data-label="Store" className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          {log.store}
                        </td>
                        <td data-label="Module" className="whitespace-nowrap px-4 py-3.5">
                          <span className="text-2xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded font-bold">
                            {log.module}
                          </span>
                        </td>
                        <td data-label="Severity" className="whitespace-nowrap px-4 py-3.5">
                          {getSeverityBadge(log.severity)}
                        </td>
                        <td data-label="Message" className="whitespace-nowrap px-4 py-3.5 max-w-xs truncate text-xs text-slate-800 dark:text-slate-100 font-medium">
                          {log.message}
                        </td>
                        <td data-label="Status" className="whitespace-nowrap px-4 py-3.5">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3.5 text-right pr-4" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer"
                            title="View Event Diagnostics"
                          >
                            <Eye size={12} /> View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Clean Pagination Footer */}
            <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
                <span>Showing {filteredSystemLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filteredSystemLogs.length)} of {filteredSystemLogs.length} logs</span>
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="select py-0.5 text-2xs bg-white dark:bg-slate-800"
                >
                  <option value={10}>10 rows</option>
                  <option value={25}>25 rows</option>
                  <option value={50}>50 rows</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="btn-secondary btn-sm py-1 px-2 text-2xs disabled:opacity-40 cursor-pointer"
                >
                  <ChevronLeft size={12} /> Prev
                </button>

                <span className="px-2 text-2xs font-bold text-slate-700 dark:text-slate-300">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="btn-secondary btn-sm py-1 px-2 text-2xs disabled:opacity-40 cursor-pointer"
                >
                  Next <ChevronRight size={12} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Log Detail Diagnostics Modal */}
      <Modal
        open={selectedLog !== null}
        onClose={() => setSelectedLog(null)}
        title="Event Diagnostics & Metadata"
        subtitle={`Log ID: ${selectedLog?.id} · Type: ${selectedLog?.logType}`}
      >
        {selectedLog && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Terminal className="text-primary-600" size={16} />
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">{selectedLog.logType}</span>
              </div>
              <div className="flex items-center gap-2">
                {getSeverityBadge(selectedLog.severity)}
                {getStatusBadge(selectedLog.status)}
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="font-bold text-slate-800 dark:text-slate-100">Log Message</h4>
              <p className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                {selectedLog.message}
              </p>
            </div>

            {selectedLog.details && (
              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-800 dark:text-slate-100">Diagnostic Technical Details</h4>
                <pre className="p-3 bg-slate-900 dark:bg-slate-950 text-emerald-400 border border-slate-800 rounded-xl font-mono text-2xs leading-relaxed overflow-x-auto">
                  {selectedLog.details}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-850 p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 text-2xs">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Target Endpoint Context</p>
                <p><span className="text-slate-400">Supplier:</span> <span className="font-bold text-slate-700 dark:text-slate-200">{selectedLog.supplier}</span></p>
                <p><span className="text-slate-400">Storefront:</span> <span className="font-bold text-slate-700 dark:text-slate-200">{selectedLog.store}</span></p>
                <p><span className="text-slate-400">Module:</span> <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">{selectedLog.module}</span></p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">Trace Audit Context</p>
                <p><span className="text-slate-400">Timestamp:</span> <span className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.timestamp}</span></p>
                <p><span className="text-slate-400">IP Address:</span> <code className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.ip || '127.0.0.1'}</code></p>
                <p><span className="text-slate-400">User Context:</span> <code className="font-mono text-slate-600 dark:text-slate-300">{selectedLog.userId || 'system'}</code></p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
