import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, RefreshCw, ExternalLink, CheckCircle2, Plus, Edit2, Trash2, Key, Sliders, ShieldCheck, DollarSign, Package } from 'lucide-react'
import { SectionHeader } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { statusToVariant, timeAgo } from '../../utils'

export interface StorefrontItem {
  id: string
  name: string
  type: string
  storeKey: string
  autoRoutingRule: string
  url: string
  region: string
  status: string
  syncStatus: string
  productCount: number
  inventoryCron: string
  pricingCron: string
  catalogCron: string
  lastSync: string | null
  createdAt: string
}

export const StoreManagement: React.FC = () => {
  const navigate = useNavigate()

  const [storesList, setStoresList] = useState<StorefrontItem[]>([])
  const [selectedStore, setSelectedStore] = useState<StorefrontItem | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const [editingStore, setEditingStore] = useState<StorefrontItem | null>(null)
  const [deletingStore, setDeletingStore] = useState<StorefrontItem | null>(null)

  const [syncingStoreId, setSyncingStoreId] = useState<string | null>(null)
  const [testingStoreId, setTestingStoreId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Zero-Code Onboarding Form State
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    platform: 'Shopify',
    storeKey: '',
    autoRoutingRule: 'ALL',
    region: 'North America',
    apiKey: '',
    apiSecret: '',
    inventoryCron: '*/15 * * * *',
    pricingCron: '0 * * * *',
  })

  const fetchStores = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stores')
      const data = await res.json()
      if (Array.isArray(data)) {
        setStoresList(data)
      }
    } catch (err) {
      console.error('Failed to fetch storefronts:', err)
    }
  }

  useEffect(() => {
    fetchStores()
  }, [])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Handlers ---
  const handlePushSyncStore = async (id: string, name: string) => {
    setSyncingStoreId(id)
    try {
      const res = await fetch(`http://localhost:5000/api/stores/${id}/push-sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncType: 'FULL' }),
      })
      const result = await res.json()
      showNotification(`Direct Push Sync completed: ${result.pushedProductsCount || 50} products updated on ${name}!`)
      fetchStores()
    } catch (err) {
      console.error('Push sync failed:', err)
    } finally {
      setSyncingStoreId(null)
    }
  }

  const handlePushInventory = async (id: string, name: string) => {
    setSyncingStoreId(id)
    try {
      await fetch(`http://localhost:5000/api/stores/${id}/push-inventory`, { method: 'POST' })
      showNotification(`Inventory stock pushed successfully to ${name}!`)
      fetchStores()
    } catch (err) {
      console.error('Push inventory failed:', err)
    } finally {
      setSyncingStoreId(null)
    }
  }

  const handlePushPricing = async (id: string, name: string) => {
    setSyncingStoreId(id)
    try {
      await fetch(`http://localhost:5000/api/stores/${id}/push-pricing`, { method: 'POST' })
      showNotification(`Price updates pushed successfully to ${name}!`)
      fetchStores()
    } catch (err) {
      console.error('Push pricing failed:', err)
    } finally {
      setSyncingStoreId(null)
    }
  }

  const handleTestConnection = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTestingStoreId(id)
    try {
      const res = await fetch(`http://localhost:5000/api/stores/${id}/test-connection`, { method: 'POST' })
      const result = await res.json()
      showNotification(`Connection Verified: ${result.message}`)
      fetchStores()
    } catch (err) {
      console.error('Connection test failed:', err)
    } finally {
      setTestingStoreId(null)
    }
  }

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      url: '',
      platform: 'Shopify',
      storeKey: '',
      autoRoutingRule: 'ALL',
      region: 'North America',
      apiKey: '',
      apiSecret: '',
      inventoryCron: '*/15 * * * *',
      pricingCron: '0 * * * *',
    })
    setAddOpen(true)
  }

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.url.trim()) {
      alert('Please enter Storefront Name and URL.')
      return
    }

    try {
      const key = formData.storeKey.trim() || formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const res = await fetch('http://localhost:5000/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
          platform: formData.platform,
          storeKey: key,
          autoRoutingRule: formData.autoRoutingRule,
          region: formData.region,
          apiKey: formData.apiKey,
          apiSecret: formData.apiSecret,
          inventoryCron: formData.inventoryCron,
          pricingCron: formData.pricingCron,
        }),
      })
      const created = await res.json()
      setStoresList((prev) => [created, ...prev])
      setAddOpen(false)
      showNotification(`Zero-Code Storefront "${created.name}" (Key: ${created.storeKey}) connected!`)
    } catch (err) {
      console.error('Failed to create store:', err)
    }
  }

  const handleOpenEdit = (store: StorefrontItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingStore(store)
    setFormData({
      name: store.name,
      url: store.url,
      platform: store.type,
      storeKey: store.storeKey,
      autoRoutingRule: store.autoRoutingRule || 'ALL',
      region: store.region || 'North America',
      apiKey: '••••••••••••••••',
      apiSecret: '••••••••••••••••',
      inventoryCron: store.inventoryCron || '*/15 * * * *',
      pricingCron: store.pricingCron || '0 * * * *',
    })
    setEditOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingStore || !formData.name.trim() || !formData.url.trim()) return

    try {
      const res = await fetch(`http://localhost:5000/api/stores/${editingStore.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          url: formData.url.startsWith('http') ? formData.url : `https://${formData.url}`,
          platform: formData.platform,
          storeKey: formData.storeKey,
          autoRoutingRule: formData.autoRoutingRule,
          inventoryCron: formData.inventoryCron,
          pricingCron: formData.pricingCron,
        }),
      })
      const updated = await res.json()
      setStoresList((prev) => prev.map((s) => (s.id === editingStore.id ? updated : s)))
      setEditOpen(false)
      setEditingStore(null)
      showNotification(`Storefront "${formData.name}" configuration updated!`)
    } catch (err) {
      console.error('Failed to update store:', err)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingStore) return

    try {
      await fetch(`http://localhost:5000/api/stores/${deletingStore.id}`, { method: 'DELETE' })
      setStoresList((prev) => prev.filter((s) => s.id !== deletingStore.id))
      showNotification(`Storefront "${deletingStore.name}" connection removed.`)
    } catch (err) {
      console.error('Failed to delete store:', err)
    } finally {
      setDeleteOpen(false)
      setDeletingStore(null)
    }
  }

  return (
    <div className="relative space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold border border-slate-700"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Storefront Synchronization Engine (Middleware Core)"
        subtitle="Manage connected ecommerce storefronts, store keys, auto-routing rules, and direct API push sync"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/sync/website')}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer font-bold text-xs"
            >
              <Globe size={14} className="text-primary-600 dark:text-primary-400" /> Website Sync Monitor
            </button>
            <button
              onClick={handleOpenAdd}
              type="button"
              className="btn-primary btn-sm flex items-center gap-1.5 cursor-pointer text-xs shadow-md font-bold"
            >
              <Plus size={14} /> Zero-Code Store Onboarding
            </button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Connected Storefronts', value: storesList.length, color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Active Direct Push APIs', value: storesList.filter((s) => s.status === 'active').length, color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Fully Synced Stores', value: storesList.filter((s) => s.syncStatus === 'synced').length, color: 'text-primary-600 dark:text-primary-400' },
          { label: 'Sync Errors', value: storesList.filter((s) => s.status === 'error' || s.syncStatus === 'failed').length, color: 'text-rose-600 dark:text-rose-400' },
        ].map((s) => (
          <div key={s.label} className="card px-4 py-3.5 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Storefront Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
        {storesList.map((store) => {
          const isSyncingThis = syncingStoreId === store.id || store.syncStatus === 'syncing'
          const isTestingThis = testingStoreId === store.id

          return (
            <div
              key={store.id}
              className="card p-5 hover:shadow-card-md transition-all flex flex-col justify-between border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3 cursor-pointer min-w-0 flex-1" onClick={() => setSelectedStore(store)}>
                    <div className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-900/60">
                      <Globe size={18} className="text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm hover:text-primary-600 transition-colors truncate" title={store.name}>
                        {store.name}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">{store.type} Direct API</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 self-start">
                    <Badge variant={statusToVariant(store.syncStatus)} dot>
                      {store.syncStatus}
                    </Badge>
                    <button
                      onClick={(e) => handleOpenEdit(store, e)}
                      className="btn-icon p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Edit Store Settings"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingStore(store)
                        setDeleteOpen(true)
                      }}
                      className="btn-icon p-1.5 rounded-lg text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      title="Remove Store Connection"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Store Keys & Routing Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-purple-200 dark:border-purple-800">
                    <Key size={10} /> KEY: {store.storeKey || 'anchorage_med'}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2.5 py-0.5 rounded-md flex items-center gap-1 border border-blue-200 dark:border-blue-800">
                    <Sliders size={10} /> RULE: {store.autoRoutingRule || 'ALL'}
                  </span>
                </div>

                <div
                  className="space-y-2 text-sm bg-slate-50/80 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-700/60 cursor-pointer"
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 text-xs">
                    <span>Assigned Products</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{store.productCount.toLocaleString()} SKUs</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 text-xs">
                    <span>Inventory Schedule</span>
                    <span className="font-mono text-slate-500 dark:text-slate-400">{store.inventoryCron || '*/15 * * * *'}</span>
                  </div>
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 text-xs">
                    <span>Last Sync Date</span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono">{store.lastSync ? timeAgo(store.lastSync) : 'Never'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-2">
                  <button
                    disabled={isSyncingThis}
                    className="btn-primary btn-sm flex-1 flex items-center justify-center gap-1.5 font-bold"
                    onClick={() => handlePushSyncStore(store.id, store.name)}
                  >
                    <RefreshCw size={12} className={isSyncingThis ? 'animate-spin' : ''} />
                    {isSyncingThis ? 'Pushing Sync...' : 'Push Full Catalog'}
                  </button>
                  <button
                    onClick={(e) => handleTestConnection(store.id, store.name, e)}
                    disabled={isTestingThis}
                    className="btn-secondary btn-sm flex items-center justify-center gap-1 font-semibold text-xs"
                    title="Test API Connectivity"
                  >
                    {isTestingThis ? <RefreshCw size={12} className="animate-spin" /> : <ShieldCheck size={14} className="text-emerald-500" />}
                    {isTestingThis ? 'Testing...' : 'Test API'}
                  </button>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handlePushInventory(store.id, store.name)} className="btn-ghost btn-xs text-xs text-slate-600 dark:text-slate-300 flex-1 flex items-center justify-center gap-1">
                    <Package size={12} /> Sync Inventory
                  </button>
                  <button onClick={() => handlePushPricing(store.id, store.name)} className="btn-ghost btn-xs text-xs text-slate-600 dark:text-slate-300 flex-1 flex items-center justify-center gap-1">
                    <DollarSign size={12} /> Sync Pricing
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ZERO-CODE STOREFRONT ONBOARDING MODAL */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Zero-Code Storefront Onboarding"
        subtitle="Onboard a new storefront without code redevelopment. Configure API credentials, store routing rules, and granular schedules below:"
        size="lg"
      >
        <form onSubmit={handleCreateStore} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Storefront Name *</label>
              <input
                className="input text-xs"
                placeholder="e.g., Anchorage Medical Store"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Store Platform Connector *</label>
              <select
                className="select font-semibold text-xs"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="Shopify">Shopify Store API</option>
                <option value="Shift4Shop">Shift4Shop REST Gateway v2</option>
                <option value="WooCommerce">WooCommerce REST API</option>
                <option value="Custom REST API">Custom Ecommerce REST Endpoint</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Storefront Endpoint URL *</label>
              <input
                className="input text-xs font-mono"
                placeholder="https://anchorage-med.myshopify.com"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Store Routing Key *</label>
              <input
                className="input text-xs font-mono"
                placeholder="e.g. anchorage_med"
                value={formData.storeKey}
                onChange={(e) => setFormData({ ...formData, storeKey: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">API Key / Token (AES Encrypted)</label>
            <input
              className="input text-xs font-mono"
              type="password"
              placeholder="shpat_1234567890"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary flex items-center gap-1.5 shadow-md">
              + Onboard Storefront
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT STOREFRONT MODAL */}
      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Storefront Settings"
        subtitle={`Configure API routing and sync settings for ${editingStore?.name}`}
        size="lg"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Storefront Name *</label>
            <input className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Platform Connector</label>
              <select className="select font-medium" value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })}>
                <option value="Shopify">Shopify Store API</option>
                <option value="WooCommerce">WooCommerce REST API</option>
                <option value="Shift4Shop">Shift4Shop (3dcart API)</option>
                <option value="Custom REST API">Custom Store API Gateway</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Store Routing Key</label>
              <input className="input font-mono" value={formData.storeKey} onChange={(e) => setFormData({ ...formData, storeKey: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Storefront Endpoint URL</label>
            <input className="input font-mono" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} required />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">Auto-Routing & Product Distribution Rule</label>
            <select className="select font-medium" value={formData.autoRoutingRule} onChange={(e) => setFormData({ ...formData, autoRoutingRule: e.target.value })}>
              <option value="ALL">Push All Master Catalog Products</option>
              <option value="MEDICAL_ONLY">Route Medical & Healthcare Products Only</option>
              <option value="RETAIL_ONLY">Route General Retail Products Only</option>
            </select>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
            <button type="button" onClick={() => setEditOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>

      {/* CONFIRM DELETE MODAL */}
      {deleteOpen && deletingStore && (
        <Modal
          open
          onClose={() => setDeleteOpen(false)}
          title="Remove Storefront Connection"
          subtitle={`Are you sure you want to disconnect ${deletingStore.name}?`}
          footer={
            <>
              <button onClick={() => setDeleteOpen(false)} className="btn-secondary">Cancel</button>
              <button onClick={handleConfirmDelete} className="btn-danger">Confirm Disconnect</button>
            </>
          }
        >
          <p className="text-xs text-slate-600">This action will remove the API connection and store routing rules for {deletingStore.name}. Existing storefront products will remain intact.</p>
        </Modal>
      )}
    </div>
  )
}
