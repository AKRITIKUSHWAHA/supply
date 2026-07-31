import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, CheckCircle2, XCircle, RefreshCw, RotateCcw, AlertCircle, FileSpreadsheet, Clock, ArrowDownCircle, UploadCloud, Eye, Zap, Layers } from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, ProgressBar, EmptyState } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockImportQueue } from '../../data/mockData'
import { statusToVariant, connectionTypeLabel, timeAgo } from '../../utils'
import type { ImportJob } from '../../types'

interface SampleRecord {
  sku: string
  name: string
  category: string
  costPrice: number
  retailPrice: number
  stock: number
  status: 'valid' | 'mapping_needed' | 'error'
}

const MOCK_PREVIEW_RECORDS: SampleRecord[] = [
  { sku: 'TP-CPU-9900K', name: 'Intel Core i9-9900K Processor', category: 'Processors', costPrice: 310.00, retailPrice: 420.00, stock: 45, status: 'valid' },
  { sku: 'GS-GPU-3080',  name: 'NVIDIA GeForce RTX 3080 10GB', category: 'Graphics Cards', costPrice: 650.00, retailPrice: 799.00, stock: 12, status: 'valid' },
  { sku: 'PS-SSD-1TB',   name: 'Samsung 980 Pro NVMe 1TB SSD', category: 'Storage', costPrice: 85.00, retailPrice: 120.00, stock: 150, status: 'valid' },
  { sku: 'AC-MEM-16GB',  name: 'Corsair Vengeance DDR4 16GB Kit', category: 'Memory', costPrice: 0.00, retailPrice: 65.00, stock: 80, status: 'error' },
  { sku: 'QS-CASE-MID',  name: 'NZXT H510 Mid-Tower ATX Case', category: 'Computer Cases', costPrice: 60.00, retailPrice: 89.00, stock: 25, status: 'mapping_needed' },
]

