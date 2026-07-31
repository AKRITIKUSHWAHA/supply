import type { Status, LogLevel } from '../types'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export function statusToVariant(status: string): 'success' | 'danger' | 'warning' | 'neutral' | 'info' | 'primary' | 'purple' {
  switch (status) {
    case 'connected':    case 'active':    case 'published':  case 'synced':
    case 'completed':    case 'passed':    case 'operational': case 'in_stock': return 'success'
    case 'failed':       case 'error':     case 'disconnected': case 'down':
    case 'out_of_stock': case 'cancelled': return 'danger'
    case 'warning':      case 'pending':   case 'degraded':
    case 'low_stock':    case 'review':    case 'validation_required': return 'warning'
    case 'syncing':      case 'processing': case 'running': return 'info'
    case 'queued':       return 'neutral'
    case 'unpublished':  case 'draft':     return 'neutral'
    default: return 'neutral'
  }
}

export function logLevelVariant(level: LogLevel) {
  switch (level) {
    case 'error':   return 'danger'
    case 'warning': return 'warning'
    case 'success': return 'success'
    case 'info':    return 'info'
    case 'debug':   return 'neutral'
  }
}

export function connectionTypeLabel(type: string): string {
  const labels: Record<string, string> = { api: 'REST API', ftp: 'FTP', sftp: 'SFTP', csv: 'CSV Feed', excel: 'Excel', xml: 'XML Feed' }
  return labels[type] ?? type.toUpperCase()
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}
