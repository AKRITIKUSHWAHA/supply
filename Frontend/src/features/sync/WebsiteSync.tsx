import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Globe, RefreshCw, CheckCircle2, RotateCcw,
  FileSpreadsheet, Search, Layers, X, ShieldCheck,
  Eye, Settings, Terminal
} from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { statusToVariant } from '../../utils'

export interface StorefrontSyncItem {
  id: string
  name: string
  platform: 'Shift4Shop' | 'Shopify' | 'WooCommerce' | 'Magento' | 'BigCommerce' | 'Custom API'
  url: string
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error'
  lastSuccessSync: string
  lastFailedSync: string | null
  productsPublished: number
  totalProducts: number
  syncStatus: 'synced' | 'syncing' | 'pending' | 'failed'
  apiKey?: string
  syncInterval?: string
}

const INITIAL_STORES: StorefrontSyncItem[] = [
  {
    id: 'store1',
    name: 'SupplyBridge US Store',
    platform: 'Shift4Shop',
    url: 'https://store.supplybridge-us.com',
    connectionStatus: 'connected',
    lastSuccessSync: '10 min ago',
    lastFailedSync: null,
    productsPublished: 40000,
    totalProducts: 40000,
    syncStatus: 'synced',
    apiKey: 's4s_live_pk_9948271',
    syncInterval: '15 mins',
  },
  {
    id: 'store2',
    name: 'Global Electronics Hub',
    platform: 'Shopify',
    url: 'https://electronics-hub.myshopify.com',
    connectionStatus: 'connected',
    lastSuccessSync: '25 min ago',
    lastFailedSync: null,
    productsPublished: 18450,
    totalProducts: 18450,
    syncStatus: 'synced',
    apiKey: 'shpat_8829103847',
    syncInterval: '30 mins',
  },
  {
    id: 'store3',
    name: 'EU Direct Commerce',
    platform: 'WooCommerce',
    url: 'https://eu.directcommerce.io',
    connectionStatus: 'connected',
    lastSuccessSync: '1 hr ago',
    lastFailedSync: '2 hr ago',
    productsPublished: 12100,
    totalProducts: 12500,
    syncStatus: 'failed',
    apiKey: 'ck_773910382910',
    syncInterval: '1 hour',
  },
  {
    id: 'store4',
    name: 'Industrial Wholesale Portal',
    platform: 'Magento',
    url: 'https://b2b.industrialportal.com',
    connectionStatus: 'connected',
    lastSuccessSync: '3 hr ago',
    lastFailedSync: null,
    productsPublished: 8900,
    totalProducts: 8900,
    syncStatus: 'synced',
    apiKey: 'mag_bearer_8829103',
    syncInterval: '6 hours',
  },
  {
    id: 'store5',
    name: 'QuickShip Outlet Store',
    platform: 'BigCommerce',
    url: 'https://store-quickship.mybigcommerce.com',
    connectionStatus: 'connecting',
    lastSuccessSync: '5 hr ago',
    lastFailedSync: null,
    productsPublished: 6200,
    totalProducts: 6400,
    syncStatus: 'pending',
    apiKey: 'bc_token_4492019',
    syncInterval: '1 hour',
  },
]