export const ImportQueue: React.FC = () => {
  const [importsList, setImportsList] = useState<ImportJob[]>(mockImportQueue)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<ImportJob | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Upload Modal State
  const [supplierName, setSupplierName] = useState('TechParts International')
  const [fileFormat, setFileFormat] = useState('CSV')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleFileDrop = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFileName(e.target.files[0].name)
    }
  }

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    showNotification('Parsing supplier feed & validating schema...')

    setTimeout(() => {
      const newJob: ImportJob = {
        id: `job_${Date.now()}`,
        supplierId: 's1',
        supplierName: supplierName,
        connectionType: fileFormat === 'CSV' ? 'csv' : fileFormat === 'XML' ? 'xml' : 'excel',
        fileName: uploadedFileName || `feed_${Date.now()}.${fileFormat.toLowerCase()}`,
        totalRecords: 1250,
        processedRecords: 450,
        failedRecords: 0,
        status: 'processing',
        createdAt: new Date().toISOString(),
      }

      setImportsList([newJob, ...importsList])
      setIsUploading(false)
      setUploadModalOpen(false)
      setUploadedFileName(null)
      showNotification(`Import job for ${supplierName} queued successfully (1,250 SKUs parsed)!`)
    }, 1200)
  }

  const handleRetry = (id: string, sName: string) => {
    setImportsList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'processing',
              errorMessage: undefined,
              processedRecords: Math.floor(item.totalRecords * 0.4),
            }
          : item
      )
    )
    showNotification(`Retrying import feed for ${sName}...`)

    setTimeout(() => {
      setImportsList(prev =>
        prev.map(item =>
          item.id === id
            ? {
                ...item,
                status: 'completed',
                processedRecords: item.totalRecords,
                failedRecords: 0,
              }
            : item
        )
      )
      showNotification(`Import for ${sName} completed successfully!`)
    }, 2000)
  }

  const handleRetryAllFailed = () => {
    showNotification('Re-queueing all failed feed imports...')
    setTimeout(() => {
      setImportsList(prev =>
        prev.map(item =>
          item.status === 'failed'
            ? { ...item, status: 'completed', processedRecords: item.totalRecords, failedRecords: 0, errorMessage: undefined }
            : item
        )
      )
      showNotification('All failed feed imports ingested successfully!')
    }, 1800)
  }

  const handleSetHighPriority = (id: string, sName: string) => {
    showNotification(`Prioritized feed import batch for ${sName} to top of queue!`)
  }

  const handleCancel = (id: string, sName: string) => {
    setImportsList(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: 'failed',
              errorMessage: 'Cancelled by administrator.',
            }
          : item
      )
    )
    showNotification(`Import for ${sName} cancelled.`)
  }

  const handleExportQueueCSV = () => {
    showNotification('Generating Import Queue CSV export...')
    const csvHeaders = 'Job ID,Supplier Name,Source File,ConnectionType,Total Records,Processed Records,Failed Records,Status,Created At\n'
    const csvRows = importsList.map(i =>
      `"${i.id}","${i.supplierName}","${i.fileName || ''}","${i.connectionType}",${i.totalRecords},${i.processedRecords},${i.failedRecords},"${i.status}","${i.createdAt || ''}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Import_Queue_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Import Queue CSV file downloaded!')
  }

  const tabs = [
    { id: 'all',        label: 'All Imports', count: importsList.length },
    { id: 'processing', label: 'Processing',  count: importsList.filter(i => i.status === 'processing').length },
    { id: 'pending',    label: 'Pending',     count: importsList.filter(i => i.status === 'pending').length },
    { id: 'completed',  label: 'Completed',   count: importsList.filter(i => i.status === 'completed').length },
    { id: 'failed',     label: 'Failed',      count: importsList.filter(i => i.status === 'failed').length },
  ]

  const filtered = importsList.filter(q => {
    const matchTab = tab === 'all' || q.status === tab
    const matchSearch = q.supplierName.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const failedCount = importsList.filter(i => i.status === 'failed').length

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

      <div className="hidden sm:block space-y-7">
        <SectionHeader
          title="Import Queue & Supplier Feed Ingestion"
          subtitle="Upload supplier catalog feeds (CSV, XML, Excel) and track background ingestion queues in real-time"
          actions={
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportQueueCSV}
                className="btn-secondary btn-sm flex items-center gap-1.5 font-bold cursor-pointer"
                title="Download Import Queue CSV File"
              >
                <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export Queue
              </button>
              {failedCount > 0 && (
                <button
                  onClick={handleRetryAllFailed}
                  className="btn-secondary btn-sm text-rose-600 hover:bg-rose-50 border-rose-200 flex items-center gap-1.5 font-bold cursor-pointer"
                  title="Retry all failed imports"
                >
                  <RotateCcw size={14} /> Retry Failed ({failedCount})
                </button>
              )}
              <button
                onClick={() => setUploadModalOpen(true)}
                className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
              >
                <UploadCloud size={14} /> Upload Supplier Feed
              </button>
            </div>
          }
        />

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-5">
          {[
            { label: 'TOTAL INGESTION SKUS', value: importsList.reduce((s, q) => s + q.totalRecords, 0).toLocaleString(), color: 'text-slate-900 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800', icon: <ArrowDownCircle size={18} className="text-slate-700 dark:text-slate-300" /> },
            { label: 'CURRENTLY PROCESSING', value: importsList.filter(q => q.status === 'processing').length, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50/70 dark:bg-cyan-950/30 border border-cyan-200/80 dark:border-cyan-900/50', icon: <RefreshCw size={18} className="animate-spin text-cyan-600" /> },
            { label: 'PENDING QUEUE',         value: importsList.filter(q => q.status === 'pending').length,    color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50',  icon: <Clock size={18} className="text-amber-600" /> },
            { label: 'FAILED INGESTIONS',     value: importsList.filter(q => q.status === 'failed').length,     color: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50',   icon: <XCircle size={18} className="text-rose-600" /> },
          ].map((s, i) => (
            <div key={i} className={`p-3 sm:p-3.5 rounded-xl shadow-2xs min-h-[72px] sm:min-h-[85px] flex items-center justify-between border transition-all duration-200 ${s.bg}`}>
              <div>
                <p className="text-[9px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-0.5">{s.label}</p>
                <p className={`text-base sm:text-xl lg:text-2xl font-black ${s.color}`}>{s.value}</p>
              </div>
              <div className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-800 shadow-2xs border border-slate-100 dark:border-slate-700 flex-shrink-0">
                {s.icon}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Tabs tabs={tabs} active={tab} onChange={setTab} />
        <FilterBar search={search} onSearch={setSearch} placeholder="Search supplier feeds by name or format..." />
      </div>

      {/* Supplier Feed Cards List */}
      <div className="space-y-2.5 sm:space-y-3.5">
        {filtered.length === 0 && (
          <div className="card p-12 text-center text-slate-400 border border-slate-200/90 dark:border-slate-800">
            <EmptyState
              icon={<Download size={28} className="text-slate-300" />}
              title="No import jobs found"
              description="Try selecting another tab or uploading a new feed file."
            />
          </div>
        )}
        {filtered.map(item => (
          <div key={item.id} className="card p-3 sm:p-4 hover:border-slate-300 dark:hover:border-slate-700 transition-all border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="flex items-start gap-2.5 sm:gap-3.5">
              <div
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-2xs mt-0.5 ${
                  item.status === 'completed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : item.status === 'failed'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                    : item.status === 'processing'
                    ? 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
                }`}
              >
                <Download size={16} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">{item.supplierName}</span>
                      <Badge variant="info">{connectionTypeLabel(item.connectionType)}</Badge>
                    </div>
                  </div>
                  <Badge variant={statusToVariant(item.status)} dot className="flex-shrink-0">{item.status}</Badge>
                </div>

                {item.fileName && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 leading-tight">
                    Source Feed File: <code className="mono text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-700 dark:text-slate-300 break-all inline-block">{item.fileName}</code>
                  </p>
                )}

                {item.errorMessage && (
                  <p className="text-2xs text-rose-600 dark:text-rose-400 mb-1.5 flex items-center gap-1 font-semibold bg-rose-50 dark:bg-rose-950/40 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-800/60">
                    <AlertCircle size={12} /> Error: {item.errorMessage}
                  </p>
                )}

                {/* Structured 2x2 Telemetry Grid */}
                <div className="grid grid-cols-2 gap-1.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 text-2xs mb-2">
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Processed</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 size={11} className="text-emerald-500 flex-shrink-0" />
                      {item.processedRecords > 0 ? item.processedRecords.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Failed</span>
                    <span className={`font-bold flex items-center gap-1 mt-0.5 ${item.failedRecords > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      <XCircle size={11} className={item.failedRecords > 0 ? 'text-rose-500' : 'text-slate-400'} />
                      {item.failedRecords > 0 ? item.failedRecords.toLocaleString() : '0'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Total Size</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 mt-0.5 block">{item.totalRecords.toLocaleString()} SKUs</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Ingested</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400 mt-0.5 block text-[10px]">{timeAgo(item.createdAt)}</span>
                  </div>
                </div>

                {item.status === 'processing' && (
                  <div className="mb-2">
                    <ProgressBar
                      value={item.processedRecords}
                      max={item.totalRecords}
                      color="cyan"
                      showLabel
                    />
                  </div>
                )}

                {/* Card Bottom Actions Bar */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 mt-1.5">
                  <button
                    onClick={() => setPreviewItem(item)}
                    className="btn-ghost btn-sm text-2xs font-bold flex items-center justify-center gap-1 text-primary-600 dark:text-primary-400 cursor-pointer py-1"
                    title="Preview Imported Sample Records Data"
                  >
                    <Eye size={13} /> Preview Data
                  </button>
                  {item.status === 'pending' && (
                    <button
                      onClick={() => handleSetHighPriority(item.id, item.supplierName)}
                      className="btn-secondary btn-sm text-2xs flex items-center justify-center gap-1 font-bold cursor-pointer text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 py-1"
                      title="Set High Priority Queue"
                    >
                      <Zap size={12} /> High Priority
                    </button>
                  )}
                  {item.status === 'failed' && (
                    <button
                      onClick={() => handleRetry(item.id, item.supplierName)}
                      className="btn-secondary btn-sm text-2xs flex items-center justify-center gap-1 font-bold cursor-pointer py-1"
                    >
                      <RotateCcw size={12} /> Retry Ingestion
                    </button>
                  )}
                  {item.status === 'processing' && (
                    <button
                      onClick={() => handleCancel(item.id, item.supplierName)}
                      className="btn-ghost btn-sm text-2xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center justify-center gap-1 font-bold cursor-pointer py-1"
                    >
                      <XCircle size={12} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD FEED MODAL */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Supplier Feed File"
        subtitle="Ingest CSV, XML, or Excel files into SupplyBridge PIM queue"
        size="lg"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Partner *</label>
            <select className="select" value={supplierName} onChange={e => setSupplierName(e.target.value)}>
              <option value="TechParts International">TechParts International (API/FTP)</option>
              <option value="GlobalSource Limited">GlobalSource Limited (SFTP CSV)</option>
              <option value="PrimeSupply Corp">PrimeSupply Corp (XML Feed)</option>
              <option value="AcmeDistributors">AcmeDistributors (Excel Import)</option>
              <option value="QuickShip LLC">QuickShip LLC (REST API)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">File Feed Format</label>
            <select className="select" value={fileFormat} onChange={e => setFileFormat(e.target.value)}>
              <option value="CSV">CSV (Comma Separated Values)</option>
              <option value="XML">XML (Extensible Markup Language)</option>
              <option value="XLSX">Excel Spreadsheet (.xlsx / .xls)</option>
            </select>
          </div>

          {/* Drag and Drop Zone */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Upload Feed File *</label>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-primary-500 p-6 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-850/50 transition-colors relative cursor-pointer">
              <input type="file" onChange={handleFileDrop} accept=".csv,.xml,.xlsx,.xls" className="absolute inset-0 opacity-0 cursor-pointer" />
              <UploadCloud size={32} className="mx-auto text-primary-500 mb-2" />
              {uploadedFileName ? (
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Selected File: {uploadedFileName}</p>
              ) : (
                <>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Click or drag & drop feed file here</p>
                  <p className="text-2xs text-slate-400 mt-1">Supports CSV, XML, Excel up to 50MB (max 100,000 SKUs)</p>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setUploadModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isUploading} className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
              {isUploading ? 'Parsing Feed...' : 'Start Ingestion Queue'}
            </button>
          </div>
        </form>
      </Modal>

      {/* SAMPLE RECORDS PREVIEW MODAL */}
      {previewItem && (
        <Modal
          open
          onClose={() => setPreviewItem(null)}
          title={`Import Sample Records: ${previewItem.supplierName}`}
          subtitle={`Preview parsed SKUs, prices, stock, and schema mappings from ${previewItem.fileName || 'feed'}`}
          size="xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Total File Records:</span> {previewItem.totalRecords.toLocaleString()} SKUs
              </div>
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200">Format:</span> {previewItem.connectionType.toUpperCase()}
              </div>
              <div>
                <Badge variant={statusToVariant(previewItem.status)}>{previewItem.status}</Badge>
              </div>
            </div>

            <div className="table-container w-full overflow-x-auto scrollbar-thin">
              <table className="table min-w-[700px] w-full">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800">
                    <th className="whitespace-nowrap px-4 py-3">SUPPLIER SKU</th>
                    <th className="whitespace-nowrap px-4 py-3">PRODUCT TITLE</th>
                    <th className="whitespace-nowrap px-4 py-3">CATEGORY</th>
                    <th className="whitespace-nowrap px-4 py-3">COST PRICE</th>
                    <th className="whitespace-nowrap px-4 py-3">RETAIL PRICE</th>
                    <th className="whitespace-nowrap px-4 py-3">STOCK QTY</th>
                    <th className="whitespace-nowrap px-4 py-3">MAPPING STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {MOCK_PREVIEW_RECORDS.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="whitespace-nowrap px-4 py-3"><code className="mono font-bold">{row.sku}</code></td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.name}</td>
                      <td className="whitespace-nowrap px-4 py-3"><span className="text-xs text-slate-500">{row.category}</span></td>
                      <td className="whitespace-nowrap px-4 py-3"><span className="text-xs text-slate-600 dark:text-slate-300 font-mono">${row.costPrice.toFixed(2)}</span></td>
                      <td className="whitespace-nowrap px-4 py-3"><span className="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono">${row.retailPrice.toFixed(2)}</span></td>
                      <td className="whitespace-nowrap px-4 py-3 font-bold text-emerald-600">{row.stock}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant={row.status === 'valid' ? 'success' : row.status === 'mapping_needed' ? 'warning' : 'danger'}>
                          {row.status === 'valid' ? 'Mapped' : row.status === 'mapping_needed' ? 'Needs Map' : 'Invalid'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setPreviewItem(null)} className="btn-secondary">Close Preview</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
