import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, CheckCircle2, XCircle, Eye, AlertTriangle, RefreshCw,
  Info, PhoneForwarded, Download, UserPlus, Filter, Search, Zap, Check, Sliders
} from 'lucide-react'
import { SectionHeader, FilterBar, Tabs, Spinner } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockValidationItems } from '../../data/mockData'
import { statusToVariant, timeAgo } from '../../utils'
import type { ValidationItem } from '../../types'
import { useAuth } from '../../context/AuthContext'

const errorTypeLabel: Record<string, string> = {
  duplicate_sku: 'Duplicate SKUs',
  duplicate_upc: 'Duplicate UPCs',
  missing_image: 'Missing Images',
  missing_price: 'Missing Pricing',
  missing_inventory: 'Missing Inventory',
  invalid_category: 'Missing Categories',
  missing_attribute: 'Missing Attributes',
  invalid_variant: 'Invalid Variants',
}

export const ValidationCenter: React.FC = () => {
  const { role } = useAuth()
  const [items, setItems] = useState<ValidationItem[]>(mockValidationItems)
  const [tab, setTab] = useState('pending')
  const [search, setSearch] = useState('')
  const [selectedSupplier, setSelectedSupplier] = useState('All Suppliers')
  const [selectedErrorType, setSelectedErrorType] = useState('All Error Types')
  
  const [reviewItem, setReviewItem] = useState<ValidationItem | null>(null)
  const [reviewNotes, setReviewNotes] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [assignReviewerOpen, setAssignReviewerOpen] = useState(false)
  const [assignedReviewerName, setAssignedReviewerName] = useState('Alex Morrison')
  
  const [isLoading, setIsLoading] = useState(false)
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null)

  // Auto-clear toast messages
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3500)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  useEffect(() => {
    setReviewNotes('')
  }, [reviewItem])

  // Extract unique suppliers list
  const suppliersList = ['All Suppliers', ...Array.from(new Set(items.map(item => item.supplierName)))]

  // Calculate Status Tabs Counts Dynamically
  const pendingReviewCount = items.filter(v => v.status === 'pending' && v.errors.length > 0).length
  const inReviewCount = items.filter(v => v.status === 'review' && v.errors.length > 0).length
  const readyForApprovalCount = items.filter(v => v.errors.length === 0 && v.status !== 'approved' && v.status !== 'rejected').length
  const approvedCount = items.filter(v => v.status === 'approved').length
  const rejectedCount = items.filter(v => v.status === 'rejected').length

  const tabs = [
    { id: 'pending',            label: 'Pending Review',     count: pendingReviewCount },
    { id: 'review',             label: 'In Review',          count: inReviewCount },
    { id: 'ready_for_approval', label: 'Ready For Approval', count: readyForApprovalCount },
    { id: 'approved',           label: 'Approved',           count: approvedCount },
    { id: 'rejected',           label: 'Rejected',           count: rejectedCount },
    { id: 'all',                label: 'All Items',          count: items.length },
  ]

  // Validation Summary Telemetry Metrics
  const totalValidationIssuesCount = items.reduce((acc, item) => acc + item.errors.length, 0)
  const criticalIssuesCount = items.reduce((acc, item) => acc + item.errors.filter(e => e.severity === 'error').length, 0)
  const warningIssuesCount = items.reduce((acc, item) => acc + item.errors.filter(e => e.severity === 'warning').length, 0)
  const totalProducts = items.length
  const validProductsCount = items.filter(i => i.errors.length === 0).length
  const validationScorePct = totalProducts > 0 ? Math.round((validProductsCount / totalProducts) * 1000) / 10 : 100

  // Filtered List
  const filtered = useMemo(() => {
    return items.filter(v => {
      // Tab Filter
      let matchTab = true
      if (tab === 'pending') matchTab = v.status === 'pending' && v.errors.length > 0
      else if (tab === 'review') matchTab = v.status === 'review' && v.errors.length > 0
      else if (tab === 'ready_for_approval') matchTab = v.errors.length === 0 && v.status !== 'approved' && v.status !== 'rejected'
      else if (tab === 'approved') matchTab = v.status === 'approved'
      else if (tab === 'rejected') matchTab = v.status === 'rejected'

      const query = search.toLowerCase()
      const matchSearch =
        v.productName.toLowerCase().includes(query) ||
        v.supplierSku.toLowerCase().includes(query) ||
        v.supplierName.toLowerCase().includes(query)

      const matchSupplier = selectedSupplier === 'All Suppliers' || v.supplierName === selectedSupplier
      const matchErrorType =
        selectedErrorType === 'All Error Types' ||
        v.errors.some(err => errorTypeLabel[err.type] === selectedErrorType || err.type === selectedErrorType)

      return matchTab && matchSearch && matchSupplier && matchErrorType
    })
  }, [items, tab, search, selectedSupplier, selectedErrorType])

  // Helper count for Error Types breakdown
  const getErrorTypeCount = (type: string) => {
    return items.filter(item => item.errors.some(err => err.type === type)).length
  }

  // Checkbox toggle
  const toggleSelect = (id: string) =>
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  // --- Handlers ---
  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      setItems(mockValidationItems)
      setSelectedIds([])
      setIsLoading(false)
      setToastMessage({ text: 'Validation queue refreshed from backend.', type: 'success' })
    }, 800)
  }

  const handleApproveSingle = (id: string, name?: string) => {
    const targetItem = items.find(i => i.id === id)
    if (!targetItem) return
    if (targetItem.errors.length > 0) {
      setToastMessage({
        text: `Approval Blocked: "${name || 'Item'}" has ${targetItem.errors.length} unresolved validation issue(s).`,
        type: 'error',
      })
      return
    }
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'approved' } : item))
    )
    setToastMessage({ text: `Product "${name || 'Item'}" approved and marked as publishable!`, type: 'success' })
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (reviewItem?.id === id) setReviewItem(null)
  }

  const handleRejectSingle = (id: string, name?: string) => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: 'rejected' } : item))
    )
    setToastMessage({ text: `Product "${name || 'Item'}" moved to Rejected tab.`, type: 'info' })
    setSelectedIds(prev => prev.filter(x => x !== id))
    if (reviewItem?.id === id) setReviewItem(null)
  }

  // --- Bulk Enterprise Actions ---
  const handleBulkApprove = () => {
    if (selectedIds.length === 0) return
    const selectedItems = items.filter(i => selectedIds.includes(i.id))
    const invalidItems = selectedItems.filter(i => i.errors.length > 0)
    if (invalidItems.length > 0) {
      setToastMessage({
        text: `Approval Blocked: ${invalidItems.length} selected item(s) contain unresolved validation errors. Resolve errors first!`,
        type: 'error',
      })
      return
    }
    setItems(prev =>
      prev.map(item => (selectedIds.includes(item.id) ? { ...item, status: 'approved' } : item))
    )
    setToastMessage({ text: `${selectedIds.length} item(s) approved for storefront publishing!`, type: 'success' })
    setSelectedIds([])
  }

  const handleBulkReject = () => {
    if (selectedIds.length === 0) return
    setItems(prev =>
      prev.map(item => (selectedIds.includes(item.id) ? { ...item, status: 'rejected' } : item))
    )
    setToastMessage({ text: `${selectedIds.length} item(s) marked as Rejected.`, type: 'info' })
    setSelectedIds([])
  }

  const handleBulkAssignReviewer = () => {
    if (selectedIds.length === 0) return
    setAssignReviewerOpen(true)
  }

  const handleSaveAssignReviewer = () => {
    setAssignReviewerOpen(false)
    setToastMessage({ text: `Assigned ${selectedIds.length} selected product(s) to reviewer ${assignedReviewerName}.`, type: 'success' })
    setSelectedIds([])
  }

  const handleBulkExportCSV = () => {
    if (selectedIds.length === 0) return
    const selectedItems = items.filter(i => selectedIds.includes(i.id))
    const headers = 'Product Title,Supplier SKU,Supplier Name,Validation Status,Issue Count,Created Date\n'
    const rows = selectedItems.map(i =>
      `"${i.productName}","${i.supplierSku}","${i.supplierName}","${i.status}",${i.errors.length},"${i.createdAt}"`
    ).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Validation_Selected_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setToastMessage({ text: `${selectedIds.length} selected validation record(s) exported to CSV.`, type: 'success' })
  }

  const handleOpenReview = (item: ValidationItem) => {
    if (item.status === 'pending' && item.errors.length > 0) {
      setItems(prev =>
        prev.map(x => (x.id === item.id ? { ...x, status: 'review' } : x))
      )
    }
    setReviewItem({ ...item, status: item.status === 'pending' ? 'review' : item.status })
  }

  const handleResolveSingleError = (itemId: string, errorIndex: number) => {
    setItems(prev =>
      prev.map(item => {
        if (item.id !== itemId) return item
        const updatedErrors = item.errors.filter((_, idx) => idx !== errorIndex)
        return { ...item, errors: updatedErrors }
      })
    )
    if (reviewItem && reviewItem.id === itemId) {
      const updatedErrors = reviewItem.errors.filter((_, idx) => idx !== errorIndex)
      setReviewItem({ ...reviewItem, errors: updatedErrors })
    }
    setToastMessage({ text: 'Validation issue resolved.', type: 'success' })
  }

  const handleResolveAll = (itemId: string) => {
    setItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, errors: [] } : item))
    )
    if (reviewItem && reviewItem.id === itemId) {
      setReviewItem({ ...reviewItem, errors: [] })
    }
    setToastMessage({ text: 'All validation issues resolved. Product is now Ready For Approval!', type: 'success' })
  }

  return (
    <div className="relative pb-12 sm:pb-6 space-y-6">
      {/* Toast Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl shadow-lg border text-xs flex items-center gap-2 font-semibold transition-all ${
              toastMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
              toastMessage.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-blue-50 text-blue-800 border-blue-200'
            }`}
          >
            {toastMessage.type === 'success' ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Info size={16} />}
            {toastMessage.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <SectionHeader
        title="Validation Center"
        subtitle="Review, resolve, and audit product validation errors before approving for storefront publishing"
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button onClick={handleRefresh} className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer text-xs font-bold" disabled={isLoading}>
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
              Refresh Queue
            </button>
          </div>
        }
      />

      {/* Official Business Workflow Banner */}
      <div className="card p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
        <p className="text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
          Official Product Validation Workflow Pipeline
        </p>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 text-center text-2xs">
          {[
            { step: '1. Supplier Import' },
            { step: '2. Auto Validation' },
            { step: '3. Errors Detected' },
            { step: '4. Open Details' },
            { step: '5. Resolve Issues' },
            { step: '6. Ready For Approval' },
            { step: '7. Approve' },
            { step: '8. Publish Eligible' },
          ].map((s, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1">
              <Zap size={11} className="text-amber-500 flex-shrink-0" />
              <span className="truncate">{s.step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Publishing Guard Alert Banner */}
      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200 shadow-xs">
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <span className="font-bold">Strict Validation Guard Active:</span>
          <span>Products with unresolved validation issues can NEVER be approved or published to storefronts.</span>
        </div>
        <Badge variant="warning" dot>PUBLISH BLOCKED</Badge>
      </div>

      {/* Validation Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[
          { label: 'TOTAL ISSUES', value: `${totalValidationIssuesCount} Issues`, color: 'text-slate-900 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800', sub: `${items.filter(i => i.errors.length > 0).length} Products Affected` },
          { label: 'CRITICAL ISSUES', value: `${criticalIssuesCount} Errors`, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50', sub: 'Requires immediate resolution' },
          { label: 'WARNING ISSUES', value: `${warningIssuesCount} Warnings`, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50', sub: 'Metadata quality alerts' },
          { label: 'VALIDATION SCORE', value: `${validationScorePct}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50', sub: `${validProductsCount} of ${totalProducts} Products Validated` },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl shadow-xs flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Error Category Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {[
          { label: 'Duplicate SKUs', value: getErrorTypeCount('duplicate_sku'), color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/60' },
          { label: 'Duplicate UPCs', value: getErrorTypeCount('duplicate_upc'), color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/60' },
          { label: 'Missing Images', value: getErrorTypeCount('missing_image'), color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/60' },
          { label: 'Missing Pricing', value: getErrorTypeCount('missing_price'), color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/60' },
          { label: 'Missing Inventory', value: getErrorTypeCount('missing_inventory'), color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/60' },
          { label: 'Missing Categories', value: getErrorTypeCount('invalid_category'), color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/60' },
          { label: 'Missing Attributes', value: getErrorTypeCount('missing_attribute'), color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/60' },
          { label: 'Invalid Variants', value: getErrorTypeCount('invalid_variant'), color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/60' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-xl p-2.5 text-center border border-slate-100 dark:border-slate-800`}>
            <p className={`text-lg font-black ${s.color}`}>{s.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5 font-bold leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Synchronized Status Tabs */}
      <Tabs tabs={tabs} active={tab} onChange={setTab} />
      
      <FilterBar search={search} onSearch={setSearch} placeholder="Search product title, SKU, or supplier...">
        <div className="flex justify-center gap-3 w-full sm:justify-start sm:w-auto">
          <select
            className="select input-sm w-[140px] font-medium text-xs"
            value={selectedSupplier}
            onChange={e => setSelectedSupplier(e.target.value)}
          >
            {suppliersList.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
          <select
            className="select input-sm w-[160px] font-medium text-xs"
            value={selectedErrorType}
            onChange={e => setSelectedErrorType(e.target.value)}
          >
            <option value="All Error Types">All Error Types</option>
            <option value="Duplicate SKUs">Duplicate SKUs</option>
            <option value="Duplicate UPCs">Duplicate UPCs</option>
            <option value="Missing Images">Missing Images</option>
            <option value="Missing Pricing">Missing Pricing</option>
            <option value="Missing Inventory">Missing Inventory</option>
            <option value="Missing Categories">Missing Categories</option>
            <option value="Missing Attributes">Missing Attributes</option>
            <option value="Invalid Variants">Invalid Variants</option>
          </select>
        </div>
      </FilterBar>

      {/* Bulk Select & Bulk Enterprise Actions Bar */}
      <div className="card p-3 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            checked={filtered.length > 0 && filtered.every(v => selectedIds.includes(v.id))}
            onChange={e => setSelectedIds(e.target.checked ? filtered.map(v => v.id) : [])}
          />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {selectedIds.length > 0 ? `${selectedIds.length} item(s) selected` : 'Select All Items'}
          </span>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={handleBulkApprove} className="btn-primary btn-sm text-2xs flex items-center gap-1 font-bold cursor-pointer">
              <CheckCircle2 size={13} /> Approve Selected
            </button>
            <button onClick={handleBulkReject} className="btn-secondary btn-sm text-2xs text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 flex items-center gap-1 font-bold cursor-pointer">
              <XCircle size={13} /> Reject Selected
            </button>
            <button onClick={handleBulkAssignReviewer} className="btn-secondary btn-sm text-2xs flex items-center gap-1 font-bold cursor-pointer">
              <UserPlus size={13} /> Assign Reviewer
            </button>
            <button onClick={handleBulkExportCSV} className="btn-secondary btn-sm text-2xs flex items-center gap-1 font-bold cursor-pointer">
              <Download size={13} /> Export Selected
            </button>
          </div>
        )}
      </div>

      {/* Main Validation Product List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="card p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Spinner size={32} />
            <p className="font-medium text-slate-500 text-xs">Fetching validation logs...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="card p-16 text-center text-slate-400">
            <ShieldCheck size={36} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium text-slate-600 text-xs">No validation records match your search and filter criteria.</p>
          </div>
        ) : (
          filtered.map(item => {
            const hasErrors = item.errors.length > 0
            const criticalErrors = item.errors.filter(e => e.severity === 'error').length
            const warningErrors = item.errors.filter(e => e.severity === 'warning').length
            const overallSeverity = criticalErrors > 0 ? 'Critical' : warningErrors > 0 ? 'Warning' : 'Info'

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-4 sm:p-5 hover:shadow-card-md transition-all cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                onClick={() => handleOpenReview(item)}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0 w-full flex-1">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 mt-1 flex-shrink-0"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div className="min-w-0 pr-2">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-snug break-words">{item.productName}</p>
                          <p className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                            <span>SKU:</span>
                            <code className="mono text-xs">{item.supplierSku}</code>
                            <span>·</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{item.supplierName}</span>
                            <span>·</span>
                            <span className="font-mono">{timeAgo(item.createdAt)}</span>
                            <span>·</span>
                            <span>Reviewer: <strong className="text-slate-700 dark:text-slate-200">Alex Morrison</strong></span>
                          </p>
                        </div>
                        <div className="flex-shrink-0 self-start sm:self-auto flex items-center gap-1.5">
                          {/* Severity Indicator */}
                          {hasErrors && (
                            <span className={`text-2xs font-extrabold px-2 py-0.5 rounded-md ${
                              overallSeverity === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400' :
                              overallSeverity === 'Warning' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {overallSeverity} Severity
                            </span>
                          )}

                          {!hasErrors && item.status !== 'approved' && item.status !== 'rejected' ? (
                            <span className="text-2xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2.5 py-1 rounded-full">
                              Ready For Approval
                            </span>
                          ) : (
                            <Badge variant={statusToVariant(item.status)}>
                              {item.status === 'pending' ? 'Pending Review' : item.status === 'review' ? 'In Review' : item.status}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Issue Count & Tags */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-3">
                        {hasErrors ? (
                          item.errors.map((err, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                                err.severity === 'error' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                              }`}
                            >
                              {err.severity === 'error' ? <XCircle size={11} className="flex-shrink-0" /> : <AlertTriangle size={11} className="flex-shrink-0" />}
                              <span>{errorTypeLabel[err.type] ?? err.type}</span>
                            </div>
                          ))
                        ) : (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                            <CheckCircle2 size={11} className="flex-shrink-0" />
                            <span>0 Issues — Ready For Approval</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Workflow Action Suite (View Details -> Resolve -> Ready For Approval -> Approve) */}
                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800" onClick={e => e.stopPropagation()}>
                    <button onClick={() => handleOpenReview(item)} className="btn-secondary btn-sm flex items-center justify-center gap-1 text-xs font-bold flex-1 md:flex-none cursor-pointer">
                      <Eye size={13} /> View Details
                    </button>

                    <button
                      onClick={() => handleApproveSingle(item.id, item.productName)}
                      className={`btn-sm flex items-center justify-center gap-1 text-xs font-bold flex-1 md:flex-none ${
                        hasErrors
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800/80 dark:text-slate-500 cursor-not-allowed border border-slate-200 dark:border-slate-800'
                          : 'btn-primary shadow-md shadow-indigo-500/20 cursor-pointer'
                      }`}
                      disabled={item.status === 'approved' || hasErrors}
                      title={hasErrors ? 'Approval blocked: Resolve validation errors first' : 'Approve product'}
                    >
                      <CheckCircle2 size={13} /> Approve
                    </button>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </div>

      {/* Review & Resolve Issues Modal */}
      {reviewItem && (
        <Modal
          open
          onClose={() => setReviewItem(null)}
          title={`Validation Details: ${reviewItem.productName}`}
          subtitle={`Supplier: ${reviewItem.supplierName} · SKU: ${reviewItem.supplierSku}`}
          size="lg"
          footer={
            <>
              <button onClick={() => setReviewItem(null)} className="btn-secondary">
                Close
              </button>
              <button
                onClick={() => {
                  handleRejectSingle(reviewItem.id, reviewItem.productName)
                  setReviewItem(null)
                }}
                className="btn-secondary text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900 hover:bg-rose-50 flex items-center gap-1.5 cursor-pointer text-xs font-bold"
              >
                <XCircle size={14} /> Reject Item
              </button>

              {reviewItem.errors.length > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                  <AlertTriangle size={14} />
                  <span>Approval Blocked (Resolve issues first)</span>
                </div>
              ) : (
                <button
                  onClick={() => {
                    handleApproveSingle(reviewItem.id, reviewItem.productName)
                    setReviewItem(null)
                  }}
                  className="btn-primary flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-md shadow-indigo-500/20"
                >
                  <CheckCircle2 size={14} /> Approve Product
                </button>
              )}
            </>
          }

        >
          <div className="space-y-4 text-xs">
            {reviewItem.errors.length > 0 ? (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-rose-800 dark:text-rose-300">
                    Validation Errors Detected ({reviewItem.errors.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => handleResolveAll(reviewItem.id)}
                    className="text-2xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 px-2.5 py-1 rounded-md cursor-pointer"
                  >
                    Resolve All Issues
                  </button>
                </div>
                {reviewItem.errors.map((err, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 text-xs text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-rose-100 dark:border-rose-900/40">
                    <div className="flex items-start gap-2 min-w-0">
                      {err.severity === 'error' ? (
                        <XCircle size={14} className="flex-shrink-0 mt-0.5 text-rose-500" />
                      ) : (
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                      )}
                      <span>
                        <strong>{errorTypeLabel[err.type] || err.type}:</strong> {err.message}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleResolveSingleError(reviewItem.id, i)}
                      className="btn-secondary btn-xs text-2xs flex-shrink-0 text-emerald-700 hover:bg-emerald-50 border-emerald-300 font-bold cursor-pointer"
                    >
                      Resolve
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl p-4 flex items-center gap-3 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">All Validation Issues Resolved!</p>
                  <p className="text-slate-600 dark:text-slate-400 mt-0.5">This product is now in the <strong>Ready For Approval</strong> state and eligible for storefront publishing.</p>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Reviewer Audit Notes</label>
              <textarea
                className="input"
                rows={3}
                placeholder="Add audit notes for this validation review..."
                value={reviewNotes}
                onChange={e => setReviewNotes(e.target.value)}
              />
            </div>
          </div>
        </Modal>
      )}

      {/* Assign Reviewer Bulk Modal */}
      <Modal
        open={assignReviewerOpen}
        onClose={() => setAssignReviewerOpen(false)}
        title="Assign Reviewer to Selected Products"
        subtitle={`Assigning ${selectedIds.length} item(s) to team member`}
        size="md"
        footer={
          <>
            <button onClick={() => setAssignReviewerOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveAssignReviewer} className="btn-primary">Save Assignment</button>
          </>
        }
      >
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Select Assignee Reviewer</label>
          <select
            className="select font-medium text-xs"
            value={assignedReviewerName}
            onChange={e => setAssignedReviewerName(e.target.value)}
          >
            <option value="Alex Morrison">Alex Morrison (Catalog Manager)</option>
            <option value="Sarah Jenkins">Sarah Jenkins (Administrator)</option>
            <option value="David Miller">David Miller (PIM Specialist)</option>
          </select>
        </div>
      </Modal>
    </div>
  )
}
