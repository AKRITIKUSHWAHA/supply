import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart3, Download, Calendar, TrendingUp, CheckCircle2, FileSpreadsheet, FileText, Package, RefreshCw, AlertTriangle, ShieldCheck, Truck, Database, ChevronDown } from 'lucide-react'
import { SectionHeader, Tabs } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#f43f5e', '#7c3aed']

const supplierData = [
  { name: 'TechParts Int.', type: 'REST API', products: 18420, synced: 18420, errors: 0, passRate: 100, uptime: '99.9%' },
  { name: 'GlobalSource',    type: 'SFTP (CSV)', products: 14800, synced: 14600, errors: 200, passRate: 98.6, uptime: '99.5%' },
  { name: 'PrimeSup Corp',   type: 'FTP (XML)', products: 11200, synced: 11200, errors: 0, passRate: 100, uptime: '99.8%' },
  { name: 'AcmeDist.',       type: 'Excel Upload', products: 9800,  synced: 9200,  errors: 600, passRate: 93.8, uptime: '94.2%' },
  { name: 'QuickShip Co.',   type: 'REST API', products: 7300,  synced: 7300,  errors: 0, passRate: 100, uptime: '99.9%' },
]

const syncTrend = [
  { month: 'Feb', success: 98.2, failed: 1.8, durationMin: 34 },
  { month: 'Mar', success: 97.8, failed: 2.2, durationMin: 32 },
  { month: 'Apr', success: 99.1, failed: 0.9, durationMin: 30 },
  { month: 'May', success: 98.7, failed: 1.3, durationMin: 29 },
  { month: 'Jun', success: 99.3, failed: 0.7, durationMin: 28 },
  { month: 'Jul', success: 98.4, failed: 1.6, durationMin: 27 },
]

const catalogPie = [
  { name: 'Electronics', value: 45200 },
  { name: 'Home & Garden', value: 12300 },
  { name: 'Sporting Goods', value: 8900 },
  { name: 'Industrial', value: 6200 },
  { name: 'Other', value: 11729 },
]

const validationErrorsPie = [
  { name: 'Missing Price', value: 42 },
  { name: 'Duplicate SKU', value: 28 },
  { name: 'Missing Image', value: 18 },
  { name: 'Invalid Category', value: 12 },
]

