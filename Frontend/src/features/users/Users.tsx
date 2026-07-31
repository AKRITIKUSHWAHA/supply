import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserPlus, Ban, CheckCircle2, Mail, Eye, ShieldCheck, AlertCircle, AlertTriangle } from 'lucide-react'
import { SectionHeader, FilterBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { mockUsers } from '../../data/mockData'
import { statusToVariant, formatDate, getInitials, timeAgo } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import type { User, UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner:      'Platform Owner',
  administrator:       'Administrator',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
}

const ROLE_COLORS: Record<UserRole, string> = {
  platform_owner:      'purple',
  administrator:       'primary',
  catalog_manager:     'info',
  integration_manager: 'cyan',
  operations_staff:    'amber',
} as any



const ROLE_DESCRIPTIONS: Record<string, string> = {
  platform_owner:  'Full unrestricted control over system configuration, user management, security, and global middleware settings.',
  administrator:   'Manage catalog, suppliers, stores, data mappings, validation rules, and team member accounts.',
  catalog_manager: 'Create, edit, and validate catalog products, taxonomy categories, pricing, and supplier sync settings.',
  read_only:       'View catalog, inventory levels, pricing, sync status, and system activity logs without edit permissions.',
}

export const Users: React.FC = () => {
  const { setViewProfileUser } = useAuth()
  const [usersList, setUsersList] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Invite Form States
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('catalog_manager')
  const [formError, setFormError] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // Email Validation Regex
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  // Duplicate Check
  const isDuplicateEmail = usersList.some(
    u => u.email.toLowerCase() === inviteEmail.trim().toLowerCase()
  )

  // Platform Owner Reserved Role Check
  const existingOwnersCount = usersList.filter(
    u => u.role === 'platform_owner' && u.status !== 'inactive'
  ).length
  const isOwnerReserved = inviteRole === 'platform_owner' && existingOwnersCount >= 1

  // Overall Form Validation
  const isFormValid =
    inviteName.trim().length >= 2 &&
    isValidEmail(inviteEmail) &&
    !isDuplicateEmail &&
    !isOwnerReserved

  const handleOpenInvite = () => {
    setInviteName('')
    setInviteEmail('')
    setInviteRole('catalog_manager')
    setFormError(null)
    setInviteOpen(true)
  }

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    const cleanName = inviteName.trim()
    const cleanEmail = inviteEmail.trim().toLowerCase()

    if (!cleanName) {
      setFormError('Please enter a valid full name.')
      return
    }

    if (!isValidEmail(cleanEmail)) {
      setFormError('Please enter a valid email address format (e.g. name@domain.com).')
      return
    }

    if (isDuplicateEmail) {
      setFormError(`A user or pending invitation with email "${cleanEmail}" already exists.`)
      return
    }

    if (isOwnerReserved) {
      setFormError('Platform Owner is a reserved system role and cannot be assigned to additional users.')
      return
    }

    const newUser: User = {
      id: `u_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: inviteRole,
      status: 'invited',
      createdAt: new Date().toISOString(),
      department: inviteRole === 'catalog_manager' ? 'Catalog & Merchandising' : inviteRole === 'administrator' ? 'Operations' : 'Platform Governance',
    }

    setUsersList(prev => [newUser, ...prev])
    setInviteOpen(false)
    setInviteName('')
    setInviteEmail('')
    showNotification(`Invitation email sent to ${newUser.email}! Account provisioned as ${ROLE_LABELS[inviteRole]}.`)
  }

  const toggleUserStatus = (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    setUsersList(prev =>
      prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u))
    )
    showNotification(`User ${user.name} account status updated to ${nextStatus.toUpperCase()}`)
  }

  const filtered = usersList.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = roleFilter === 'all' || u.role === roleFilter
    const matchStatus = statusFilter === 'all' || u.status === statusFilter
    return matchSearch && matchRole && matchStatus
  })

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
        title="User Management & Access Control"
        subtitle={`${usersList.length} total team members — ${usersList.filter(u => u.status === 'active').length} active, ${usersList.filter(u => u.status === 'invited').length} pending invitation`}
        actions={
          <button onClick={handleOpenInvite} className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer">
            <UserPlus size={14} /> Invite New User
          </button>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: usersList.length, color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Active Sessions', value: usersList.filter(u => u.status === 'active').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Pending Invites', value: usersList.filter(u => u.status === 'invited').length, color: 'text-amber-600 dark:text-amber-400' },
          { label: 'Inactive / Suspended', value: usersList.filter(u => u.status === 'inactive').length, color: 'text-slate-400' },
        ].map(s => (
          <div key={s.label} className="card px-4 py-3 text-center border border-slate-200/90 dark:border-slate-800">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder="Search team members by name or email...">
        <select className="select input-sm w-auto min-w-[140px]" value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="platform_owner">Platform Owner</option>
          <option value="administrator">Administrator</option>
          <option value="catalog_manager">Catalog Manager</option>
          <option value="read_only">Read Only</option>
        </select>
        <select className="select input-sm w-auto min-w-[130px]" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="invited">Invited</option>
          <option value="inactive">Inactive</option>
        </select>
      </FilterBar>

      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User & Account</th>
                <th>Assigned Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Joined</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(user => (
                <tr key={user.id} className="cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors" onClick={() => setViewProfileUser(user)}>
                  <td data-label="User">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-aurora flex items-center justify-center text-white text-xs font-black flex-shrink-0 shadow-glow-primary">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 dark:text-slate-100 text-sm hover:text-primary-600 transition-colors">{user.name}</p>
                        <p className="text-2xs text-slate-400 dark:text-slate-400 font-mono">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td data-label="Role">
                    <Badge variant={(ROLE_COLORS[user.role] as any) || 'neutral'}>{ROLE_LABELS[user.role]}</Badge>
                  </td>
                  <td data-label="Department"><span className="text-xs font-medium text-slate-600 dark:text-slate-300">{user.department || '—'}</span></td>
                  <td data-label="Status">
                    <Badge variant={statusToVariant(user.status)} dot>
                      {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                    </Badge>
                  </td>
                  <td data-label="Last Login"><span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{user.lastLogin ? timeAgo(user.lastLogin) : '—'}</span></td>
                  <td data-label="Joined"><span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{formatDate(user.createdAt)}</span></td>
                  <td data-label="Actions" className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <button className="btn-icon cursor-pointer" onClick={() => setViewProfileUser(user)} title="View User Profile"><Eye size={14} /></button>
                      {user.status === 'active' ? (
                        <button className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer" onClick={() => toggleUserStatus(user)} title="Suspend User Account">
                          <Ban size={14} />
                        </button>
                      ) : (
                        <button className="btn-icon text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 cursor-pointer" onClick={() => toggleUserStatus(user)} title="Activate User Account">
                          <CheckCircle2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- REFINED INVITE TEAM MEMBER MODAL --- */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        subtitle="Provision user permissions and dispatch email invitation"
        size="md"
      >
        <form onSubmit={handleSendInvite} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-500 flex-shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* 1. Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              className="input text-xs"
              value={inviteName}
              onChange={e => {
                setInviteName(e.target.value)
                setFormError(null)
              }}
            />
          </div>

          {/* 2. Email Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="sarah@supplybridge.io"
              className={`input text-xs ${
                inviteEmail && (!isValidEmail(inviteEmail) || isDuplicateEmail)
                  ? 'border-rose-400 dark:border-rose-600 focus:ring-rose-500/20'
                  : ''
              }`}
              value={inviteEmail}
              onChange={e => {
                setInviteEmail(e.target.value)
                setFormError(null)
              }}
            />
            {inviteEmail && !isValidEmail(inviteEmail) && (
              <p className="text-2xs text-rose-500 font-semibold mt-1">Please enter a valid email address format.</p>
            )}
            {inviteEmail && isDuplicateEmail && (
              <p className="text-2xs text-rose-500 font-semibold mt-1">An account or pending invitation already exists for this email.</p>
            )}
          </div>

          {/* 3. Platform Role Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Platform Role <span className="text-rose-500">*</span>
            </label>
            <select
              className="select text-xs font-medium"
              value={inviteRole}
              onChange={e => {
                setInviteRole(e.target.value as UserRole)
                setFormError(null)
              }}
            >
              <option value="platform_owner" disabled={existingOwnersCount >= 1}>
                Platform Owner {existingOwnersCount >= 1 ? '(Reserved System Role)' : ''}
              </option>
              <option value="administrator">Administrator</option>
              <option value="catalog_manager">Catalog Manager</option>
              <option value="read_only">Read Only</option>
            </select>

            {/* Dynamic Role Permission Description */}
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-2xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="font-bold text-slate-800 dark:text-slate-100 block mb-0.5">
                Role Permissions ({ROLE_LABELS[inviteRole]}):
              </span>
              {ROLE_DESCRIPTIONS[inviteRole]}
            </div>

            {/* Reserved System Role Protection Warning */}
            {isOwnerReserved && (
              <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-2xs font-semibold flex items-start gap-2">
                <AlertTriangle size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Reserved Single System Role</span>
                  Platform Owner is a restricted system role. Additional owner accounts cannot be created unless authorized by system configuration.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setInviteOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`btn-primary text-xs flex items-center gap-1.5 shadow-md shadow-indigo-500/20 ${
                !isFormValid ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <Mail size={14} /> Send Invitation Email
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
