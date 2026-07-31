import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Tag, ChevronRight, CheckCircle2 } from 'lucide-react'
import { SectionHeader, FilterBar, EmptyState, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockCategories } from '../../data/mockData'
import type { Category } from '../../types'

export const Categories: React.FC = () => {
  const [categoriesList, setCategoriesList] = useState<Category[]>(mockCategories)
  const [search, setSearch] = useState('')

  // Modals state
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: '',
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
      parentId: '',
      description: '',
      status: 'active',
    })
    setAddOpen(true)
  }

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('Please enter a Category Name.')
      return
    }

    const generatedSlug =
      formData.slug.trim() ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    const newCat: Category = {
      id: `cat_${Date.now()}`,
      name: formData.name,
      slug: generatedSlug,
      parentId: formData.parentId || undefined,
      description: formData.description,
      productCount: 0,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setCategoriesList([newCat, ...categoriesList])
    setAddOpen(false)
    showNotification(`Category "${newCat.name}" created successfully!`)
  }

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat)
    setFormData({
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId || '',
      description: cat.description || '',
      status: cat.status,
    })
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingCategory || !formData.name.trim()) return

    setCategoriesList(prev =>
      prev.map(c => {
        if (c.id === editingCategory.id) {
          return {
            ...c,
            name: formData.name,
            slug: formData.slug.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            parentId: formData.parentId || undefined,
            description: formData.description,
            status: formData.status,
            updatedAt: new Date().toISOString(),
          }
        }
        return c
      })
    )

    setEditOpen(false)
    setEditingCategory(null)
    showNotification(`Category "${formData.name}" updated successfully!`)
  }

  const handleConfirmDelete = () => {
    if (!deletingCategory) return

    setCategoriesList(prev => prev.filter(c => c.id !== deletingCategory.id))
    showNotification(`Category "${deletingCategory.name}" deleted.`)
    setDeleteOpen(false)
    setDeletingCategory(null)
  }

  // Filter Categories
  const filtered = categoriesList.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
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
        title="Categories"
        subtitle={`${categoriesList.length} categories configured in master catalog`}
        actions={
          <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5">
            <Plus size={14} /> Add Category
          </button>
        }
      />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search category by name or slug..." />

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Parent Category</th>
                <th>Products</th>
                <th>Status</th>
                <th>Created</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-slate-400">
                    <EmptyState
                      icon={<Tag size={24} />}
                      title="No categories found"
                      description="Try adjusting your search query or add a new category."
                    />
                  </td>
                </tr>
              )}
              {filtered.map(cat => {
                const parentCat = categoriesList.find(c => c.id === cat.parentId)

                return (
                  <tr key={cat.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Category">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-950/60 border border-primary-100 dark:border-primary-900/60 flex items-center justify-center flex-shrink-0">
                          <Tag size={14} className="text-primary-600 dark:text-primary-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{cat.name}</p>
                          <code className="text-2xs text-slate-400 dark:text-slate-400 font-mono">{cat.slug}</code>
                        </div>
                      </div>
                    </td>
                    <td data-label="Parent Category">
                      {parentCat ? (
                        <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 font-medium">
                          <ChevronRight size={12} className="text-slate-400" />
                          {parentCat.name}
                        </div>
                      ) : (
                        <span className="text-2xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                          Root
                        </span>
                      )}
                    </td>
                    <td data-label="Products">
                      <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.productCount.toLocaleString()}</span>
                    </td>
                    <td data-label="Status">
                      <Badge variant={cat.status === 'active' ? 'success' : 'neutral'} dot>
                        {cat.status}
                      </Badge>
                    </td>
                    <td data-label="Created">
                      <span className="text-xs text-slate-500 dark:text-slate-300 font-medium">{cat.createdAt.split('T')[0]}</span>
                    </td>
                    <td data-label="Actions" className="text-right sm:text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="btn-icon"
                          title="Edit Category"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => { setDeletingCategory(cat); setDeleteOpen(true); }}
                          className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD CATEGORY MODAL --- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Category"
        subtitle="Create a new classification in the master catalog tree"
        size="md"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Category</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category Name *</label>
            <input
              className="input"
              placeholder="e.g. Motherboards & CPUs"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Parent Category</label>
            <select
              className="select"
              value={formData.parentId}
              onChange={e => setFormData({ ...formData, parentId: e.target.value })}
            >
              <option value="">None (Root Level Category)</option>
              {categoriesList.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Enter category description..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- EDIT CATEGORY MODAL --- */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Category"
        subtitle={`Updating details for ${editingCategory?.name}`}
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
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Category Name *</label>
            <input
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Parent Category</label>
            <select
              className="select"
              value={formData.parentId}
              onChange={e => setFormData({ ...formData, parentId: e.target.value })}
            >
              <option value="">None (Root Level Category)</option>
              {categoriesList
                .filter(c => c.id !== editingCategory?.id)
                .map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Description</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Enter category description..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
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
        title="Delete Category"
        message={`Are you sure you want to delete category "${deletingCategory?.name}"? Sub-categories and products assigned will lose their category parent.`}
        confirmLabel="Yes, Delete Category"
        danger
      />
    </div>
  )
}
