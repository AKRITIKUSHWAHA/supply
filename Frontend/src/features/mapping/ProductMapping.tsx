import React, { useState } from 'react'
import { Edit2, Trash2, Link2, CheckCircle2 } from 'lucide-react'
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

const INITIAL_DATA: ProductMappingItem[] = [
  { id: '1', supplierSku: 'ASUS-ROG-X570-E', supplierName: 'TechParts Int.', masterSku: 'MB-X570-001', status: 'mapped' },
  { id: '2', supplierSku: 'CMK32GX5M2B6000C36', supplierName: 'TechParts Int.', masterSku: 'RAM-DDR5-001', status: 'mapped' },
  { id: '3', supplierSku: 'ASUS-TUF-4090-OC', supplierName: 'TechParts Int.', masterSku: '', status: 'unmapped' },
  { id: '4', supplierSku: 'MZ-V8P2T0B/AM', supplierName: 'GlobalSource Ltd.', masterSku: 'SSD-980P-001', status: 'mapped' },
  { id: '5', supplierSku: 'LOG-MX-M3S-GR', supplierName: 'GlobalSource Ltd.', masterSku: 'MOUSE-MX3S-001', status: 'mapped' },
  { id: '6', supplierSku: 'ACME-CMK-50-BLK', supplierName: 'AcmeDistributors', masterSku: '', status: 'unmapped' },
]

export const ProductMapping: React.FC = () => {
  const [items, setItems] = useState<ProductMappingItem[]>(INITIAL_DATA)
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [editingItem, setEditingItem] = useState<ProductMappingItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editMasterSku, setEditMasterSku] = useState('')

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

  const handleOpenEdit = (item: ProductMappingItem) => {
    setEditingItem(item)
    setEditMasterSku(item.masterSku)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const updatedSku = editMasterSku.trim()
    setItems(prev =>
      prev.map(i =>
        i.id === editingItem.id
          ? {
              ...i,
              masterSku: updatedSku,
              status: updatedSku ? 'mapped' : 'unmapped',
            }
          : i
      )
    )
    setEditingItem(null)
  }

  const handleDelete = () => {
    if (!deletingId) return
    setItems(prev => prev.filter(i => i.id !== deletingId))
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionHeader
        title="Product Mapping"
        subtitle="Map supplier product SKUs to Master Catalog SKUs"
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
