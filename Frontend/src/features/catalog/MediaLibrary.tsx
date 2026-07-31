import React, { useState, useRef } from 'react'
import { Image, Upload, Search, Edit2, Trash2, Eye, RefreshCw, X } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { SectionHeader, FilterBar } from '../../components/ui'

interface MediaAsset {
  id: string
  name: string
  sku: string
  type: string
  imageUrl: string
  status: 'active' | 'pending'
}

const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: 'a1',
    name: 'RAM-DDR5-6000-Front.png',
    sku: 'RAM-DDR5-001',
    type: 'Image (PNG)',
    imageUrl: 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'a2',
    name: 'CPU-7950X-Packaging.webp',
    sku: 'CPU-AMD-7950X',
    type: 'Image (WebP)',
    imageUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'a3',
    name: 'GPU-RTX4090-Backplate.png',
    sku: 'GPU-RTX4090-001',
    type: 'Image (PNG)',
    imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=600&auto=format&fit=crop&q=80',
    status: 'pending'
  },
  {
    id: 'a4',
    name: 'SSD-990Pro-Top.png',
    sku: 'SSD-990P-2TB',
    type: 'Image (PNG)',
    imageUrl: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=600&auto=format&fit=crop&q=80',
    status: 'active'
  },
  {
    id: 'a5',
    name: 'PSU-RM1000x-Modular.jpg',
    sku: 'PSU-COR-1000W',
    type: 'Image (JPG)',
    imageUrl: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=600&auto=format&fit=crop&q=80',
    status: 'active'
  },
]

