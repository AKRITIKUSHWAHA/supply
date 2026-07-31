import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, Users, UserCog, Shield, CheckCircle2, Lock, Save, X, Building, ShieldAlert, KeyRound, Clock, Eye, Edit3 } from 'lucide-react'
import { SectionHeader, ConfirmDialog } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockRoles } from '../../data/mockData'
import type { Role } from '../../types'

const ALL_MODULES = [
  'Dashboard', 'Suppliers', 'Integrations', 'Master Catalog', 'Categories', 'Brands',
  'Manufacturers', 'Variants', 'Media Library', 'Data Mapping', 'Validation', 'Inventory Sync',
  'Pricing Sync', 'Image Sync', 'Store Management', 'Store Synchronization', 'Queue Management',
  'Logs', 'Monitoring', 'Reports', 'Users', 'Roles', 'Permissions', 'Settings'
]

const DEPARTMENTS = [
  'Executive Management',
  'Platform Operations',
  'Catalog & Merchandising',
  'Supplier Integration',
  'System Monitoring',
  'Finance & Audit',
  'Security & Compliance'
]

export const Roles: React.FC = () => {
  const [rolesList, setRolesList] = useState<Role[]>(mockRoles)
  const [createOpen, setCreateOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [deleteConfirmRole, setDeleteConfirmRole] = useState<Role | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form states for Enterprise Role Creation
  const [formName, setFormName] = useState('')
  const [formDepartment, setFormDepartment] = useState('Platform Operations')
  const [formDataScope, setFormDataScope] = useState('all')
  const [formMfa, setFormMfa] = useState(true)
  const [formSessionTimeout, setFormSessionTimeout] = useState('1h')
  const [formDesc, setFormDesc] = useState('')
  const [formPerms, setFormPerms] = useState<string[]>([])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleOpenCreate = () => {
    setFormName('')
    setFormDepartment('Platform Operations')
    setFormDataScope('all')
    setFormMfa(true)
    setFormSessionTimeout('1h')
    setFormDesc('')
    setFormPerms(['dashboard'])
    setCreateOpen(true)
  }

  const handleOpenEdit = (role: Role) => {
    setSelectedRole(role)
    setFormName(role.name)
    setFormDepartment('Catalog & Merchandising')
    setFormDataScope('all')
    setFormMfa(true)
    setFormSessionTimeout('1h')
    setFormDesc(role.description)
    setFormPerms(role.permissions)
    setEditOpen(true)
  }

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const slug = formName.toLowerCase().replace(/[^a-z0-9]/g, '_') as any
    const newRole: Role = {
      id: `role_${Date.now()}`,
      name: formName.trim(),
      slug: slug,
      description: `${formDesc.trim() || 'Custom platform role'} • Dept: ${formDepartment} • Scope: ${formDataScope.toUpperCase()}`,
      userCount: 0,
      permissions: formPerms,
      createdAt: new Date().toISOString(),
    }

    setRolesList(prev => [...prev, newRole])
    setCreateOpen(false)
    showNotification(`Enterprise Role "${newRole.name}" created with MFA & Scope policies!`)
  }

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole || !formName.trim()) return

    setRolesList(prev =>
      prev.map(r => {
        if (r.id === selectedRole.id) {
          return {
            ...r,
            name: formName.trim(),
            description: formDesc.trim(),
            permissions: formPerms,
          }
        }
        return r
      })
    )

    setEditOpen(false)
    setSelectedRole(null)
    showNotification(`Enterprise Role "${formName}" updated successfully!`)
  }

  const handleDeleteRole = () => {
    if (!deleteConfirmRole) return
    setRolesList(prev => prev.filter(r => r.id !== deleteConfirmRole.id))
    showNotification(`Role "${deleteConfirmRole.name}" deleted.`)
    setDeleteConfirmRole(null)
  }

  const togglePerm = (permKey: string) => {
    setFormPerms(prev =>
      prev.includes(permKey) ? prev.filter(p => p !== permKey) : [...prev, permKey]
    )
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Enterprise Roles & Security Governance"
        subtitle="Manage RBAC roles, data isolation boundaries, MFA security rules, and module access permissions"
        actions={
          <button onClick={handleOpenCreate} className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
            <Plus size={14} /> Create Enterprise Role
          </button>
        }
      />

      {/* Role Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map(role => (
          <div key={role.id} className="card p-5 hover:shadow-card-md transition-all flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-slate-800 border border-primary-100 dark:border-slate-700 flex items-center justify-center">
                  <UserCog size={18} className="text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex gap-1">
                  <button className="btn-icon" onClick={() => handleOpenEdit(role)} title="Edit Role">
                    <Edit size={13} />
                  </button>
                  {role.slug !== 'platform_owner' && (
                    <button
                      className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      onClick={() => setDeleteConfirmRole(role)}
                      title="Delete Role"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-base mb-1">{role.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">{role.description}</p>
            </div>

            <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <Users size={13} className="text-slate-400" />
              <span className="text-xs text-slate-500 font-medium">{role.userCount} active user{role.userCount !== 1 ? 's' : ''}</span>
              <div className="ml-auto">
                <Badge variant={role.slug === 'platform_owner' ? 'purple' : 'neutral'}>
                  {role.permissions.length === 1 && role.permissions[0] === '*' ? 'Full Access (*)' : `${role.permissions.length} modules`}
                </Badge>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE ENTERPRISE ROLE MODAL */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Enterprise Role"
        subtitle="Specify role metadata, data scope, MFA enforcement, and module access matrix"
        size="xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-5">
          {/* Section 1: Basic Role Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <UserCog size={13} className="text-primary-600" /> Role Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Catalog Auditor"
                className="input"
                value={formName}
                onChange={e => setFormName(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                <Building size={13} className="text-primary-600" /> Department / Business Unit
              </label>
              <select
                className="select"
                value={formDepartment}
                onChange={e => setFormDepartment(e.target.value)}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Role Description & Scope</label>
            <textarea
              rows={2}
              placeholder="Detailed description of operational responsibilities, data boundaries, and authorization scope..."
              className="input"
              value={formDesc}
              onChange={e => setFormDesc(e.target.value)}
            />
          </div>

          {/* Section 2: Enterprise Governance & Data Scope */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 space-y-3">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <ShieldAlert size={14} className="text-amber-500" /> Enterprise Security & Data Isolation Policy
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="text-2xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Data Access Boundary</label>
                <select className="select input-sm" value={formDataScope} onChange={e => setFormDataScope(e.target.value)}>
                  <option value="all">Full System Scope (All Data)</option>
                  <option value="assigned_suppliers">Assigned Suppliers Only</option>
                  <option value="assigned_stores">Assigned Storefronts Only</option>
                  <option value="read_only">Audit / Read-Only Partition</option>
                </select>
              </div>

              <div>
                <label className="text-2xs font-bold text-slate-600 dark:text-slate-400 block mb-1">Idle Session Timeout</label>
                <select className="select input-sm" value={formSessionTimeout} onChange={e => setFormSessionTimeout(e.target.value)}>
                  <option value="15m">15 Minutes (High Security)</option>
                  <option value="30m">30 Minutes</option>
                  <option value="1h">1 Hour (Standard)</option>
                  <option value="8h">8 Hours (Work Shift)</option>
                </select>
              </div>

              <div className="flex items-center pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formMfa}
                    onChange={e => setFormMfa(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600"
                  />
                  <span>Enforce Multi-Factor Auth (MFA)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Module Permissions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <KeyRound size={13} className="text-primary-600" /> Granted Module Access Matrix ({formPerms.length}/{ALL_MODULES.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormPerms(ALL_MODULES.map(m => m.toLowerCase().replace(/ /g, '_')))}
                  className="text-2xs font-bold text-primary-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">•</span>
                <button
                  type="button"
                  onClick={() => setFormPerms(['dashboard'])}
                  className="text-2xs font-bold text-slate-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-h-56 overflow-y-auto scrollbar-hide">
              {ALL_MODULES.map(m => {
                const key = m.toLowerCase().replace(/ /g, '_')
                const isChecked = formPerms.includes('*') || formPerms.includes(key)
                return (
                  <label key={m} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePerm(key)}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500/20"
                    />
                    <span>{m}</span>
                  </label>
                )
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
              <Plus size={14} /> Create Enterprise Role
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT ENTERPRISE ROLE MODAL */}
      {selectedRole && (
        <Modal
          open={editOpen}
          onClose={() => setEditOpen(false)}
          title={`Edit Enterprise Role: ${selectedRole.name}`}
          subtitle="Modify role details, security requirements, and permissions"
          size="xl"
        >
          <form onSubmit={handleEditSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Role Name *</label>
                <input
                  type="text"
                  required
                  className="input"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Department</label>
                <select
                  className="select"
                  value={formDepartment}
                  onChange={e => setFormDepartment(e.target.value)}
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Description</label>
              <textarea
                rows={2}
                className="input"
                value={formDesc}
                onChange={e => setFormDesc(e.target.value)}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">Module Access Permissions</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 max-h-56 overflow-y-auto scrollbar-hide">
                {ALL_MODULES.map(m => {
                  const key = m.toLowerCase().replace(/ /g, '_')
                  const isChecked = formPerms.includes('*') || formPerms.includes(key)
                  return (
                    <label key={m} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700 dark:text-slate-300 select-none p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => togglePerm(key)}
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500/20"
                      />
                      <span>{m}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary flex items-center gap-1.5"><Save size={14} /> Save Changes</button>
            </div>
          </form>
        </Modal>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {deleteConfirmRole && (
        <ConfirmDialog
          open
          onClose={() => setDeleteConfirmRole(null)}
          onConfirm={handleDeleteRole}
          title={`Delete Role "${deleteConfirmRole.name}"?`}
          message="Are you sure you want to delete this role? Any users assigned to this role will need to be re-assigned."
          confirmLabel="Delete Role"
          danger
        />
      )}
    </div>
  )
}