export const Reports: React.FC = () => {
  const [tab, setTab] = useState('import_summary')
  const [dateRange, setDateRange] = useState('Last 30 days')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Real File Exporters ---
  const handleExportPDF = () => {
    showNotification('Generating PDF report...')

    const htmlContent = `
      <html>
        <head>
          <title>SupplyBridge_Operational_Report_${dateRange.replace(/\s+/g, '_')}</title>
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, sans-serif;
              padding: 40px;
              color: #1e293b;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #e2e8f0;
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .title {
              font-size: 24px;
              font-weight: 800;
              color: #4f46e5;
              margin: 0;
            }
            .subtitle {
              font-size: 14px;
              color: #64748b;
              margin-top: 5px;
              font-weight: 600;
            }
            .meta {
              font-size: 11px;
              color: #94a3b8;
              margin-top: 8px;
            }
            h2 {
              font-size: 15px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 25px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 6px;
            }
            ul {
              padding-left: 20px;
              margin: 10px 0;
            }
            li {
              margin-bottom: 6px;
              font-size: 13px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 15px;
              margin-bottom: 15px;
            }
            th, td {
              border: 1px solid #e2e8f0;
              padding: 10px 12px;
              text-align: left;
              font-size: 12px;
            }
            th {
              background-color: #f8fafc;
              font-weight: 700;
              color: #475569;
            }
            .footer {
              margin-top: 60px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 11px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">SUPPLYBRIDGE ENTERPRISE PIM</h1>
            <div class="subtitle">Operational Analytics & Reports - ${dateRange}</div>
            <div class="meta">Generated: ${new Date().toLocaleString()} | Report Tab: ${tab.toUpperCase()}</div>
          </div>

          <h2>1. Executive Summary & KPIs</h2>
          <ul>
            <li><strong>Total Configured Suppliers:</strong> 27 Partners</li>
            <li><strong>Active API/FTP Connections:</strong> 23 Connections</li>
            <li><strong>Total Catalog Products:</strong> 84,329 SKUs</li>
            <li><strong>Overall Sync Health:</strong> 99.8% Operational</li>
          </ul>

          <h2>2. Supplier Performance & Feed Pass Rates</h2>
          <table>
            <thead>
              <tr>
                <th>Supplier Partner</th>
                <th>Protocol / Connection Type</th>
                <th>Total SKUs</th>
                <th>Synced SKUs</th>
                <th>Validation Pass %</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              ${supplierData.map(s => `
                <tr>
                  <td><strong>${s.name}</strong></td>
                  <td>${s.type}</td>
                  <td>${s.products.toLocaleString()}</td>
                  <td>${s.synced.toLocaleString()}</td>
                  <td>${s.passRate}%</td>
                  <td>${s.uptime}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>3. Historical Sync Trends (Last 6 Months)</h2>
          <table>
            <thead>
              <tr>
                <th>Month</th>
                <th>Success Rate %</th>
                <th>Failed Rate %</th>
                <th>Avg Duration</th>
              </tr>
            </thead>
            <tbody>
              ${syncTrend.map(t => `
                <tr>
                  <td>${t.month}</td>
                  <td>${t.success}%</td>
                  <td>${t.failed}%</td>
                  <td>${t.durationMin} mins</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <h2>4. PIM Catalog Quality & Completeness Index</h2>
          <ul>
            <li><strong>Products With High-Res Images:</strong> 97.2%</li>
            <li><strong>Products With Full Descriptions:</strong> 91.5%</li>
            <li><strong>Category Taxonomy Mapped:</strong> 99.1%</li>
            <li><strong>Retail & MAP Pricing Set:</strong> 98.8%</li>
            <li><strong>Shift4Shop Storefront Published:</strong> 98.1%</li>
          </ul>

          <div class="footer">
            Confidential - SupplyBridge Enterprise PIM & Middleware Platform
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 800);
            }
          </script>
        </body>
      </html>
    `

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    if (!printWindow) {
      showNotification('Pop-up blocker active! Please allow pop-ups to export PDF.')
      return
    }

    // Revoke the blob URL after 5 seconds to free resources
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 5000)
  }

  const handleExportCSV = () => {
    showNotification('Generating CSV export file...')

    const fileName = `SupplyBridge_Analytics_${dateRange.replace(/\s+/g, '_')}.csv`
    const csvHeaders = 'Supplier Partner,Connection Type,Total Products,Synced SKUs,Feed Errors,Validation Pass Rate %,Uptime %\n'
    const csvRows = supplierData
      .map(s => `"${s.name}","${s.type}",${s.products},${s.synced},${s.errors},${s.passRate},"${s.uptime}"`)
      .join('\n')

    const csvContent = csvHeaders + csvRows

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setTimeout(() => {
      showNotification(`File "${fileName}" downloaded to your browser Downloads folder!`)
    }, 500)
  }

  const tabs = [
    { id: 'import_summary',       label: 'Import Summary' },
    { id: 'failed_imports',       label: 'Failed Imports' },
    { id: 'supplier_performance', label: 'Supplier Performance' },
    { id: 'price_changes',        label: 'Price Changes' },
    { id: 'inventory_changes',    label: 'Inventory Changes' },
    { id: 'new_products',         label: 'New Products' },
    { id: 'publishing_activity',   label: 'Publishing Activity' },
    { id: 'sync_performance',     label: 'Sync Performance' },
  ]

  // Mock Report Data Tables for specific sections
  const mockPriceChanges = [
    { sku: 'CPU-AMD-7950X', name: 'AMD Ryzen 9 7950X Processor', supplier: 'TechParts Int.', oldPrice: '$549.00', newPrice: '$529.00', change: '-3.6%', date: '2026-07-27 10:15' },
    { sku: 'GPU-NV-4090', name: 'NVIDIA RTX 4090 24GB', supplier: 'TechParts Int.', oldPrice: '$1,599.00', newPrice: '$1,649.00', change: '+3.1%', date: '2026-07-27 09:30' },
    { sku: 'RAM-DDR5-001', name: 'DDR5 32GB 6000MHz RAM Kit', supplier: 'GlobalSource Ltd.', oldPrice: '$129.00', newPrice: '$119.00', change: '-7.7%', date: '2026-07-26 18:20' },
  ]

  const mockInventoryChanges = [
    { sku: 'SSD-990P-2TB', name: 'Samsung 990 Pro 2TB SSD', supplier: 'GlobalSource Ltd.', oldStock: 120, newStock: 195, change: '+75 units', date: '2026-07-27 11:05' },
    { sku: 'PSU-COR-1000W', name: 'Corsair RM1000x 1000W PSU', supplier: 'PrimeSupply Corp', oldStock: 45, newStock: 0, change: '-45 (Out of stock)', date: '2026-07-27 08:40' },
    { sku: 'MON-ASUS-27', name: 'ASUS ROG Swift 27" Monitor', supplier: 'PrimeSupply Corp', oldStock: 50, newStock: 82, change: '+32 units', date: '2026-07-26 21:10' },
  ]

  const mockNewProducts = [
    { sku: 'KEY-Q1PRO', name: 'Keychron Q1 Pro Wireless Keyboard', category: 'Peripherals', supplier: 'QuickShip LLC', price: '$199.00', added: '2026-07-27 07:00' },
    { sku: 'CASE-NZXT-H9', name: 'NZXT H9 Flow Dual-Chamber Case', category: 'Components', supplier: 'AcmeDistributors', price: '$159.00', added: '2026-07-26 16:45' },
  ]

  const mockPublishingActivity = [
    { sku: 'CPU-AMD-7950X', name: 'AMD Ryzen 9 7950X', store: 'Main Shift4Shop Storefront', status: 'Published', date: '2026-07-27 11:30' },
    { sku: 'GPU-NV-4090', name: 'NVIDIA RTX 4090 24GB', store: 'US East Storefront', status: 'Published', date: '2026-07-27 11:15' },
    { sku: 'KEY-Q1PRO', name: 'Keychron Q1 Pro Keyboard', store: 'EU Storefront', status: 'Staged for Publish', date: '2026-07-27 10:50' },
  ]

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
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

      <SectionHeader
        title="Operational Reports"
        subtitle="Detailed operational activity, feed import summaries, supplier metrics, and store publishing activity"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer text-xs"
              title="Export Report CSV"
            >
              <FileSpreadsheet size={14} className="text-emerald-600 dark:text-emerald-400" /> Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 font-bold cursor-pointer text-xs"
              title="Print or Export PDF Report"
            >
              <FileText size={14} className="text-primary-600 dark:text-primary-400" /> Export PDF
            </button>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5">
              <Calendar size={14} className="text-slate-400" />
              <select
                value={dateRange}
                onChange={e => {
                  setDateRange(e.target.value)
                  showNotification(`Date range set to ${e.target.value}`)
                }}
                className="text-xs text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer font-bold"
              >
                <option value="Last 7 days">Last 7 days</option>
                <option value="Last 30 days">Last 30 days</option>
                <option value="Last 90 days">Last 90 days</option>
                <option value="Year to Date">Year to Date</option>
              </select>
            </div>
          </div>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      {/* 1. IMPORT SUMMARY TAB */}
      {tab === 'import_summary' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {[
              { label: 'TOTAL IMPORTED SKUS', value: '84,329 SKUs', color: 'text-slate-900 dark:text-slate-100', bg: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800', sub: 'Across 5 active supplier feeds' },
              { label: 'FEED VALIDATION PASS RATE', value: '98.4%', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50', sub: 'Passed Validation Rules' },
              { label: 'FAILED IMPORT RECORDS', value: '843 Records', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50', sub: 'Pending review in Validation' },
              { label: 'STOREFRONT PUBLISHED RATE', value: '99.2%', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/50', sub: 'Published across channels' },
            ].map((card, i) => (
              <div key={i} className={`p-4 rounded-2xl shadow-xs flex flex-col justify-between transition-all duration-200 ${card.bg}`}>
                <p className="text-[10px] sm:text-2xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">{card.label}</p>
                <p className={`text-xl sm:text-2xl font-black tracking-tight my-1 ${card.color}`}>{card.value}</p>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-semibold">{card.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Feed Import Volume & Master Catalog Category Share</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={catalogPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                    {catalogPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => (v as number).toLocaleString()} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Category Volume & Quality Index</h3>
              <div className="space-y-3">
                {catalogPie.map((cat, idx) => (
                  <div key={cat.name} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/70 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{cat.value.toLocaleString()} SKUs</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">99.5% Health</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. FAILED IMPORTS TAB */}
      {tab === 'failed_imports' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Failed Import Error Category Share</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={validationErrorsPie} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                  {validationErrorsPie.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Failed Import Diagnostics Index</h3>
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Resolved & Approved Products</span>
                <span className="font-black text-emerald-700 dark:text-emerald-400 text-sm">1,247 Items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="font-bold text-amber-800 dark:text-amber-300">Pending Review Queue</span>
                <span className="font-black text-amber-700 dark:text-amber-400 text-sm">84 Items</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
                <span className="font-bold text-rose-800 dark:text-rose-300">Rejected & Returned to Supplier</span>
                <span className="font-black text-rose-700 dark:text-rose-400 text-sm">12 Items</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. SUPPLIER PERFORMANCE TAB */}
      {tab === 'supplier_performance' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="card p-4 sm:p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Supplier Products & Error Rate Breakdown</h3>
            <div className="w-full overflow-x-auto">
              <ResponsiveContainer width="100%" height={240} minWidth={300}>
                <BarChart data={supplierData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
                  <Bar dataKey="synced" name="Synced SKUs" fill="#10b981" radius={[4,4,0,0]} stackId="a" />
                  <Bar dataKey="errors" name="Feed Errors" fill="#f43f5e" radius={[4,4,0,0]} stackId="a" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card w-full">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Supplier Feed Performance Index</h3>
              <span className="text-2xs text-slate-400 font-semibold">{dateRange}</span>
            </div>
            <div className="table-container w-full overflow-x-auto scrollbar-thin">
              <table className="table min-w-0 sm:min-w-[850px] w-full">
                <thead>
                  <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b-2 border-slate-200 dark:border-slate-800">
                    <th className="whitespace-nowrap px-4 py-3.5">SUPPLIER PARTNER</th>
                    <th className="whitespace-nowrap px-4 py-3.5">PROTOCOL</th>
                    <th className="whitespace-nowrap px-4 py-3.5">TOTAL SKUS</th>
                    <th className="whitespace-nowrap px-4 py-3.5">SYNCED SKUS</th>
                    <th className="whitespace-nowrap px-4 py-3.5">VALIDATION PASS %</th>
                    <th className="whitespace-nowrap px-4 py-3.5">CONNECTION UPTIME</th>
                    <th className="whitespace-nowrap px-4 py-3.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {supplierData.map(s => (
                    <tr key={s.name} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{s.name}</td>
                      <td className="whitespace-nowrap px-4 py-3.5"><span className="text-2xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-600 dark:text-slate-300">{s.type}</span></td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-800 dark:text-slate-200">{s.products.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-emerald-600 dark:text-emerald-400 font-bold">{s.synced.toLocaleString()}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-bold text-slate-700 dark:text-slate-300">{s.passRate}%</td>
                      <td className="whitespace-nowrap px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono">{s.uptime}</td>
                      <td className="whitespace-nowrap px-4 py-3.5">
                        <Badge variant={s.errors === 0 ? 'success' : 'warning'}>
                          {s.errors === 0 ? 'Optimal' : `${s.errors} Errors`}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. PRICE CHANGES TAB */}
      {tab === 'price_changes' && (
        <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card w-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Price Change Audit Log</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product SKU & Name</th>
                  <th>Supplier Source</th>
                  <th>Previous Price</th>
                  <th>Updated Price</th>
                  <th>Change (%)</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {mockPriceChanges.map(p => (
                  <tr key={p.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="font-semibold text-slate-800 dark:text-slate-100">{p.name} <span className="text-2xs font-mono text-slate-400 block">{p.sku}</span></td>
                    <td className="text-slate-600 dark:text-slate-300 font-medium">{p.supplier}</td>
                    <td className="text-slate-500 font-mono">{p.oldPrice}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100 font-mono">{p.newPrice}</td>
                    <td><span className={`px-2 py-0.5 rounded text-2xs font-bold ${p.change.startsWith('-') ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/60'}`}>{p.change}</span></td>
                    <td className="text-xs text-slate-400 font-mono">{p.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. INVENTORY CHANGES TAB */}
      {tab === 'inventory_changes' && (
        <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card w-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Stock Level Inventory Change Report</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product SKU & Name</th>
                  <th>Supplier Source</th>
                  <th>Previous Stock</th>
                  <th>New Stock</th>
                  <th>Stock Change</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {mockInventoryChanges.map(i => (
                  <tr key={i.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="font-semibold text-slate-800 dark:text-slate-100">{i.name} <span className="text-2xs font-mono text-slate-400 block">{i.sku}</span></td>
                    <td className="text-slate-600 dark:text-slate-300 font-medium">{i.supplier}</td>
                    <td className="text-slate-500 font-mono">{i.oldStock}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100 font-mono">{i.newStock}</td>
                    <td><span className={`px-2 py-0.5 rounded text-2xs font-bold ${i.change.includes('-') ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60'}`}>{i.change}</span></td>
                    <td className="text-xs text-slate-400 font-mono">{i.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. NEW PRODUCTS TAB */}
      {tab === 'new_products' && (
        <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card w-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Newly Onboarded Products Report</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product SKU & Title</th>
                  <th>Category</th>
                  <th>Supplier Source</th>
                  <th>Retail Price</th>
                  <th>Onboarded Date</th>
                </tr>
              </thead>
              <tbody>
                {mockNewProducts.map(n => (
                  <tr key={n.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="font-semibold text-slate-800 dark:text-slate-100">{n.name} <span className="text-2xs font-mono text-slate-400 block">{n.sku}</span></td>
                    <td className="text-slate-600 dark:text-slate-300">{n.category}</td>
                    <td className="text-slate-600 dark:text-slate-300 font-medium">{n.supplier}</td>
                    <td className="font-bold text-slate-800 dark:text-slate-100 font-mono">{n.price}</td>
                    <td className="text-xs text-slate-400 font-mono">{n.added}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. PUBLISHING ACTIVITY TAB */}
      {tab === 'publishing_activity' && (
        <div className="card overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card w-full">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Shift4Shop Storefront Publishing Activity</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Product SKU & Name</th>
                  <th>Target Storefront</th>
                  <th>Publishing Status</th>
                  <th>Publish Date</th>
                </tr>
              </thead>
              <tbody>
                {mockPublishingActivity.map(pub => (
                  <tr key={pub.sku} className="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <td className="font-semibold text-slate-800 dark:text-slate-100">{pub.name} <span className="text-2xs font-mono text-slate-400 block">{pub.sku}</span></td>
                    <td className="text-slate-600 dark:text-slate-300 font-medium">{pub.store}</td>
                    <td><Badge variant={pub.status === 'Published' ? 'success' : 'info'}>{pub.status}</Badge></td>
                    <td className="text-xs text-slate-400 font-mono">{pub.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. SYNC PERFORMANCE TAB */}
      {tab === 'sync_performance' && (
        <div className="card p-5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-4">Sync Pipeline Success Rate (%) & Throughput Trends — Last 6 Months</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={syncTrend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[95, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Line type="monotone" dataKey="success" name="Sync Success Rate %" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
