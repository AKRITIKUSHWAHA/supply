import React, { useState } from 'react'
import { Edit2, Trash2 } from 'lucide-react'
import { SectionHeader, FilterBar, Select, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

interface CategoryMappingItem {
  id: string
  supplierCategory: string
  supplierName: string
  masterCategory: string
  status: 'mapped' | 'unmapped'
}

const INITIAL_DATA: CategoryMappingItem[] = [
  { id: '1', supplierCategory: 'PC Components > Motherboards', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Motherboards', status: 'mapped' },
  { id: '2', supplierCategory: 'Memory & Storage > RAM', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Computers > Memory', status: 'mapped' },
  { id: '3', supplierCategory: 'Peripherals > Input Devices', supplierName: 'GlobalSource Ltd.', masterCategory: 'Electronics > Peripherals', status: 'mapped' },
  { id: '4', supplierCategory: 'Industrial > Cooling', supplierName: 'AcmeDistributors', masterCategory: '', status: 'unmapped' },
  { id: '5', supplierCategory: 'Power > Modular PSUs', supplierName: 'TechParts Int.', masterCategory: 'Electronics > Power Supplies', status: 'mapped' },
]

export const CategoryMapping: React.FC = () => {
  const [items, setItems] = useState<CategoryMappingItem[]>(INITIAL_DATA)
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const [editingItem, setEditingItem] = useState<CategoryMappingItem | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editMasterCategory, setEditMasterCategory] = useState('')

  const filtered = items.filter(item => {
    const matchesSearch =
      item.supplierCategory.toLowerCase().includes(search.toLowerCase()) ||
      item.masterCategory.toLowerCase().includes(search.toLowerCase()) ||
      item.supplierName.toLowerCase().includes(search.toLowerCase())
    const matchesSupplier = supplierFilter === 'all' || item.supplierName === supplierFilter
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter
    return matchesSearch && matchesSupplier && matchesStatus
  })

  const suppliers = Array.from(new Set(items.map(i => i.supplierName)))

  const handleOpenEdit = (item: CategoryMappingItem) => {
    setEditingItem(item)
    setEditMasterCategory(item.masterCategory)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem) return
    const updated = editMasterCategory.trim()
    setItems(prev =>
      prev.map(i =>
        i.id === editingItem.id
          ? {
              ...i,
              masterCategory: updated,
              status: updated ? 'mapped' : 'unmapped',
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
        title="Category Mapping"
        subtitle="Map supplier category names to Master Catalog categories"
      />

      {/* Filter & Search Bar */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search supplier category or master category...">
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

      {/* Category Mapping Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Supplier Category</th>
                <th>Supplier</th>
                <th>Master Category</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Supplier Category">
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                        {item.supplierCategory}
                      </span>
                    </td>
                    <td data-label="Supplier">
                      <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                        {item.supplierName}
                      </span>
                    </td>
                    <td data-label="Master Category">
                      {item.masterCategory ? (
                        <span className="text-xs font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2.5 py-1 rounded">
                          {item.masterCategory}
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
                    <p className="font-medium text-sm">No category mappings found matching your search</p>
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
        title="Edit Category Mapping"
        subtitle={`Supplier Category: ${editingItem?.supplierCategory}`}
        size="md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Supplier Category</label>
            <input
              type="text"
              disabled
              value={editingItem?.supplierCategory || ''}
              className="input bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
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
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Master Category *</label>
            <input
              type="text"
              required
              value={editMasterCategory}
              onChange={e => setEditMasterCategory(e.target.value)}
              placeholder="e.g. Electronics > Computers > Memory"
              className="input"
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
        message="Are you sure you want to delete this category mapping rule?"
        confirmLabel="Yes, Delete"
        danger
      />
    </div>
  )
}
