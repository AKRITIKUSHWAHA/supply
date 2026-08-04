import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  RefreshCw,
  MoreVertical,
  Plug,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Wifi,
  WifiOff,
  RotateCcw,
  Edit2,
  Trash2,
  Check,
  X,
  FileText,
  Key,
  Database,
  Globe,
  Activity,
  Download,
  Upload,
  FileSpreadsheet,
  FolderUp
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { SectionHeader, FilterBar, EmptyState, ConfirmDialog, Select } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { statusToVariant, connectionTypeLabel, formatDateTime, timeAgo } from '../../utils'
import type { Supplier, ConnectionType, SupplierStatus } from '../../types'
import { useAuth } from '../../context/AuthContext'
import { useSuppliers } from '../../context/SupplierContext'

const CONNECTION_TYPES: { value: ConnectionType; label: string }[] = [
  { value: 'api', label: 'REST API' },
  { value: 'ftp', label: 'FTP' },
  { value: 'sftp', label: 'SFTP' },
  { value: 'csv', label: 'CSV Feed' },
  { value: 'excel', label: 'Excel' },
  { value: 'xml', label: 'XML Feed' },
]

const connTypeIcon: Record<ConnectionType, string> = {
  api: '🔌', ftp: '📁', sftp: '🔐', csv: '📄', excel: '📊', xml: '📋'
}

