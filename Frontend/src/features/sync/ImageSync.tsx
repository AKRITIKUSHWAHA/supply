import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Image, RefreshCw, XCircle, CheckCircle2, AlertTriangle, Eye,
  Download, Search, RotateCcw, ExternalLink, Layers, Copy, Zap, Sliders, History, FileUp
} from 'lucide-react'
import { SectionHeader, HealthIndicator } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'

export type ImageStatusType =
  | 'Uploaded'
  | 'Optimized'
  | 'CDN Cached'
  | 'Published'
  | 'Validated'
  | 'Missing'
  | '404'
  | 'Compression Failed'
  | 'Duplicate'
  | 'Invalid Format'
  | 'Oversized'

export interface ImageAssetItem {
  id: string
  product: string
  sku: string
  supplier: string
  imageType: 'Hero' | 'Gallery' | 'Thumbnail' | 'Technical Diagram'
  rawUrl: string
  cdnUrl: string
  resolution: string
  fileSize: string
  compressionRatio: string
  status: ImageStatusType
  lastSync: string
  history?: { timestamp: string; action: string; note: string }[]
}

const INITIAL_IMAGE_ITEMS: ImageAssetItem[] = [
  {
    id: 'img-101',
    product: 'AMD Ryzen 9 7950X Processor 16-Core',
    sku: 'CPU-AMD-7950X',
    supplier: 'TechParts International',
    imageType: 'Hero',
    rawUrl: 'https://techparts-cdn.com/raw/cpu-7950x-front.jpg',
    cdnUrl: 'https://cdn.supplybridge.io/media/cpu-7950x-thumb.webp',
    resolution: '1920x1080',
    fileSize: '148 KB',
    compressionRatio: '-68% WebP',
    status: 'Published',
    lastSync: '4 min ago',
    history: [
      { timestamp: '2026-07-27 16:15', action: 'CDN Upload', note: 'Pushed to CDN distribution network' },
      { timestamp: '2026-07-27 16:14', action: 'WebP Conversion', note: 'Compressed from 460KB JPEG to 148KB WebP' },
      { timestamp: '2026-07-27 16:10', action: 'Supplier Feed Import', note: 'Received from TechParts REST API' },
    ],
  },
  {
    id: 'img-102',
    product: 'NVIDIA GeForce RTX 4090 24GB OC',
    sku: 'GPU-NV-4090',
    supplier: 'TechParts International',
    imageType: 'Hero',
    rawUrl: 'https://techparts-cdn.com/raw/rtx-4090-box.jpg',
    cdnUrl: 'https://cdn.supplybridge.io/media/rtx-4090-thumb.webp',
    resolution: '3840x2160',
    fileSize: '320 KB',
    compressionRatio: '-72% WebP',
    status: 'Optimized',
    lastSync: '12 min ago',
    history: [
      { timestamp: '2026-07-27 16:00', action: 'Image Optimization', note: 'WebP conversion completed' },
    ],
  },
  {
    id: 'img-103',
    product: 'DDR5 32GB 6000MHz RGB Memory Kit',
    sku: 'RAM-DDR5-001',
    supplier: 'TechParts International',
    imageType: 'Gallery',
    rawUrl: 'https://techparts-cdn.com/raw/ddr5-ram-kit.jpg',
    cdnUrl: 'https://cdn.supplybridge.io/media/ddr5-ram-thumb.webp',
    resolution: '1200x1200',
    fileSize: '92 KB',
    compressionRatio: '-55% WebP',
    status: 'CDN Cached',
    lastSync: '18 min ago',
  },
  {
    id: 'img-104',
    product: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD',
    sku: 'SSD-990P-2TB',
    supplier: 'GlobalSource Limited',
    imageType: 'Technical Diagram',
    rawUrl: 'https://globalsource-feeds.org/assets/ssd990.png',
    cdnUrl: 'https://cdn.supplybridge.io/media/ssd-990p-thumb.webp',
    resolution: '1600x1200',
    fileSize: '115 KB',
    compressionRatio: '-60% WebP',
    status: 'Published',
    lastSync: '28 min ago',
  },
  {
    id: 'img-105',
    product: 'Corsair RM1000x 1000W Modular PSU',
    sku: 'PSU-COR-1000W',
    supplier: 'GlobalSource Limited',
    imageType: 'Hero',
    rawUrl: '',
    cdnUrl: '',
    resolution: '—',
    fileSize: '0 KB',
    compressionRatio: '0%',
    status: 'Missing',
    lastSync: '1 hr ago',
  },
  {
    id: 'img-106',
    product: 'Logitech MX Master 3S Wireless Mouse',
    sku: 'MOUSE-MX3S',
    supplier: 'Acme Distributors',
    imageType: 'Thumbnail',
    rawUrl: 'https://acme-dist.com/media/mx3s-broken.png',
    cdnUrl: '',
    resolution: 'Unknown',
    fileSize: '0 KB',
    compressionRatio: '0%',
    status: '404',
    lastSync: '3 hr ago',
  },
  {
    id: 'img-107',
    product: 'Keychron Q1 Pro Mechanical Keyboard',
    sku: 'KEY-Q1PRO',
    supplier: 'QuickShip LLC',
    imageType: 'Hero',
    rawUrl: 'https://quickship.com/feeds/keychron-q1.jpg',
    cdnUrl: 'https://cdn.supplybridge.io/media/keychron-q1-thumb.webp',
    resolution: '2048x1536',
    fileSize: '165 KB',
    compressionRatio: '-64% WebP',
    status: 'Validated',
    lastSync: '5 min ago',
  },
  {
    id: 'img-108',
    product: 'ASUS ROG Swift 27" 1440P Monitor',
    sku: 'MON-ASUS-27',
    supplier: 'PrimeSupply Corp',
    imageType: 'Hero',
    rawUrl: 'https://primesupply.net/img/asus-27.jpg',
    cdnUrl: 'https://cdn.supplybridge.io/media/asus-27-thumb.webp',
    resolution: '2560x1440',
    fileSize: '210 KB',
    compressionRatio: '-58% WebP',
    status: 'Compression Failed',
    lastSync: '2 hr ago',
  },
]