export const MediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS)
  const [search, setSearch] = useState('')

  // Modals
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [previewModalAsset, setPreviewModalAsset] = useState<MediaAsset | null>(null)

  const [editingAsset, setEditingAsset] = useState<MediaAsset | null>(null)

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    sku: '',
    name: '',
    status: 'active' as 'active' | 'pending',
    imageUrl: '',
  })

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: '',
    sku: '',
    status: 'active' as 'active' | 'pending',
    imageUrl: '',
  })

  const uploadFileInputRef = useRef<HTMLInputElement | null>(null)
  const editFileInputRef = useRef<HTMLInputElement | null>(null)

  const filtered = assets.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.sku.toLowerCase().includes(search.toLowerCase())
  )

  // --- Handlers ---
  const handleOpenUpload = () => {
    setUploadForm({ sku: '', name: '', status: 'active', imageUrl: '' })
    setUploadModalOpen(true)
  }

  const handleUploadFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setUploadForm(prev => ({
        ...prev,
        imageUrl: objectUrl,
        name: prev.name || file.name,
      }))
    }
  }

  const handleUploadSave = (e: React.FormEvent) => {
    e.preventDefault()
    const newAsset: MediaAsset = {
      id: `a-${Date.now()}`,
      name: uploadForm.name.trim() || `Product-Image-${Date.now().toString().slice(-4)}.png`,
      sku: uploadForm.sku.trim() || 'GENERAL-SKU',
      type: 'Image (PNG)',
      imageUrl: uploadForm.imageUrl || 'https://images.unsplash.com/photo-1562976540-1502c2145186?w=600&auto=format&fit=crop&q=80',
      status: uploadForm.status,
    }
    setAssets(prev => [newAsset, ...prev])
    setUploadModalOpen(false)
  }

  const handleOpenEdit = (asset: MediaAsset) => {
    setEditingAsset(asset)
    setEditForm({
      name: asset.name,
      sku: asset.sku,
      status: asset.status,
      imageUrl: asset.imageUrl,
    })
    setEditModalOpen(true)
  }

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const objectUrl = URL.createObjectURL(file)
      setEditForm(prev => ({
        ...prev,
        imageUrl: objectUrl,
      }))
    }
  }

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAsset) return
    setAssets(prev =>
      prev.map(a =>
        a.id === editingAsset.id
          ? {
              ...a,
              name: editForm.name || a.name,
              sku: editForm.sku || a.sku,
              status: editForm.status,
              imageUrl: editForm.imageUrl || a.imageUrl,
            }
          : a
      )
    )
    setEditModalOpen(false)
    setEditingAsset(null)
  }

  const handleDelete = (id: string) => {
    setAssets(prev => prev.filter(a => a.id !== id))
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <SectionHeader
        title="Media / Image Library"
        subtitle="Centralized product image media repository"
        actions={
          <button
            onClick={handleOpenUpload}
            className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Upload size={15} /> Upload Media
          </button>
        }
      />

      {/* Filter & Search Bar */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search media file name or product SKU..." />

      {/* Media Table Listing */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-20">Preview</th>
                <th>File Name</th>
                <th>Related Product / SKU</th>
                <th>File Type</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map(asset => (
                  <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td>
                      {/* Actual Image Thumbnail */}
                      <div
                        onClick={() => setPreviewModalAsset(asset)}
                        className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden cursor-pointer hover:opacity-85 transition-opacity relative group"
                        title="Click to view full preview"
                      >
                        <img
                          src={asset.imageUrl}
                          alt={asset.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye size={14} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">{asset.name}</span>
                    </td>
                    <td>
                      <span className="font-mono text-2xs bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded font-bold text-slate-700 dark:text-slate-300">
                        {asset.sku}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{asset.type}</span>
                    </td>
                    <td>
                      <Badge variant={asset.status === 'active' ? 'success' : 'neutral'} dot>
                        {asset.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setPreviewModalAsset(asset)}
                          className="btn-icon text-slate-500 hover:text-primary-600"
                          title="View Larger Preview"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(asset)}
                          className="btn-icon"
                          title="Edit Media"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(asset.id)}
                          className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          title="Delete Media"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <p className="font-medium text-sm">No media files found matching your search</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- LARGER PREVIEW MODAL --- */}
      <Modal
        open={previewModalAsset !== null}
        onClose={() => setPreviewModalAsset(null)}
        title={previewModalAsset?.name || 'Image Preview'}
        subtitle={`SKU: ${previewModalAsset?.sku}`}
        size="lg"
      >
        {previewModalAsset && (
          <div className="space-y-4 text-center">
            <div className="w-full max-h-[480px] bg-slate-950 rounded-2xl overflow-hidden flex items-center justify-center p-4 border border-slate-800">
              <img
                src={previewModalAsset.imageUrl}
                alt={previewModalAsset.name}
                className="max-h-[440px] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-2">
              <span>File: {previewModalAsset.name}</span>
              <Badge variant={previewModalAsset.status === 'active' ? 'success' : 'neutral'}>{previewModalAsset.status}</Badge>
            </div>
          </div>
        )}
      </Modal>

      {/* --- UPLOAD MEDIA MODAL (WITH LIVE PREVIEW) --- */}
      <Modal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Media"
        subtitle="Upload product image asset"
        size="md"
      >
        <form onSubmit={handleUploadSave} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            ref={uploadFileInputRef}
            className="hidden"
            onChange={handleUploadFileChange}
          />

          {uploadForm.imageUrl ? (
            <div className="relative group rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 bg-slate-900 p-2 text-center">
              <img
                src={uploadForm.imageUrl}
                alt="Upload Preview"
                className="h-44 w-full object-contain mx-auto rounded-xl"
              />
              <button
                type="button"
                onClick={() => setUploadForm(prev => ({ ...prev, imageUrl: '' }))}
                className="absolute top-3 right-3 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-rose-600 transition-colors"
                title="Remove image"
              >
                <X size={14} />
              </button>
              <p className="text-2xs font-bold text-emerald-400 mt-2">✓ Image selected — Live preview ready</p>
            </div>
          ) : (
            <div
              onClick={() => uploadFileInputRef.current?.click()}
              className="p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-900/60 cursor-pointer hover:border-primary-500 hover:bg-primary-50/20 transition-all"
            >
              <Upload size={28} className="mx-auto text-primary-600 dark:text-primary-400 mb-2" />
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Click to Select or Drag Image File Here</p>
              <p className="text-2xs text-slate-400 mt-1">Supports PNG, WebP, JPG up to 10MB</p>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Related Product / SKU *</label>
            <input
              type="text"
              required
              value={uploadForm.sku}
              onChange={e => setUploadForm({ ...uploadForm, sku: e.target.value })}
              placeholder="e.g. RAM-DDR5-001"
              className="input font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">File Name (Optional)</label>
            <input
              type="text"
              value={uploadForm.name}
              onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
              placeholder="e.g. Product-Angle-View.png"
              className="input"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setUploadModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Media</button>
          </div>
        </form>
      </Modal>

      {/* --- EDIT MEDIA MODAL (WITH PREVIEW & REPLACE IMAGE BUTTON) --- */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Media Details"
        subtitle="Update image metadata or replace file"
        size="md"
      >
        <form onSubmit={handleEditSave} className="space-y-4">
          <input
            type="file"
            accept="image/*"
            ref={editFileInputRef}
            className="hidden"
            onChange={handleEditFileChange}
          />

          {/* Current Image Preview & Replace Button */}
          <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={editForm.imageUrl || editingAsset?.imageUrl}
                alt="Current Preview"
                className="w-14 h-14 object-cover rounded-xl border border-slate-700 bg-slate-800"
              />
              <div>
                <p className="text-xs font-bold text-white truncate max-w-[200px]">{editForm.name}</p>
                <p className="text-2xs text-slate-400 font-mono">SKU: {editForm.sku}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => editFileInputRef.current?.click()}
              className="btn-secondary btn-sm flex items-center gap-1 text-2xs font-bold cursor-pointer"
            >
              <RefreshCw size={12} /> Replace Image
            </button>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">File Name</label>
            <input
              type="text"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Related Product / SKU</label>
            <input
              type="text"
              value={editForm.sku}
              onChange={e => setEditForm({ ...editForm, sku: e.target.value })}
              className="input font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Status</label>
            <select
              value={editForm.status}
              onChange={e => setEditForm({ ...editForm, status: e.target.value as 'active' | 'pending' })}
              className="select"
            >
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button type="button" onClick={() => setEditModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
