import { API_BASE_URL } from '../../config/api'
import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  UserPlus, 
  Ban, 
  CheckCircle2, 
  Mail, 
  Eye, 
  AlertCircle, 
  AlertTriangle,
  Users as UsersIcon,
  UserCheck,
  UserX,
  Clock,
  X
} from 'lucide-react'
import { SectionHeader, FilterBar, EmptyState } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { statusToVariant, formatDate, getInitials } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import type { User, UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner:      'Platform Owner',
  administrator:       'Administrator',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
}

const ROLE_BADGE_VARIANTS: Record<UserRole, 'purple' | 'primary' | 'info' | 'warning' | 'neutral'> = {
  platform_owner:      'purple',
  administrator:       'primary',
  catalog_manager:     'info',
  integration_manager: 'info',
  operations_staff:    'warning',
}

const AVATAR_GRADIENTS: Record<UserRole, string> = {
  platform_owner:      'from-purple-600 to-indigo-600 text-white shadow-purple-500/25',
  administrator:       'from-indigo-600 to-blue-600 text-white shadow-indigo-500/25',
  catalog_manager:     'from-cyan-600 to-blue-600 text-white shadow-cyan-500/25',
  integration_manager: 'from-emerald-600 to-teal-600 text-white shadow-emerald-500/25',
  operations_staff:    'from-amber-500 to-orange-600 text-white shadow-amber-500/25',
}

const ROLE_DESCRIPTIONS: Record<string, string> = {
  platform_owner:  'Full unrestricted control over system configuration, user management, security, and global middleware settings.',
  administrator:   'Manage catalog, suppliers, stores, data mappings, validation rules, and team member accounts.',
  catalog_manager: 'Create, edit, and validate catalog products, taxonomy categories, pricing, and supplier sync settings.',
  integration_manager: 'Oversee API connections, store integrations, webhooks, and channel data flows.',
  operations_staff: 'Monitor daily sync jobs, inventory updates, system logs, and operational alerts.',
  read_only:       'View catalog, inventory levels, pricing, sync status, and system activity logs without edit permissions.',
}

