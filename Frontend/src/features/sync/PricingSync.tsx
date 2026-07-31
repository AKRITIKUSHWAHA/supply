import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, RefreshCw, Plus, Edit2, Trash2, CheckCircle2, FileSpreadsheet, Filter, X } from 'lucide-react'
import { SectionHeader, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

export interface PriceRule {
  id: string
  name: string
  formula: string
  applies: string
  products: number
  active: boolean
}

export interface PricingAuditRecord {
  id: string
  name: string
  sku: string
  supplier: string
  oldPrice: number
  newPrice: number
  wholesaleCost: number
  status: 'pending' | 'synced' | 'error'
  lastSync: string
}

const INITIAL_RULES: PriceRule[] = [
  { id: 'r1', name: 'Electronics — Standard Markup',  formula: 'Cost × 1.22 + $5', applies: 'Electronics', products: 45200, active: true },
  { id: 'r2', name: 'Components — Volume Pricing',    formula: 'Cost × 1.18',      applies: 'PC Components', products: 18400, active: true },
  { id: 'r3', name: 'Accessories — High Margin',      formula: 'Cost × 1.35',      applies: 'Accessories', products: 8900, active: true },
  { id: 'r4', name: 'Industrial — Fixed Margin',      formula: 'Cost + 15%',       applies: 'Industrial', products: 6200, active: true },
]

const INITIAL_AUDIT_RECORDS: PricingAuditRecord[] = [
  { id: 'pr1', name: 'AMD Ryzen 9 7950X Processor', sku: 'CPU-AMD-7950X', supplier: 'TechParts International', oldPrice: 549.99, newPrice: 579.99, wholesaleCost: 450.00, status: 'synced', lastSync: '4 min ago' },
  { id: 'pr2', name: 'NVIDIA GeForce RTX 4090 24GB', sku: 'GPU-NV-4090', supplier: 'TechParts International', oldPrice: 1599.99, newPrice: 1699.99, wholesaleCost: 1450.00, status: 'pending', lastSync: '12 min ago' },
  { id: 'pr3', name: 'DDR5 32GB 6000MHz RGB Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts International', oldPrice: 129.99, newPrice: 119.99, wholesaleCost: 89.00, status: 'synced', lastSync: '18 min ago' },
  { id: 'pr4', name: 'Samsung 990 Pro 2TB NVMe SSD', sku: 'SSD-990P-2TB', supplier: 'GlobalSource Limited', oldPrice: 169.99, newPrice: 179.99, wholesaleCost: 135.00, status: 'pending', lastSync: '28 min ago' },
  { id: 'pr5', name: 'Corsair RM1000x 1000W Gold PSU', sku: 'PSU-COR-1000W', supplier: 'GlobalSource Limited', oldPrice: 189.99, newPrice: 199.99, wholesaleCost: 150.00, status: 'synced', lastSync: '1 hr ago' },
  { id: 'pr6', name: 'Logitech MX Master 3S Mouse', sku: 'MOUSE-MX3S', supplier: 'AcmeDistributors', oldPrice: 99.99, newPrice: 109.99, wholesaleCost: 75.00, status: 'error', lastSync: '3 hr ago' },
]

export const PricingSync: React.FC = () => {
  const [rulesList, setRulesList] = useState<PriceRule[]>(INITIAL_RULES)
  const [auditRecords, setAuditRecords] = useState<PricingAuditRecord[]>(INITIAL_AUDIT_RECORDS)
  
  // Search & Filter state
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const [syncing, setSyncing] = useState(false)
  const [addRuleOpen, setAddRuleOpen] = useState(false)
  const [editRuleOpen, setEditRuleOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [editingRule, setEditingRule] = useState<PriceRule | null>(null)
  const [deletingRule, setDeletingRule] = useState<PriceRule | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [ruleFormData, setRuleFormData] = useState({
    name: '',
    formula: '',
    applies: 'Electronics',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Dynamic KPI Calculations derived from state ---
  const activeRulesCount = rulesList.filter(r => r.active).length
  const pendingUpdatesCount = auditRecords.filter(r => r.status === 'pending').length
  
  // Average Catalog Margin = sum( ((Retail - Cost)/Retail)*100 ) / total
  const avgMargin = auditRecords.length > 0
    ? (auditRecords.reduce((sum, r) => sum + (((r.newPrice - r.wholesaleCost) / r.newPrice) * 100), 0) / auditRecords.length).toFixed(1)
    : '0.0'

  const latestSyncTime = auditRecords.find(r => r.status === 'synced')?.lastSync || 'Just now'

  // Dynamic Chart Data derived from auditRecords
  const priceChartData = auditRecords.slice(0, 5).map(r => ({
    sku: r.sku,
    supplier: r.wholesaleCost,
    cost: r.wholesaleCost,
    retail: r.newPrice,
  }))

  // Supplier List for filter dropdown
  const suppliersList = ['all', ...Array.from(new Set(auditRecords.map(r => r.supplier)))]

  // Sync Prices Action
  const handleSyncPrices = () => {
    setSyncing(true)
    showNotification('Initializing price update pipeline to storefronts...')
    setTimeout(() => {
      setAuditRecords(prev =>
        prev.map(r =>
          r.status === 'pending'
            ? { ...r, status: 'synced', lastSync: 'Just now' }
            : r
        )
      )
      setSyncing(false)
      showNotification(`Pricing synchronization complete! All pending storefront prices updated.`)
    }, 1800)
  }

  // Pricing Rule Handlers
  const handleOpenAddRule = () => {
    setRuleFormData({ name: '', formula: '', applies: 'Electronics' })
    setAddRuleOpen(true)
  }

  const handleCreateRule = () => {
    if (!ruleFormData.name.trim() || !ruleFormData.formula.trim()) {
      alert('Please enter Rule Name and Formula.')
      return
    }

    const created: PriceRule = {
      id: `r_${Date.now()}`,
      name: ruleFormData.name,
      formula: ruleFormData.formula,
      applies: ruleFormData.applies,
      products: 0,
      active: true,
    }

    setRulesList(prev => [created, ...prev])
    setAddRuleOpen(false)
    showNotification(`Price Rule "${created.name}" created successfully!`)
  }

  const handleOpenEditRule = (rule: PriceRule) => {
    setEditingRule(rule)
    setRuleFormData({
      name: rule.name,
      formula: rule.formula,
      applies: rule.applies,
    })
    setEditRuleOpen(true)
  }

  const handleSaveEditRule = () => {
    if (!editingRule || !ruleFormData.name.trim() || !ruleFormData.formula.trim()) return

    setRulesList(prev =>
      prev.map(r => {
        if (r.id === editingRule.id) {
          return {
            ...r,
            name: ruleFormData.name,
            formula: ruleFormData.formula,
            applies: ruleFormData.applies,
          }
        }
        return r
      })
    )

    setEditRuleOpen(false)
    setEditingRule(null)
    showNotification(`Price Rule "${ruleFormData.name}" updated successfully!`)
  }

  const handleToggleRuleActive = (id: string) => {
    setRulesList(prev =>
      prev.map(r => (r.id === id ? { ...r, active: !r.active } : r))
    )
  }

  const handleConfirmDeleteRule = () => {
    if (!deletingRule) return

    setRulesList(prev => prev.filter(r => r.id !== deletingRule.id))
    showNotification(`Price Rule "${deletingRule.name}" deleted.`)
    setDeleteDialogOpen(false)
    setDeletingRule(null)
  }

  // Filtering Audit Records
  const filteredAuditRecords = auditRecords.filter(row => {
    const query = search.toLowerCase()
    const matchSearch =
      row.name.toLowerCase().includes(query) ||
      row.sku.toLowerCase().includes(query) ||
      row.supplier.toLowerCase().includes(query)
    
    const matchSupplier = supplierFilter === 'all' || row.supplier === supplierFilter
    const matchStatus = statusFilter === 'all' || row.status === statusFilter
    
    return matchSearch && matchSupplier && matchStatus
  })

  // Export Filtered CSV
  const handleExportPricingCSV = () => {
    showNotification('Generating Price Update Audit Log CSV export...')
    const csvHeaders = 'Product Name,SKU,Supplier,Wholesale Cost,Old Price,New Price,Change,Margin %,Sync Status,Last Sync\n'
    const csvRows = filteredAuditRecords.map(r => {
      const change = r.newPrice - r.oldPrice
      const margin = (((r.newPrice - r.wholesaleCost) / r.newPrice) * 100).toFixed(1)
      const statusLabel = r.status === 'synced' ? 'Synced' : r.status === 'pending' ? 'Pending' : 'Error'

      return `"${r.name}","${r.sku}","${r.supplier}",${r.wholesaleCost},${r.oldPrice},${r.newPrice},${change.toFixed(2)},${margin},"${statusLabel}","${r.lastSync}"`
    }).join('\n')

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Pricing_Audit_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Filtered Price Audit Log CSV file downloaded!')
  }

  const hasActiveFilters = search !== '' || supplierFilter !== 'all' || statusFilter !== 'all' || dateFilter !== 'all'
  const resetFilters = () => {
    setSearch('')
    setSupplierFilter('all')
    setStatusFilter('all')
    setDateFilter('all')
  }

  return (
    <div className="relative space-y-6">
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
        title="Pricing Synchronization"
        subtitle="Manage pricing markup rules and synchronize supplier price updates to storefronts"
        actions={
          <div className="grid grid-cols-3 gap-1.5 w-full sm:flex sm:w-auto sm:items-center sm:gap-2">
            <button
              onClick={handleExportPricingCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-semibold cursor-pointer px-2 sm:px-3 text-xs"
              title="Download Pricing Audit Log CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleOpenAddRule}
              className="btn-secondary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-semibold cursor-pointer px-2 sm:px-3 text-xs"
            >
              <Plus size={14} /> Add Rule
            </button>
            <button
              onClick={handleSyncPrices}
              disabled={syncing}
              className="btn-primary btn-sm flex items-center justify-center gap-1 sm:gap-1.5 font-bold cursor-pointer px-2 sm:px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncing ? 'animate-spin text-white' : ''} />
              <span>{syncing ? 'Syncing...' : <><span className="sm:hidden">Sync Prices</span><span className="hidden sm:inline">Sync Prices Now</span></>}</span>
            </button>
          </div>
        }
      />

      {/* Dynamic Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
        {[
          { label: 'Avg Catalog Margin', value: `${avgMargin}%`, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50', trend: 'Calculated margin' },
          { label: 'Pending Price Updates', value: `${pendingUpdatesCount} SKUs`, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50/80 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50', trend: 'Awaiting sync' },
          { label: 'Active Rules', value: activeRulesCount.toString(), color: 'text-primary-700 dark:text-primary-400', bg: 'bg-primary-50/80 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50', trend: 'Formulas active' },
          { label: 'Last Price Sync', value: latestSyncTime, color: 'text-slate-800 dark:text-slate-200', bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800', trend: 'Latest update' },
        ].map(s => (
          <div key={s.label} className={`card p-2.5 sm:p-4 border ${s.bg}`}>
            <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold mb-1 leading-tight">{s.label}</p>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-0.5 sm:gap-1">
              <p className={`text-base sm:text-2xl font-black ${s.color} whitespace-nowrap leading-tight`}>{s.value}</p>
              {s.trend && <span className="text-[9px] sm:text-2xs text-slate-500 dark:text-slate-400 font-medium leading-tight">{s.trend}</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {/* Configurable Active Pricing Rules */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <DollarSign size={16} className="text-primary-600 dark:text-primary-400" /> Active Pricing Markup Rules
            </h3>
            <span className="text-2xs text-slate-400 font-bold">{activeRulesCount} Active</span>
          </div>
          <div className="space-y-3">
            {rulesList.map(rule => (
              <div key={rule.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/70 hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{rule.name}</p>
                    {!rule.active && <Badge variant="neutral">Disabled</Badge>}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                    <code className="mono font-semibold px-2 py-0.5 bg-slate-200/70 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-md">{rule.formula}</code>
                    <span>• {rule.products.toLocaleString()} SKUs</span>
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap sm:justify-end pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-200/60 dark:border-slate-700/60">
                  <Badge variant={rule.active ? 'success' : 'neutral'}>{rule.applies}</Badge>
                  <button
                    onClick={() => handleToggleRuleActive(rule.id)}
                    className="btn-ghost btn-sm text-2xs font-bold whitespace-nowrap"
                    title={rule.active ? 'Disable Rule' : 'Enable Rule'}
                  >
                    {rule.active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleOpenEditRule(rule)}
                    className="btn-icon text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 flex-shrink-0"
                    title="Edit Rule"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => { setDeletingRule(rule); setDeleteDialogOpen(true); }}
                    className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex-shrink-0"
                    title="Delete Rule"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Supplier Cost vs Retail Price Comparison Chart */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">Supplier Cost vs Retail Price Comparison</h3>
          <ResponsiveContainer width="100%" height={230}>
            <BarChart data={priceChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="sku" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => `$${(v as number).toFixed(2)}`} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              <Bar dataKey="supplier" name="Supplier Cost" fill="#06b6d4" radius={[4,4,0,0]} />
              <Bar dataKey="retail"   name="Retail Price"   fill="#4f46e5" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Price Update Audit Log Table with Filters */}
      <div className="card p-5 border border-slate-200 dark:border-slate-800 shadow-card space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Price Update Audit Log</h3>
            <p className="text-xs text-slate-400 font-medium">Recent supplier price updates and margin calculations</p>
          </div>

          {/* Search, Supplier Filter, Status Filter & Date Filter */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder="Search Product Name, SKU, Supplier..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input text-xs"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>

            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Suppliers</option>
              {suppliersList.filter(s => s !== 'all').map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="synced">Synced</option>
              <option value="error">Error</option>
            </select>

            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
            </select>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="btn-ghost btn-sm text-2xs font-bold text-slate-500">
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[200px]">Product Name</th>
                <th className="min-w-[130px]">SKU</th>
                <th className="min-w-[120px]">Supplier</th>
                <th className="min-w-[100px]">Old Price</th>
                <th className="min-w-[100px]">New Price</th>
                <th className="min-w-[110px]">Change</th>
                <th className="min-w-[90px]">Margin</th>
                <th className="min-w-[100px]">Status</th>
                <th className="min-w-[110px]">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredAuditRecords.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No price update records match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredAuditRecords.map(row => {
                  const change = row.newPrice - row.oldPrice
                  const marginPct = (((row.newPrice - row.wholesaleCost) / row.newPrice) * 100).toFixed(1)

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td data-label="Product Name"><span className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">{row.name}</span></td>
                      <td data-label="SKU">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs font-semibold inline-block whitespace-nowrap">
                          {row.sku}
                        </span>
                      </td>
                      <td data-label="Supplier"><span className="text-xs text-slate-600 dark:text-slate-300 font-semibold whitespace-nowrap">{row.supplier}</span></td>
                      <td data-label="Old Price"><span className="text-xs text-slate-500 dark:text-slate-400 font-mono font-medium whitespace-nowrap">${row.oldPrice.toFixed(2)}</span></td>
                      <td data-label="New Price"><span className="text-xs font-bold text-slate-900 dark:text-slate-100 font-mono whitespace-nowrap">${row.newPrice.toFixed(2)}</span></td>
                      <td data-label="Change">
                        <span className={`inline-flex items-center gap-1 text-xs font-bold whitespace-nowrap ${change > 0 ? 'text-emerald-600 dark:text-emerald-400' : change < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                          {change > 0 ? <TrendingUp size={12} /> : change < 0 ? <TrendingDown size={12} /> : '='}
                          {change > 0 ? '+' : ''}${change.toFixed(2)}
                        </span>
                      </td>
                      <td data-label="Margin"><span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">{marginPct}%</span></td>
                      <td data-label="Status">
                        {row.status === 'synced' && <Badge variant="success" dot>Synced</Badge>}
                        {row.status === 'pending' && <Badge variant="warning" dot>Pending</Badge>}
                        {row.status === 'error' && <Badge variant="danger" dot>Error</Badge>}
                      </td>
                      <td data-label="Time"><span className="text-xs text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{row.lastSync}</span></td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD PRICE RULE MODAL --- */}
      <Modal
        open={addRuleOpen}
        onClose={() => setAddRuleOpen(false)}
        title="Add Pricing Rule"
        subtitle="Define dynamic markup formulas for supplier catalog prices"
        size="md"
        footer={
          <>
            <button onClick={() => setAddRuleOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateRule} className="btn-primary">Create Price Rule</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Rule Name *</label>
            <input
              className="input"
              placeholder="e.g. Components — 20% Standard Markup"
              value={ruleFormData.name}
              onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Formula Definition *</label>
            <input
              className="input font-mono text-xs"
              placeholder="e.g. Cost * 1.20 + $3"
              value={ruleFormData.formula}
              onChange={e => setRuleFormData({ ...ruleFormData, formula: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Applies To Category</label>
            <select
              className="select font-medium"
              value={ruleFormData.applies}
              onChange={e => setRuleFormData({ ...ruleFormData, applies: e.target.value })}
            >
              <option value="Electronics">Electronics</option>
              <option value="PC Components">PC Components</option>
              <option value="Accessories">Accessories</option>
              <option value="Industrial">Industrial</option>
              <option value="All Catalog">All Catalog</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- EDIT PRICE RULE MODAL --- */}
      <Modal
        open={editRuleOpen}
        onClose={() => setEditRuleOpen(false)}
        title="Edit Pricing Rule"
        subtitle={`Updating formula for ${editingRule?.name}`}
        size="md"
        footer={
          <>
            <button onClick={() => setEditRuleOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEditRule} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Rule Name *</label>
            <input
              className="input"
              value={ruleFormData.name}
              onChange={e => setRuleFormData({ ...ruleFormData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Formula Definition *</label>
            <input
              className="input font-mono text-xs"
              value={ruleFormData.formula}
              onChange={e => setRuleFormData({ ...ruleFormData, formula: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Applies To Category</label>
            <select
              className="select font-medium"
              value={ruleFormData.applies}
              onChange={e => setRuleFormData({ ...ruleFormData, applies: e.target.value })}
            >
              <option value="Electronics">Electronics</option>
              <option value="PC Components">PC Components</option>
              <option value="Accessories">Accessories</option>
              <option value="Industrial">Industrial</option>
              <option value="All Catalog">All Catalog</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDeleteRule}
        title="Delete Pricing Rule"
        message={`Are you sure you want to delete rule "${deletingRule?.name}"?`}
        confirmLabel="Yes, Delete Rule"
        danger
      />
    </div>
  )
}
