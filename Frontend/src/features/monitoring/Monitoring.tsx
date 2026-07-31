import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Server, Activity, Cpu, HardDrive, Wifi, Database, Globe, Truck,
  RefreshCw, CheckCircle2, AlertTriangle, Zap, Play, Terminal, Sliders, ShieldCheck
} from 'lucide-react'
import { SectionHeader, HealthIndicator, ProgressBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { mockSuppliers } from '../../data/mockData'

const uptimeData = [
  { time: '00:00', cpu: 42, memory: 61, queue: 80, apiLatency: 45 },
  { time: '04:00', cpu: 38, memory: 58, queue: 65, apiLatency: 38 },
  { time: '08:00', cpu: 67, memory: 72, queue: 120, apiLatency: 82 },
  { time: '12:00', cpu: 78, memory: 80, queue: 180, apiLatency: 95 },
  { time: '16:00', cpu: 55, memory: 68, queue: 140, apiLatency: 64 },
  { time: '20:00', cpu: 48, memory: 64, queue: 100, apiLatency: 52 },
  { time: 'Now',   cpu: 52, memory: 66, queue: 248, apiLatency: 48 },
]

export const Monitoring: React.FC = () => {
  const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [testingSupplierId, setTestingSupplierId] = useState<string | null>(null)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleRunDiagnostics = () => {
    setIsRunningDiagnostics(true)
    setTimeout(() => {
      setIsRunningDiagnostics(false)
      showNotification('Full system diagnostic check complete! All 24 API gateways & FTP endpoints verified.')
    }, 1200)
  }

  const handlePingSupplier = (supplierName: string, id: string) => {
    setTestingSupplierId(id)
    setTimeout(() => {
      setTestingSupplierId(null)
      showNotification(`Ping test successful for ${supplierName}: 200 OK (Latency: 34ms)`)
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700 backdrop-blur-md"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="System Telemetry & Operational Health"
        subtitle="Real-time infrastructure monitoring, supplier API/FTP connection status, and Shift4Shop sync throughput"
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="success" dot>System Health: 99.8%</Badge>
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiagnostics}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              <RefreshCw size={14} className={isRunningDiagnostics ? 'animate-spin text-white' : ''} />
              {isRunningDiagnostics ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
            </button>
          </div>
        }
      />

      {/* System Health Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'CPU Load',      value: 52, color: 'primary', icon: <Cpu size={16} className="text-primary-600 dark:text-primary-400" />, bg: 'bg-primary-50 dark:bg-slate-800/80' },
          { label: 'Memory Usage',  value: 66, color: 'cyan',    icon: <Server size={16} className="text-cyan-600 dark:text-cyan-400" />,  bg: 'bg-cyan-50 dark:bg-slate-800/80' },
          { label: 'Disk Storage',  value: 43, color: 'emerald', icon: <HardDrive size={16} className="text-emerald-600 dark:text-emerald-400" />, bg: 'bg-emerald-50 dark:bg-slate-800/80' },
          { label: 'Queue Load',    value: 48, color: 'amber',   icon: <Database size={16} className="text-amber-600 dark:text-amber-400" />, bg: 'bg-amber-50 dark:bg-slate-800/80' },
        ].map(s => (
          <div key={s.label} className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>{s.icon}</div>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{s.value}%</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 mb-2">{s.label}</p>
            <ProgressBar value={s.value} color={s.color as any} />
          </div>
        ))}
      </div>

      {/* Performance Chart */}
      <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100">Telemetry Performance — Last 24 Hours</h3>
            <p className="text-2xs text-slate-400">Real-time CPU %, Memory %, and API Gateway Response Latency</p>
          </div>
          <Badge variant="info">200 Requests / Sec</Badge>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={uptimeData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #1e293b', color: '#f8fafc', fontSize: '12px' }} />
            <Area type="monotone" dataKey="cpu" name="CPU %" stroke="#4f46e5" strokeWidth={2} fill="url(#cpuGrad)" dot={false} />
            <Area type="monotone" dataKey="memory" name="Memory %" stroke="#06b6d4" strokeWidth={2} fill="url(#memGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* API Health */}
        <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Wifi size={15} className="text-primary-600 dark:text-primary-400" /> API Gateway Endpoint Latency
          </h3>
          <div className="space-y-3">
            {[
              { endpoint: '/api/v1/products',    latency: '48ms', status: 'operational', calls: '12,400/hr' },
              { endpoint: '/api/v1/inventory',   latency: '32ms', status: 'operational', calls: '8,200/hr' },
              { endpoint: '/api/v1/pricing',     latency: '120ms', status: 'degraded',   calls: '4,100/hr' },
              { endpoint: '/api/v1/sync',        latency: '65ms', status: 'operational', calls: '2,800/hr' },
              { endpoint: '/api/v1/suppliers',   latency: '55ms', status: 'operational', calls: '980/hr' },
              { endpoint: '/v2/shift4shop/catalog', latency: '78ms', status: 'operational', calls: '15,600/hr' },
            ].map(ep => (
              <div key={ep.endpoint} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <code className="text-xs font-mono text-slate-700 dark:text-slate-300">{ep.endpoint}</code>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 font-medium">{ep.calls}</span>
                  <span className={`text-xs font-semibold ${ep.latency.includes('12') ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>{ep.latency}</span>
                  <HealthIndicator status={ep.status as any} label={ep.status === 'operational' ? 'OK' : 'Slow'} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supplier Status Telemetry */}
        <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Truck size={15} className="text-primary-600 dark:text-primary-400" /> Supplier Connection Telemetry
            </h3>
            <span className="text-2xs text-slate-400 font-semibold">{mockSuppliers.length} Total Partners</span>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto scrollbar-hide">
            {mockSuppliers.map(s => {
              const isTesting = testingSupplierId === s.id
              const isUp = s.status === 'connected' || s.status === 'syncing'
              return (
                <div key={s.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50/70 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{s.name}</span>
                    <span className="text-2xs text-slate-400 bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded font-mono uppercase">{s.connectionType}</span>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handlePingSupplier(s.name, s.id)}
                      disabled={isTesting}
                      className="btn-ghost btn-xs text-primary-600 dark:text-primary-400 font-bold hover:underline"
                    >
                      {isTesting ? 'Pinging...' : 'Ping Test'}
                    </button>
                    <HealthIndicator status={isUp ? 'operational' : 'down'} label={isUp ? 'Up' : 'Error'} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Queue Health */}
        <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Database size={15} className="text-primary-600 dark:text-primary-400" /> Message & Job Queue Throughput
          </h3>
          <div className="space-y-3">
            {[
              { label: 'CSV/XML Import Queue', current: 248, max: 500, status: 'healthy' as const },
              { label: 'Inventory Sync Queue',   current: 45,  max: 200, status: 'healthy' as const },
              { label: 'Image Download Queue',  current: 180, max: 300, status: 'degraded' as const },
              { label: 'Shift4Shop Push Queue',  current: 12,  max: 1000, status: 'healthy' as const },
            ].map(q => (
              <div key={q.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-slate-700 dark:text-slate-300">{q.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">{q.current}/{q.max} items</span>
                    <HealthIndicator status={q.status} label={q.status === 'healthy' ? 'OK' : 'High'} />
                  </div>
                </div>
                <ProgressBar value={q.current} max={q.max} color={q.current / q.max > 0.7 ? 'amber' : 'emerald'} />
              </div>
            ))}
          </div>
        </div>

        {/* Shift4Shop Storefront Availability */}
        <div className="card p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Globe size={15} className="text-primary-600 dark:text-primary-400" /> Shift4Shop Storefront Availability
          </h3>
          <div className="space-y-2">
            {[
              { name: 'SupplyBridge US Storefront', uptime: '99.98%', ok: true },
              { name: 'SupplyBridge EU Storefront', uptime: '99.92%', ok: true },
              { name: 'TechHub Shift4Shop Portal',   uptime: '99.87%', ok: true },
              { name: 'IndusStore UK Storefront',   uptime: '99.95%', ok: true },
              { name: 'QuickBuy CA Storefront',    uptime: '98.50%', ok: false },
            ].map(s => (
              <div key={s.name} className="flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.ok ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{s.name}</span>
                </div>
                <span className={`text-xs font-semibold ${s.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{s.uptime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