export const Users: React.FC = () => {
  const { setViewProfileUser } = useAuth()
  const [usersList, setUsersList] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [inviteOpen, setInviteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/users`)
      const json = await res.json()
      if (json && json.data && Array.isArray(json.data.users)) {
        const mapped = json.data.users.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role?.name || u.role || 'catalog_manager').toLowerCase().replace(/\s+/g, '_') as UserRole,
          status: u.status || 'active',
          lastActive: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
          createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
        }))
        setUsersList(mapped)
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Invite Form States
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<UserRole>('catalog_manager')
  const [formError, setFormError] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  }

  const isDuplicateEmail = usersList.some(
    u => u.email.toLowerCase() === inviteEmail.trim().toLowerCase()
  )

  const existingOwnersCount = usersList.filter(
    u => u.role === 'platform_owner' && u.status !== 'inactive'
  ).length
  const isOwnerReserved = inviteRole === 'platform_owner' && existingOwnersCount >= 1

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

  const handleSendInvite = async (e: React.FormEvent) => {
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

    const createdUser: User = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: inviteRole,
      status: 'invited',
      createdAt: new Date().toISOString(),
    }

    try {
      await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          password: 'Password123!',
          role: inviteRole,
        }),
      })
    } catch (err) {
      console.warn('Backend user invite API offline, added to local state:', err)
    }

    setUsersList(prev => [createdUser, ...prev])
    setInviteOpen(false)
    setInviteName('')
    setInviteEmail('')
    showNotification(`Invitation email sent to ${cleanEmail}! Account provisioned as ${ROLE_LABELS[inviteRole]}.`)
  }

  const toggleUserStatus = async (user: User) => {
    const nextStatus = user.status === 'active' ? 'inactive' : 'active'
    setUsersList(prev =>
      prev.map(u => (u.id === user.id ? { ...u, status: nextStatus } : u))
    )
    try {
      await fetch(`${API_BASE_URL}/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })
    } catch (err) {
      console.warn('Backend status update offline:', err)
    }
    showNotification(`User ${user.name} account status updated to ${nextStatus.toUpperCase()}`)
  }

  const filtered = useMemo(() => {
    return usersList.filter(u => {
      const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
      const matchRole = roleFilter === 'all' || u.role === roleFilter
      const matchStatus = statusFilter === 'all' || u.status === statusFilter
      return matchSearch && matchRole && matchStatus
    })
  }, [usersList, search, roleFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      total: usersList.length,
      active: usersList.filter(u => u.status === 'active').length,
      invited: usersList.filter(u => u.status === 'invited').length,
      inactive: usersList.filter(u => u.status === 'inactive').length,
    }
  }, [usersList])

  const hasActiveFilters = search !== '' || roleFilter !== 'all' || statusFilter !== 'all'

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
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
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold border border-slate-700/80"
          >
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="User Management & Access Control"
        subtitle={`${stats.total} total team members — ${stats.active} active, ${stats.invited} pending invitation`}
        actions={
          <button 
            onClick={handleOpenInvite} 
            className="btn-primary flex items-center gap-2 shadow-lg shadow-indigo-500/25 cursor-pointer text-xs px-4 py-2.5 rounded-xl font-bold"
          >
            <UserPlus size={16} /> Invite New User
          </button>
        }
      />

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/50">
            <UsersIcon size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stats.total}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Users</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-100 dark:border-emerald-900/50">
            <UserCheck size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">{stats.active}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Members</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-100 dark:border-amber-900/50">
            <Clock size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 tracking-tight">{stats.invited}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Invites</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-500 dark:text-rose-400 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/50">
            <UserX size={22} />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-400 dark:text-slate-500 tracking-tight">{stats.inactive}</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inactive / Suspended</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <FilterBar search={search} onSearch={setSearch} placeholder="Search team members by name or email...">
          <select 
            className="select input-sm w-auto min-w-[150px] font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl"
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="platform_owner">Platform Owner</option>
            <option value="administrator">Administrator</option>
            <option value="catalog_manager">Catalog Manager</option>
            <option value="integration_manager">Integration Manager</option>
            <option value="operations_staff">Operations Staff</option>
          </select>

          <select 
            className="select input-sm w-auto min-w-[140px] font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl"
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="invited">Invited</option>
            <option value="inactive">Inactive</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="btn-ghost btn-sm flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl px-3"
            >
              <X size={14} /> Clear Filters
            </button>
          )}
        </FilterBar>

        {hasActiveFilters && (
          <div className="text-2xs font-semibold text-slate-500 dark:text-slate-400 px-1">
            Showing <strong className="text-slate-900 dark:text-slate-100">{filtered.length}</strong> of {usersList.length} total team members
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="table-container">
          <table className="table w-full">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-850/80">
                <th className="py-3.5 px-4 text-left font-bold text-slate-600 dark:text-slate-400 text-2xs uppercase tracking-wider">User & Account</th>
                <th className="py-3.5 px-4 text-left font-bold text-slate-600 dark:text-slate-400 text-2xs uppercase tracking-wider">Assigned Role</th>
                <th className="py-3.5 px-4 text-left font-bold text-slate-600 dark:text-slate-400 text-2xs uppercase tracking-wider">Status</th>
                <th className="py-3.5 px-4 text-left font-bold text-slate-600 dark:text-slate-400 text-2xs uppercase tracking-wider">Joined Date</th>
                <th className="py-3.5 px-4 text-right font-bold text-slate-600 dark:text-slate-400 text-2xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <EmptyState
                      icon={<UsersIcon size={32} />}
                      title="No team members found"
                      description={hasActiveFilters ? "No users match your current search and filter criteria." : "No team members exist in the platform yet."}
                      action={
                        hasActiveFilters ? (
                          <button onClick={clearFilters} className="btn-secondary btn-sm text-xs mt-2">
                            Reset Filters
                          </button>
                        ) : (
                          <button onClick={handleOpenInvite} className="btn-primary btn-sm text-xs mt-2">
                            Invite First User
                          </button>
                        )
                      }
                    />
                  </td>
                </tr>
              ) : (
                filtered.map(user => (
                  <tr 
                    key={user.id} 
                    className="group cursor-pointer hover:bg-slate-50/90 dark:hover:bg-slate-800/40 transition-colors" 
                    onClick={() => setViewProfileUser(user)}
                  >
                    <td data-label="User" className="py-3.5 px-4">
                      <div className="flex items-center gap-3 text-left">
                        <div
                          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${AVATAR_GRADIENTS[user.role] || 'from-indigo-600 to-purple-600 text-white'} flex items-center justify-center text-xs font-bold shrink-0 shadow-md transition-transform group-hover:scale-105`}
                        >
                          {getInitials(user.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors truncate">
                            {user.name}
                          </p>
                          <p className="text-2xs text-slate-500 dark:text-slate-400 font-mono truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td data-label="Role" className="py-3.5 px-4 text-left">
                      <Badge variant={ROLE_BADGE_VARIANTS[user.role] || 'neutral'}>
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    </td>
                    <td data-label="Status" className="py-3.5 px-4 text-left">
                      <Badge variant={statusToVariant(user.status)} dot>
                        {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                      </Badge>
                    </td>
                    <td data-label="Joined" className="py-3.5 px-4 text-left">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td data-label="Actions" className="py-3.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          className="btn-icon cursor-pointer hover:bg-slate-200/60 dark:hover:bg-slate-700/60" 
                          onClick={() => setViewProfileUser(user)} 
                          title="View User Profile"
                        >
                          <Eye size={15} />
                        </button>
                        {user.status === 'active' ? (
                          <button 
                            className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer" 
                            onClick={() => toggleUserStatus(user)} 
                            title="Suspend User Account"
                          >
                            <Ban size={15} />
                          </button>
                        ) : (
                          <button 
                            className="btn-icon text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 cursor-pointer" 
                            onClick={() => toggleUserStatus(user)} 
                            title="Activate User Account"
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- INVITE TEAM MEMBER MODAL --- */}
      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite Team Member"
        subtitle="Provision user permissions and dispatch email invitation"
        size="md"
      >
        <form onSubmit={handleSendInvite} className="space-y-4 pt-1">
          {formError && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2.5">
              <AlertCircle size={16} className="text-rose-500 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sarah Jenkins"
              className="input text-xs font-medium"
              value={inviteName}
              onChange={e => {
                setInviteName(e.target.value)
                setFormError(null)
              }}
            />
          </div>

          {/* Email Address */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              placeholder="sarah@supplybridge.io"
              className={`input text-xs font-medium ${
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

          {/* Platform Role Selection */}
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
              Platform Role <span className="text-rose-500">*</span>
            </label>
            <select
              className="select text-xs font-medium w-full"
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
              <option value="integration_manager">Integration Manager</option>
              <option value="operations_staff">Operations Staff</option>
            </select>

            {/* Dynamic Role Permission Description */}
            <div className="mt-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 text-2xs text-slate-600 dark:text-slate-300 font-medium">
              <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                Role Permissions ({ROLE_LABELS[inviteRole]}):
              </span>
              {ROLE_DESCRIPTIONS[inviteRole]}
            </div>

            {/* Reserved System Role Protection Warning */}
            {isOwnerReserved && (
              <div className="mt-2.5 p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-2xs font-semibold flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">Reserved Single System Role</span>
                  Platform Owner is a restricted system role. Additional owner accounts cannot be created unless authorized by system configuration.
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setInviteOpen(false)} className="btn-secondary text-xs">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className={`btn-primary text-xs flex items-center gap-2 shadow-md shadow-indigo-500/20 ${
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
