import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit2, Trash2, Layers, CheckCircle2, X, Sliders, Tag, Sparkles } from 'lucide-react'
import { SectionHeader, FilterBar, EmptyState, ConfirmDialog } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { mockVariantTypes } from '../../data/mockData'
import type { VariantType } from '../../types'

export const Variants: React.FC = () => {
  const [variantsList, setVariantsList] = useState<VariantType[]>(mockVariantTypes)
  const [search, setSearch] = useState('')

  // Modals state
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [editingVariant, setEditingVariant] = useState<VariantType | null>(null)
  const [deletingVariant, setDeletingVariant] = useState<VariantType | null>(null)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Inline value adding state
  const [addingValueForId, setAddingValueForId] = useState<string | null>(null)
  const [newValueInput, setNewValueInput] = useState('')

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    valuesString: '',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Calculate summary metrics
  const totalDimensions = variantsList.length
  const totalOptionValues = variantsList.reduce((acc, curr) => acc + curr.values.length, 0)
  const totalProductsCovered = variantsList.reduce((acc, curr) => acc + curr.productCount, 0)

  // --- Handlers ---
  const handleOpenAdd = () => {
    setFormData({ name: '', valuesString: '' })
    setAddOpen(true)
  }

  const handleCreate = () => {
    if (!formData.name.trim()) {
      alert('Please enter Variant Type Name.')
      return
    }

    const valArray = formData.valuesString
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)

    const newVariant: VariantType = {
      id: `var_${Date.now()}`,
      name: formData.name,
      values: valArray.length > 0 ? valArray : ['Default'],
      productCount: 0,
    }

    setVariantsList([newVariant, ...variantsList])
    setAddOpen(false)
    showNotification(`Variant Type "${newVariant.name}" created!`)
  }

  const handleOpenEdit = (v: VariantType) => {
    setEditingVariant(v)
    setFormData({
      name: v.name,
      valuesString: v.values.join(', '),
    })
    setEditOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingVariant || !formData.name.trim()) return

    const valArray = formData.valuesString
      .split(',')
      .map(v => v.trim())
      .filter(Boolean)

    setVariantsList(prev =>
      prev.map(v => {
        if (v.id === editingVariant.id) {
          return {
            ...v,
            name: formData.name,
            values: valArray.length > 0 ? valArray : v.values,
          }
        }
        return v
      })
    )

    setEditOpen(false)
    setEditingVariant(null)
    showNotification(`Variant Type "${formData.name}" updated!`)
  }

  const handleConfirmDelete = () => {
    if (!deletingVariant) return

    setVariantsList(prev => prev.filter(v => v.id !== deletingVariant.id))
    showNotification(`Variant Type "${deletingVariant.name}" deleted.`)
    setDeleteOpen(false)
    setDeletingVariant(null)
  }

  const handleAddInlineValue = (id: string) => {
    if (!newValueInput.trim()) {
      setAddingValueForId(null)
      return
    }

    setVariantsList(prev =>
      prev.map(v => {
        if (v.id === id) {
          return {
            ...v,
            values: [...v.values, newValueInput.trim()],
          }
        }
        return v
      })
    )

    showNotification(`Added "${newValueInput.trim()}" option`)
    setNewValueInput('')
    setAddingValueForId(null)
  }

  const handleRemoveChipValue = (variantId: string, valToRemove: string) => {
    setVariantsList(prev =>
      prev.map(v => {
        if (v.id === variantId) {
          return {
            ...v,
            values: v.values.filter(val => val !== valToRemove),
          }
        }
        return v
      })
    )
  }

  const filtered = variantsList.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="relative space-y-6">
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
        title="Variant Types"
        subtitle="Define product variant dimensions (Size, Color, Storage, RAM) used across all catalog products"
        actions={
          <button onClick={handleOpenAdd} className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer">
            <Plus size={14} /> Add Variant Type
          </button>
        }
      />

      <FilterBar search={search} onSearch={setSearch} placeholder="Search variant types by name..." />

      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <EmptyState
            icon={<Layers size={28} className="text-slate-300" />}
            title="No variant types found"
            description="Try searching for another term or create a new variant dimension."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(v => (
            <div key={v.id} className="card p-5 hover:shadow-card-md transition-all flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/60 border border-violet-100 dark:border-violet-900/60 flex items-center justify-center shadow-2xs">
                      <Layers size={18} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{v.name}</p>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">{v.productCount.toLocaleString()} products using</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(v)}
                      className="btn-icon text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Edit Variant Type"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => { setDeletingVariant(v); setDeleteOpen(true); }}
                      className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Delete Variant Type"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Option Chips Container */}
                <div className="space-y-2">
                  <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">Available Dimension Values ({v.values.length})</p>
                  <div className="flex flex-wrap gap-1.5 items-center bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 min-h-[60px]">
                    {v.values.map(val => (
                      <span
                        key={val}
                        className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 shadow-2xs group/chip hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                      >
                        {val}
                        <button
                          onClick={() => handleRemoveChipValue(v.id, val)}
                          className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-md p-0.5 transition-colors"
                          title="Remove option value"
                        >
                          <X size={11} />
                        </button>
                      </span>
                    ))}

                    {addingValueForId === v.id ? (
                      <div className="inline-flex items-center gap-1">
                        <input
                          className="input input-sm py-1 px-2.5 text-xs w-28 font-medium"
                          autoFocus
                          placeholder="New Option"
                          value={newValueInput}
                          onChange={e => setNewValueInput(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleAddInlineValue(v.id)
                            if (e.key === 'Escape') setAddingValueForId(null)
                          }}
                        />
                        <button
                          onClick={() => handleAddInlineValue(v.id)}
                          className="btn-primary btn-sm text-2xs py-1 px-2.5 font-bold cursor-pointer"
                        >
                          Add
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setAddingValueForId(v.id); setNewValueInput(''); }}
                        className="px-3 py-1 border border-dashed border-slate-300 bg-white text-slate-500 rounded-lg text-xs hover:border-primary-400 hover:text-primary-600 transition-colors font-semibold cursor-pointer"
                      >
                        + Add Option
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD VARIANT MODAL --- */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Variant Type"
        subtitle="Define a new dimension for product variations"
        size="md"
        footer={
          <>
            <button onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreate} className="btn-primary">Create Variant Type</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Variant Type Name *</label>
            <input
              className="input"
              placeholder="e.g. Color, Size, Storage, Voltage"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Values (comma-separated)</label>
            <input
              className="input"
              placeholder="e.g. Black, White, Red, Blue, 128GB, 256GB"
              value={formData.valuesString}
              onChange={e => setFormData({ ...formData, valuesString: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- EDIT VARIANT MODAL --- */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Variant Type"
        subtitle={`Updating ${editingVariant?.name}`}
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
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Variant Type Name *</label>
            <input
              className="input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Values (comma-separated)</label>
            <input
              className="input"
              value={formData.valuesString}
              onChange={e => setFormData({ ...formData, valuesString: e.target.value })}
            />
          </div>
        </div>
      </Modal>

      {/* --- CONFIRM DELETE DIALOG --- */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Variant Type"
        message={`Are you sure you want to delete variant dimension "${deletingVariant?.name}"?`}
        confirmLabel="Yes, Delete"
        danger
      />
    </div>
  )
}