export const ImageSync: React.FC = () => {
  const [items, setItems] = useState<ImageAssetItem[]>(INITIAL_IMAGE_ITEMS)
  const [syncingAll, setSyncingAll] = useState(false)
  const [activeItemId, setActiveItemId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Searches & Filters
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [imageTypeFilter, setImageTypeFilter] = useState('all')
  const [galleryTab, setGalleryTab] = useState<'all' | 'pending' | 'missing' | 'broken' | 'published'>('all')

  // Modals
  const [previewItem, setPreviewItem] = useState<ImageAssetItem | null>(null)
  const [historyItem, setHistoryItem] = useState<ImageAssetItem | null>(null)
  const [replaceItem, setReplaceItem] = useState<ImageAssetItem | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  // --- Dynamic Telemetry KPI Cards ---
  const totalAssetsCount = items.length
  const optimizedCount = items.filter(i => i.status === 'Optimized' || i.status === 'CDN Cached' || i.status === 'Published' || i.status === 'Validated').length
  const cdnOptimizedRatePct = totalAssetsCount > 0 ? Math.round((optimizedCount / totalAssetsCount) * 100) : 100
  const totalStorageSavedMB = (items.length * 0.45).toFixed(1)
  const syncIssuesCount = items.filter(i => i.status === '404' || i.status === 'Missing' || i.status === 'Compression Failed' || i.status === 'Invalid Format' || i.status === 'Oversized').length

  // List of unique suppliers
  const suppliersList = ['all', ...Array.from(new Set(items.map(i => i.supplier)))]

  // --- Supplier Feed Cards ---
  const supplierFeedCards = useMemo(() => {
    const uniqueSuppliers = Array.from(new Set(items.map(i => i.supplier)))

    return uniqueSuppliers.map(supName => {
      const supItems = items.filter(i => i.supplier === supName)
      const received = supItems.length * 12
      const optimized = supItems.filter(i => i.status === 'Optimized' || i.status === 'CDN Cached' || i.status === 'Published' || i.status === 'Validated').length * 12
      const failed = supItems.filter(i => i.status === '404' || i.status === 'Compression Failed' || i.status === 'Missing').length
      const status: 'Healthy' | 'Syncing' | 'Degraded' | 'Critical' = failed > 1 ? 'Critical' : failed === 1 ? 'Degraded' : 'Healthy'

      return {
        supplier: supName,
        imagesReceived: received,
        imagesOptimized: optimized,
        imagesFailed: failed,
        lastFeedTime: supItems[0]?.lastSync || 'Just now',
        feedDuration: '1.2s',
        overallStatus: status,
      }
    })
  }, [items])

  // --- Handlers for Image Workflow ---

  // 1. Sync All Images
  const handleSyncAllImages = () => {
    setSyncingAll(true)
    showNotification('Starting Image Workflow: Feed Import → Validation → WebP Conversion → CDN Publishing...')

    setTimeout(() => {
      setItems(prev =>
        prev.map(item => {
          if (item.status === 'Missing') return item
          return {
            ...item,
            status: 'Published',
            cdnUrl: item.rawUrl ? item.rawUrl.replace(/https:\/\/[^/]+/, 'https://cdn.supplybridge.io/media').replace(/\.(jpg|png)/, '.webp') : '',
            compressionRatio: '-68% WebP',
            fileSize: '145 KB',
            lastSync: 'Just now',
          }
        })
      )
      setSyncingAll(false)
      showNotification('Image Synchronization & CDN WebP publishing completed!')
    }, 2000)
  }

  // 2. Retry Image Processing
  const handleRetryImage = (item: ImageAssetItem) => {
    setActiveItemId(item.id)
    showNotification(`Re-fetching image URL from supplier feed for SKU "${item.sku}"...`)

    setTimeout(() => {
      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? {
                ...i,
                status: 'Published',
                cdnUrl: `https://cdn.supplybridge.io/media/${item.sku.toLowerCase()}-thumb.webp`,
                resolution: '1920x1080',
                fileSize: '160 KB',
                compressionRatio: '-65% WebP',
                lastSync: 'Just now',
              }
            : i
        )
      )
      setActiveItemId(null)
      showNotification(`Image successfully recovered and published to CDN for SKU "${item.sku}"!`)
    }, 1400)
  }

  // 3. Force Optimize WebP
  const handleOptimizeImage = (item: ImageAssetItem) => {
    setActiveItemId(item.id)
    setTimeout(() => {
      setItems(prev =>
        prev.map(i =>
          i.id === item.id
            ? { ...i, status: 'Optimized', compressionRatio: '-75% WebP', fileSize: '110 KB', lastSync: 'Just now' }
            : i
        )
      )
      setActiveItemId(null)
      showNotification(`WebP compression re-optimized for SKU "${item.sku}".`)
    }, 1000)
  }

  // Copy CDN URL
  const handleCopyUrl = (url: string) => {
    if (!url) {
      showNotification('No CDN URL available for this item.')
      return
    }
    navigator.clipboard.writeText(url)
    showNotification('Published CDN URL copied to clipboard!')
  }

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const query = search.toLowerCase()
      const matchSearch =
        item.product.toLowerCase().includes(query) ||
        item.sku.toLowerCase().includes(query) ||
        item.supplier.toLowerCase().includes(query)

      const matchSupplier = supplierFilter === 'all' || item.supplier === supplierFilter
      const matchStatus = statusFilter === 'all' || item.status.toLowerCase().replace(/\s+/g, '_') === statusFilter
      const matchType = imageTypeFilter === 'all' || item.imageType === imageTypeFilter

      // Gallery Tab Filter
      let matchTab = true
      if (galleryTab === 'pending') matchTab = item.status === 'Uploaded' || item.status === 'Optimized'
      else if (galleryTab === 'missing') matchTab = item.status === 'Missing'
      else if (galleryTab === 'broken') matchTab = item.status === '404' || item.status === 'Compression Failed'
      else if (galleryTab === 'published') matchTab = item.status === 'Published' || item.status === 'CDN Cached'

      return matchSearch && matchSupplier && matchStatus && matchType && matchTab
    })
  }, [items, search, supplierFilter, statusFilter, imageTypeFilter, galleryTab])

  // Export CSV Audit Report
  const handleExportCSV = () => {
    showNotification('Generating Image Media Audit CSV Report...')
    const headers = 'Product Title,Master SKU,Supplier,Image Type,Resolution,File Size,Compression Ratio,Status,Published CDN URL,Last Sync\n'
    const rows = filteredItems.map(i =>
      `"${i.product}","${i.sku}","${i.supplier}","${i.imageType}","${i.resolution}","${i.fileSize}","${i.compressionRatio}","${i.status}","${i.cdnUrl}","${i.lastSync}"`
    ).join('\n')

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Image_Assets_Report_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Image Audit CSV downloaded!')
  }

  // Status Badge Styling Helper
  const getStatusBadge = (status: ImageStatusType) => {
    switch (status) {
      case 'Published':   return <Badge variant="success" dot>Published</Badge>
      case 'CDN Cached':  return <Badge variant="success" dot>CDN Cached</Badge>
      case 'Optimized':   return <Badge variant="info" dot>Optimized</Badge>
      case 'Validated':   return <Badge variant="info" dot>Validated</Badge>
      case 'Uploaded':    return <Badge variant="warning" dot>Uploaded</Badge>
      case '404':         return <Badge variant="danger" dot>404 Link</Badge>
      case 'Missing':     return <Badge variant="neutral">Missing Media</Badge>
      case 'Compression Failed': return <Badge variant="danger" dot>Failed</Badge>
      default:            return <Badge variant="neutral">{status}</Badge>
    }
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
        title="Image Synchronization"
        subtitle="Automated image ingestion, WebP optimization, CDN distribution, and 404 URL resolution"
        actions={
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer px-3 text-xs"
              title="Download Image Audit CSV Report"
            >
              <Download size={14} className="text-emerald-600 dark:text-emerald-400" /> Export <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={handleSyncAllImages}
              disabled={syncingAll}
              className="btn-primary btn-sm flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer px-3 text-xs whitespace-nowrap"
            >
              <RefreshCw size={14} className={syncingAll ? 'animate-spin' : ''} />
              <span>{syncingAll ? 'Processing...' : 'Sync All Images Now'}</span>
            </button>
          </div>
        }
      />

      {/* Workflow Step Indicator Visual Banner */}
      <div className="card p-3.5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
        <p className="text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
          Official Image Processing & Distribution Workflow Pipeline
        </p>
        <div className="grid grid-cols-4 lg:grid-cols-8 gap-1.5 text-center text-2xs">
          {[
            { step: '1. Supplier Feed', active: true },
            { step: '2. Image Validation', active: true },
            { step: '3. Image Optimization', active: true },
            { step: '4. WebP Conversion', active: true },
            { step: '5. CDN Upload', active: true },
            { step: '6. Storefront Publishing', active: true },
            { step: '7. Verification', active: true },
            { step: '8. Completed', active: true },
          ].map((s, idx) => (
            <div key={idx} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-850 border border-slate-200/80 dark:border-slate-800 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1">
              <Zap size={11} className="text-amber-500 flex-shrink-0" />
              <span className="truncate">{s.step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Telemetry KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {[
          { label: 'TOTAL MEDIA ASSETS', value: `${totalAssetsCount} Assets`, color: 'text-slate-900 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800', sub: 'Indexed across catalog' },
          { label: 'CDN OPTIMIZED RATE', value: `${cdnOptimizedRatePct}%`, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50', sub: `${optimizedCount} of ${totalAssetsCount} Assets WebP Cached` },
          { label: 'STORAGE SAVED (WEBP)', value: `${totalStorageSavedMB} MB`, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-900/50', sub: 'Average 68% compression' },
          { label: 'IMAGE SYNC ISSUES', value: `${syncIssuesCount} Issues`, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/50', sub: 'Requires refetch or replacement' },
        ].map((card, i) => (
          <div key={i} className={`p-4 rounded-2xl shadow-xs flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
            <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
            <p className={`text-xl sm:text-2xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
            <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Supplier Feed Cards */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Layers size={16} className="text-primary-600 dark:text-primary-400" /> Supplier Image Feed Telemetry
          </h3>
          <Badge variant="primary" dot>Live Ingestion Feeds</Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {supplierFeedCards.map(s => (
            <div key={s.supplier} className="p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate pr-1" title={s.supplier}>{s.supplier}</span>
                <HealthIndicator status={s.overallStatus === 'Healthy' ? 'healthy' : s.overallStatus === 'Degraded' ? 'degraded' : 'critical'} label={s.overallStatus} />
              </div>
              <div className="text-2xs text-slate-500 space-y-1">
                <div className="flex justify-between"><span>Received:</span><span className="font-bold text-slate-700 dark:text-slate-200">{s.imagesReceived}</span></div>
                <div className="flex justify-between"><span>Optimized:</span><span className="font-bold text-emerald-600 dark:text-emerald-400">{s.imagesOptimized}</span></div>
                <div className="flex justify-between"><span>Failed:</span><span className={`font-bold ${s.imagesFailed > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{s.imagesFailed}</span></div>
                <div className="flex justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60"><span className="text-slate-400">Duration:</span><span className="font-mono">{s.feedDuration}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Filter & Media Gallery Section */}
      <div className="card p-5 border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900">
        {/* Search & Enterprise Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search image by SKU, title, or supplier..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-9 text-xs"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Gallery Views Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
              {[
                { id: 'all', label: 'All Media' },
                { id: 'pending', label: 'Pending Optimization' },
                { id: 'missing', label: 'Missing Images' },
                { id: 'broken', label: 'Broken Images' },
                { id: 'published', label: 'Recently Published' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setGalleryTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                    galleryTab === tab.id
                      ? 'bg-primary-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <select
              value={supplierFilter}
              onChange={e => setSupplierFilter(e.target.value)}
              className="select text-xs w-auto py-1.5"
            >
              <option value="all">All Suppliers</option>
              {suppliersList.filter(s => s !== 'all').map(sup => (
                <option key={sup} value={sup}>{sup}</option>
              ))}
            </select>

            <select
              value={imageTypeFilter}
              onChange={e => setImageTypeFilter(e.target.value)}
              className="select text-xs w-auto py-1.5"
            >
              <option value="all">All Image Types</option>
              <option value="Hero">Hero</option>
              <option value="Gallery">Gallery</option>
              <option value="Thumbnail">Thumbnail</option>
              <option value="Technical Diagram">Technical Diagram</option>
            </select>
          </div>
        </div>

        {/* Main Image Asset Table (No Raw URLs Exposed Directly - Replaced with Action Suite) */}
        <div className="table-container w-full overflow-x-auto scrollbar-thin">
          <table className="table min-w-[1000px] w-full">
            header
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                <th className="whitespace-nowrap px-4 py-3.5">PRODUCT TITLE</th>
                <th className="whitespace-nowrap px-4 py-3.5">MASTER SKU</th>
                <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER</th>
                <th className="whitespace-nowrap px-4 py-3.5">IMAGE TYPE</th>
                <th className="whitespace-nowrap px-4 py-3.5">RESOLUTION & SIZE</th>
                <th className="whitespace-nowrap px-4 py-3.5">COMPRESSION</th>
                <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                <th className="whitespace-nowrap px-4 py-3.5">PUBLISHED CDN ACTIONS</th>
                <th className="whitespace-nowrap px-4 py-3.5">LAST SYNC</th>
                <th className="whitespace-nowrap px-4 py-3.5 text-right pr-4">WORKFLOW ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 text-xs">
                    No image media records match your search and filter criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map(row => {
                  const isSyncingRow = activeItemId === row.id

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td data-label="Product Title" className="whitespace-nowrap px-4 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-normal max-w-xs truncate">{row.product}</p>
                      </td>
                      <td data-label="Master SKU" className="whitespace-nowrap px-4 py-3.5">
                        <code className="mono text-xs">{row.sku}</code>
                      </td>
                      <td data-label="Supplier" className="whitespace-nowrap px-4 py-3.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {row.supplier}
                      </td>
                      <td data-label="Image Type" className="whitespace-nowrap px-4 py-3.5">
                        <span className="text-2xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
                          {row.imageType}
                        </span>
                      </td>
                      <td data-label="Resolution & Size" className="whitespace-nowrap px-4 py-3.5 font-mono text-2xs text-slate-600 dark:text-slate-300">
                        {row.resolution} ({row.fileSize})
                      </td>
                      <td data-label="Compression" className="whitespace-nowrap px-4 py-3.5 font-mono text-2xs font-bold text-emerald-600 dark:text-emerald-400">
                        {row.compressionRatio}
                      </td>
                      <td data-label="Status" className="whitespace-nowrap px-4 py-3.5">
                        {getStatusBadge(row.status)}
                      </td>
                      <td data-label="CDN Actions" className="whitespace-nowrap px-4 py-3.5">
                        {/* Enterprise Action Suite instead of raw URLs */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => setPreviewItem(row)}
                            className="btn-secondary btn-sm py-0.5 px-2 text-2xs cursor-pointer flex items-center gap-1 font-semibold whitespace-nowrap"
                            title="Preview Image Asset"
                          >
                            <Eye size={12} /> View
                          </button>
                          <button
                            onClick={() => handleCopyUrl(row.cdnUrl || row.rawUrl)}
                            className="btn-secondary btn-sm py-0.5 px-2 text-2xs cursor-pointer flex items-center gap-1 font-semibold whitespace-nowrap"
                            title="Copy Published CDN URL to Clipboard"
                          >
                            <Copy size={12} /> Copy URL
                          </button>
                          {row.cdnUrl && row.cdnUrl.startsWith('http') && (
                            <a
                              href={row.cdnUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="btn-secondary btn-sm py-0.5 px-2 text-2xs cursor-pointer inline-flex items-center gap-1 font-semibold whitespace-nowrap"
                              title="Open CDN Image in New Tab"
                            >
                              <ExternalLink size={12} /> Open
                            </a>
                          )}
                        </div>
                      </td>
                      <td data-label="Last Sync" className="whitespace-nowrap px-4 py-3.5 font-mono text-2xs text-slate-500 dark:text-slate-400">
                        {row.lastSync}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1 flex-wrap">
                          <button
                            onClick={() => handleRetryImage(row)}
                            disabled={isSyncingRow}
                            className="btn-secondary btn-sm py-1 px-2 text-2xs font-bold cursor-pointer whitespace-nowrap"
                            title="Retry Download & WebP Processing"
                          >
                            <RefreshCw size={12} className={isSyncingRow ? 'animate-spin text-primary-600' : ''} /> Retry
                          </button>
                          <button
                            onClick={() => handleOptimizeImage(row)}
                            className="btn-secondary btn-sm py-1 px-2 text-2xs font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer whitespace-nowrap"
                            title="Force WebP Re-Optimization"
                          >
                            <Zap size={12} /> Optimize
                          </button>
                          <button
                            onClick={() => setReplaceItem(row)}
                            className="btn-secondary btn-sm py-1 px-2 text-2xs font-bold text-amber-600 dark:text-amber-400 cursor-pointer whitespace-nowrap"
                            title="Replace Image Asset"
                          >
                            <FileUp size={12} /> Replace
                          </button>
                          <button
                            onClick={() => setHistoryItem(row)}
                            className="btn-icon whitespace-nowrap"
                            title="View Image Audit History"
                          >
                            <History size={13} />
                          </button>
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

      {/* --- PREVIEW MODAL --- */}
      {previewItem && (
        <Modal
          open
          onClose={() => setPreviewItem(null)}
          title={`Image Preview: ${previewItem.sku}`}
          subtitle={`Product: ${previewItem.product}`}
          size="md"
          footer={<button onClick={() => setPreviewItem(null)} className="btn-secondary">Close</button>}
        >
          <div className="space-y-4 text-center">
            <div className="w-64 h-64 mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-900">
              {previewItem.cdnUrl || previewItem.rawUrl ? (
                <img
                  src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&auto=format&fit=crop&q=80"
                  alt={previewItem.product}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Image size={48} className="text-slate-300 dark:text-slate-600" />
              )}
            </div>
            <div className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 text-left space-y-1.5 font-mono">
              <div className="flex justify-between"><span className="text-slate-400">Image Type:</span><span className="font-bold text-slate-800 dark:text-slate-100">{previewItem.imageType}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Resolution:</span><span className="font-bold">{previewItem.resolution}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">File Size:</span><span className="font-bold">{previewItem.fileSize}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">WebP Compression:</span><span className="font-bold text-emerald-600">{previewItem.compressionRatio}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Published CDN URL:</span><span className="font-bold text-indigo-600 text-2xs truncate max-w-[200px]">{previewItem.cdnUrl || 'Pending'}</span></div>
            </div>
          </div>
        </Modal>
      )}

      {/* --- AUDIT HISTORY MODAL --- */}
      {historyItem && (
        <Modal
          open
          onClose={() => setHistoryItem(null)}
          title={`Image Audit History: ${historyItem.sku}`}
          subtitle={`Product: ${historyItem.product}`}
          size="md"
          footer={<button onClick={() => setHistoryItem(null)} className="btn-secondary">Close History</button>}
        >
          <div className="space-y-3 text-xs">
            {(historyItem.history || [
              { timestamp: '2026-07-27 16:20', action: 'CDN Upload', note: 'Published WebP asset to global CDN distribution node.' },
              { timestamp: '2026-07-27 16:15', action: 'WebP Optimization', note: 'Compressed JPEG asset with 68% size reduction.' },
              { timestamp: '2026-07-27 16:00', action: 'Supplier Feed Ingest', note: 'Received image URL from supplier REST API feed.' },
            ]).map((h, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-100">{h.action}</span>
                  <span className="font-mono text-2xs text-slate-400">{h.timestamp}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 font-medium">{h.note}</p>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* --- REPLACE IMAGE ASSET MODAL --- */}
      {replaceItem && (
        <Modal
          open
          onClose={() => setReplaceItem(null)}
          title={`Replace Image Asset: ${replaceItem.sku}`}
          subtitle={`Product: ${replaceItem.product}`}
          size="md"
        >
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">New Image Source URL *</label>
              <input
                type="url"
                placeholder="https://supplier-assets.com/new_hd_image.jpg"
                className="input"
              />
            </div>
            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button onClick={() => setReplaceItem(null)} className="btn-secondary">Cancel</button>
              <button
                onClick={() => {
                  showNotification(`Image asset replaced for SKU "${replaceItem.sku}"!`)
                  setReplaceItem(null)
                }}
                className="btn-primary"
              >
                Upload & Replace
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
