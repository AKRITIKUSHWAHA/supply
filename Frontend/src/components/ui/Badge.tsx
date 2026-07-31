import React from 'react'
import { cn } from '../../utils'

type Variant = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple'

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  dot?: boolean
  className?: string
}

const variantClass: Record<Variant, string> = {
  primary: 'badge-primary',
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  neutral: 'badge-neutral',
  purple:  'badge-purple',
}

const dotClass: Record<Variant, string> = {
  primary: 'bg-primary-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  danger:  'bg-rose-500',
  info:    'bg-cyan-500',
  neutral: 'bg-slate-400',
  purple:  'bg-violet-500',
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'neutral', children, dot, className }) => (
  <span className={cn(variantClass[variant], className)}>
    {dot && <span className={cn('w-1.5 h-1.5 rounded-full', dotClass[variant])} />}
    {children}
  </span>
)