export const WebsiteSync: React.FC = () => {
  const [storesList, setStoresList] = useState<StorefrontSyncItem[]>(INITIAL_STORES)
  const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [platformFilter, setPlatformFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  
  const [syncingAll, setSyncingAll] = useState(false)
  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Modal States for View & Settings
  const [viewStore, setViewStore] = useState<StorefrontSyncItem | null>(null)
  const [settingsStore, setSettingsStore] = useState<StorefrontSyncItem | null>(null)
  const [settingsFormData, setSettingsFormData] = useState({ apiKey: '', syncInterval: '15 mins' })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Dynamic KPI Summary Telemetry Cards ---
  const totalStores = storesList.length
  const connectedCount = storesList.filter(s => s.connectionStatus === 'connected').length
  const totalProductsPublished = storesList.reduce((acc, s) => acc + s.productsPublished, 0)
  const syncedCount = storesList.filter(s => s.syncStatus === 'synced').length
  const syncHealthPct = totalStores > 0 ? Math.round((syncedCount / totalStores) * 100) : 100
  const failedStoresCount = storesList.filter(s => s.syncStatus === 'failed').length

  // Selection Checkbox Toggle
  const toggleSelectStore = (id: string) =>
    setSelectedStoreIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))

  // Handlers for Synchronization Actions
  
  // 1. Sync Selected Stores
  const handleSyncSelectedStores = () => {
    if (selectedStoreIds.length === 0) return
    const selectedCount = selectedStoreIds.length
    showNotification(`Synchronizing ${selectedCount} selected storefront(s)...`)

    setStoresList(prev =>
      prev.map(s =>
        selectedStoreIds.includes(s.id)
          ? { ...s, syncStatus: 'syncing' }
          : s
      )
    )

    setTimeout(() => {
      setStoresList(prev =>
        prev.map(s =>
          selectedStoreIds.includes(s.id)
            ? {
                ...s,
                syncStatus: 'synced',
                connectionStatus: 'connected',
                lastSuccessSync: 'Just now',
                productsPublished: s.totalProducts,
                lastFailedSync: null,
              }
            : s
        )
      )
      setSelectedStoreIds([])
      showNotification(`${selectedCount} storefront(s) published & synchronized successfully!`)
    }, 2000)
  }

  // 2. Sync All Stores
  const handleSyncAllStores = () => {
    setSyncingAll(true)
    showNotification('Initiating catalog synchronization for all connected storefronts...')
    setStoresList(prev => prev.map(s => ({ ...s, syncStatus: 'syncing' })))

    setTimeout(() => {
      setStoresList(prev =>
        prev.map(s => ({
          ...s,
          syncStatus: 'synced',
          connectionStatus: 'connected',
          lastSuccessSync: 'Just now',
          productsPublished: s.totalProducts,
          lastFailedSync: null,
        }))
      )
      setSyncingAll(false)
      showNotification('All connected storefronts synchronized successfully!')
    }, 2200)
  }

  // 3. Retry Failed Syncs
  const handleRetryFailedSyncs = () => {
    const failedList = storesList.filter(s => s.syncStatus === 'failed')
    if (failedList.length === 0) return

    showNotification(`Retrying synchronization for ${failedList.length} failed storefront(s)...`)
    setStoresList(prev =>
      prev.map(s =>
        s.syncStatus === 'failed' ? { ...s, syncStatus: 'syncing' } : s
      )
    )

    setTimeout(() => {
      setStoresList(prev =>
        prev.map(s =>
          s.syncStatus === 'syncing'
            ? {
                ...s,
                syncStatus: 'synced',
                connectionStatus: 'connected',
                lastSuccessSync: 'Just now',
                productsPublished: s.totalProducts,
                lastFailedSync: null,
              }
            : s
        )
      )
      showNotification('Failed storefront synchronization retried and completed successfully!')
    }, 2000)
  }

  // 4. Single Store Sync / Retry
  const handleSyncSingleStore = (id: string, name: string) => {
    setSyncingStoreId(id)
    setStoresList(prev =>
      prev.map(s => (s.id === id ? { ...s, syncStatus: 'syncing' } : s))
    )

    setTimeout(() => {
      setStoresList(prev =>
        prev.map(s =>
          s.id === id
            ? {
                ...s,
                syncStatus: 'synced',
                connectionStatus: 'connected',
                lastSuccessSync: 'Just now',
                productsPublished: s.totalProducts,
                lastFailedSync: null,
              }
            : s
        )
      )
      setSyncingStoreId(null)
      showNotification(`Catalog published & synced successfully for "${name}"!`)
    }, 1500)
  }

  // Save Store Settings
  const handleOpenSettings = (store: StorefrontSyncItem) => {
    setSettingsStore(store)
    setSettingsFormData({
      apiKey: store.apiKey || '',
      syncInterval: store.syncInterval || '15 mins',
    })
  }

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    if (!settingsStore) return

    setStoresList(prev =>
      prev.map(s =>
        s.id === settingsStore.id
          ? {
              ...s,
              apiKey: settingsFormData.apiKey,
              syncInterval: settingsFormData.syncInterval,
            }
          : s
      )
    )

    showNotification(`Settings updated for "${settingsStore.name}".`)
    setSettingsStore(null)
  }

  // Export Storefront Audit CSV
  const handleExportCSV = () => {
    showNotification('Exporting Storefront Synchronization Audit CSV...')
    const csvHeaders = 'Store Name,Platform,Connection Status,Last Successful Sync,Last Failed Sync,Products Published,Total Catalog Products,Sync Status\n'
    const csvRows = filteredStores.map(s =>
      `"${s.name}","${s.platform}","${s.connectionStatus}","${s.lastSuccessSync}","${s.lastFailedSync || 'None'}",${s.productsPublished},${s.totalProducts},"${s.syncStatus}"`
    ).join('\n')

    const blob = new Blob([csvHeaders + csvRows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Store_Sync_Report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Storefront Audit CSV downloaded!')
  }

  // Platform List for Filter
  const platformsList = ['all', ...Array.from(new Set(storesList.map(s => s.platform)))]

  // Filtering Stores
  const filteredStores = storesList.filter(store => {
    const query = search.toLowerCase()
    const matchSearch =
      store.name.toLowerCase().includes(query) ||
      store.platform.toLowerCase().includes(query) ||
      store.url.toLowerCase().includes(query)

    const matchPlatform = platformFilter === 'all' || store.platform === platformFilter
    const matchStatus = statusFilter === 'all' || store.syncStatus === statusFilter

    return matchSearch && matchPlatform && matchStatus
  })

  const hasActiveFilters = search !== '' || platformFilter !== 'all' || statusFilter !== 'all'
  const resetFilters = () => {
    setSearch('')
    setPlatformFilter('all')
    setStatusFilter('all')
  }

  return (
    <div className="relative space-y-6 sm:space-y-7">
      {/* Toast Notification Banner */}
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

      {/* Page Header */}
      <SectionHeader
        title="Store Synchronization"
        subtitle="Publish validated catalog products, categories, pricing, and stock levels to multi-channel ecommerce storefronts"
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
              title="Download Storefront Sync CSV Report"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>

            {failedStoresCount > 0 && (
              <button
                onClick={handleRetryFailedSyncs}
                className="btn-secondary btn-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
                title="Retry failed storefront syncs"
              >
                <RotateCcw size={14} /> Retry Failed ({failedStoresCount})
              </button>
            )}

            <button
              onClick={handleSyncSelectedStores}
              disabled={selectedStoreIds.length === 0}
              className={`btn-secondary btn-sm flex items-center gap-1.5 font-bold ${
                selectedStoreIds.length === 0 ? 'opacity-50 cursor-not-allowed text-slate-400' : 'cursor-pointer'
              }`}
              title={selectedStoreIds.length === 0 ? 'Select one or more stores to sync' : 'Sync Selected Stores'}
            >
              <Layers size={14} className="text-cyan-500" /> Sync Selected {selectedStoreIds.length > 0 && `(${selectedStoreIds.length})`}
            </button>

            <button
              onClick={handleSyncAllStores}
              disabled={syncingAll}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncingAll ? 'animate-spin text-white' : ''} />
              <span>{syncingAll ? 'Syncing All...' : 'Sync All Stores'}</span>
            </button>
          </div>
        }
      />

      {/* Dynamic Summary Telemetry KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[
          {
            label: 'CONNECTED STORES',
            value: `${connectedCount} / ${totalStores} Stores`,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50',
            sub: 'Active API endpoints',
          },
          {
            label: 'TOTAL PRODUCTS PUBLISHED',
            value: `${totalProductsPublished.toLocaleString()} SKUs`,
            color: 'text-slate-900 dark:text-slate-100',
            bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800',
            sub: 'Live on storefront channels',
          },
          {
            label: 'STOREFRONT SYNC HEALTH',
            value: `${syncHealthPct}%`,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50',
            sub: `${syncedCount} of ${totalStores} Stores Synced`,
          },
          {
            label: 'FAILED STORE SYNCS',
            value: `${failedStoresCount} Stores`,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50',
            sub: 'Requires retry action',
          },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl shadow-xs flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Validation Center Publishing Guard Banner */}
      <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between border border-slate-800 shadow-md">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
          <p className="text-xs font-semibold text-slate-200">
            <span className="font-bold text-white">Publishing Guard Active:</span> Only products that have passed 100% of validation rules in the Validation Center are eligible for storefront publishing.
          </p>
        </div>
        <span className="text-2xs text-emerald-400 font-mono font-bold uppercase tracking-wider hidden sm:inline">Guarded</span>
      </div>

      {/* Main Filter & Storefront Table Section */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search storefronts by name, platform, or URL..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <select
              value={platformFilter}
              onChange={e => setPlatformFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Platforms</option>
              {platformsList.filter(p => p !== 'all').map(plat => (
                <option key={plat} value={plat}>{plat}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="select text-xs w-auto py-2"
            >
              <option value="all">All Sync Status</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>

            {hasActiveFilters && (
              <button onClick={resetFilters} className="btn-ghost btn-sm text-2xs font-bold text-slate-500">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main Storefront Synchronization Table */}
        <div className="table-container w-full overflow-x-auto scrollbar-thin">
          <table className="table min-w-[980px] w-full">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="w-10 text-center px-3 py-3.5">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={filteredStores.length > 0 && filteredStores.every(s => selectedStoreIds.includes(s.id))}
                    onChange={e => setSelectedStoreIds(e.target.checked ? filteredStores.map(s => s.id) : [])}
                  />
                </th>
                <th className="whitespace-nowrap px-4 py-3.5">STORE NAME</th>
                <th className="whitespace-nowrap px-4 py-3.5">STORE TYPE / PLATFORM</th>
                <th className="whitespace-nowrap px-4 py-3.5">CONNECTION STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5">LAST SUCCESSFUL SYNC</th>
                <th className="whitespace-nowrap px-4 py-3.5">LAST FAILED SYNC</th>
                <th className="whitespace-nowrap px-4 py-3.5">PRODUCTS PUBLISHED</th>
                <th className="whitespace-nowrap px-4 py-3.5">SYNC STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStores.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No storefront endpoints match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredStores.map(store => {
                  const isSyncingStore = syncingStoreId === store.id || store.syncStatus === 'syncing'

                  return (
                    <tr key={store.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="w-10 text-center px-3 py-3.5" onClick={e => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                          checked={selectedStoreIds.includes(store.id)}
                          onChange={() => toggleSelectStore(store.id)}
                        />
                      </td>
                      <td data-label="Store Name" className="whitespace-nowrap px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Globe size={15} className="text-primary-600 dark:text-primary-400 flex-shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100 text-xs">{store.name}</p>
                            <p className="text-2xs text-slate-400 font-mono mt-0.5 max-w-[200px] truncate">{store.url}</p>
                          </div>
                        </div>
                      </td>
                      <td data-label="Store Type / Platform" className="whitespace-nowrap px-4 py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-2xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {store.platform}
                        </span>
                      </td>
                      <td data-label="Connection Status" className="whitespace-nowrap px-4 py-3.5">
                        <Badge
                          variant={
                            store.connectionStatus === 'connected' ? 'success' :
                            store.connectionStatus === 'connecting' ? 'warning' : 'danger'
                          }
                          dot
                        >
                          {store.connectionStatus === 'connected' ? 'Connected' :
                           store.connectionStatus === 'connecting' ? 'Connecting' :
                           store.connectionStatus === 'disconnected' ? 'Disconnected' : 'Error'}
                        </Badge>
                      </td>
                      <td data-label="Last Successful Sync" className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-xs text-slate-600 dark:text-slate-300 font-mono">{store.lastSuccessSync}</span>
                      </td>
                      <td data-label="Last Failed Sync" className="whitespace-nowrap px-4 py-3.5">
                        {store.lastFailedSync ? (
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 font-mono">{store.lastFailedSync}</span>
                        ) : (
                          <span className="text-xs text-slate-400 italic">None</span>
                        )}
                      </td>
                      <td data-label="Products Published" className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {store.productsPublished.toLocaleString()} <span className="text-slate-400 font-normal">/ {store.totalProducts.toLocaleString()}</span>
                        </span>
                      </td>
                      <td data-label="Sync Status" className="whitespace-nowrap px-4 py-3.5">
                        <Badge variant={statusToVariant(store.syncStatus)} dot>
                          {store.syncStatus}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => setViewStore(store)}
                            className="btn-secondary btn-sm flex items-center gap-1 font-bold text-2xs py-1 px-2 cursor-pointer whitespace-nowrap"
                            title="View Store Details"
                          >
                            <Eye size={12} /> View
                          </button>

                          <button
                            onClick={() => handleOpenSettings(store)}
                            className="btn-secondary btn-sm flex items-center gap-1 font-bold text-2xs py-1 px-2 cursor-pointer whitespace-nowrap"
                            title="Store API Settings"
                          >
                            <Settings size={12} /> Settings
                          </button>

                          {store.syncStatus === 'failed' ? (
                            <button
                              onClick={() => handleSyncSingleStore(store.id, store.name)}
                              disabled={isSyncingStore}
                              className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 cursor-pointer whitespace-nowrap"
                              title={`Retry sync for ${store.name}`}
                            >
                              <RotateCcw size={12} className={isSyncingStore ? 'animate-spin' : ''} />
                              <span>{isSyncingStore ? 'Syncing...' : 'Retry'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSyncSingleStore(store.id, store.name)}
                              disabled={isSyncingStore}
                              className="btn-secondary btn-sm inline-flex items-center gap-1 font-bold text-2xs py-1 px-2.5 cursor-pointer whitespace-nowrap"
                              title={`Sync catalog to ${store.name}`}
                            >
                              <RefreshCw size={12} className={isSyncingStore ? 'animate-spin text-primary-600' : ''} />
                              <span>{isSyncingStore ? 'Syncing...' : 'Sync'}</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW STORE DETAILS MODAL --- */}
      {viewStore && (
        <Modal
          open
          onClose={() => setViewStore(null)}
          title={`Store Overview: ${viewStore.name}`}
          subtitle={`Platform: ${viewStore.platform} · Endpoint: ${viewStore.url}`}
          size="lg"
          footer={
            <button onClick={() => setViewStore(null)} className="btn-secondary">Close</button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Platform Platform', value: viewStore.platform },
                { label: 'Connection Status', value: <Badge variant={viewStore.connectionStatus === 'connected' ? 'success' : 'danger'} dot>{viewStore.connectionStatus}</Badge> },
                { label: 'Sync Status', value: <Badge variant={statusToVariant(viewStore.syncStatus)} dot>{viewStore.syncStatus}</Badge> },
                { label: 'Published SKUs', value: viewStore.productsPublished.toLocaleString() },
                { label: 'Total Catalog SKUs', value: viewStore.totalProducts.toLocaleString() },
                { label: 'Sync Interval', value: viewStore.syncInterval || '15 mins' },
                { label: 'Last Success Sync', value: viewStore.lastSuccessSync },
                { label: 'Last Failed Sync', value: viewStore.lastFailedSync || 'None' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                  <p className="text-2xs text-slate-400 font-semibold uppercase tracking-wider mb-1">{item.label}</p>
                  <div className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.value}</div>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Terminal size={14} className="text-primary-600" /> Storefront API Health & Audit Trace
                </p>
                <span className="text-2xs text-emerald-600 font-mono font-bold">200 OK</span>
              </div>
              <div className="bg-slate-900 text-slate-300 rounded-xl p-4 space-y-1.5 font-mono text-xs max-h-36 overflow-y-auto border border-slate-800">
                <p><span className="text-slate-500">1.</span> Authenticated REST API token for {viewStore.platform} node.</p>
                <p><span className="text-slate-500">2.</span> Pushing {viewStore.productsPublished.toLocaleString()} validated products to storefront endpoint.</p>
                <p><span className="text-slate-500">3.</span> Category taxonomy mapping verified (100% matched).</p>
                <p><span className="text-emerald-400">4. Connection status: ACTIVE. Sync status: {viewStore.syncStatus.toUpperCase()}.</span></p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* --- STORE SETTINGS MODAL --- */}
      {settingsStore && (
        <Modal
          open
          onClose={() => setSettingsStore(null)}
          title={`Configure Store: ${settingsStore.name}`}
          subtitle={`Platform: ${settingsStore.platform}`}
          size="md"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Store URL</label>
              <input
                type="text"
                disabled
                value={settingsStore.url}
                className="input bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">API Access Token / Key *</label>
              <input
                type="text"
                required
                value={settingsFormData.apiKey}
                onChange={e => setSettingsFormData({ ...settingsFormData, apiKey: e.target.value })}
                className="input font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">Auto-Sync Frequency</label>
              <select
                value={settingsFormData.syncInterval}
                onChange={e => setSettingsFormData({ ...settingsFormData, syncInterval: e.target.value })}
                className="select"
              >
                <option value="5 mins">Every 5 minutes</option>
                <option value="15 mins">Every 15 minutes</option>
                <option value="30 mins">Every 30 minutes</option>
                <option value="1 hour">Every 1 hour</option>
                <option value="6 hours">Every 6 hours</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button type="button" onClick={() => setSettingsStore(null)} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Configuration</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