export const Suppliers: React.FC = () => {
  const { role } = useAuth()
  const canManageSuppliers = role === 'platform_owner' || role === 'administrator'
  const { suppliersList, setSuppliersList } = useSuppliers()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  // Modals state
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selected, setSelected] = useState<Supplier | null>(null)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

  // Action Menu Dropdown state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const actionMenuRef = useRef<HTMLDivElement>(null)

  // Close action menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return
    const handleClickOutside = (e: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [openMenuId])

  // Sync All loader state
  const [isSyncingAll, setIsSyncingAll] = useState(false)
  const [syncingSupplierId, setSyncingSupplierId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State for Add / Edit
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    code: '',
    contactName: '',
    contactEmail: '',
    country: '',
    connectionType: 'api' as ConnectionType,
    apiUrl: '',
    apiKey: '',
    ftpHost: '',
    ftpUsername: '',
    ftpPassword: '',
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      showNotification(`Selected feed file: "${file.name}" from computer`)
    }
  }

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Handlers ---
  const handleSyncAll = async () => {
    setIsSyncingAll(true)
    try {
      await fetch('http://localhost:5000/api/suppliers/sync-all', { method: 'POST' })
      const res = await fetch('http://localhost:5000/api/suppliers')
      const data = await res.json()
      if (Array.isArray(data)) setSuppliersList(data)
      showNotification('All suppliers synchronized successfully!')
    } catch (err) {
      console.error(err)
    } finally {
      setIsSyncingAll(false)
    }
  }

  const handleSyncSingle = async (id: string, name: string) => {
    setSyncingSupplierId(id)
    try {
      await fetch(`http://localhost:5000/api/suppliers/${id}/sync`, { method: 'POST' })
      const res = await fetch('http://localhost:5000/api/suppliers')
      const data = await res.json()
      if (Array.isArray(data)) setSuppliersList(data)
      showNotification(`Supplier "${name}" synchronized successfully!`)
    } catch (err) {
      console.error(err)
    } finally {
      setSyncingSupplierId(null)
    }
  }

  const handleToggleStatus = async (id: string) => {
    const current = suppliersList.find(s => s.id === id)
    if (!current) return
    const nextStatus: SupplierStatus = current.status === 'connected' ? 'disconnected' : 'connected'
    try {
      const res = await fetch(`http://localhost:5000/api/suppliers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      })
      const updated = await res.json()
      setSuppliersList(prev => prev.map(s => (s.id === id ? updated : s)))
      showNotification(`Supplier "${current.name}" is now ${nextStatus.toUpperCase()}`)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateSupplier = async () => {
    if (!newSupplier.name.trim() || !newSupplier.code.trim()) {
      alert('Please enter Supplier Name and Supplier Code.')
      return
    }

    try {
      let fileContent: string | undefined = undefined
      let fileName: string | undefined = undefined

      if (selectedFile) {
        fileName = selectedFile.name
        fileContent = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = e => resolve(e.target?.result as string || '')
          reader.onerror = err => reject(err)
          reader.readAsText(selectedFile)
        })
      }

      const res = await fetch('http://localhost:5000/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplier.name,
          code: newSupplier.code.toUpperCase(),
          contactName: newSupplier.contactName || 'Primary Contact',
          contactEmail: newSupplier.contactEmail || 'contact@supplier.com',
          country: newSupplier.country || 'United States',
          connectionType: newSupplier.connectionType,
          status: 'connected',
          fileContent,
          fileName,
          credentials: {
            apiUrl: newSupplier.apiUrl || undefined,
            apiKey: newSupplier.apiKey || undefined,
            ftpHost: newSupplier.ftpHost || undefined,
            ftpUsername: newSupplier.ftpUsername || undefined,
          }
        })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to create supplier on server')
      }
      const created = await res.json()
      setSuppliersList(prev => [created, ...prev])
      setAddOpen(false)
      setSelectedFile(null)
      setNewSupplier({
        name: '',
        code: '',
        contactName: '',
        contactEmail: '',
        country: '',
        connectionType: 'api',
        apiUrl: '',
        apiKey: '',
        ftpHost: '',
        ftpUsername: '',
        ftpPassword: '',
      })
      showNotification(`Supplier "${created.name}" created and product feed ingested!`)
    } catch (err) {
      console.error('Failed to create supplier:', err)
      showNotification('Failed to create supplier and process feed file')
    }
  }

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s)
    setNewSupplier({
      name: s.name,
      code: s.code,
      contactName: s.contactName || '',
      contactEmail: s.contactEmail || '',
      country: s.country || '',
      connectionType: s.connectionType,
      apiUrl: s.credentials?.apiUrl || '',
      apiKey: s.credentials?.apiKey || '',
      ftpHost: s.credentials?.ftpHost || '',
      ftpUsername: s.credentials?.ftpUsername || '',
      ftpPassword: '',
    })
    setEditOpen(true)
    setOpenMenuId(null)
  }

  const handleSaveEdit = async () => {
    if (!editingSupplier) return
    try {
      const res = await fetch(`http://localhost:5000/api/suppliers/${editingSupplier.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSupplier.name,
          code: newSupplier.code.toUpperCase(),
          contactName: newSupplier.contactName,
          contactEmail: newSupplier.contactEmail,
          country: newSupplier.country,
          connectionType: newSupplier.connectionType,
          credentials: {
            apiUrl: newSupplier.apiUrl,
            apiKey: newSupplier.apiKey,
            ftpHost: newSupplier.ftpHost,
            ftpUsername: newSupplier.ftpUsername,
          }
        })
      })
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to update supplier on server')
      }
      const updated = await res.json()
      setSuppliersList(prev => prev.map(s => (s.id === editingSupplier.id ? updated : s)))
      setEditOpen(false)
      setEditingSupplier(null)
      showNotification(`Supplier "${newSupplier.name}" updated successfully!`)
    } catch (err) {
      console.error('Failed to save supplier:', err)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return
    try {
      await fetch(`http://localhost:5000/api/suppliers/${deletingSupplier.id}`, { method: 'DELETE' })
      setSuppliersList(prev => prev.filter(s => s.id !== deletingSupplier.id))
      showNotification(`Supplier "${deletingSupplier.name}" deleted.`)
    } catch (err) {
      console.error('Failed to delete supplier:', err)
    } finally {
      setDeleteOpen(false)
      setDeletingSupplier(null)
    }
  }

  // --- Filtering & Pagination ---
  const filtered = suppliersList.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactEmail && s.contactEmail.toLowerCase().includes(search.toLowerCase()))
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const matchType = typeFilter === 'all' || s.connectionType === typeFilter
    return matchSearch && matchStatus && matchType
  })

  const totalPages = Math.ceil(filtered.length / pageSize) || 1
  const paginatedSuppliers = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleExportSuppliersCSV = () => {
    showNotification('Generating Suppliers Directory CSV export...')
    const csvHeaders = 'Supplier Name,Code,Connection Type,Status,Products Count,Errors,Contact Email,Country,Last Sync\n'
    const csvRows = suppliersList.map(s =>
      `"${s.name}","${s.code}","${s.connectionType}","${s.status}",${s.productCount},${s.errorCount},"${s.contactEmail || ''}","${s.country || ''}","${s.lastSync || ''}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Suppliers_Directory_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Suppliers Directory CSV file downloaded!')
  }

  return (
    <div className="relative">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Suppliers"
        subtitle={`${suppliersList.length} suppliers configured — ${suppliersList.filter(s => s.status === 'connected').length} connected`}
        actions={
          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={handleExportSuppliersCSV}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer flex-1 sm:flex-initial justify-center"
              title="Download Suppliers CSV Directory"
            >
              <Download size={14} className="text-emerald-600" /> Export CSV
            </button>
            {canManageSuppliers && (
              <>
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncingAll}
                  className="btn-secondary btn-sm flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                >
                  <RefreshCw size={14} className={isSyncingAll ? 'animate-spin text-primary-600' : ''} />
                  {isSyncingAll ? 'Syncing All...' : 'Sync All'}
                </button>
                <button
                  onClick={() => setAddOpen(true)}
                  className="btn-primary btn-sm flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                >
                  <Plus size={14} /> Add Supplier
                </button>
              </>
            )}
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {[
          { label: 'Connected', value: suppliersList.filter(s => s.status === 'connected').length, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/50' },
          { label: 'Disconnected', value: suppliersList.filter(s => s.status === 'disconnected').length, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/50' },
          { label: 'Error State', value: suppliersList.filter(s => s.status === 'error').length, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/50' },
          { label: 'Syncing', value: suppliersList.filter(s => s.status === 'syncing').length, color: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200/80 dark:border-cyan-900/50' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-3 sm:p-4 cursor-pointer transition-transform hover:scale-[1.01] shadow-xs`} onClick={() => setStatusFilter(c.label.toLowerCase().includes('connected') ? 'connected' : c.label.toLowerCase().includes('disconnected') ? 'disconnected' : c.label.toLowerCase().includes('error') ? 'error' : 'syncing')}>
            <p className={`text-xl sm:text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <FilterBar search={search} onSearch={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search by name, code, or email...">
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <select
            className="select w-full sm:w-auto min-w-[130px] input-sm"
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Status</option>
            <option value="connected">Connected</option>
            <option value="disconnected">Disconnected</option>
            <option value="error">Error</option>
            <option value="syncing">Syncing</option>
          </select>
          <select
            className="select w-full sm:w-auto min-w-[130px] input-sm"
            value={typeFilter}
            onChange={e => { setTypeFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="all">All Types</option>
            {CONNECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
      </FilterBar>

      {/* Table */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                <th className="text-left whitespace-nowrap px-4 py-3.5">SUPPLIER</th>
                <th className="text-center whitespace-nowrap px-4 py-3.5">CONNECTION</th>
                <th className="text-center whitespace-nowrap px-4 py-3.5">STATUS</th>
                <th className="text-center whitespace-nowrap px-4 py-3.5">PRODUCTS</th>
                <th className="text-center whitespace-nowrap px-4 py-3.5">LAST SYNC</th>
                <th className="text-center whitespace-nowrap px-4 py-3.5">ERRORS</th>
                <th className="text-right whitespace-nowrap px-4 py-3.5 pr-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedSuppliers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-slate-400">
                    <EmptyState
                      icon={<Plug size={24} />}
                      title="No suppliers found"
                      description="Try adjusting your filter or search query."
                      action={
                        <button onClick={() => { setSearch(''); setStatusFilter('all'); setTypeFilter('all'); }} className="btn-secondary btn-sm">
                          Reset Filters
                        </button>
                      }
                    />
                  </td>
                </tr>
              )}
              {paginatedSuppliers.map(supplier => {
                const isSyncingThis = syncingSupplierId === supplier.id || supplier.status === 'syncing'
                const isMenuOpen = openMenuId === supplier.id

                return (
                  <tr
                    key={supplier.id}
                    className={`cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${
                      isMenuOpen ? 'relative z-40' : 'relative z-0'
                    }`}
                    onClick={() => setSelected(supplier)}
                  >
                    <td data-label="Supplier" className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 flex items-center justify-center text-base shrink-0 shadow-xs">
                          {connTypeIcon[supplier.connectionType]}
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">{supplier.name}</p>
                          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium">{supplier.code} · {supplier.country}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Connection" className="px-4 py-3.5 text-center">
                      <Badge variant="info">{connectionTypeLabel(supplier.connectionType)}</Badge>
                    </td>
                    <td data-label="Status" className="px-4 py-3.5 text-center">
                      <Badge variant={statusToVariant(supplier.status)} dot>
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </Badge>
                    </td>
                    <td data-label="Products" className="px-4 py-3.5 text-center">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{supplier.productCount.toLocaleString()}</span>
                    </td>
                    <td data-label="Last Sync" className="px-4 py-3.5 text-center">
                      <span className="text-slate-600 dark:text-slate-300 text-xs font-medium">{supplier.lastSync ? timeAgo(supplier.lastSync) : '—'}</span>
                    </td>
                    <td data-label="Errors" className="px-4 py-3.5 text-center">
                      {supplier.errorCount > 0 ? (
                        <Badge variant="danger">{supplier.errorCount} errors</Badge>
                      ) : (
                        <Badge variant="success">Clean</Badge>
                      )}
                    </td>
                    <td data-label="Actions" className={`px-4 py-3.5 text-right pr-4 ${isMenuOpen ? 'z-50 relative' : ''}`}>
                      <div className={`flex items-center justify-end gap-1 relative ${isMenuOpen ? 'z-50' : ''}`} onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleSyncSingle(supplier.id, supplier.name)}
                          disabled={isSyncingThis}
                          className="btn-icon"
                          title="Manual Sync"
                        >
                          <RefreshCw size={14} className={isSyncingThis ? 'animate-spin text-primary-600 dark:text-primary-400' : ''} />
                        </button>

                        <div className={`relative ${isMenuOpen ? 'z-50' : ''}`} ref={isMenuOpen ? actionMenuRef : null}>
                          <button
                            onClick={() => setOpenMenuId(isMenuOpen ? null : supplier.id)}
                            className="btn-icon"
                            title="Options"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {/* Popover Action Menu */}
                          {isMenuOpen && (
                            <div className="absolute right-0 top-9 w-44 card shadow-2xl z-50 p-1 text-left text-xs space-y-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                              <button
                                onClick={() => { setSelected(supplier); setOpenMenuId(null); }}
                                className="w-full px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <ExternalLink size={13} /> View Details
                              </button>
                              <button
                                onClick={() => { handleSyncSingle(supplier.id, supplier.name); setOpenMenuId(null); }}
                                className="w-full px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <RefreshCw size={13} /> Trigger Sync
                              </button>
                              <button
                                onClick={() => { handleToggleStatus(supplier.id); setOpenMenuId(null); }}
                                className="w-full px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                {supplier.status === 'connected' ? <WifiOff size={13} className="text-amber-500" /> : <Wifi size={13} className="text-emerald-500" />}
                                {supplier.status === 'connected' ? 'Disconnect' : 'Connect'}
                              </button>
                              <button
                                onClick={() => handleOpenEdit(supplier)}
                                className="w-full px-3 py-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-200"
                              >
                                <Edit2 size={13} /> Edit Details
                              </button>
                              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                              <button
                                onClick={() => { setDeletingSupplier(supplier); setDeleteOpen(true); setOpenMenuId(null); }}
                                className="w-full px-3 py-1.5 rounded hover:bg-rose-50 text-rose-600 flex items-center gap-2 font-medium"
                              >
                                <Trash2 size={13} /> Delete Supplier
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Working Pagination Footer */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 font-medium text-center sm:text-left">
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{paginatedSuppliers.length}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{filtered.length}</span> suppliers (Page {currentPage} of {totalPages})
          </p>
          <div className="flex gap-1.5 w-full sm:w-auto justify-center">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary btn-sm flex-1 sm:flex-initial disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="btn-secondary btn-sm flex-1 sm:flex-initial disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* --- ADD SUPPLIER MODAL --- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Supplier"
        subtitle="Configure supplier connection and integration settings"
        size="lg"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateSupplier} className="btn-primary">Create Supplier</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Supplier Name *</label>
              <input
                className="input"
                placeholder="e.g. TechParts International"
                value={newSupplier.name}
                onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Supplier Code *</label>
              <input
                className="input uppercase"
                placeholder="e.g. TPI"
                value={newSupplier.code}
                onChange={e => setNewSupplier({ ...newSupplier, code: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Name</label>
              <input
                className="input"
                placeholder="Full name"
                value={newSupplier.contactName}
                onChange={e => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Email *</label>
              <input
                className="input"
                type="email"
                placeholder="email@supplier.com"
                value={newSupplier.contactEmail}
                onChange={e => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Country</label>
            <input
              className="input"
              placeholder="e.g. United States"
              value={newSupplier.country}
              onChange={e => setNewSupplier({ ...newSupplier, country: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-2">Integration Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {CONNECTION_TYPES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setNewSupplier({ ...newSupplier, connectionType: t.value })}
                  className={`border rounded-xl p-3 text-center transition-all text-sm font-medium ${newSupplier.connectionType === t.value
                    ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                >
                  <div className="text-lg mb-1">{connTypeIcon[t.value]}</div>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {newSupplier.connectionType === 'api' && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-200">
              <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Globe size={14} className="text-primary-600" /> REST API Credentials
              </p>
              <input
                className="input"
                placeholder="API Endpoint URL (e.g. https://api.supplier.com/v1)"
                value={newSupplier.apiUrl}
                onChange={e => setNewSupplier({ ...newSupplier, apiUrl: e.target.value })}
              />
              <input
                className="input font-mono text-xs"
                placeholder="API Key / Token"
                type="password"
                value={newSupplier.apiKey}
                onChange={e => setNewSupplier({ ...newSupplier, apiKey: e.target.value })}
              />
            </div>
          )}

          {(newSupplier.connectionType === 'ftp' || newSupplier.connectionType === 'sftp') && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Database size={14} className="text-primary-600 dark:text-primary-400" /> FTP Server Config
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input
                    className="input"
                    placeholder="Host (ftp.supplier.com)"
                    value={newSupplier.ftpHost}
                    onChange={e => setNewSupplier({ ...newSupplier, ftpHost: e.target.value })}
                  />
                </div>
                <input className="input" placeholder="Port" defaultValue={newSupplier.connectionType === 'sftp' ? '22' : '21'} />
              </div>
              <input
                className="input"
                placeholder="Username"
                value={newSupplier.ftpUsername}
                onChange={e => setNewSupplier({ ...newSupplier, ftpUsername: e.target.value })}
              />
              <input className="input" placeholder="Password" type="password" />
            </div>
          )}

          {(newSupplier.connectionType === 'csv' || newSupplier.connectionType === 'excel' || newSupplier.connectionType === 'xml') && (
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 space-y-3 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload size={14} className="text-primary-600 dark:text-primary-400" /> Select {newSupplier.connectionType.toUpperCase()} Feed File from Computer
                </span>
                <span className="text-2xs font-bold text-emerald-600 dark:text-emerald-400 uppercase bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900">
                  .{newSupplier.connectionType === 'csv' ? 'csv' : newSupplier.connectionType === 'excel' ? 'xlsx / .xls' : 'xml'}
                </span>
              </p>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-4 text-center bg-white dark:bg-slate-900 hover:border-primary-500 transition-colors">
                <input
                  type="file"
                  id="supplier-feed-file-input"
                  className="hidden"
                  accept={
                    newSupplier.connectionType === 'csv'
                      ? '.csv,text/csv'
                      : newSupplier.connectionType === 'excel'
                      ? '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel'
                      : '.xml,text/xml'
                  }
                  onChange={handleFileChange}
                />
                <label
                  htmlFor="supplier-feed-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2 py-2"
                >
                  <div className="w-11 h-11 rounded-full bg-primary-50 dark:bg-primary-950/60 flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-xs border border-primary-200/60 dark:border-primary-900/60">
                    <Upload size={20} />
                  </div>
                  <div>
                    <span className="btn-primary btn-sm inline-flex items-center gap-1.5 text-xs font-bold shadow-xs">
                      <FolderUp size={14} /> Choose File from Computer
                    </span>
                    <span className="text-2xs text-slate-400 block mt-1.5">
                      Select local .{newSupplier.connectionType === 'csv' ? 'csv' : newSupplier.connectionType === 'excel' ? 'xlsx / .xls' : 'xml'} file from your computer (Max 50MB)
                    </span>
                  </div>
                </label>

                {selectedFile && (
                  <div className="mt-3 p-3 bg-emerald-50/80 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <FileSpreadsheet size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div className="text-left min-w-0">
                        <p className="font-bold text-slate-800 dark:text-slate-100 truncate">{selectedFile.name}</p>
                        <p className="text-2xs text-slate-500 font-mono">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for processing</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedFile(null)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 shrink-0"
                      title="Remove file"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-2xs font-semibold text-slate-500 dark:text-slate-400 block mb-1">
                  Or enter Remote Feed Endpoint URL (Optional)
                </label>
                <input
                  className="input text-xs"
                  placeholder={`https://supplier.com/feeds/products.${newSupplier.connectionType === 'excel' ? 'xlsx' : newSupplier.connectionType}`}
                  value={newSupplier.apiUrl}
                  onChange={e => setNewSupplier({ ...newSupplier, apiUrl: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* --- EDIT SUPPLIER MODAL --- */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Supplier Details"
        subtitle={`Updating settings for ${editingSupplier?.name}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Supplier Name</label>
              <input
                className="input"
                value={newSupplier.name}
                onChange={e => setNewSupplier({ ...newSupplier, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Supplier Code</label>
              <input
                className="input uppercase"
                value={newSupplier.code}
                onChange={e => setNewSupplier({ ...newSupplier, code: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Name</label>
              <input
                className="input"
                value={newSupplier.contactName}
                onChange={e => setNewSupplier({ ...newSupplier, contactName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Contact Email</label>
              <input
                className="input"
                type="email"
                value={newSupplier.contactEmail}
                onChange={e => setNewSupplier({ ...newSupplier, contactEmail: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Country</label>
            <input
              className="input"
              value={newSupplier.country}
              onChange={e => setNewSupplier({ ...newSupplier, country: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- DELETE CONFIRM DIALOG --- */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Supplier"
        message={`Are you sure you want to delete supplier "${deletingSupplier?.name}"? All sync schedules and product feed associations will be removed.`}
        confirmLabel="Yes, Delete Supplier"
        danger
      />

      {/* --- SUPPLIER DETAIL DRAWER/MODAL --- */}
      {selected && (
        <SupplierDetail
          supplier={selected}
          onClose={() => setSelected(null)}
          onTriggerSync={() => handleSyncSingle(selected.id, selected.name)}
          onNotify={showNotification}
        />
      )}
    </div>
  )
}

const SupplierDetail: React.FC<{
  supplier: Supplier
  onClose: () => void
  onTriggerSync: () => void
  onNotify: (msg: string) => void
}> = ({ supplier, onClose, onTriggerSync, onNotify }) => {
  const [tab, setTab] = useState('overview')
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const tabs = ['overview', 'connection', 'credentials', 'history', 'errors']

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const res = await fetch(`http://localhost:5000/api/suppliers/${supplier.id}/test`, { method: 'POST' });
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTestResult('Connection Successful! HTTP 200 OK — Auth Validated.');
        onNotify(`Connection test passed for ${supplier.name}`);
      } else {
        setTestResult(`Connection Failed: ${data.error || 'Unknown error'}`);
        onNotify(`Connection test failed for ${supplier.name}`);
      }
    } catch (err) {
      console.error(err);
      setTestResult('Connection Failed: Network error');
    } finally {
      setIsTesting(false);
    }
  }

  return (
    <Modal
      open
      title={supplier.name}
      subtitle={`${supplier.code} · ${supplier.country}`}
      onClose={onClose}
      size="xl"
    >
      <div className="flex gap-1 border-b border-slate-100 dark:border-slate-800 mb-5 overflow-x-auto scrollbar-hide -mx-6 px-6">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm font-medium capitalize whitespace-nowrap border-b-2 transition-colors ${tab === t
              ? 'border-primary-600 text-primary-700 dark:text-primary-400 font-bold'
              : 'border-transparent text-slate-400 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Connection Type', value: connectionTypeLabel(supplier.connectionType) },
            { label: 'Status', value: <Badge variant={statusToVariant(supplier.status)} dot>{supplier.status}</Badge> },
            { label: 'Product Count', value: supplier.productCount.toLocaleString() },
            { label: 'Error Count', value: supplier.errorCount },
            { label: 'Contact', value: supplier.contactName },
            { label: 'Email', value: supplier.contactEmail },
            { label: 'Last Sync', value: supplier.lastSync ? formatDateTime(supplier.lastSync) : '—' },
            { label: 'Next Sync', value: supplier.nextSync ? formatDateTime(supplier.nextSync) : '—' },
          ].map(item => (
            <div key={item.label} className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60">
              <p className="text-xs text-slate-400 dark:text-slate-400 mb-1 font-medium">{item.label}</p>
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.value}</div>
            </div>
          ))}
          <div className="col-span-2 flex gap-2 pt-2">
            <button
              onClick={onTriggerSync}
              className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5"
            >
              <RefreshCw size={13} /> Manual Sync Now
            </button>
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="btn-secondary btn-sm flex-1 flex items-center justify-center gap-1.5"
            >
              <Plug size={13} className={isTesting ? 'animate-spin text-primary-600 dark:text-primary-400' : ''} />
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </div>
      )}

      {tab === 'connection' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">Connection Active</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Last verified {supplier.lastSync ? timeAgo(supplier.lastSync) : 'N/A'}</p>
            </div>
          </div>

          {testResult && (
            <div className="p-3 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 size={14} className="text-sky-600 dark:text-sky-400" /> {testResult}
            </div>
          )}

          <div className="space-y-3">
            {supplier.credentials?.apiUrl && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-100 dark:border-slate-700/60">
                <p className="text-2xs text-slate-400 font-medium uppercase tracking-wider mb-1">API Endpoint</p>
                <code className="text-xs text-slate-700 dark:text-slate-200 font-mono">{supplier.credentials.apiUrl}</code>
              </div>
            )}
          </div>
          <button
            onClick={handleTestConnection}
            disabled={isTesting}
            className="btn-secondary btn-sm w-full flex items-center justify-center gap-1.5"
          >
            <Plug size={13} className={isTesting ? 'animate-spin' : ''} />
            {isTesting ? 'Testing Server Response...' : 'Run Connection Test'}
          </button>
        </div>
      )}

      {tab === 'credentials' && (
        <div className="space-y-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
            <Key size={14} className="text-primary-600 dark:text-primary-400" /> Credentials & Endpoint Details
          </p>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">Endpoint / Server Host</label>
            <input
              className="input text-xs"
              readOnly
              value={supplier.credentials?.apiUrl || supplier.credentials?.ftpHost || 'https://api.supplier.com/v1/feed'}
            />
          </div>
          <div>
            <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block mb-1">API Key / Token</label>
            <input
              className="input text-xs font-mono"
              type="password"
              readOnly
              value={supplier.credentials?.apiKey || '••••••••••••••••••••••••'}
            />
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-2">
          {[
            { date: 'Jul 24, 05:30', products: 18420, status: 'success', duration: '28m' },
            { date: 'Jul 23, 23:30', products: 18410, status: 'success', duration: '31m' },
            { date: 'Jul 23, 17:30', products: 18380, status: 'warning', duration: '34m' },
            { date: 'Jul 23, 11:30', products: 18350, status: 'success', duration: '27m' },
          ].map((h, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-sm border border-slate-100 dark:border-slate-700/60">
              <span className="text-slate-600 dark:text-slate-400 text-xs">{h.date}</span>
              <span className="text-slate-800 dark:text-slate-100 font-medium text-xs">{h.products.toLocaleString()} products</span>
              <span className="text-slate-400 dark:text-slate-400 text-xs">{h.duration}</span>
              <Badge variant={statusToVariant(h.status)}>{h.status}</Badge>
            </div>
          ))}
        </div>
      )}

      {tab === 'errors' && (
        supplier.errorCount === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <CheckCircle2 size={40} className="mx-auto mb-3 text-emerald-400" />
            <p className="font-medium">No active errors recorded for this supplier.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <p className="font-semibold flex items-center gap-1.5 mb-1">
                <AlertCircle size={14} className="text-rose-600" /> Timeout on Image Download Batch
              </p>
              <p className="text-rose-600 font-mono text-2xs">FTP connection idle timeout after 120s. 3 items skipped.</p>
            </div>
          </div>
        )
      )}
    </Modal>
  )
}

