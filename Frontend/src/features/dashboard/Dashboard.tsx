import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Truck, Package, AlertTriangle, CheckCircle2, RefreshCw,
  DollarSign, Image, Briefcase, XCircle, PlayCircle,
  Globe, Wifi, Server, Database, Clock, TrendingUp,
  ArrowUpRight, ArrowDownRight, Activity, ShieldCheck, UserCheck, Tag,
  Zap, RotateCcw, Search, Filter, Sliders, ArrowUp, ArrowDown, Eye, EyeOff, Check,
  Plus, Trash2, GripVertical
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { StatsCard, HealthIndicator, ConfirmDialog } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { Badge } from '../../components/ui/Badge'
import { mockDashboardMetrics, mockSyncChartData, mockProductsBySupplier, mockActivities } from '../../data/mockData'
import { formatNumber } from '../../utils'
import { useAuth } from '../../context/AuthContext'
import { useSuppliers } from '../../context/SupplierContext'
import type { UserRole, DashboardWidgetSetting, WidgetSize } from '../../types'

const DEFAULT_WIDGET_SETTINGS: DashboardWidgetSetting[] = [
  { id: 'connected', label: 'Connected Suppliers', visible: true, order: 0, size: 'sm' },
  { id: 'disconnected', label: 'Disconnected Suppliers', visible: true, order: 1, size: 'sm' },
  { id: 'total-products', label: 'Total Products', visible: true, order: 2, size: 'sm' },
  { id: 'imported-today', label: 'Products Imported Today', visible: true, order: 3, size: 'sm' },
  { id: 'ready-publish', label: 'Products Ready to Publish', visible: true, order: 4, size: 'sm' },
  { id: 'pending-validation', label: 'Pending Validation', visible: true, order: 5, size: 'sm' },
  { id: 'published-products', label: 'Published Products', visible: true, order: 6, size: 'sm' },
  { id: 'awaiting-review', label: 'Products Awaiting Review', visible: true, order: 7, size: 'sm' },
  { id: 'duplicate-products', label: 'Duplicate Products', visible: true, order: 8, size: 'sm' },
  { id: 'missing-images', label: 'Missing Images', visible: true, order: 9, size: 'sm' },
  { id: 'missing-categories', label: 'Missing Categories', visible: true, order: 10, size: 'sm' },
  { id: 'missing-pricing', label: 'Missing Pricing', visible: true, order: 11, size: 'sm' },
  { id: 'failed-products', label: 'Failed Products', visible: true, order: 12, size: 'sm' },
]

const getStorageKey = (userId: string) => `supplybridge_widgets_${userId}`
const getCustomCardsKey = (userId: string) => `supplybridge_custom_cards_${userId}`

const loadUserWidgetSettings = (userId: string): DashboardWidgetSetting[] => {
  const key = getStorageKey(userId)
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      const parsed: DashboardWidgetSetting[] = JSON.parse(saved)
      const existingIds = new Set(parsed.map(w => w.id))
      const missing = DEFAULT_WIDGET_SETTINGS.filter(w => !existingIds.has(w.id))
      return [...parsed, ...missing].sort((a, b) => a.order - b.order)
    } catch (e) {
      console.error('Failed parsing widget settings', e)
    }
  }
  return DEFAULT_WIDGET_SETTINGS
}

const getSizeColClass = (size: WidgetSize) => {
  switch (size) {
    case 'sm':
      return 'col-span-1'
    case 'md':
      return 'col-span-1 sm:col-span-2'
    case 'lg':
      return 'col-span-1 sm:col-span-2 lg:col-span-3'
    case 'full':
      return 'col-span-1 sm:col-span-2 lg:col-span-4 xl:col-span-6'
    default:
      return 'col-span-1'
  }
}

const ROLE_DESCRIPTIONS: Record<UserRole, { title: string; subtitle: string; focus: string }> = {
  platform_owner: {
    title: 'Platform Owner Control Center',
    subtitle: 'Complete platform control, system architecture health & full operational status',
    focus: 'Platform Owner',
  },
  administrator: {
    title: 'Business Operations Overview',
    subtitle: 'Daily platform administration, supplier inventory, pricing & catalog performance',
    focus: 'Administrator',
  },
  catalog_manager: {
    title: 'Catalog & PIM Dashboard',
    subtitle: 'Product information management, attribute mapping, and validation queue status',
    focus: 'Catalog Manager',
  },
  integration_manager: {
    title: 'Integration & Data Pipeline Hub',
    subtitle: 'Supplier feeds, API & SFTP protocols, mapping rules and sync queue performance',
    focus: 'Integration Manager',
  },
  operations_staff: {
    title: 'Storefront Operations Desk',
    subtitle: 'Store sync execution, validation error review, and order fulfillment status',
    focus: 'Operations Staff',
  },
}



const stagger = {
  parent: { transition: { staggerChildren: 0.05 } },
  child: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } },
}

