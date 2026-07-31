import React, { useState } from 'react'
import { Plus, Search, Building2, Edit3, Trash2, CheckCircle2 } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { SectionHeader, FilterBar } from '../../components/ui'

interface Manufacturer {
  id: string
  name: string
  description?: string
  status: 'active' | 'inactive'
}

const INITIAL_MANUFACTURERS: Manufacturer[] = [
  { id: 'm1', name: 'Bosch Automotive Global', description: 'Global automotive components & systems manufacturer', status: 'active' },
  { id: 'm2', name: 'Denso Corporation', description: 'Thermal, powertrain, and mobility electronics', status: 'active' },
  { id: 'm3', name: 'Magna International', description: 'Mobility technology & vehicle assembly manufacturer', status: 'active' },
  { id: 'm4', name: 'ZF Friedrichshafen', description: 'Driveline and chassis technology supplier', status: 'inactive' },
  { id: 'm5', name: 'Aisin Seiki Parts', description: 'Automotive systems and precision components', status: 'active' },
]

export const Manufacturers: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(INITIAL_MANUFACTURERS)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  })

  const filtered = manufacturers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    (m.description && m.description.toLowerCase().includes(search.toLowerCase()))
  )

  const handleOpenAdd = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', status: 'active' })
    setModalOpen(true)
  }

  const handleOpenEdit = (m: Manufacturer) => {
    setEditingId(m.id)
    setFormData({ name: m.name, description: m.description || '', status: m.status })
    setModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setManufacturers(prev => prev.filter(x => x.id !== id))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      setManufacturers(prev => prev.map(m => m.id === editingId ? { ...m, ...formData } : m))
    } else {
      const newM: Manufacturer = {
        id: `m-${Date.now()}`,
        ...formData,
      }
      setManufacturers(prev => [newM, ...prev])
    }
    setModalOpen(false)
    setEditingId(null)
    setFormData({ name: '', description: '', status: 'active' })
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <SectionHeader
        title="Manufacturers"
        subtitle="Manage product catalog brand manufacturers"
        actions={
          <button
            onClick={handleOpenAdd}
            className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={15} /> Add Manufacturer
          </button>
        }
      />

      {/* Filter & Search Bar */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search manufacturer name or description..." />

      {/* Manufacturers Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Manufacturer Name</th>
                <th>Description</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Manufacturer Name">
                      <div className="flex items-center justify-end gap-2.5 text-right">
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">{m.name}</span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 flex items-center justify-center flex-shrink-0">
                          <Building2 size={15} className="text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                    </td>
                    <td data-label="Description">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {m.description || <span className="italic text-slate-400">No description</span>}
                      </span>
                    </td>
                    <td data-label="Status">
                      <Badge variant={m.status === 'active' ? 'success' : 'neutral'} dot>
                        {m.status}
                      </Badge>
                    </td>
                    <td data-label="Actions" className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn-icon"
                          title="Edit Manufacturer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Manufacturer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">No manufacturers found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Manufacturer Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Manufacturer' : 'Add New Manufacturer'}
        subtitle="Manage brand manufacturer details"
        size="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Manufacturer Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Bosch Automotive Global"
              className="input"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Description (Optional)</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter brief description of manufacturer..."
              className="input"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Status (Optional)</label>
            <select
              value={formData.status}
              onChange={e => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="select"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Manufacturer</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
