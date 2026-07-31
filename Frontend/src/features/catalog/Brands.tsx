import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Award, CheckCircle2 } from 'lucide-react'
import { SectionHeader, FilterBar, EmptyState, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockBrands } from '../../data/mockData'
import type { Brand } from '../../types'

export const Brands: React.FC = () => {
  const [brandsList, setBrandsList] = useState<Brand[]>(mockBrands)
  const [search, setSearch] = useState('')

  // Modals state
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [deletingBrand, setDeletingBrand] = useState<Brand | null>(null)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    logo: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Handlers ---
  const handleOpenAdd = () => {
    setFormData({
      name: '',
      slug: '',
      logo: '',
      description: '',
      status: 'active',
    })
    setAddOpen(true)
  }

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('Please enter a Brand Name.')
      return
    }

    const generatedSlug =
      formData.slug.trim() ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const newBrand: Brand = {
      id: `brand_${Date.now()}`,
      name: formData.name,
      slug: generatedSlug,
      logo: formData.logo,
      description: formData.description,
      productCount: 0,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setBrandsList([newBrand, ...brandsList])
    setAddOpen(false)
    showNotification(`Brand "${newBrand.name}" created successfully!`)
  }

  const handleOpenEdit = (brand: Brand) => {
    setEditingBrand(brand)
    setFormData({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || '',
      description: brand.description || '',
      status: brand.status,
    })
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingBrand || !formData.name.trim()) return

    setBrandsList(prev =>
      prev.map(b => {
        if (b.id === editingBrand.id) {
          return {
            ...b,
            name: formData.name,
            slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            logo: formData.logo,
            description: formData.description,
            status: formData.status,
            updatedAt: new Date().toISOString(),
          }
        }
        return b
      })
    )

    setEditOpen(false)
    setEditingBrand(null)
    showNotification(`Brand "${formData.name}" updated successfully!`)
  }

  const handleConfirmDelete = () => {
    if (!deletingBrand) return

    setBrandsList(prev => prev.filter(b => b.id !== deletingBrand.id))
    showNotification(`Brand "${deletingBrand.name}" deleted.`)
    setDeleteOpen(false)
    setDeletingBrand(null)
  }

  const filtered = brandsList.filter(
    b =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.slug.toLowerCase().includes(search.toLowerCase())
  )

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
        title="Brands"
        subtitle={`${brandsList.length} brands in master catalog`}
        actions={
          <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Brand
          </button>
        }
      />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search brands by name or slug..." />

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Products</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-16 text-slate-400">
                    <EmptyState
                      icon={<Award size={24} />}
                      title="No brands found"
                      description="Try adjusting your search query or create a new brand."
                    />
                  </td>
                </tr>
              )}
              {filtered.map(brand => (
                <tr key={brand.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td data-label="Brand">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-900/60 flex items-center justify-center flex-shrink-0">
                        <Award size={14} className="text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{brand.name}</p>
                        <code className="text-2xs text-slate-400 dark:text-slate-400 font-mono">{brand.slug}</code>
                      </div>
                    </div>
                  </td>
                  <td data-label="Products">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{brand.productCount.toLocaleString()}</span>
                  </td>
                  <td data-label="Status">
                    <Badge variant={brand.status === 'active' ? 'success' : 'neutral'} dot>
                      {brand.status}
                    </Badge>
                  </td>
                  <td data-label="Created">
                    <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">{brand.createdAt.split('T')[0]}</span>
                  </td>
                  <td data-label="Actions" className="text-right sm:text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(brand)}
                        className="btn-icon"
                        title="Edit Brand"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => { setDeletingBrand(brand); setDeleteOpen(true); }}
                        className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        title="Delete Brand"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD BRAND MODAL --- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Brand"
        subtitle="Create a new manufacturer or brand entity"
        size="md"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Brand</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand Name *</label>
            <input
              className="input"
              placeholder="e.g. Samsung"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Brand description..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- EDIT BRAND MODAL --- */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Brand"
        subtitle={`Updating details for ${editingBrand?.name}`}
        size="md"
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Brand Name *</label>
            <input
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Status</label>
            <select
              className="select"
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Brand"
        message={`Are you sure you want to delete brand "${deletingBrand?.name}"?`}
        confirmLabel="Yes, Delete Brand"
        danger
      />
    </div>
  )
}
