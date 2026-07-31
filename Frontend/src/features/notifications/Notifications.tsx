import React, { useState } from 'react'
import { Bell, AlertCircle, AlertTriangle, CheckCircle2, Info, Eye, Check, Trash2, ArrowLeft, ShieldAlert } from 'lucide-react'
import { SectionHeader, FilterBar, Select } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { format } from 'date-fns'
import { Link } from 'react-router-dom'

interface NotificationItem {
  id: string
  title: string
  message: string
  type: 'error' | 'warning' | 'success' | 'info'
  timestamp: string
  read: boolean
  details?: string
}

const mockNotificationData: NotificationItem[] = [
  {
    id: 'n1',
    title: 'QuickShip Sync Failed',
    message: 'QuickShip LLC inventory sync failed — 256 items could not be matched.',
    type: 'error',
    timestamp: '2026-07-24T12:22:00Z',
    read: false,
    details: 'Error Code: SYNC_ERR_MATCH_404\nFailed during variant mapping lookup. 256 SKUs in the QuickShip import feed did not match any variants in the Master Catalog. Please review variant mapping settings.'
  },
  {
    id: 'n2',
    title: 'FTP Connection Error',
    message: 'AcmeDistributors FTP connection error. Failed to connect after 3 attempts.',
    type: 'warning',
    timestamp: '2026-07-24T12:00:00Z',
    read: false,
    details: 'Connection error on ftp.acmedistributors.com:21.\nTimeout occurred after 30000ms. Host might be temporarily offline or firewall settings are blocking the incoming integration traffic.'
  },
  {
    id: 'n3',
    title: 'Inventory Sync Completed',
    message: 'Inventory synchronization completed successfully for PrimeSupply Corp.',
    type: 'success',
    timestamp: '2026-07-24T11:51:00Z',
    read: true,
    details: 'Job ID: job_prime_8832\nTotal processed items: 12,482\nUpdated: 341\nFailed: 0\nCompleted in 42.6 seconds.'
  },
  {
    id: 'n4',
    title: 'Pending Validation Review',
    message: '5 products are pending validation review from EastWest Imports.',
    type: 'info',
    timestamp: '2026-07-24T11:23:00Z',
    read: true,
    details: 'New import payload contained 5 products with missing attributes or low image resolutions.\nProducts have been sent to the Validation Center for manual review.'
  },
  {
    id: 'n5',
    title: 'Price Sync Completed',
    message: 'Pricing update successfully synced to Shopify and WooCommerce stores.',
    type: 'success',
    timestamp: '2026-07-24T09:15:00Z',
    read: true,
    details: 'Job ID: job_price_3992\nSynced 82,770 product prices across 6 online store sales channels.\nSuccess Rate: 100%'
  },
  {
    id: 'n6',
    title: 'Database Maintenance Warning',
    message: 'System database load peaked at 92%. Performance degraded temporarily.',
    type: 'warning',
    timestamp: '2026-07-24T08:00:00Z',
    read: true,
    details: 'CPU load warning on postgres-primary.\nDatabase engine memory consumption: 81%\nDisk I/O writes: 1,202 IOPS\nAutovacuum daemon was automatically triggered to optimize table spacing.'
  }
]

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotificationData)
  const [search, setSearch] = useState('')
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null)
  const [filterType, setFilterType] = useState<string>('all')

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    )
  }

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (selectedNotif?.id === id) {
      setSelectedNotif(null)
    }
  }

  const filtered = notifications.filter(n => {
    const matchSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.message.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || n.type === filterType
    return matchSearch && matchType
  })

  const getStatusIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="text-rose-500" size={18} />
      case 'warning':
        return <AlertTriangle className="text-amber-500" size={18} />
      case 'success':
        return <CheckCircle2 className="text-emerald-500" size={18} />
      case 'info':
        return <Info className="text-blue-500" size={18} />
      default:
        return <Bell className="text-slate-500" size={18} />
    }
  }

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'error': return 'danger'
      case 'warning': return 'warning'
      case 'success': return 'success'
      case 'info': return 'info'
      default: return 'neutral'
    }
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors">
          <ArrowLeft size={13} /> Back to Dashboard
        </Link>
      </div>

      <SectionHeader
        title="Notifications & Alerts"
        subtitle="Manage and view system status updates, synchronization events, and error diagnostics."
        actions={
          <button
            onClick={handleMarkAllRead}
            className="btn-secondary btn-sm flex items-center gap-1.5 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-200 shadow-sm"
            disabled={notifications.every(n => n.read)}
          >
            <Check size={14} />
            Mark all read
          </button>
        }
      />

      {/* KPI Cards for Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Alerts', value: notifications.length, icon: <Bell size={16} className="text-primary-600" />, bg: 'bg-primary-50' },
          { label: 'Critical Errors', value: notifications.filter(n => n.type === 'error').length, icon: <ShieldAlert size={16} className="text-rose-600" />, bg: 'bg-rose-50' },
          { label: 'Warnings', value: notifications.filter(n => n.type === 'warning').length, icon: <AlertTriangle size={16} className="text-amber-600" />, bg: 'bg-amber-50' },
          { label: 'Unread Messages', value: notifications.filter(n => !n.read).length, icon: <Info size={16} className="text-blue-600" />, bg: 'bg-blue-50' },
        ].map((card, idx) => (
          <div key={idx} className="card p-5 flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold text-slate-900">{card.value}</p>
              <p className="text-xs font-semibold text-slate-800 mt-1">{card.label}</p>
            </div>
            <div className={`w-9 h-9 rounded-xl ${card.bg} flex items-center justify-center`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <FilterBar search={search} onSearch={setSearch} placeholder="Search notifications by title or message...">
        <Select
          className="w-auto min-w-[130px]"
          value={filterType}
          onChange={setFilterType}
          options={[
            { label: 'All Types', value: 'all' },
            { label: 'Success', value: 'success' },
            { label: 'Info', value: 'info' },
            { label: 'Warning', value: 'warning' },
            { label: 'Errors', value: 'error' },
          ]}
        />
      </FilterBar>

      <div className="card overflow-hidden">
        <div className="divide-y divide-slate-100">
          {filtered.length > 0 ? (
            filtered.map(item => (
              <div
                key={item.id}
                className={`p-3.5 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 ${
                  !item.read ? 'bg-primary-50/20 dark:bg-primary-950/20 border-l-2 border-primary-500' : 'border-l-2 border-transparent'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 w-full flex-1">
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className={`text-sm leading-snug ${!item.read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-700 dark:text-slate-300 font-semibold'}`}>
                        {item.title}
                      </p>
                      <Badge variant={getBadgeVariant(item.type)}>{item.type}</Badge>
                      {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1.5 leading-relaxed">{item.message}</p>
                    <p className="text-2xs font-mono text-slate-400 dark:text-slate-500">
                      {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => {
                      handleMarkAsRead(item.id)
                      setSelectedNotif(item)
                    }}
                    className="btn-icon text-slate-400 hover:bg-primary-600 hover:text-white transition-all duration-200"
                    title="View Details"
                  >
                    <Eye size={14} />
                  </button>
                  {!item.read && (
                    <button
                      onClick={() => handleMarkAsRead(item.id)}
                      className="btn-icon text-slate-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                      title="Mark as Read"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="btn-icon text-slate-400 hover:bg-rose-600 hover:text-white transition-all duration-200"
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-16 text-center text-slate-400">
              <Bell size={36} className="mx-auto mb-3 text-slate-300 animate-pulse-slow" />
              <p className="font-medium text-slate-600">No notifications found</p>
            </div>
          )}
        </div>
      </div>

      {/* Notification Detail Modal */}
      <Modal
        open={selectedNotif !== null}
        onClose={() => setSelectedNotif(null)}
        title="Notification Event Details"
        subtitle={`ID: ${selectedNotif?.id || ''}`}
        size="md"
        footer={
          <div className="flex gap-2 justify-end w-full">
            {selectedNotif && !selectedNotif.read && (
              <button
                onClick={() => {
                  handleMarkAsRead(selectedNotif.id)
                  setSelectedNotif(prev => prev ? { ...prev, read: true } : null)
                }}
                className="btn-secondary btn-sm flex items-center gap-1.5"
              >
                <Check size={14} /> Mark as Read
              </button>
            )}
            <button onClick={() => setSelectedNotif(null)} className="btn-primary btn-sm">
              Close Details
            </button>
          </div>
        }
      >
        {selectedNotif && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Timestamp</label>
                <div className="font-mono text-slate-700 mt-1">
                  {format(new Date(selectedNotif.timestamp), 'yyyy-MM-dd HH:mm:ss.SSS XXX')}
                </div>
              </div>
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Type</label>
                <div className="mt-1">
                  <Badge variant={getBadgeVariant(selectedNotif.type)}>{selectedNotif.type}</Badge>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Event Title</label>
              <div className="text-slate-800 font-semibold text-sm mt-1">{selectedNotif.title}</div>
            </div>

            <div>
              <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Notification Message</label>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-slate-700 leading-relaxed mt-1">
                {selectedNotif.message}
              </div>
            </div>

            {selectedNotif.details && (
              <div>
                <label className="text-xxs font-semibold text-slate-400 uppercase tracking-wider block">Detailed Diagnostics</label>
                <pre className="bg-slate-900 text-slate-200 border border-slate-800 rounded-xl p-3.5 font-mono overflow-x-auto mt-1 whitespace-pre-wrap max-h-48 scrollbar-thin">
                  {selectedNotif.details}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
