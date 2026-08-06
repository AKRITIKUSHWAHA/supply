import { API_BASE_URL } from '../../config/api'
import React, { useState, useEffect } from 'react'
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

export const Manufacturers: React.FC = () => {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  })

  const fetchManufacturers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/manufacturers`);
      if (res.ok) {
        const data = await res.json();
        setManufacturers(data);
      }
    } catch (err) {
      console.error('Failed to fetch manufacturers:', err);
    }
  }

  useEffect(() => {
    fetchManufacturers();
  }, [])

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

  const handleDelete = async (id: string) => {
    try {
      await fetch(`${API_BASE_URL}/api/manufacturers/${id}`, {
        method: 'DELETE'
      });
      await fetchManufacturers();
    } catch (err) {
      console.error(err);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    try {
      if (editingId) {
        await fetch(`${API_BASE_URL}/api/manufacturers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      } else {
        await fetch(`${API_BASE_URL}/api/manufacturers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }
      await fetchManufacturers();
    } catch (err) {
      console.error(err);
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
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
                <th className="text-left whitespace-nowrap px-4 py-3.5">MANUFACTURER NAME</th>
                <th className="text-left whitespace-nowrap px-4 py-3.5">DESCRIPTION</th>
                <th className="text-center whitespace-nowrap px-4 py-3.5">STATUS</th>
                <th className="text-right whitespace-nowrap px-4 py-3.5 pr-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.length > 0 ? (
                filtered.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td data-label="Manufacturer Name" className="px-4 py-3.5 text-left">
                      <div className="flex items-center gap-3 text-left">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 flex items-center justify-center shrink-0 shadow-xs">
                          <Building2 size={16} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug truncate">{m.name}</p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Description" className="px-4 py-3.5 text-left">
                      <p className="text-xs text-slate-600 dark:text-slate-300 font-medium line-clamp-2 max-w-md">
                        {m.description || <span className="italic text-slate-400">No description provided</span>}
                      </p>
                    </td>
                    <td data-label="Status" className="px-4 py-3.5 text-center">
                      <Badge variant={m.status === 'active' ? 'success' : 'neutral'} dot>
                        {m.status.charAt(0).toUpperCase() + m.status.slice(1)}
                      </Badge>
                    </td>
                    <td data-label="Actions" className="px-4 py-3.5 text-right pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="btn-icon p-1.5 rounded-lg text-slate-400 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Edit Manufacturer"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          className="btn-icon p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
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
