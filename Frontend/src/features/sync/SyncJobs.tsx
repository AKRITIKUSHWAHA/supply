import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, PlayCircle, CheckCircle2, XCircle, Clock, RotateCcw, FileSpreadsheet, Terminal, PauseCircle, Play, Layers, Eye } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockSyncJobs } from '../../data/mockData'
import { statusToVariant, timeAgo, formatDateTime } from '../../utils'
import type { SyncJob } from '../../types'
import { useAuth } from '../../context/AuthContext'

const jobTypeColor: Record<string, string> = {
  inventory: 'bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-900',
  pricing:   'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900',
  image:     'bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900',
  website:   'bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 border-violet-200 dark:border-violet-900',
  full:      'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900',
}

export const SyncJobs: React.FC = () => {
  const { role } = useAuth()
  const [jobsList, setJobsList] = useState<SyncJob[]>(mockSyncJobs)
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>([])
  const [detailJob, setDetailJob] = useState<SyncJob | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Handlers for Synchronization Controls ---
  
  // 1. Manual Trigger Sync (Creates running job, updates counters immediately)
  const handleTriggerSync = () => {
    const newJob: SyncJob = {
      id: `job_${Date.now().toString().slice(-4)}`,
      type: 'full',
      name: 'Full Catalog Resync',
      status: 'running',
      progress: 20,
      processedItems: 3600,
      totalItems: 18450,
      failedItems: 0,
      startedAt: new Date().toISOString(),
      triggeredBy: 'Manual Trigger',
      canRetry: false,
      logs: [
        'Manual sync job triggered',
        'Initializing background data pipeline...',
        'Processing product catalog synchronization...',
      ],
    }

    setJobsList(prev => [newJob, ...prev])
    showNotification('New Sync Job created and running!')

    // Auto-advance progress to completion
    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j =>
          j.id === newJob.id
            ? { ...j, progress: 100, processedItems: 18450, status: 'completed' }
            : j
        )
      )
      showNotification('Sync Job completed successfully!')
    }, 3000)
  }

  // 2. Retry Failed Jobs (Toolbar action & single row action)
  const handleRetryJob = (id: string, name: string) => {
    setJobsList(prev =>
      prev.map(j =>
        j.id === id
          ? {
              ...j,
              status: 'running',
              progress: 40,
              failedItems: 0,
              retryAttempts: (j.retryAttempts || 1) + 1,
              maxRetries: j.maxRetries || 3,
              startedAt: new Date().toISOString(),
            }
          : j
      )
    )
    showNotification(`Retrying failed job "${name}"...`)

    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j =>
          j.id === id
            ? {
                ...j,
                status: 'completed',
                progress: 100,
                processedItems: j.totalItems,
                canRetry: false,
              }
            : j
        )
      )
      showNotification(`Job "${name}" retried and completed successfully!`)
    }, 2200)
  }

  const handleRetryAllFailed = () => {
    const failedJobs = jobsList.filter(j => j.status === 'failed')
    if (failedJobs.length === 0) return
    showNotification(`Re-queueing ${failedJobs.length} failed sync job(s)...`)
    setJobsList(prev =>
      prev.map(j =>
        j.status === 'failed'
          ? {
              ...j,
              status: 'running',
              progress: 35,
              retryAttempts: (j.retryAttempts || 1) + 1,
            }
          : j
      )
    )

    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j =>
          j.status === 'running' && failedJobs.some(f => f.id === j.id)
            ? { ...j, status: 'completed', progress: 100, processedItems: j.totalItems, canRetry: false }
            : j
        )
      )
      showNotification('All failed sync jobs retried successfully!')
    }, 2200)
  }

  // 3. Sync Selected Suppliers/Jobs
  const handleSyncSelectedSuppliers = () => {
    if (selectedJobIds.length === 0) return
    const selectedCount = selectedJobIds.length
    showNotification(`Syncing ${selectedCount} selected supplier job(s)...`)

    setJobsList(prev =>
      prev.map(j =>
        selectedJobIds.includes(j.id)
          ? { ...j, status: 'running', progress: 15, startedAt: new Date().toISOString() }
          : j
      )
    )

    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j =>
          selectedJobIds.includes(j.id)
            ? { ...j, status: 'completed', progress: 100, processedItems: j.totalItems, failedItems: 0 }
            : j
        )
      )
      setSelectedJobIds([])
      showNotification(`${selectedCount} selected supplier job(s) synced successfully!`)
    }, 2500)
  }

  // 4. Sync All Suppliers
  const handleSyncAllSuppliers = () => {
    showNotification('Synchronizing all active suppliers...')
    setJobsList(prev =>
      prev.map(j => ({
        ...j,
        status: 'running',
        progress: 25,
        startedAt: new Date().toISOString(),
      }))
    )

    setTimeout(() => {
      setJobsList(prev =>
        prev.map(j => ({
          ...j,
          status: 'completed',
          progress: 100,
          processedItems: j.totalItems,
          failedItems: 0,
        }))
      )
      showNotification('All active suppliers synchronized successfully!')
    }, 2500)
  }

  // 5. Pause Queue (Pauses running jobs)
  const handlePauseQueue = () => {
    setJobsList(prev =>
      prev.map(j => (j.status === 'running' ? { ...j, status: 'paused' } : j))
    )
    showNotification('Queue paused: All running sync jobs placed on hold.')
  }

  // 6. Resume Queue (Restores paused jobs to running)
  const handleResumeQueue = () => {
    setJobsList(prev =>
      prev.map(j => (j.status === 'paused' ? { ...j, status: 'running' } : j))
    )
    showNotification('Queue resumed: Execution restored for paused sync jobs.')
  }

  // 7. Cancel Queue (Cancels Running or Queued jobs only)
  const handleCancelQueue = () => {
    setJobsList(prev =>
      prev.map(j =>
        j.status === 'running' || j.status === 'queued'
          ? { ...j, status: 'cancelled', canRetry: false, progress: 0 }
          : j
      )
    )
    showNotification('Queue cancelled: Active and queued jobs terminated.')
  }

  const handleCancelSingleJob = (id: string, name: string) => {
    setJobsList(prev =>
      prev.map(j =>
        j.id === id ? { ...j, status: 'cancelled', canRetry: false } : j
      )
    )
    showNotification(`Job "${name}" cancelled.`)
  }

  // 8. Rebuild Catalog
  const handleRebuildCatalog = () => {
    showNotification('Rebuilding master product catalog indexes...')
    setTimeout(() => {
      showNotification('Master product catalog rebuilt and indexed successfully!')
    }, 1800)
  }

  // Export CSV Report
  const handleExportJobsCSV = () => {
    showNotification('Generating Sync Jobs CSV report...')
    const csvHeaders = 'Job ID,Job Name,Type,Status,Progress %,Processed Items,Total Items,Failed Items,Retry Attempts,Started At,Triggered By\n'
    const csvRows = jobsList.map(j =>
      `"${j.id}","${j.name}","${j.type}","${j.status}",${j.progress},${j.processedItems},${j.totalItems},${j.failedItems},"${j.retryAttempts ? `${j.retryAttempts}/${j.maxRetries || 3}` : '—'}","${j.startedAt || ''}","${j.triggeredBy || ''}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Sync_Jobs_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Sync Jobs CSV report downloaded!')
  }

  // Checkbox selection toggle
  const toggleSelectJob = (id: string) =>
    setSelectedJobIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  // Counts for dynamic updates
  const failedCount = jobsList.filter(j => j.status === 'failed').length
  const runningCount = jobsList.filter(j => j.status === 'running').length
  const pausedCount = jobsList.filter(j => j.status === 'paused').length
  const queuedCount = jobsList.filter(j => j.status === 'queued').length

  // Tab definitions dynamically updated after every action
  const tabs = [
    { id: 'all',       label: 'All Jobs',  count: jobsList.length },
    { id: 'running',   label: 'Running',   count: runningCount },
    { id: 'queued',    label: 'Queued',    count: queuedCount },
    { id: 'completed', label: 'Completed', count: jobsList.filter(j => j.status === 'completed').length },
    { id: 'failed',    label: 'Failed',    count: failedCount },
  ]

  // Multi-field search (Job Name, Job ID, Supplier Name)
  const filtered = jobsList.filter(j => {
    const matchTab = tab === 'all' || j.status === tab
    const query = search.toLowerCase()
    const matchSearch =
      j.name.toLowerCase().includes(query) ||
      j.id.toLowerCase().includes(query) ||
      (j.supplierName && j.supplierName.toLowerCase().includes(query)) ||
      (j.storeName && j.storeName.toLowerCase().includes(query))
    return matchTab && matchSearch
  })

  return (
    <div className="relative space-y-7 sm:space-y-8">
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
        title="Synchronization Jobs"
        subtitle="Monitor, audit, and trigger background synchronization jobs across all suppliers and stores"
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={handleExportJobsCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-bold cursor-pointer flex-1 sm:flex-initial px-2 sm:px-3 text-xs"
              title="Download Jobs Report CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleRetryAllFailed}
              disabled={failedCount === 0}
              className={`btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-bold flex-1 sm:flex-initial px-2 sm:px-3 text-xs ${
                failedCount === 0
                  ? 'opacity-50 cursor-not-allowed text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-800'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 cursor-pointer'
              }`}
              title={failedCount === 0 ? 'No failed jobs to retry' : `Retry ${failedCount} failed job(s)`}
            >
              <RotateCcw size={14} /> Retry Failed Jobs {failedCount > 0 && `(${failedCount})`}
            </button>
            <button
              onClick={handleSyncSelectedSuppliers}
              disabled={selectedJobIds.length === 0}
              className={`btn-secondary btn-sm flex items-center gap-1 font-bold ${
                selectedJobIds.length === 0 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'cursor-pointer'
              }`}
              title={selectedJobIds.length === 0 ? 'Select one or more jobs/suppliers to sync' : 'Sync Selected Jobs'}
            >
              <Layers size={14} className="text-cyan-500" /> Sync Selected {selectedJobIds.length > 0 && `(${selectedJobIds.length})`}
            </button>
            <button onClick={handleSyncAllSuppliers} className="btn-secondary btn-sm flex items-center gap-1 font-bold cursor-pointer">
              <PlayCircle size={14} className="text-amber-500" /> Sync All Suppliers
            </button>
            <button onClick={handleRebuildCatalog} className="btn-secondary btn-sm font-bold cursor-pointer">
              Rebuild Catalog
            </button>
            <button onClick={handleTriggerSync} className="btn-primary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 shadow-md shadow-amber-500/25 cursor-pointer flex-1 sm:flex-initial px-2 sm:px-3 text-xs whitespace-nowrap">
              <PlayCircle size={14} /> Trigger Sync
            </button>

          </div>
        }
      />

      {/* Queue Real-time Processing Metrics & Queue Control Bar */}
      <div className="card p-3 sm:p-4 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Processing Speed</span>
            <span className="text-sm font-black text-emerald-400 font-mono">840 rec/sec</span>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Estimated Completion</span>
            <span className="text-sm font-black text-amber-400 font-mono">~3 mins 45 sec</span>
          </div>
          <div className="h-8 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:block">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Max Retry Limit</span>
            <span className="text-sm font-black text-slate-200 font-mono">3 Attempts</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {pausedCount > 0 ? (
            <button
              onClick={handleResumeQueue}
              className="btn-success btn-sm text-2xs py-1 flex items-center gap-1 cursor-pointer font-bold"
              title="Resume execution for paused jobs"
            >
              <Play size={12} /> Resume Queue ({pausedCount})
            </button>
          ) : (
            <button
              onClick={handlePauseQueue}
              disabled={runningCount === 0}
              className={`btn-secondary btn-sm text-2xs py-1 flex items-center gap-1 font-bold ${
                runningCount === 0
                  ? 'opacity-50 cursor-not-allowed text-slate-400 border-slate-700 bg-slate-800'
                  : 'cursor-pointer hover:bg-slate-800 text-slate-200'
              }`}
              title={runningCount === 0 ? 'No running jobs to pause' : 'Pause all running sync jobs'}
            >
              <PauseCircle size={12} className="text-amber-400" /> Pause Queue
            </button>
          )}
          <button
            onClick={handleCancelQueue}
            disabled={runningCount === 0 && queuedCount === 0}
            className={`btn-danger btn-sm text-2xs py-1 font-bold ${
              runningCount === 0 && queuedCount === 0
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
            }`}
            title={runningCount === 0 && queuedCount === 0 ? 'No active jobs to cancel' : 'Cancel active and queued jobs'}
          >
            Cancel Queue
          </button>
        </div>
      </div>

      {/* KPI Summary Stats — Dynamic Updates */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
        {[
          { label: 'RUNNING JOBS',   value: runningCount,   color: 'text-cyan-600 dark:text-cyan-400',    bg: 'bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/50',    icon: <RefreshCw size={20} className="animate-spin text-cyan-600" /> },
          { label: 'QUEUED JOBS',    value: queuedCount,    color: 'text-amber-600 dark:text-amber-400',   bg: 'bg-amber-50/70 dark:bg-amber-200/80 dark:border-amber-900/50',   icon: <Clock size={20} className="text-amber-600" /> },
          { label: 'COMPLETED JOBS', value: jobsList.filter(j => j.status === 'completed').length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50', icon: <CheckCircle2 size={20} className="text-emerald-600" /> },
          { label: 'FAILED JOBS',    value: failedCount,    color: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50',    icon: <XCircle size={20} className="text-rose-600" /> },
        ].map((s, i) => (
          <div key={i} className={`p-4 sm:p-5 rounded-2xl shadow-xs min-h-[105px] sm:min-h-[115px] flex items-center justify-between border transition-all duration-200 ${s.bg}`}>
            <div>
              <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
              <p className={`text-xl sm:text-2xl lg:text-3xl font-black ${s.color}`}>{s.value}</p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-xs border border-slate-100 dark:border-slate-700 flex-shrink-0">
              {s.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search jobs by Job Name, Job ID, or Supplier..." />
      </div>

      {/* Synchronization Jobs Table */}
      <div className="card overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-card w-full">
        <div className="table-container w-full overflow-x-auto scrollbar-thin">
          <table className="table min-w-[980px] w-full">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="w-10 text-center px-3 py-3.5">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={filtered.length > 0 && filtered.every(j => selectedJobIds.includes(j.id))}
                    onChange={e => setSelectedJobIds(e.target.checked ? filtered.map(j => j.id) : [])}
                  />
                </th>
                <th className="whitespace-nowrap px-4 py-3.5">JOB NAME / ID</th>
                <th className="whitespace-nowrap px-4 py-3.5">TYPE</th>
                <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5">PROGRESS</th>
                <th className="whitespace-nowrap px-4 py-3.5">ITEMS PROCESSED</th>
                <th className="whitespace-nowrap px-4 py-3.5">STARTED AT</th>
                <th className="whitespace-nowrap px-4 py-3.5">TRIGGERED BY</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-slate-400 font-medium">
                    No synchronization jobs found matching your search criteria.
                  </td>
                </tr>
              )}
              {filtered.map(job => (
                <tr key={job.id} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors" onClick={() => setDetailJob(job)}>
                  <td className="w-10 text-center px-3 py-3.5" onClick={e => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={selectedJobIds.includes(job.id)}
                      onChange={() => toggleSelectJob(job.id)}
                    />
                  </td>
                  <td data-label="Job Name" className="whitespace-nowrap px-4 py-3.5">
                    <div className="flex flex-col items-end sm:items-start text-right sm:text-left">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">{job.name}</p>
                      <p className="text-2xs text-slate-400 font-mono mt-0.5">ID: {job.id}</p>
                      {job.supplierName && <p className="text-2xs text-slate-500 font-medium mt-0.5">Supplier: {job.supplierName}</p>}
                      {job.storeName && <p className="text-2xs text-slate-500 font-medium mt-0.5">Store: {job.storeName}</p>}
                    </div>
                  </td>
                  <td data-label="Type" className="whitespace-nowrap px-4 py-3.5">
                    <span className={`px-2.5 py-1 rounded-lg text-2xs font-bold uppercase tracking-wider border ${jobTypeColor[job.type] || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'}`}>
                      {job.type}
                    </span>
                  </td>
                  <td data-label="Status" className="whitespace-nowrap px-4 py-3.5">
                    <Badge variant={statusToVariant(job.status)} dot>{job.status}</Badge>
                    {job.status === 'failed' && (
                      <span className="block text-2xs font-mono font-bold text-rose-600 dark:text-rose-400 mt-1">
                        Retry {job.retryAttempts || 1}/{job.maxRetries || 3}
                      </span>
                    )}
                  </td>
                  <td data-label="Progress" className="whitespace-nowrap px-4 py-3.5 min-w-[140px]">
                    <ProgressBar
                      value={job.progress}
                      color={job.status === 'failed' ? 'rose' : job.status === 'completed' ? 'emerald' : 'primary'}
                      showLabel
                    />
                  </td>
                  <td data-label="Items Processed" className="whitespace-nowrap px-4 py-3.5">
                    <div className="text-xs font-medium">
                      <span className="text-slate-900 dark:text-slate-100 font-bold">{job.processedItems.toLocaleString()}</span>
                      <span className="text-slate-400"> / {job.totalItems.toLocaleString()}</span>
                      {job.failedItems > 0 && <span className="text-rose-600 dark:text-rose-400 ml-1.5 font-bold">({job.failedItems} failed)</span>}
                    </div>
                  </td>
                  <td data-label="Started At" className="whitespace-nowrap px-4 py-3.5">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {job.startedAt ? timeAgo(job.startedAt) : job.scheduledAt ? formatDateTime(job.scheduledAt) : '—'}
                    </span>
                  </td>
                  <td data-label="Triggered By" className="whitespace-nowrap px-4 py-3.5"><span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{job.triggeredBy}</span></td>
                  <td data-label="Actions" className="whitespace-nowrap px-4 py-3.5 text-right pr-4">
                    <div className="flex justify-end items-center gap-1.5" onClick={e => e.stopPropagation()}>
                      <button
                        onClick={() => setDetailJob(job)}
                        className="btn-secondary btn-sm flex items-center gap-1 font-bold cursor-pointer text-xs"
                        title="View Job Details & Logs"
                      >
                        <Eye size={13} /> View
                      </button>
                      {(job.status === 'running' || job.status === 'queued' || job.status === 'paused') && (
                        <button
                          onClick={() => handleCancelSingleJob(job.id, job.name)}
                          className="btn-ghost btn-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 font-bold cursor-pointer text-xs"
                          title="Cancel Job"
                        >
                          <XCircle size={13} /> Cancel
                        </button>
                      )}
                      {job.status === 'failed' && (
                        <button
                          onClick={() => handleRetryJob(job.id, job.name)}
                          className="btn-secondary btn-sm flex items-center gap-1 font-bold cursor-pointer text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs border-amber-300"
                          title="Retry Failed Job"
                        >
                          <RotateCcw size={13} /> Retry
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Detail Modal */}
      {detailJob && (
        <Modal
          open
          onClose={() => setDetailJob(null)}
          title={detailJob.name}
          subtitle={`Job ID: ${detailJob.id} · Type: ${detailJob.type.toUpperCase()}`}
          size="lg"
          footer={
            <>
              <button onClick={() => setDetailJob(null)} className="btn-secondary">Close</button>
              {detailJob.status === 'failed' && (
                <button
                  onClick={() => { handleRetryJob(detailJob.id, detailJob.name); setDetailJob(null); }}
                  className="btn-primary flex items-center gap-1.5 cursor-pointer font-bold"
                >
                  <RotateCcw size={14} /> Retry Execution
                </button>

              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Execution Status', value: <Badge variant={statusToVariant(detailJob.status)} dot>{detailJob.status}</Badge> },
                { label: 'Progress Percentage', value: `${detailJob.progress}%` },
                { label: 'Total Catalog SKUs', value: detailJob.totalItems.toLocaleString() },
                { label: 'Processed SKUs', value: detailJob.processedItems.toLocaleString() },
                { label: 'Failed Items', value: <span className={detailJob.failedItems > 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{detailJob.failedItems}</span> },
                { label: 'Retry Attempts', value: detailJob.status === 'failed' ? `Retry ${detailJob.retryAttempts || 1}/${detailJob.maxRetries || 3}` : 'N/A' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</div>
                </div>
              ))}
            </div>

            <ProgressBar value={detailJob.progress} color={detailJob.status === 'failed' ? 'rose' : 'primary'} showLabel className="mt-2" />

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary-600" /> Console Trace Logs
                </p>
                <span className="text-2xs text-slate-400 font-mono">{detailJob.logs.length} lines logged</span>
              </div>
              <div className="bg-slate-900 text-slate-300 rounded-xl p-4 space-y-1.5 font-mono text-xs max-h-48 overflow-y-auto border border-slate-800 shadow-inner">
                {detailJob.logs.length > 0 ? (
                  detailJob.logs.map((log, i) => (
                    <div key={i} className="text-slate-300 flex items-start gap-2">
                      <span className="text-slate-600 select-none">{i + 1}.</span>
                      <span>{log}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">No console logs recorded for this job execution.</p>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
