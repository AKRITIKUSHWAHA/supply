import React from 'react'
export * from './Select'
export * from './Badge'
export * from './Modal'
export * from './UserProfileModal'
import { cn } from '../../utils'

// ─── Skeleton ─────────────────────────────────────────────
export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('skeleton', className)} />
)

// ─── Empty State ──────────────────────────────────────────
interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-20 text-center">
    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
      {icon}
    </div>
    <h3 className="text-base font-semibold text-slate-700 mb-1">{title}</h3>
    <p className="text-sm text-slate-500 max-w-sm mb-5">{description}</p>
    {action}
  </div>
)

// ─── Loading Spinner ──────────────────────────────────────
export const Spinner: React.FC<{ size?: number; className?: string }> = ({ size = 20, className }) => (
  <svg
    className={cn('animate-spin text-primary-600', className)}
    width={size} height={size}
    viewBox="0 0 24 24" fill="none"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
)

// ─── Progress Bar ─────────────────────────────────────────
interface ProgressBarProps {
  value: number
  max?: number
  color?: 'primary' | 'emerald' | 'amber' | 'rose' | 'cyan'
  className?: string
  showLabel?: boolean
}

const barColor = {
  primary: 'bg-primary-600',
  emerald: 'bg-emerald-500',
  amber:   'bg-amber-500',
  rose:    'bg-rose-500',
  cyan:    'bg-cyan-500',
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max = 100, color = 'primary', className, showLabel }) => {
  const pct = Math.round((value / max) * 100)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && <span className="text-xs font-medium text-slate-600 w-9 text-right">{pct}%</span>}
    </div>
  )
}

// ─── Stats Card ───────────────────────────────────────────
interface StatsCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  iconBg?: string
  footer?: React.ReactNode
  onClick?: () => void
}

export const StatsCard: React.FC<StatsCardProps> = ({ label, value, change, changeType = 'neutral', icon, iconBg = 'bg-primary-50', footer, onClick }) => (
  <div
    onClick={onClick}
    className={cn('kpi-card group', onClick && 'cursor-pointer hover:shadow-card-md hover:border-primary-300 transition-all')}
  >
    <div className="flex items-start justify-between">
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', iconBg)}>
        {icon}
      </div>
      {change && (
        <span className={cn('text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
          changeType === 'positive' ? 'text-emerald-700 bg-emerald-50' :
          changeType === 'negative' ? 'text-rose-700 bg-rose-50' : 'text-slate-500 bg-slate-100'
        )}>
          {change}
        </span>
      )}
    </div>
    <div>
      <p className="kpi-label">{label}</p>
      <p className="kpi-value mt-0.5">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
    {footer && <div className="pt-2 border-t border-slate-100">{footer}</div>}
  </div>
)

// ─── Section Header ───────────────────────────────────────
interface SectionHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actions }) => (
  <div className="page-header">
    <div>
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </div>
)

// ─── Divider ──────────────────────────────────────────────
export const Divider: React.FC<{ className?: string }> = ({ className }) => (
  <hr className={cn('border-slate-200', className)} />
)

// ─── Health Indicator ─────────────────────────────────────
interface HealthIndicatorProps {
  status: 'operational' | 'degraded' | 'down' | 'healthy' | 'critical'
  label: string
}

export const HealthIndicator: React.FC<HealthIndicatorProps> = ({ status, label }) => {
  const cfg = {
    operational: { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Operational' },
    healthy:      { dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Healthy' },
    degraded:     { dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',   label: 'Degraded' },
    down:         { dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50',    label: 'Down' },
    critical:     { dot: 'bg-rose-500',    text: 'text-rose-700',    bg: 'bg-rose-50',    label: 'Critical' },
  }[status]

  return (
    <div className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold', cfg.bg, cfg.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full animate-pulse-slow', cfg.dot)} />
      {label}
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────
interface TabsProps {
  tabs: { id: string; label: string; count?: number }[]
  active: string
  onChange: (id: string) => void
}

export const Tabs: React.FC<TabsProps> = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto scrollbar-hide">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          'px-4 py-2.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all duration-200',
          active === tab.id
            ? 'border-primary-600 text-primary-700 dark:text-primary-400 font-bold'
            : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
        )}
      >
        {tab.label}
        {tab.count !== undefined && (
          <span className={cn('ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold', active === tab.id ? 'bg-primary-100 dark:bg-primary-950/80 text-primary-700 dark:text-primary-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400')}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
)

// ─── Filter Bar ───────────────────────────────────────────
interface FilterBarProps {
  search: string
  onSearch: (v: string) => void
  placeholder?: string
  children?: React.ReactNode
  actions?: React.ReactNode
}

export const FilterBar: React.FC<FilterBarProps> = ({ search, onSearch, placeholder = 'Search...', children, actions }) => (
  <div className="flex flex-col sm:flex-row gap-3 mb-5">
    <div className="relative flex-1">
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        type="text"
        className="input pl-9"
        placeholder={placeholder}
        value={search}
        onChange={e => onSearch(e.target.value)}
      />
    </div>
    {children && <div className="flex gap-4 flex-wrap">{children}</div>}
    {actions && <div className="flex gap-3 flex-wrap">{actions}</div>}
  </div>
)

// ─── Confirmation Dialog ──────────────────────────────────
interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirm', danger }) => {
  return open ? (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel max-w-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <div className="modal-body">
          <p className="text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary btn-sm">Cancel</button>
          <button onClick={onConfirm} className={danger ? 'btn-danger btn-sm' : 'btn-primary btn-sm'}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  ) : null
}
