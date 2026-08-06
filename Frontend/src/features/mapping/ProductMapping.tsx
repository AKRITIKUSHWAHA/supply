import { API_BASE_URL } from '../../config/api'
import React, { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { SectionHeader, FilterBar, Select, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface ProductMappingItem {
  id: string
  supplierSku: string
  supplierName: string
  masterSku: string
  status: 'mapped' | 'unmapped'
}

export const ProductMapping: React.FC = () => {
  const [items, setItems] = useState<ProductMappingItem[]>([])
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [addOpen, setAddOpen] = useState(false)
  const [newMapping, setNewMapping] = useState({ supplierSku: '', supplierName: '', masterSku: '' })
  const [editingItem, setEditingItem] = useState<ProductMappingItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editMasterSku, setEditMasterSku] = useState('')

  const fetchMappings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mappings/products`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to fetch product mappings:', err)
    }
  }

  useEffect(() => {
    fetchMappings()
  }, [])

  const filtered = items.filter(item => {
    const matchesSearch =
      item.supplierSku.toLowerCase().includes(search.toLowerCase()) ||
      item.masterSku.toLowerCase().includes(search.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(search.toLowerCase())
    const matchesSupplier = supplierFilter === 'all' || item.supplierName === supplierFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesSupplier && matchesStatus
  })

  const suppliers = Array.from(new Set(items.map(i => i.supplierName)))

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMapping.supplierSku.trim()) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/mappings/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierSku: newMapping.supplierSku,
          supplierName: newMapping.supplierName || 'Default Supplier',
          masterSku: newMapping.masterSku,
        })
      })
      const created = await res.json()
      setItems(prev => [created, ...prev])
      setAddOpen(false)
      setNewMapping({ supplierSku: '', supplierName: '', masterSku: '' })
    } catch (err) {
      console.error('Failed to create product mapping:', err)
    }
  }

  const handleOpenEdit = (item: ProductMappingItem) => {
    setEditingItem(item)
    setEditMasterSku(item.masterSku)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const updatedSku = editMasterSku.trim()
    try {
      const res = await fetch(`${API_BASE_URL}/api/mappings/products/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierSku: editingItem.supplierSku,
          supplierName: editingItem.supplierName,
          masterSku: updatedSku,
        })
      })
      const updated = await res.json()
      setItems(prev => prev.map(i => i.id === editingItem.id ? updated : i))
      setEditingItem(null)
    } catch (err) {
      console.error('Failed to update product mapping:', err)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await fetch(`${API_BASE_URL}/api/mappings/products/${deletingId}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== deletingId))
    } catch (err) {
      console.error('Failed to delete product mapping:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Product Mapping"
        subtitle="Map supplier product SKUs to Master Catalog SKUs"
        actions={
          <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Add Product Mapping
          </button>
        }
      />

      {/* Filter & Search Bar */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search supplier SKU or master SKU...">
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <Select
            className="w-full sm:w-44"
            value={supplierFilter}
            onChange={setSupplierFilter}
            options={[
              { label: 'All Suppliers', value: 'all' },
              ...suppliers.map(s => ({ label: s, value: s })),
            ]}
          />
          <Select
            className="w-full sm:w-36"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Mapped', value: 'mapped' },
              { label: 'Unmapped', value: 'unmapped' },
            ]}
          />
        </div>
      </FilterBar>

      {/* Product Mapping Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier SKU</th>
                <th>Supplier</th>
                <th>Master SKU</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Supplier SKU">
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-100">
                        {item.supplierSku}
                      </span>
                    </td>
                    <td data-label="Supplier">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {item.supplierName}
                      </span>
                    </td>
                    <td data-label="Master SKU">
                      {item.masterSku ? (
                        <span className="font-mono text-2xs bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 text-amber-700 dark:text-amber-400 px-2.5 py-1 rounded font-bold">
                          {item.masterSku}
                        </span>
                      ) : (
                        <span className="text-2xs italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <Badge variant={item.status === 'mapped' ? 'success' : 'warning'} dot>
                        {item.status}
                      </Badge>
                    </td>
                    <td data-label="Action" className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="btn-icon"
                          title="Edit Mapping"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Mapping"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">No product mappings found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Product Mapping"
        subtitle="Create a new supplier SKU to master SKU mapping rule"
        size="md"
      >
        <form onSubmit={handleCreateMapping} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier SKU *</label>
            <input
              type="text"
              required
              value={newMapping.supplierSku}
              onChange={e => setNewMapping({ ...newMapping, supplierSku: e.target.value })}
              placeholder="e.g. ASUS-ROG-X570-E"
              className="input font-mono uppercase"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Name</label>
            <input
              type="text"
              value={newMapping.supplierName}
              onChange={e => setNewMapping({ ...newMapping, supplierName: e.target.value })}
              placeholder="e.g. TechParts Int."
              className="input"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Master SKU</label>
            <input
              type="text"
              value={newMapping.masterSku}
              onChange={e => setNewMapping({ ...newMapping, masterSku: e.target.value })}
              placeholder="e.g. MB-X570-001"
              className="input font-mono uppercase"
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Mapping</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={editingItem !== null}
        onClose={() => setEditingItem(null)}
        title="Edit Product Mapping"
        subtitle={`Supplier SKU: ${editingItem?.supplierSku}`}
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier SKU</label>
            <input
              type="text"
              disabled
              value={editingItem?.supplierSku || ''}
              className="input font-mono bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Name</label>
            <input
              type="text"
              disabled
              value={editingItem?.supplierName || ''}
              className="input bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Master SKU *</label>
            <input
              type="text"
              required
              value={editMasterSku}
              onChange={e => setEditMasterSku(e.target.value)}
              placeholder="e.g. MB-X570-001"
              className="input font-mono uppercase"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Mapping</button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Mapping"
        message="Are you sure you want to delete this product mapping rule?"
        confirmLabel="Yes, Delete"
        danger
      />
    </div>
  )
}
