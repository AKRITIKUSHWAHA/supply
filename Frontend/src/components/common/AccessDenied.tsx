import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface AccessDeniedProps {
  moduleName?: string
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ moduleName }) => {
  const { role } = useAuth()

  const formattedRole = role
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full card p-8 text-center border border-rose-100 shadow-xl bg-white relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-rose-50 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-50 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-5 shadow-sm">
          <ShieldAlert size={32} />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100/80 text-rose-800 text-xs font-semibold mb-3">
          <Lock size={12} /> 403 HTTP Access Denied
        </div>

        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
        
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          You do not have administrative permissions to view {moduleName ? <span className="font-semibold text-slate-800">{moduleName}</span> : 'this section'}.
          Access is restricted to Super Admin accounts.
        </p>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 mb-6 text-left space-y-1.5 font-mono">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <span className="text-slate-400">Logged-in Role:</span>
            <span className="font-semibold text-slate-800 sm:text-right">{formattedRole}</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
            <span className="text-slate-400">Required Role:</span>
            <span className="font-semibold text-rose-600 sm:text-right">Super Admin</span>
          </div>
          {moduleName && (
            <div className="flex flex-col sm:flex-row sm:justify-between gap-0.5 sm:gap-2">
              <span className="text-slate-400">Restricted Module:</span>
              <span className="font-semibold text-slate-800 sm:text-right">{moduleName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="btn-primary flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
