import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw, CheckCircle2, TrendingDown, TrendingUp,
  Search, Download, Sliders, AlertTriangle, Layers, Filter, X, Eye, RotateCcw
} from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

export interface InventoryItem {
  id: string
  name: string
  sku: string
  supplier: string
  supplierStock: number
  buffer: number
  storefrontStock: number
  syncStatus: 'Synced' | 'Pending Push' | 'Out of Sync' | 'Error' | 'Syncing'
  lastSync: string
  updatedAt: string
}

const INITIAL_ITEMS: InventoryItem[] = [
  { id: 'inv1', name: 'AMD Ryzen 9 7950X Processor 16-Core', sku: 'CPU-AMD-7950X', supplier: 'TechParts International', supplierStock: 450, buffer: 5, storefrontStock: 445, syncStatus: 'Synced', lastSync: '4 min ago', updatedAt: '2026-07-27 16:20' },
  { id: 'inv2', name: 'NVIDIA GeForce RTX 4090 24GB OC', sku: 'GPU-NV-4090', supplier: 'TechParts International', supplierStock: 18, buffer: 3, storefrontStock: 12, syncStatus: 'Out of Sync', lastSync: '12 min ago', updatedAt: '2026-07-27 16:10' },
  { id: 'inv3', name: 'DDR5 32GB 6000MHz RGB Memory Kit', sku: 'RAM-DDR5-001', supplier: 'TechParts International', supplierStock: 325, buffer: 5, storefrontStock: 320, syncStatus: 'Synced', lastSync: '18 min ago', updatedAt: '2026-07-27 16:00' },
  { id: 'inv4', name: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD', sku: 'SSD-990P-2TB', supplier: 'GlobalSource Limited', supplierStock: 195, buffer: 5, storefrontStock: 180, syncStatus: 'Pending Push', lastSync: '28 min ago', updatedAt: '2026-07-27 15:50' },
  { id: 'inv5', name: 'Corsair RM1000x 1000W 80+ Gold Modular PSU', sku: 'PSU-COR-1000W', supplier: 'GlobalSource Limited', supplierStock: 0, buffer: 2, storefrontStock: 0, syncStatus: 'Synced', lastSync: '1 hr ago', updatedAt: '2026-07-27 15:00' },
  { id: 'inv6', name: 'ASUS ROG Swift 27" 1440P 240Hz Gaming Monitor', sku: 'MON-ASUS-27', supplier: 'PrimeSupply Corp', supplierStock: 82, buffer: 2, storefrontStock: 80, syncStatus: 'Synced', lastSync: '2 hr ago', updatedAt: '2026-07-27 14:00' },
  { id: 'inv7', name: 'Logitech MX Master 3S Wireless Mouse', sku: 'MOUSE-MX3S', supplier: 'Acme Distributors', supplierStock: 120, buffer: 5, storefrontStock: 90, syncStatus: 'Error', lastSync: '3 hr ago', updatedAt: '2026-07-27 13:00' },
  { id: 'inv8', name: 'Keychron Q1 Pro Wireless Mechanical Keyboard', sku: 'KEY-Q1PRO', supplier: 'QuickShip LLC', supplierStock: 64, buffer: 2, storefrontStock: 62, syncStatus: 'Synced', lastSync: '5 min ago', updatedAt: '2026-07-27 16:22' },
]

export const InventorySync: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_ITEMS)
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Filters & Searches
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [quickFilter, setQuickFilter] = useState('All')

  // Modals
  const [viewItem, setViewItem] = useState<InventoryItem | null>(null)
  const [bufferModalOpen, setBufferModalOpen] = useState(false)
  const [globalBuffer, setGlobalBuffer] = useState(5)
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null)
  const [editItemBuffer, setEditItemBuffer] = useState<number>(5)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Dynamic Inventory Metrics Formulas ---
  // Available Stock = Math.max(0, Supplier Stock - Safety Buffer)
  // Variance = Available Stock - Storefront Stock
  const getItemCalculations = (item: InventoryItem) => {
    const buffer = Math.max(0, item.buffer)
    const availableStock = Math.max(0, item.supplierStock - buffer)
    const variance = availableStock - item.storefrontStock
    return { availableStock, variance, buffer }
  }

  // --- Summary Telemetry KPI Cards ---
  const totalInStockSKUs = items.filter(i => i.supplierStock > 0).length
  const totalInStockUnits = items.reduce((acc, i) => acc + i.supplierStock, 0)
  const pendingSyncQueueCount = items.filter(i => i.syncStatus === 'Pending Push' || i.syncStatus === 'Out of Sync').length
  const totalItemsCount = items.length
  const healthySyncedCount = items.filter(i => i.syncStatus === 'Synced').length
  const inventoryHealthPct = totalItemsCount > 0 ? Math.round((healthySyncedCount / totalItemsCount) * 100) : 100
  const lowStockWarningsCount = items.filter(i => {
    const { availableStock, buffer } = getItemCalculations(i)
    return availableStock <= buffer * 2
  }).length

  // List of unique suppliers
  const suppliersList = ['all', ...Array.from(new Set(items.map(i => i.supplier)))]

  // --- Supplier Pipeline Statuses (Healthy, Syncing, Pending, Warning, Error) ---
  const supplierPipeline = useMemo(() => {
    const uniqueSuppliers = Array.from(new Set(items.map(i => i.supplier)))

    return uniqueSuppliers.map(supName => {
      const supItems = items.filter(i => i.supplier === supName)
      const errorCount = supItems.filter(i => i.syncStatus === 'Error').length
      const syncingCount = supItems.filter(i => i.syncStatus === 'Syncing').length
      const pendingCount = supItems.filter(i => i.syncStatus === 'Pending Push' || i.syncStatus === 'Out of Sync').length
      const totalCount = supItems.length
      const syncedCount = supItems.filter(i => i.syncStatus === 'Synced').length
      const progress = Math.round((syncedCount / totalCount) * 100)

      let pipelineState: 'Healthy' | 'Syncing' | 'Pending' | 'Warning' | 'Error' = 'Healthy'
      if (errorCount > 0) pipelineState = 'Error'
      else if (syncingCount > 0) pipelineState = 'Syncing'
      else if (pendingCount > 0) pipelineState = 'Pending'

      return {
        name: supName,
        totalCount,
        pendingCount,
        errorCount,
        progress,
        pipelineState,
        lastSync: supItems[0]?.lastSync || 'Just now',
      }
    })
  }, [items])

  // --- Handlers for Sync Workflows ---

  // 1. Sync All Stock Now
  const handleSyncAll = () => {
    setSyncingAll(true)
    showNotification('Initiating global inventory stock sync for all connected suppliers...')

    setItems(prev =>
      prev.map(item => ({ ...item, syncStatus: 'Syncing' }))
    )

    setTimeout(() => {
      setItems(prev =>
        prev.map(item => {
          const buffer = Math.max(0, item.buffer)
          const available = Math.max(0, item.supplierStock - buffer)
          return {
            ...item,
            storefrontStock: available,
            syncStatus: 'Synced',
            lastSync: 'Just now',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        })
      )
      setSyncingAll(false)
      showNotification('Global Inventory Stock Sync completed successfully!')
    }, 1800)
  }

  // 2. Single SKU Sync / Retry
  const handleSyncSingle = (id: string, name: string) => {
    setSyncingItemId(id)
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, syncStatus: 'Syncing' } : item))
    )

    setTimeout(() => {
      setItems(prev =>
        prev.map(item => {
          if (item.id !== id) return item
          const buffer = Math.max(0, item.buffer)
          const available = Math.max(0, item.supplierStock - buffer)
          return {
            ...item,
            storefrontStock: available,
            syncStatus: 'Synced',
            lastSync: 'Just now',
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          }
        })
      )
      setSyncingItemId(null)
      showNotification(`Stock levels synchronized successfully for "${name}"!`)
    }, 1400)
  }

  // Global Buffer Configuration
  const handleSaveGlobalBuffer = () => {
    const validBuffer = Math.max(0, globalBuffer)
    setItems(prev =>
      prev.map(item => ({ ...item, buffer: validBuffer }))
    )
    setBufferModalOpen(false)
    showNotification(`Global Safety Reserve Buffer set to ${validBuffer} units.`)
  }

  // SKU Buffer Configuration
  const handleOpenEditBuffer = (item: InventoryItem) => {
    setEditingItem(item)
    setEditItemBuffer(Math.max(0, item.buffer))
  }

  const handleSaveItemBuffer = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const validBuffer = Math.max(0, editItemBuffer)
    setItems(prev =>
      prev.map(item => (item.id === editingItem.id ? { ...item, buffer: validBuffer } : item))
    )
    showNotification(`Safety Buffer set to ${validBuffer} units for SKU "${editingItem.sku}".`)
    setEditingItem(null)
  }

  // Export CSV
  const handleExportCSV = () => {
    showNotification('Exporting Inventory Stock Audit CSV Report...')
    const headers = 'Product Name,Master SKU,Supplier,Supplier Stock,Safety Buffer,Available Stock,Storefront Stock,Variance,Sync Status,Last Sync\n'
    const rows = filteredItems.map(i => {
      const { availableStock, variance, buffer } = getItemCalculations(i)
      return `"${i.name}","${i.sku}","${i.supplier}",${i.supplierStock},${buffer},${availableStock},${i.storefrontStock},${variance},"${i.syncStatus}","${i.lastSync}"`
    }).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Inventory_Report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Inventory Audit CSV downloaded!')
  }

  // Filtering Inventory Items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const query = search.toLowerCase()
      const matchSearch =
        item.name.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query)

      const matchSupplier = supplierFilter === 'all' || item.supplier === supplierFilter
      const matchStatus = statusFilter === 'all' || item.syncStatus.toLowerCase().replace(/\s+/g, '_') === statusFilter

      // Quick Filters
      const { availableStock, buffer } = getItemCalculations(item)
      let matchQuick = true
      if (quickFilter === 'Low Stock') matchQuick = availableStock <= buffer * 2
      else if (quickFilter === 'Out of Sync') matchQuick = item.syncStatus === 'Out of Sync' || item.syncStatus === 'Pending Push'
      else if (quickFilter === 'Error') matchQuick = item.syncStatus === 'Error'
      else if (quickFilter === 'Recently Updated') matchQuick = item.lastSync.includes('min') || item.lastSync === 'Just now'

      return matchSearch && matchSupplier && matchStatus && matchQuick
    })
  }, [items, search, supplierFilter, statusFilter, quickFilter])

  const hasActiveFilters = search !== '' || supplierFilter !== 'all' || statusFilter !== 'all' || quickFilter !== 'All'
  const resetFilters = () => {
    setSearch('')
    setSupplierFilter('all')
    setStatusFilter('all')
    setQuickFilter('All')
  }

  return (
    <div className="relative space-y-6 sm:space-y-7">
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

      {/* Page Header */}
      <SectionHeader
        title="Inventory Synchronization"
        subtitle="Manage supplier stock feeds, safety buffers, available stock calculations, and storefront inventory synchronization"
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
              title="Download Inventory Audit CSV"
            >
              <Download size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => setBufferModalOpen(true)}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
              title="Configure Global Safety Reserve Buffer"
            >
              <Sliders size={14} className="text-primary-600 dark:text-primary-400" /> Buffer ({globalBuffer} units)
            </button>
            <button
              onClick={handleSyncAll}
              disabled={syncingAll}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
              <span>{syncingAll ? 'Syncing...' : 'Sync All Stock Now'}</span>
            </button>
          </div>
        }
      />

      {/* Dynamic Telemetry KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[
          {
            label: 'TOTAL IN-STOCK ITEMS',
            value: `${totalInStockSKUs} SKUs`,
            color: 'text-slate-900 dark:text-slate-100',
            bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800',
            sub: `${totalInStockUnits.toLocaleString()} Feed Units`,
          },
          {
            label: 'PENDING SYNC QUEUE',
            value: `${pendingSyncQueueCount} SKUs`,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50',
            sub: 'Awaiting storefront push',
          },
          {
            label: 'INVENTORY HEALTH',
            value: `${inventoryHealthPct}%`,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50',
            sub: `${healthySyncedCount} of ${totalItemsCount} Products Synced`,
          },
          {
            label: 'LOW STOCK WARNINGS',
            value: `${lowStockWarningsCount} SKUs`,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50',
            sub: 'Near safety buffer threshold',
          },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl shadow-xs flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Supplier Stock Pipeline Grid (Client States: Healthy, Syncing, Pending, Warning, Error) */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-primary-600 dark:text-primary-400" /> Supplier Stock Pipeline
          </h3>
          <Badge variant="primary" dot>Live Suppliers ({supplierPipeline.length})</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {supplierPipeline.map(s => (
            <div key={s.name} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-1" title={s.name}>{s.name}</span>
                <Badge
                  variant={
                    s.pipelineState === 'Healthy' ? 'success' :
                    s.pipelineState === 'Syncing' ? 'info' :
                    s.pipelineState === 'Error' ? 'danger' : 'warning'
                  }
                  dot
                >
                  {s.pipelineState}
                </Badge>
              </div>
              <ProgressBar value={s.progress} color={s.progress === 100 ? 'emerald' : s.progress > 50 ? 'primary' : 'rose'} />
              <div className="flex items-center justify-between text-2xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">{s.totalCount} SKUs</span>
                {s.pendingCount > 0 ? (
                  <span className="text-amber-600 dark:text-amber-400 font-bold">{s.pendingCount} pending</span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Synced</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Filter & Table Section */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Master SKU, Product Name, or Supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {['All', 'Low Stock', 'Out of Sync', 'Error', 'Recently Updated'].map(qf => (
                <button
                  key={qf}
                  onClick={() => setQuickFilter(qf)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    quickFilter === qf
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {qf}
                </button>
              ))}
            </div>

            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="select text-xs w-auto py-1.5"
            >
              <option value="all">All Suppliers</option>
              {suppliersList.filter(s => s !== 'all').map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select text-xs w-auto py-1.5"
            >
              <option value="all">All Sync Status</option>
              <option value="synced">Synced</option>
              <option value="pending_push">Pending Push</option>
              <option value="out_of_sync">Out of Sync</option>
              <option value="error">Error</option>
            </select>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="btn-ghost btn-sm text-2xs font-bold text-slate-500 hover:text-slate-800">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Inventory Sync Table (Exact Required Columns) */}
        <div className="table-container w-full overflow-x-auto scrollbar-thin">
          <table className="table min-w-[1000px] w-full">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="whitespace-nowrap px-4 py-3.5">PRODUCT NAME</th>
                <th className="whitespace-nowrap px-4 py-3.5">MASTER SKU</th>
                <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER</th>
                <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER STOCK</th>
                <th className="whitespace-nowrap px-4 py-3.5">SAFETY BUFFER</th>
                <th className="whitespace-nowrap px-4 py-3.5">AVAILABLE STOCK</th>
                <th className="whitespace-nowrap px-4 py-3.5">STOREFRONT STOCK</th>
                <th className="whitespace-nowrap px-4 py-3.5">VARIANCE</th>
                <th className="whitespace-nowrap px-4 py-3.5">SYNC STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5">LAST SYNC</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400">
                    No inventory records match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(row => {
                  const isSyncingRow = syncingItemId === row.id || row.syncStatus === 'Syncing' || syncingAll
                  const { availableStock, variance, buffer } = getItemCalculations(row)

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td data-label="Product Name" className="whitespace-nowrap px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug break-words">{row.name}</p>
                      </td>
                      <td data-label="Master SKU" className="whitespace-nowrap px-4 py-3.5">
                        <code className="mono text-xs">{row.sku}</code>
                      </td>
                      <td data-label="Supplier" className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-semibold">{row.supplier}</span>
                      </td>
                      <td data-label="Supplier Stock" className="whitespace-nowrap px-4 py-3.5">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{row.supplierStock.toLocaleString()}</span>
                      </td>
                      <td data-label="Safety Buffer" className="whitespace-nowrap px-4 py-3.5">
                        <button
                          onClick={() => handleOpenEditBuffer(row)}
                          className="text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-md font-bold hover:bg-amber-100 cursor-pointer"
                          title="Configure SKU Safety Reserve Buffer"
                        >
                          {buffer} units
                        </button>
                      </td>
                      <td data-label="Available Stock" className="whitespace-nowrap px-4 py-3.5">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">{availableStock.toLocaleString()}</span>
                      </td>
                      <td data-label="Storefront Stock" className="whitespace-nowrap px-4 py-3.5">
                        <span className={`font-bold ${row.storefrontStock === availableStock ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                          {row.storefrontStock.toLocaleString()}
                        </span>
                      </td>
                      <td data-label="Variance" className="whitespace-nowrap px-4 py-3.5">
                        {/* Strictly Color-Coded: Positive = Green, Negative = Red, Zero = Neutral */}
                        <span className={`inline-flex items-center gap-1 text-xs font-extrabold ${
                          variance > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : variance < 0
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {variance > 0 ? <TrendingUp size={13} /> : variance < 0 ? <TrendingDown size={13} /> : null}
                          {variance > 0 ? `+${variance}` : variance === 0 ? '0' : variance}
                        </span>
                      </td>
                      <td data-label="Sync Status" className="whitespace-nowrap px-4 py-3.5">
                        {row.syncStatus === 'Synced' && <Badge variant="success" dot>Synced</Badge>}
                        {row.syncStatus === 'Pending Push' && <Badge variant="warning" dot>Pending Push</Badge>}
                        {row.syncStatus === 'Out of Sync' && <Badge variant="warning" dot>Out of Sync</Badge>}
                        {row.syncStatus === 'Error' && <Badge variant="danger" dot>Error</Badge>}
                        {row.syncStatus === 'Syncing' && <Badge variant="info" dot>Syncing...</Badge>}
                      </td>
                      <td data-label="Last Sync" className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-2xs text-slate-500 dark:text-slate-400 font-mono">{row.lastSync}</span>
                      </td>
                      <td data-label="Action" className="whitespace-nowrap px-4 py-3.5 text-right pr-4">
                        {/* Workflow Action Buttons */}
                        {row.syncStatus === 'Synced' ? (
                          <button
                            onClick={() => setViewItem(row)}
                            className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer"
                            title="View Stock Breakdown"
                          >
                            <Eye size={12} /> View
                          </button>
                        ) : row.syncStatus === 'Error' ? (
                          <button
                            onClick={() => handleSyncSingle(row.id, row.name)}
                            disabled={isSyncingRow}
                            className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 cursor-pointer"
                            title="Retry Storefront Stock Sync"
                          >
                            <RotateCcw size={12} className={isSyncingRow ? 'animate-spin' : ''} />
                            <span>{isSyncingRow ? 'Syncing...' : 'Retry'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSyncSingle(row.id, row.name)}
                            disabled={isSyncingRow}
                            className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer"
                            title="Sync Stock to Storefront"
                          >
                            <RefreshCw size={12} className={isSyncingRow ? 'animate-spin text-primary-600' : ''} />
                            <span>{isSyncingRow ? 'Syncing...' : 'Sync Stock'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW STOCK BREAKDOWN MODAL --- */}
      {viewItem && (
        <Modal
          open
          onClose={() => setViewItem(null)}
          title={`Stock Telemetry: ${viewItem.sku}`}
          subtitle={`Product: ${viewItem.name}`}
          size="md"
          footer={
            <button onClick={() => setViewItem(null)} className="btn-secondary">Close</button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Supplier Stock</p>
                <p className="text-base font-bold text-slate-900 dark:text-slate-100">{viewItem.supplierStock.toLocaleString()} Units</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl">
                <p className="text-2xs text-amber-600 font-semibold uppercase">Safety Reserve Buffer</p>
                <p className="text-base font-bold text-amber-700 dark:text-amber-400">{viewItem.buffer} Units</p>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                <p className="text-2xs text-emerald-600 font-semibold uppercase">Calculated Available Stock</p>
                <p className="text-base font-bold text-emerald-700 dark:text-emerald-400">{Math.max(0, viewItem.supplierStock - viewItem.buffer).toLocaleString()} Units</p>
              </div>
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl">
                <p className="text-2xs text-indigo-600 font-semibold uppercase">Storefront Live Stock</p>
                <p className="text-base font-bold text-indigo-700 dark:text-indigo-400">{viewItem.storefrontStock.toLocaleString()} Units</p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-900 text-slate-200 rounded-xl font-mono text-2xs space-y-1">
              <p className="text-slate-400 font-bold">Calculation Formula:</p>
              <p>Available Stock = max(0, Supplier Stock - Safety Buffer)</p>
              <p>Available Stock = max(0, {viewItem.supplierStock} - {viewItem.buffer}) = <span className="text-emerald-400 font-bold">{Math.max(0, viewItem.supplierStock - viewItem.buffer)}</span></p>
              <p>Variance = Available Stock - Storefront Stock = {Math.max(0, viewItem.supplierStock - viewItem.buffer) - viewItem.storefrontStock}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Global Safety Stock Buffer Modal */}
      <Modal
        open={bufferModalOpen}
        onClose={() => setBufferModalOpen(false)}
        title="Safety Stock Reserve Buffer Rules"
        subtitle="Configure safety stock reservation buffers to prevent overselling on connected storefronts"
        size="md"
        footer={
          <>
            <button onClick={() => setBufferModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveGlobalBuffer} className="btn-primary flex items-center gap-1.5">
              <CheckCircle2 size={14} />
              <span>Apply Global Buffer</span>
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Overselling Protection Active</p>
              <p className="mt-0.5">Available Stock is calculated as Supplier Stock − Safety Buffer before publishing to storefronts.</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Global Safety Reserve Buffer (Units)</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="0"
                max="50"
                value={globalBuffer}
                onChange={e => setGlobalBuffer(Math.max(0, Number(e.target.value)))}
                className="input text-sm font-bold w-28 text-center"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">positive units reserved per SKU</span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Individual SKU Safety Buffer Modal */}
      {editingItem && (
        <Modal
          open
          onClose={() => setEditingItem(null)}
          title={`Configure SKU Buffer: ${editingItem.sku}`}
          subtitle={`Product: ${editingItem.name}`}
          size="md"
        >
          <form onSubmit={handleSaveItemBuffer} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Feed Stock</label>
              <input
                type="text"
                disabled
                value={`${editingItem.supplierStock.toLocaleString()} Units`}
                className="input bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Safety Reserve Buffer (Units) *</label>
              <input
                type="number"
                min="0"
                max={editingItem.supplierStock}
                required
                value={editItemBuffer}
                onChange={e => setEditItemBuffer(Math.max(0, Number(e.target.value)))}
                className="input"
              />
              <p className="text-2xs text-slate-500 mt-1">Available Stock will update to: <strong>{Math.max(0, editingItem.supplierStock - Math.max(0, editItemBuffer))}</strong> units</p>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save SKU Buffer</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
