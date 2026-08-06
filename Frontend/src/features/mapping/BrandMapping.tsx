import { API_BASE_URL } from '../../config/api'
import React, { useState, useEffect } from 'react'
import { Edit2, Trash2, Plus } from 'lucide-react'
import { SectionHeader, FilterBar, Select, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface BrandMappingItem {
  id: string
  supplierBrand: string
  supplierName: string
  masterBrand: string
  status: 'mapped' | 'unmapped'
}

export const BrandMapping: React.FC = () => {
  const [items, setItems] = useState<BrandMappingItem[]>([])
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [addOpen, setAddOpen] = useState(false)
  const [newMapping, setNewMapping] = useState({ supplierBrand: '', supplierName: '', masterBrand: '' })
  const [editingItem, setEditingItem] = useState<BrandMappingItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editMasterBrand, setEditMasterBrand] = useState('')

  const fetchMappings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/mappings/brands`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setItems(data)
      }
    } catch (err) {
      console.error('Failed to fetch brand mappings:', err)
    }
  }

  useEffect(() => {
    fetchMappings()
  }, [])

  const filtered = items.filter(item => {
    const matchesSearch =
      item.supplierBrand.toLowerCase().includes(search.toLowerCase()) ||
      item.masterBrand.toLowerCase().includes(search.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(search.toLowerCase())
    const matchesSupplier = supplierFilter === 'all' || item.supplierName === supplierFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesSupplier && matchesStatus
  })

  const suppliers = Array.from(new Set(items.map(i => i.supplierName)))

  const handleCreateMapping = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMapping.supplierBrand.trim()) return
    try {
      const res = await fetch(`${API_BASE_URL}/api/mappings/brands`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierBrand: newMapping.supplierBrand,
          supplierName: newMapping.supplierName || 'Default Supplier',
          masterBrand: newMapping.masterBrand,
        })
      })
      const created = await res.json()
      setItems(prev => [created, ...prev])
      setAddOpen(false)
      setNewMapping({ supplierBrand: '', supplierName: '', masterBrand: '' })
    } catch (err) {
      console.error('Failed to create brand mapping:', err)
    }
  }

  const handleOpenEdit = (item: BrandMappingItem) => {
    setEditingItem(item)
    setEditMasterBrand(item.masterBrand)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const updated = editMasterBrand.trim()
    try {
      const res = await fetch(`${API_BASE_URL}/api/mappings/brands/${editingItem.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierBrand: editingItem.supplierBrand,
          supplierName: editingItem.supplierName,
          masterBrand: updated,
        })
      })
      const updatedItem = await res.json()
      setItems(prev => prev.map(i => i.id === editingItem.id ? updatedItem : i))
      setEditingItem(null)
    } catch (err) {
      console.error('Failed to update brand mapping:', err)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await fetch(`${API_BASE_URL}/api/mappings/brands/${deletingId}`, { method: 'DELETE' })
      setItems(prev => prev.filter(i => i.id !== deletingId))
    } catch (err) {
      console.error('Failed to delete brand mapping:', err)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Brand Mapping"
        subtitle="Map supplier brand names to Master Catalog brands"
        actions={
          <button onClick={() => setAddOpen(true)} className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Add Brand Mapping
          </button>
        }
      />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search supplier brand or master brand...">
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

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier Brand</th>
                <th>Supplier</th>
                <th>Master Brand</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Supplier Brand">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">{item.supplierBrand}</span>
                    </td>
                    <td data-label="Supplier">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">{item.supplierName}</span>
                    </td>
                    <td data-label="Master Brand">
                      {item.masterBrand ? (
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded">
                          {item.masterBrand}
                        </span>
                      ) : (
                        <span className="text-2xs italic text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td data-label="Status">
                      <Badge variant={item.status === 'mapped' ? 'success' : 'warning'} dot>{item.status}</Badge>
                    </td>
                    <td data-label="Action" className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenEdit(item)} className="btn-icon" title="Edit Mapping"><Edit2 size={14} /></button>
                        <button onClick={() => setDeletingId(item.id)} className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40" title="Delete Mapping"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">No brand mappings found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Brand Mapping" subtitle="Create a new supplier brand to master brand mapping rule" size="md">
        <form onSubmit={handleCreateMapping} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Brand *</label>
            <input type="text" required value={newMapping.supplierBrand} onChange={e => setNewMapping({ ...newMapping, supplierBrand: e.target.value })} placeholder="e.g. ASUS Republic of Gamers" className="input" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Name</label>
            <input type="text" value={newMapping.supplierName} onChange={e => setNewMapping({ ...newMapping, supplierName: e.target.value })} placeholder="e.g. TechParts Int." className="input" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Master Brand</label>
            <input type="text" value={newMapping.masterBrand} onChange={e => setNewMapping({ ...newMapping, masterBrand: e.target.value })} placeholder="e.g. ASUS ROG" className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Mapping</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal open={editingItem !== null} onClose={() => setEditingItem(null)} title="Edit Brand Mapping" subtitle={`Supplier Brand: ${editingItem?.supplierBrand}`} size="md">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Brand</label>
            <input type="text" disabled value={editingItem?.supplierBrand || ''} className="input bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Name</label>
            <input type="text" disabled value={editingItem?.supplierName || ''} className="input bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed" />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Master Brand *</label>
            <input type="text" required value={editMasterBrand} onChange={e => setEditMasterBrand(e.target.value)} placeholder="e.g. ASUS ROG" className="input" />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setEditingItem(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Mapping</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={deletingId !== null} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Delete Mapping" message="Are you sure you want to delete this brand mapping rule?" confirmLabel="Yes, Delete" danger />
    </div>
  )
}
