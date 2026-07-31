import React from 'react'
import { User, Mail, Shield, Calendar, Building, LogOut, CheckCircle2, Clock } from 'lucide-react'
import { Modal } from './Modal'
import { Badge } from './Badge'
import { useAuth } from '../../context/AuthContext'
import { getInitials, formatDate, timeAgo } from '../../utils'
import type { UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner:      'Platform Owner',
  administrator:       'Administrator',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
}



export const UserProfileModal: React.FC = () => {
  const { viewProfileUser, setViewProfileUser, currentUser, logout } = useAuth()

  if (!viewProfileUser) return null

  const isSelf = viewProfileUser.id === currentUser.id

  return (
    <Modal
      open={Boolean(viewProfileUser)}
      onClose={() => setViewProfileUser(null)}
      title="User Profile"
      subtitle={isSelf ? 'Your active platform profile details' : 'User account and permission summary'}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          {isSelf ? (
            <button
              onClick={() => { setViewProfileUser(null); logout(); }}
              className="btn-danger btn-sm"
            >
              <LogOut size={14} /> Log Out
            </button>
          ) : (
            <div />
          )}
          <button onClick={() => setViewProfileUser(null)} className="btn-secondary btn-sm">
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center text-xl font-bold text-white shadow-md flex-shrink-0">
            {getInitials(viewProfileUser.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg text-white truncate">{viewProfileUser.name}</h3>
              <Badge variant="purple" dot>{viewProfileUser.status}</Badge>
            </div>
            <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
              <Mail size={12} className="text-slate-400" /> {viewProfileUser.email}
            </p>
            <p className="text-2xs text-primary-300 font-semibold mt-1 uppercase tracking-wider">
              {ROLE_LABELS[viewProfileUser.role] || viewProfileUser.role}
            </p>
          </div>
        </div>

        {/* Profile Info Details Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Building size={12} /> Department
            </p>
            <p className="text-sm font-semibold text-slate-800">{viewProfileUser.department || 'Operations'}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Shield size={12} /> Role Level
            </p>
            <p className="text-sm font-semibold text-slate-800 capitalize">{viewProfileUser.role.replace('_', ' ')}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Calendar size={12} /> Joined Date
            </p>
            <p className="text-sm font-semibold text-slate-800">{formatDate(viewProfileUser.createdAt)}</p>
          </div>

          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
            <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
              <Clock size={12} /> Last Active
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {viewProfileUser.lastLogin ? timeAgo(viewProfileUser.lastLogin) : 'Just now'}
            </p>
          </div>
        </div>

        {/* Security & Access Overview */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
          <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" /> Account Security Status
          </p>
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Multi-Factor Authentication: <strong className="text-slate-700">Enabled</strong></p>
            <p>• Role-Based Access: <strong className="text-slate-700">{ROLE_LABELS[viewProfileUser.role]}</strong></p>
            <p>• Access Status: <strong className="text-emerald-600 font-medium">Authorized & Active</strong></p>
          </div>
        </div>
      </div>
    </Modal>
  )
}