export const Dashboard: React.FC = () => {
  const { role, currentUser } = useAuth()
  const { suppliersList } = useSuppliers()
  const roleInfo = ROLE_DESCRIPTIONS[role] || ROLE_DESCRIPTIONS.platform_owner

  const [activeCard, setActiveCard] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState('Updated just now')

  const [m, setM] = useState({
    connectedSuppliers: 0, disconnectedSuppliers: 0, totalSuppliers: 0,
    totalProducts: 0, pendingProducts: 0, failedProducts: 0, publishedProducts: 0,
    productsImportedToday: 0, productsReadyToPublish: 0, duplicateProducts: 0,
    missingImages: 0, missingCategories: 0, missingPricing: 0, productsAwaitingReview: 0,
    inventorySyncStatus: 'healthy', pricingSyncStatus: 'healthy', imageSyncStatus: 'healthy',
    runningJobs: 0, completedJobs: 0, failedJobs: 0, queuedJobs: 0,
    apiStatus: 'operational', ftpStatus: 'operational', systemHealth: 100,
    queueSize: 0, storesSynced: 0, totalStores: 0
  })

  const [activities, setActivities] = useState<any[]>(mockActivities)

  const loadStats = () => {
    setIsRefreshing(true)
    fetch('http://localhost:5000/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setM(prev => ({
          ...prev,
          totalProducts: data.totalProducts ?? prev.totalProducts,
          totalSuppliers: data.totalSuppliers ?? prev.totalSuppliers,
          connectedSuppliers: data.connectedSuppliers ?? prev.connectedSuppliers,
          disconnectedSuppliers: data.disconnectedSuppliers ?? prev.disconnectedSuppliers,
          publishedProducts: data.publishedProducts ?? prev.publishedProducts,
          missingImages: data.missingImages ?? prev.missingImages,
          missingCategories: data.missingCategories ?? prev.missingCategories,
          missingPricing: data.missingPricing ?? prev.missingPricing,
          duplicateProducts: data.duplicateProducts ?? prev.duplicateProducts,
          productsImportedToday: data.productsImportedToday ?? prev.productsImportedToday,
          productsReadyToPublish: data.productsReadyToPublish ?? prev.productsReadyToPublish,
          runningJobs: data.runningJobs ?? prev.runningJobs,
          completedJobs: data.completedJobs ?? prev.completedJobs,
          failedJobs: data.failedJobs ?? prev.failedJobs,
          totalStores: data.totalStores ?? prev.totalStores,
        }))
        if (data.activities && data.activities.length > 0) {
          setActivities(data.activities.map((a: any) => ({
            id: a.id,
            message: `${a.user} ${a.action} ${a.target}`,
            time: a.time,
            color: a.type === 'success' ? 'emerald' : a.type === 'error' ? 'rose' : 'blue'
          })))
        }
        setLastUpdated('Updated just now (Live)')
      })
      .catch(err => console.error('Failed to fetch dashboard metrics:', err))
      .finally(() => setIsRefreshing(false))
  }

  useEffect(() => {
    loadStats()
  }, [])

  // Per-User Custom Cards & Widget Layout State
  const [customCards, setCustomCards] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem(getCustomCardsKey(currentUser.id))
    return saved ? JSON.parse(saved) : {}
  })

  const [widgetSettings, setWidgetSettings] = useState<DashboardWidgetSetting[]>(() =>
    loadUserWidgetSettings(currentUser.id)
  )

  // Re-sync when switching active demo user
  useEffect(() => {
    setWidgetSettings(loadUserWidgetSettings(currentUser.id))
    const saved = localStorage.getItem(getCustomCardsKey(currentUser.id))
    setCustomCards(saved ? JSON.parse(saved) : {})
  }, [currentUser.id])

  // Customization Modal State
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [editingSettings, setEditingSettings] = useState<DashboardWidgetSetting[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Add Custom Widget Modal State
  const [addCustomModalOpen, setAddCustomModalOpen] = useState(false)
  const [newWidgetLabel, setNewWidgetLabel] = useState('')
  const [newWidgetValue, setNewWidgetValue] = useState('')
  const [newWidgetChange, setNewWidgetChange] = useState('+5% today')
  const [newWidgetSize, setNewWidgetSize] = useState<WidgetSize>('sm')
  const [newWidgetColor, setNewWidgetColor] = useState('emerald')

  // Action Modal states
  const [manualSyncOpen, setManualSyncOpen] = useState(false)
  const [retryModalOpen, setRetryModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState('TechParts International')
  const [selectedSyncType, setSelectedSyncType] = useState('Inventory Sync')
  const [syncLaunching, setSyncLaunching] = useState(false)
  const [syncSuccessMsg, setSyncSuccessMsg] = useState('')

  // Activity Feed Filter State
  const [activityFilter, setActivityFilter] = useState('All')
  const [activitySearch, setActivitySearch] = useState('')

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastUpdated('Updated just now')
    }, 600)
  }

  const handleLaunchSync = () => {
    setSyncLaunching(true)
    setTimeout(() => {
      setSyncLaunching(false)
      setManualSyncOpen(false)
      setSyncSuccessMsg(`Manual ${selectedSyncType} triggered successfully for ${selectedSupplier}!`)
      setTimeout(() => setSyncSuccessMsg(''), 4000)
    }, 600)
  }

  const handleConfirmRetryAll = () => {
    setRetryModalOpen(false)
    setSyncSuccessMsg('Re-queued all 17 failed sync jobs for immediate retry!')
    setTimeout(() => setSyncSuccessMsg(''), 4000)
  }

  // --- Widget Customization Handlers ---
  const handleOpenCustomize = () => {
    setEditingSettings([...widgetSettings].sort((a, b) => a.order - b.order))
    setCustomizeOpen(true)
  }

  const handleToggleVisibility = (id: string) => {
    setEditingSettings(prev =>
      prev.map(w => (w.id === id ? { ...w, visible: !w.visible } : w))
    )
  }

  const handleSizeChange = (id: string, size: WidgetSize) => {
    setEditingSettings(prev =>
      prev.map(w => (w.id === id ? { ...w, size } : w))
    )
  }

  const handleMoveWidget = (index: number, direction: 'up' | 'down') => {
    const next = [...editingSettings]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= next.length) return
    const temp = next[index]
    next[index] = next[targetIndex]
    next[targetIndex] = temp
    setEditingSettings(next.map((item, idx) => ({ ...item, order: idx })))
  }

  // HTML5 Drag & Drop reordering
  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return
    const next = [...editingSettings]
    const draggedItem = next[draggedIndex]
    next.splice(draggedIndex, 1)
    next.splice(targetIndex, 0, draggedItem)
    setEditingSettings(next.map((item, idx) => ({ ...item, order: idx })))
    setDraggedIndex(null)
  }

  const handleDeleteWidget = (id: string) => {
    setEditingSettings(prev => prev.filter(w => w.id !== id))
  }

  const handleCreateCustomWidget = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWidgetLabel.trim()) return

    const customId = `custom_w_${Date.now()}`
    const colorBgMap: Record<string, string> = {
      emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-500',
      blue: 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-500',
      amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-500',
      violet: 'bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400 border-violet-500',
      rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border-rose-500',
      cyan: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 border-cyan-500',
    }

    const colorConfig = colorBgMap[newWidgetColor] || colorBgMap.emerald

    const newCardObj = {
      id: customId,
      label: newWidgetLabel.trim(),
      value: newWidgetValue.trim() || '100%',
      iconType: 'activity',
      iconBg: colorConfig.split(' ').slice(0, 2).join(' '),
      change: newWidgetChange.trim() || '+0%',
      changeType: 'positive' as const,
      activeClass: `${colorConfig.split(' ')[4]} ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40`,
      activeNumberClass: colorConfig.split(' ')[2],
    }

    const updatedCustomCards = { ...customCards, [customId]: newCardObj }
    setCustomCards(updatedCustomCards)
    localStorage.setItem(getCustomCardsKey(currentUser.id), JSON.stringify(updatedCustomCards))


    const newSetting: DashboardWidgetSetting = {
      id: customId,
      label: newWidgetLabel.trim(),
      visible: true,
      order: editingSettings.length,
      size: newWidgetSize,
    }

    setEditingSettings(prev => [...prev, newSetting])
    setAddCustomModalOpen(false)
    setNewWidgetLabel('')
    setNewWidgetValue('')
  }

  const handleApplyPreset = (preset: 'all' | 'compact' | 'defaults') => {
    if (preset === 'defaults') {
      setEditingSettings([...DEFAULT_WIDGET_SETTINGS])
    } else if (preset === 'all') {
      setEditingSettings(editingSettings.map(w => ({ ...w, visible: true })))
    } else if (preset === 'compact') {
      setEditingSettings(
        editingSettings.map(w => ({
          ...w,
          visible: ['connected', 'total-products', 'ready-publish', 'pending-validation'].includes(w.id),
          size: 'sm' as WidgetSize,
        }))
      )
    }
  }

  const handleSaveCustomization = () => {
    const finalSettings = editingSettings.map((w, idx) => ({ ...w, order: idx }))
    setWidgetSettings(finalSettings)
    localStorage.setItem(getStorageKey(currentUser.id), JSON.stringify(finalSettings))
    setCustomizeOpen(false)
    setSyncSuccessMsg(`Customized dashboard layout & widget sizes saved for ${currentUser.name}!`)
    setTimeout(() => setSyncSuccessMsg(''), 4000)
  }

  // Master KPI Dictionary (Merged with Custom User-Created Widgets)
  const cardDictionary = useMemo(() => {
    const dict: Record<string, {
      id: string
      label: string
      value: string | number
      icon: React.ReactNode
      iconBg: string
      change: string
      changeType: 'positive' | 'negative'
      activeClass: string
      activeNumberClass: string
    }> = {
      'connected': { id: 'connected', label: 'Connected Suppliers', value: m.connectedSuppliers, icon: <Truck size={14} className="text-emerald-600 dark:text-emerald-400" />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', change: '+2 this week', changeType: 'positive', activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
      'disconnected': { id: 'disconnected', label: 'Disconnected Suppliers', value: m.disconnectedSuppliers, icon: <Wifi size={14} className="text-rose-600 dark:text-rose-400" />, iconBg: 'bg-rose-50 dark:bg-rose-950/60', change: '-1 resolved', changeType: 'positive', activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50 dark:bg-rose-950/40', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
      'total-products': { id: 'total-products', label: 'Total Products', value: formatNumber(m.totalProducts), icon: <Package size={14} className="text-primary-600 dark:text-primary-400" />, iconBg: 'bg-primary-50 dark:bg-primary-950/60', change: '+1.2K today', changeType: 'positive', activeClass: 'border-primary-500 ring-2 ring-primary-500/10 bg-primary-25/50 dark:bg-primary-950/40', activeNumberClass: 'text-primary-600 dark:text-primary-400' },
      'imported-today': { id: 'imported-today', label: 'Products Imported Today', value: formatNumber(m.productsImportedToday), icon: <Package size={14} className="text-cyan-600 dark:text-cyan-400" />, iconBg: 'bg-cyan-50 dark:bg-cyan-950/60', change: '+1.4K today', changeType: 'positive', activeClass: 'border-cyan-500 ring-2 ring-cyan-500/10 bg-cyan-25/50 dark:bg-cyan-950/40', activeNumberClass: 'text-cyan-600 dark:text-cyan-400' },
      'ready-publish': { id: 'ready-publish', label: 'Products Ready to Publish', value: formatNumber(m.productsReadyToPublish), icon: <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', change: 'Ready', changeType: 'positive', activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
      'pending-validation': { id: 'pending-validation', label: 'Pending Validation', value: m.pendingProducts, icon: <AlertTriangle size={14} className="text-amber-600 dark:text-amber-400" />, iconBg: 'bg-amber-50 dark:bg-amber-950/60', change: '-84 resolved', changeType: 'positive', activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50 dark:bg-amber-950/40', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
      'published-products': { id: 'published-products', label: 'Published Products', value: formatNumber(m.publishedProducts), icon: <CheckCircle2 size={14} className="text-emerald-600 dark:text-emerald-400" />, iconBg: 'bg-emerald-50 dark:bg-emerald-950/60', change: '+982 today', changeType: 'positive', activeClass: 'border-emerald-500 ring-2 ring-emerald-500/10 bg-emerald-25/50 dark:bg-emerald-950/40', activeNumberClass: 'text-emerald-600 dark:text-emerald-400' },
      'awaiting-review': { id: 'awaiting-review', label: 'Products Awaiting Review', value: m.productsAwaitingReview, icon: <Clock size={14} className="text-amber-600 dark:text-amber-400" />, iconBg: 'bg-amber-50 dark:bg-amber-950/60', change: 'Review', changeType: 'positive', activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50 dark:bg-amber-950/40', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
      'duplicate-products': { id: 'duplicate-products', label: 'Duplicate Products', value: m.duplicateProducts, icon: <XCircle size={14} className="text-rose-600 dark:text-rose-400" />, iconBg: 'bg-rose-50 dark:bg-rose-950/60', change: 'Fix needed', changeType: 'negative', activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50 dark:bg-rose-950/40', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
      'missing-images': { id: 'missing-images', label: 'Missing Images', value: m.missingImages, icon: <Image size={14} className="text-violet-600 dark:text-violet-400" />, iconBg: 'bg-violet-50 dark:bg-violet-950/60', change: 'Fix needed', changeType: 'negative', activeClass: 'border-violet-500 ring-2 ring-violet-500/10 bg-violet-25/50 dark:bg-violet-950/40', activeNumberClass: 'text-violet-600 dark:text-violet-400' },
      'missing-categories': { id: 'missing-categories', label: 'Missing Categories', value: m.missingCategories, icon: <Tag size={14} className="text-indigo-600 dark:text-indigo-400" />, iconBg: 'bg-indigo-50 dark:bg-indigo-950/60', change: 'Fix needed', changeType: 'negative', activeClass: 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-25/50 dark:bg-indigo-950/40', activeNumberClass: 'text-indigo-600 dark:text-indigo-400' },
      'missing-pricing': { id: 'missing-pricing', label: 'Missing Pricing', value: m.missingPricing, icon: <DollarSign size={14} className="text-amber-600 dark:text-amber-400" />, iconBg: 'bg-amber-50 dark:bg-amber-950/60', change: 'Fix needed', changeType: 'negative', activeClass: 'border-amber-500 ring-2 ring-amber-500/10 bg-amber-25/50 dark:bg-amber-950/40', activeNumberClass: 'text-amber-600 dark:text-amber-400' },
      'failed-products': { id: 'failed-products', label: 'Failed Products', value: m.failedProducts, icon: <XCircle size={14} className="text-rose-600 dark:text-rose-400" />, iconBg: 'bg-rose-50 dark:bg-rose-950/60', change: '+12 today', changeType: 'negative', activeClass: 'border-rose-500 ring-2 ring-rose-500/10 bg-rose-25/50 dark:bg-rose-950/40', activeNumberClass: 'text-rose-600 dark:text-rose-400' },
    }

    for (const [id, c] of Object.entries(customCards)) {
      if (!c || typeof c !== 'object') continue
      const validIcon = React.isValidElement((c as any).icon)
        ? (c as any).icon
        : <Activity size={14} className={(c as any).activeNumberClass || 'text-emerald-600'} />

      dict[id] = {
        id,
        label: (c as any).label || 'Custom Tile',
        value: (c as any).value || '0',
        change: (c as any).change || '+0%',
        changeType: (c as any).changeType || 'positive',
        iconBg: (c as any).iconBg || 'bg-emerald-50 dark:bg-emerald-950/60',
        activeClass: (c as any).activeClass || 'border-emerald-500',
        activeNumberClass: (c as any).activeNumberClass || 'text-emerald-600 dark:text-emerald-400',
        icon: validIcon,
      }
    }
    return dict
  }, [customCards, m])



  // Active Visible & Reordered Widgets for current user
  const activeUserWidgets = useMemo(() => {
    return widgetSettings
      .filter(w => w.visible)
      .sort((a, b) => a.order - b.order)
  }, [widgetSettings])

  return (
    <div className="relative space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="purple" dot>{roleInfo.focus}</Badge>
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold">• Logged in as <strong className="text-slate-800 dark:text-slate-200">{currentUser.name}</strong></span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">SupplyBridge Control Center</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Real-time catalog middleware, supplier feed pipelines, and Shift4Shop storefront sync</p>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-center mt-1 sm:mt-0">
          <HealthIndicator status="operational" label="All Systems" />

          {/* Customize Dashboard Widgets Button */}
          <button
            onClick={handleOpenCustomize}
            className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer font-bold border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/30 hover:bg-amber-100/60"
            title="Customize, show/hide, reorder & resize dashboard tiles for your account"
          >
            <Sliders size={13} />
            <span>Customize Widgets ({activeUserWidgets.length})</span>
          </button>

          {/* Trigger Manual Sync Button */}
          <button
            onClick={() => setManualSyncOpen(true)}
            className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Zap size={14} />
            <span>Trigger Manual Sync</span>
          </button>


          {/* Refresh Button */}
          <button
            onClick={loadStats}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
            title="Click to refresh dashboard metrics"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-primary-600' : 'text-slate-500'} />
            <span>{isRefreshing ? 'Refreshing...' : lastUpdated}</span>
          </button>
        </div>
      </div>

      {/* Instant Action Alert Banner */}
      {syncSuccessMsg && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{syncSuccessMsg}</span>
        </motion.div>
      )}

      {/* Dynamic & Customizable User KPI Tiles Grid */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-3.5"
        variants={stagger.parent}
        initial="initial"
        animate="animate"
      >
        {activeUserWidgets.map((setting) => {
          const card = cardDictionary[setting.id]
          if (!card) return null
          const isSelected = activeCard === card.id
          const colSpanClass = getSizeColClass(setting.size)

          return (
            <motion.div
              key={card.id}
              variants={stagger.child}
              transition={{ duration: 0.3 }}
              onClick={() => setActiveCard(prev => (prev === card.id ? null : card.id))}
              className={`kpi-card group cursor-pointer transition-all duration-200 ${colSpanClass} ${
                isSelected ? card.activeClass : 'border-surface-border'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${card.iconBg}`}>
                    {card.icon}
                  </div>
                  {setting.size !== 'sm' && (
                    <span className="text-2xs font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                      {setting.size}
                    </span>
                  )}
                </div>
                {card.change && (
                  <span className={`text-2xs font-semibold px-1.5 py-0.5 rounded-full ${
                    card.changeType === 'positive'
                      ? 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800'
                      : 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800'
                  }`}>
                    {card.change}
                  </span>
                )}
              </div>
              <div className="mt-2">
                <p className="kpi-label">{card.label}</p>
                <p className={`kpi-value mt-0.5 transition-colors duration-200 ${
                  isSelected ? card.activeNumberClass : 'text-slate-900 dark:text-slate-100'
                }`}>
                  {typeof card.value === 'number' ? card.value.toLocaleString() : card.value}
                </p>
              </div>
            </motion.div>
          )
        })}
      </motion.div>


      {/* Static Sync Status + Jobs Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sync Channels */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-primary-600 dark:text-primary-400" /> Synchronization Channels
          </p>
          <div className="space-y-3.5">
            {[
              { label: 'Inventory Sync', status: m.inventorySyncStatus, last: '4 min ago', icon: <RefreshCw size={14} /> },
              { label: 'Pricing Sync', status: m.pricingSyncStatus, last: '12 min ago', icon: <DollarSign size={14} /> },
              { label: 'Image Sync', status: m.imageSyncStatus, last: '2 hr ago', icon: <Image size={14} /> },
            ].map(s => (
              <div
                key={s.label}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60"
              >
                <div className="flex items-center gap-2.5 text-slate-800 dark:text-slate-200 text-xs font-bold">
                  <span className="text-slate-400">{s.icon}</span>
                  {s.label}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-400 font-mono">{s.last}</span>
                  <HealthIndicator status={s.status as any} label={s.status === 'healthy' ? 'Healthy' : s.status === 'degraded' ? 'Degraded' : 'Critical'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Execution Summary */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-primary-600 dark:text-primary-400" /> Job Execution Summary
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Running', value: m.runningJobs, color: 'text-cyan-700 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-100 dark:border-cyan-900/50', icon: <RefreshCw size={16} className="animate-spin text-cyan-600" /> },
              { label: 'Queued', value: m.queuedJobs, color: 'text-amber-700 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border border-amber-100 dark:border-amber-900/50', icon: <Clock size={16} className="text-amber-600" /> },
              { label: 'Completed', value: m.completedJobs, color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/50', icon: <CheckCircle2 size={16} className="text-emerald-600" /> },
              { label: 'Failed', value: m.failedJobs, color: 'text-rose-700 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/50', icon: <XCircle size={16} className="text-rose-600" /> },
            ].map(j => (
              <div
                key={j.label}
                className={`${j.bg} rounded-xl p-3 flex flex-col gap-1`}
              >
                <span>{j.icon}</span>
                <p className={`text-2xl font-black ${j.color}`}>{j.value.toLocaleString()}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{j.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row: Recent Activity + Import Queue & Store Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Recent Activity */}
        <div className="card p-5 border border-slate-200 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity size={16} className="text-primary-600 dark:text-primary-400" /> Recent Activity Feed
            </p>
            <Link to="/logs" className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium">View all logs →</Link>
          </div>

          {/* Activity Feed Filters & Search */}
          <div className="space-y-2 mb-4">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search activity timeline..."
                value={activitySearch}
                onChange={e => setActivitySearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 outline-none focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide py-1">
              {[
                'All', 'Supplier', 'Store', 'Inventory', 'Pricing', 'Images', 'Errors', 'Warnings', 'Manual Actions'
              ].map(f => (
                <button
                  key={f}
                  onClick={() => setActivityFilter(f)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all ${
                    activityFilter === f
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3.5">
            {activities
              .filter(act => {
                const matchesSearch = act.message.toLowerCase().includes(activitySearch.toLowerCase())
                if (activityFilter === 'All') return matchesSearch
                if (activityFilter === 'Supplier') return matchesSearch && (act.message.includes('Supplier') || act.message.includes('TechParts') || act.message.includes('Acme'))
                if (activityFilter === 'Store') return matchesSearch && (act.message.includes('Store') || act.message.includes('Shop'))
                if (activityFilter === 'Inventory') return matchesSearch && (act.message.includes('Inventory') || act.message.includes('Stock'))
                if (activityFilter === 'Pricing') return matchesSearch && (act.message.includes('Price') || act.message.includes('Pricing') || act.message.includes('Cost'))
                if (activityFilter === 'Images') return matchesSearch && (act.message.includes('Image') || act.message.includes('Media'))
                if (activityFilter === 'Errors') return matchesSearch && (act.color === 'rose' || act.message.includes('failed') || act.message.includes('Error'))
                if (activityFilter === 'Warnings') return matchesSearch && (act.color === 'amber' || act.message.includes('warning'))
                if (activityFilter === 'Manual Actions') return matchesSearch && (act.message.includes('Manual') || act.message.includes('triggered'))
                return matchesSearch
              })
              .map(act => {
                const colorMap: Record<string, string> = {
                  emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
                  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
                  rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400',
                  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
                  violet: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
                }
                return (
                  <div key={act.id} className="flex items-start gap-3 p-2 rounded-xl">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${colorMap[act.color]}`}>
                      <span className="text-xs font-bold">●</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">{act.message}</p>
                      <p className="text-2xs text-slate-400 font-mono mt-0.5">{act.time}</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>

        {/* Queue + Store Status */}
        <div className="space-y-5">
          {/* Import Queue */}
          <div className="card p-5 border border-slate-200 dark:border-slate-800">
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 flex items-center gap-2">
              <Database size={16} className="text-primary-600 dark:text-primary-400" /> Active Import Queue Capacity
            </p>
            <div className="flex items-center gap-4">
              <div className="text-3xl font-black text-slate-900 dark:text-slate-100">{m.queueSize}</div>
              <div className="flex-1">
                <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
                  <motion.div
                    className="h-full rounded-full bg-cyan-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.queueSize / 500) * 100}%` }}
                    transition={{ duration: 1, delay: 0.2 }}
                  />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5">{m.queueSize} items currently processing — total queue capacity 500</p>
              </div>
            </div>
          </div>

          {/* Store Status */}
          <div className="card p-5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe size={16} className="text-primary-600 dark:text-primary-400" /> Multi-Store Status
              </p>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">{m.storesSynced}/{m.totalStores} Synced</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'US Store', ok: true }, { label: 'EU Store', ok: true },
                { label: 'TechHub', ok: true }, { label: 'UK Store', ok: true },
                { label: 'CA Store', ok: false }, { label: 'AutoParts', ok: true },
                { label: 'SportGear', ok: false },
              ].map((s, i) => (
                <div key={i} className={`rounded-xl p-2 text-center border ${s.ok ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-100 dark:border-emerald-900/50' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-100 dark:border-rose-900/50'}`}>
                  <div className={`w-2 h-2 rounded-full mx-auto mb-1 ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <p className="text-2xs font-bold text-slate-700 dark:text-slate-300 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Customize Dashboard Tiles & Layout Modal (Enterprise 2XL Studio) */}
      <Modal
        open={customizeOpen}
        onClose={() => setCustomizeOpen(false)}
        title="Enterprise Dashboard Widget Studio & Layout Manager"
        subtitle={`Customize tile visibility, sizes, drag & drop order, or build custom widgets for ${currentUser.name}`}
        size="2xl"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              type="button"
              onClick={() => handleApplyPreset('defaults')}
              className="btn-secondary text-xs flex items-center gap-1 text-slate-600 dark:text-slate-300 font-bold"
            >
              <RotateCcw size={13} /> Reset to Defaults
            </button>

            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setCustomizeOpen(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomization}
                className="btn-primary flex items-center gap-1.5 shadow-md shadow-amber-500/25 font-bold cursor-pointer"
              >
                <Check size={14} /> Save Dashboard Layout
              </button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Modal Header Controls & Quick Presets */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">Quick Layout Presets:</span>
              <button
                type="button"
                onClick={() => handleApplyPreset('all')}
                className="px-2.5 py-1 rounded-lg text-2xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Show All Tiles
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('compact')}
                className="px-2.5 py-1 rounded-lg text-2xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-primary-500 text-slate-700 dark:text-slate-200 cursor-pointer"
              >
                Compact Grid
              </button>
            </div>

            <button
              type="button"
              onClick={() => setAddCustomModalOpen(true)}
              className="btn-primary btn-xs flex items-center gap-1 font-bold shadow-sm cursor-pointer"
            >
              <Plus size={13} /> Add Custom Tile (Bada Form)
            </button>
          </div>

          {/* 2-Column Spacious Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Reorderable Widget Manager List (7 Cols) */}
            <div className="lg:col-span-7 space-y-2 max-h-[440px] overflow-y-auto pr-1 scrollbar-thin">
              <p className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                Tile List ({editingSettings.filter(w => w.visible).length} Visible / {editingSettings.length} Total) — Drag or use ▲▼ to reorder:
              </p>

              {editingSettings.map((item, index) => {
                const cardInfo = cardDictionary[item.id]
                const isBeingDragged = draggedIndex === index

                return (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(index)}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                      isBeingDragged ? 'opacity-40 border-dashed border-primary-500 bg-primary-50/20' : ''
                    } ${
                      item.visible
                        ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                        : 'bg-slate-50/60 dark:bg-slate-950/40 border-slate-100 dark:border-slate-850 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Drag Handle */}
                      <span className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 flex-shrink-0" title="Drag to reorder">
                        <GripVertical size={16} />
                      </span>

                      {/* Reorder Up/Down Buttons */}
                      <div className="flex flex-col gap-0.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleMoveWidget(index, 'up')}
                          disabled={index === 0}
                          className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          <ArrowUp size={11} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveWidget(index, 'down')}
                          disabled={index === editingSettings.length - 1}
                          className="p-0.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          <ArrowDown size={11} />
                        </button>
                      </div>

                      {/* Tile Icon & Title */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${cardInfo?.iconBg || 'bg-slate-100'}`}>
                          {cardInfo?.icon}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                          {item.label}
                        </span>
                      </div>
                    </div>

                    {/* Size Selector & Show/Hide Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
                      {/* Size selector pills */}
                      <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {[
                          { sizeKey: 'sm' as WidgetSize, label: 'Small' },
                          { sizeKey: 'md' as WidgetSize, label: 'Medium' },
                          { sizeKey: 'lg' as WidgetSize, label: 'Large' },
                          { sizeKey: 'full' as WidgetSize, label: 'Full Width' },
                        ].map(sz => (
                          <button
                            key={sz.sizeKey}
                            type="button"
                            onClick={() => handleSizeChange(item.id, sz.sizeKey)}
                            className={`px-2 py-0.5 rounded text-2xs font-extrabold transition-all cursor-pointer ${
                              item.size === sz.sizeKey
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>

                      {/* Visibility Toggle Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item.id)}
                        className={`btn-icon text-xs flex items-center gap-1 px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          item.visible
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 font-bold'
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 font-normal'
                        }`}
                        title={item.visible ? 'Click to hide widget' : 'Click to show widget'}
                      >
                        {item.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                        <span className="text-2xs">{item.visible ? 'Visible' : 'Hidden'}</span>
                      </button>

                      {/* Delete Tile Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteWidget(item.id)}
                        className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 p-1.5 rounded-lg cursor-pointer"
                        title="Delete Tile"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}

            </div>

            {/* Right Column: Real-Time Live Preview Pane (5 Cols) */}
            <div className="lg:col-span-5 card p-4 bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders size={14} className="text-amber-500" /> Real-Time Live Layout Preview
                  </p>
                  <Badge variant="purple" dot>{editingSettings.filter(w => w.visible).length} Tiles Visible</Badge>
                </div>
                <p className="text-2xs text-slate-500 dark:text-slate-400 mb-3">
                  This live preview shows how your dashboard layout will render on desktop screens:
                </p>

                {/* Mini Preview Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[340px] overflow-y-auto pr-1 scrollbar-thin">
                  {editingSettings
                    .filter(w => w.visible)
                    .map(setting => {
                      const card = cardDictionary[setting.id]
                      if (!card) return null
                      const miniColSpan = setting.size === 'full' ? 'col-span-4' : setting.size === 'lg' ? 'col-span-3' : setting.size === 'md' ? 'col-span-2' : 'col-span-1'

                      return (
                        <div
                          key={setting.id}
                          className={`p-2.5 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs ${miniColSpan}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center ${card.iconBg}`}>
                              {card.icon}
                            </div>
                            <span className="text-[9px] font-mono text-slate-400 uppercase">{setting.size}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-700 dark:text-slate-300 truncate mt-1.5">{card.label}</p>
                          <p className="text-xs font-black text-slate-900 dark:text-slate-100">{card.value}</p>
                        </div>
                      )
                    })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setAddCustomModalOpen(true)}
                  className="w-full btn-primary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer shadow-md shadow-amber-500/25"
                >
                  <Plus size={14} /> Build New Widget (Bada Form)
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Custom KPI Tile Modal (Bada Form - Widget Studio) */}
      <Modal
        open={addCustomModalOpen}
        onClose={() => setAddCustomModalOpen(false)}
        title="Widget Studio — Create Custom KPI Telemetry Tile (Bada Form)"
        subtitle="Configure custom telemetry metrics, data domain source, icon, color theme, and live card preview"
        size="xl"
      >
        <form onSubmit={handleCreateCustomWidget} className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Form Fields (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Widget Title / Metric Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Order Fulfillment Velocity"
                  className="input font-semibold text-xs"
                  value={newWidgetLabel}
                  onChange={e => setNewWidgetLabel(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Metric Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 99.4% or $142.5K"
                    className="input font-mono font-bold text-xs"
                    value={newWidgetValue}
                    onChange={e => setNewWidgetValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Change / Comparison Badge
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. +4.2% vs last week"
                    className="input font-semibold text-xs"
                    value={newWidgetChange}
                    onChange={e => setNewWidgetChange(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Default Card Size
                  </label>
                  <select
                    className="select text-xs font-bold"
                    value={newWidgetSize}
                    onChange={e => setNewWidgetSize(e.target.value as WidgetSize)}
                  >
                    <option value="sm">Small (1 Column)</option>
                    <option value="md">Medium (2 Columns)</option>
                    <option value="lg">Large (3 Columns)</option>
                    <option value="full">Full Width (6 Columns)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Accent Color Theme
                  </label>
                  <select
                    className="select text-xs font-bold"
                    value={newWidgetColor}
                    onChange={e => setNewWidgetColor(e.target.value)}
                  >
                    <option value="emerald">Emerald Green (Success)</option>
                    <option value="blue">Primary Blue (System)</option>
                    <option value="violet">Violet (PIM & Catalog)</option>
                    <option value="amber">Amber Yellow (Warning)</option>
                    <option value="cyan">Cyan (Feed Pipeline)</option>
                    <option value="rose">Rose Red (Critical Alert)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Right Column: Live Card Preview (5 Cols) */}
            <div className="lg:col-span-5 card p-4 bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <p className="text-2xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
                  Live Card Preview on Dashboard
                </p>

                {/* Simulated Card Output */}
                <div className="kpi-card bg-white dark:bg-slate-900 border-amber-500/80 shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center">
                      <Activity size={16} className="text-amber-500" />
                    </div>
                    <span className="text-2xs font-semibold px-2 py-0.5 rounded-full text-emerald-700 bg-emerald-50 border border-emerald-200">
                      {newWidgetChange || '+0%'}
                    </span>
                  </div>
                  <div className="mt-3">
                    <p className="kpi-label">{newWidgetLabel || 'Custom Tile Title'}</p>
                    <p className="kpi-value text-xl font-black mt-1 text-slate-900 dark:text-slate-100">
                      {newWidgetValue || '100%'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
                <p className="text-2xs text-slate-500 leading-relaxed mb-3">
                  This custom tile will be immediately appended to your account&apos;s active dashboard layout.
                </p>
                <button
                  type="submit"
                  className="w-full btn-primary flex items-center justify-center gap-1.5 font-bold shadow-md shadow-amber-500/25 cursor-pointer"
                >
                  <Plus size={15} /> Save & Add Custom Tile
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>



      {/* Trigger Manual Sync Modal */}
      <Modal
        open={manualSyncOpen}
        onClose={() => setManualSyncOpen(false)}

        title="Trigger Manual Synchronization"
        subtitle="Manually launch an instant synchronization pipeline for a specific supplier"
        size="md"
        footer={
          <>
            <button onClick={() => setManualSyncOpen(false)} className="btn-secondary">Cancel</button>
            <button
              onClick={handleLaunchSync}
              disabled={syncLaunching}
              className="btn-primary flex items-center gap-1.5"
            >
              {syncLaunching ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Triggering Job...</span>
                </>
              ) : (
                <>
                  <Zap size={14} />
                  <span>Run Sync Now</span>
                </>
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Select Supplier</label>
            <select
              value={selectedSupplier}
              onChange={e => setSelectedSupplier(e.target.value)}
              className="select w-full"
            >
              {suppliersList.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Synchronization Type</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'Inventory Sync', label: 'Inventory Sync', desc: 'Stock level updates' },
                { id: 'Pricing Sync', label: 'Pricing Sync', desc: 'Cost & MSRP updates' },
                { id: 'Image Sync', label: 'Image Sync', desc: 'Media & gallery sync' },
                { id: 'Full Sync', label: 'Full Pipeline', desc: 'Complete data pull' },
              ].map(st => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setSelectedSyncType(st.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${selectedSyncType === st.id
                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-950/40 ring-2 ring-primary-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{st.label}</p>
                  <p className="text-2xs text-slate-500 dark:text-slate-400 mt-0.5">{st.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Retry All Failed Jobs Confirmation Dialog */}
      <ConfirmDialog
        open={retryModalOpen}
        onClose={() => setRetryModalOpen(false)}
        onConfirm={handleConfirmRetryAll}
        title="Retry All Failed Sync Jobs?"
        message="Are you sure you want to re-queue all 17 failed synchronization jobs across connected suppliers? This will trigger automated retry attempts immediately."
        confirmLabel="Retry All Jobs (17)"
        danger={false}
      />
    </div>
  )
}
