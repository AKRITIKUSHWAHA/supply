import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lock, CheckCircle2, XCircle, Shield, RefreshCw, Save,
  RotateCcw, Search, Filter, Check, Eye, AlertCircle, Zap, Users, ShieldAlert, Sliders
} from 'lucide-react'
import { SectionHeader, FilterBar } from '../../components/ui'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../context/AuthContext'
import type { UserRole } from '../../types'

interface ModuleDef {
  key: string
  label: string
  category: 'Core' | 'Integrations' | 'PIM & Catalog' | 'Sync Engines' | 'Monitoring & Ops' | 'Security & Settings'
  desc: string
}

const MODULE_LIST: ModuleDef[] = [
  { key: 'dashboard',        label: 'Dashboard Overview',       category: 'Core', desc: 'Central performance metrics & system health' },
  { key: 'suppliers',        label: 'Supplier Management',      category: 'Integrations', desc: 'Manage partner suppliers & connection parameters' },
  { key: 'integrations',     label: 'FTP/API Integrations',     category: 'Integrations', desc: 'FTP server setups, REST API keys & protocol endpoints' },
  { key: 'sync_jobs',        label: 'Queue Management',         category: 'Sync Engines', desc: 'Background cron jobs, batch runs & retry logs' },
  { key: 'catalog',          label: 'Master Catalog Hub',       category: 'PIM & Catalog', desc: 'Central product taxonomy & master PIM data' },
  { key: 'products',         label: 'Products Editor',          category: 'PIM & Catalog', desc: 'Product creation, attribute editing & media' },
  { key: 'categories',       label: 'Categories Management',    category: 'PIM & Catalog', desc: 'Product taxonomy tree & hierarchy' },
  { key: 'brands',           label: 'Brands Management',        category: 'PIM & Catalog', desc: 'Manufacturer & brand entity directory' },
  { key: 'manufacturers',    label: 'Manufacturers Directory',   category: 'PIM & Catalog', desc: 'Supplier & manufacturer entity registry' },
  { key: 'variants',         label: 'Variant Schemas',          category: 'PIM & Catalog', desc: 'Color, size & option group definitions' },
  { key: 'media',            label: 'Media / Image Library',    category: 'PIM & Catalog', desc: 'Central product image repository & CDN assets' },
  { key: 'mapping',          label: 'Data Mapping',             category: 'PIM & Catalog', desc: 'Product, category, brand, variant & attribute transformation' },
  { key: 'validation',       label: 'Validation Center',        category: 'Monitoring & Ops', desc: 'Product review queue, approval & error checks' },
  { key: 'inventory_sync',   label: 'Inventory Sync',           category: 'Sync Engines', desc: 'Real-time multi-supplier stock synchronization' },
  { key: 'pricing_sync',     label: 'Pricing Sync',             category: 'Sync Engines', desc: 'Cost, margin & retail price update pipeline' },
  { key: 'image_sync',       label: 'Image Sync',               category: 'Sync Engines', desc: 'Media assets & image URL processing engine' },
  { key: 'website_sync',     label: 'Store Synchronization',    category: 'Sync Engines', desc: 'Multi-storefront catalog publishing & web sync' },
  { key: 'store_management', label: 'Store Management',         category: 'Core', desc: 'Connected ecommerce storefronts & API credentials' },
  { key: 'logs',             label: 'System Logs',              category: 'Monitoring & Ops', desc: 'Audit trails, sync errors & event history' },
  { key: 'reports',          label: 'Analytics & Reports',      category: 'Monitoring & Ops', desc: 'Operational metrics & supplier performance' },
  { key: 'users',            label: 'User Management',          category: 'Security & Settings', desc: 'User account creation & status management' },
  { key: 'roles',            label: 'Role Definitions',         category: 'Security & Settings', desc: 'Platform RBAC role definitions' },
  { key: 'permissions',      label: 'Permissions Matrix',       category: 'Security & Settings', desc: 'Granular module permission configuration' },
  { key: 'settings',         label: 'Platform Settings',        category: 'Security & Settings', desc: 'Global platform configuration & environment' },
]

const ROLE_METADATA: { role: UserRole; name: string; badgeVariant: 'purple' | 'primary' | 'info' | 'warning'; desc: string }[] = [
  { role: 'platform_owner',      name: 'Platform Owner',      badgeVariant: 'purple',  desc: 'Full System Owner (*)' },
  { role: 'administrator',       name: 'Administrator',       badgeVariant: 'primary', desc: 'Business Operations Manager' },
  { role: 'catalog_manager',     name: 'Catalog Manager',     badgeVariant: 'info',    desc: 'PIM & Merchandising' },
  { role: 'integration_manager', name: 'Integration Manager', badgeVariant: 'info',    desc: 'Feeds & Data Pipelines' },
  { role: 'operations_staff',    name: 'Operations Staff',    badgeVariant: 'warning', desc: 'Validation & Store Sync' },
]




export const Permissions: React.FC = () => {
  const { permissionsConfig, updateRolePermission, setBulkRolePermissions, resetPermissionsToDefault } = useAuth()
  
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleToggle = (targetRole: UserRole, moduleKey: string, currentAccess: boolean) => {
    if (targetRole === 'platform_owner') {
      showNotification('Platform Owner maintains root access (*) across all modules.')
      return
    }
    updateRolePermission(targetRole, moduleKey, !currentAccess)
    showNotification(`Updated ${moduleKey.replace(/_/g, ' ')} permission for ${targetRole.replace(/_/g, ' ')}`)
  }

  const handleGrantAll = (targetRole: UserRole) => {
    if (targetRole === 'platform_owner') return
    const allModuleKeys = MODULE_LIST.map(m => m.key)
    setBulkRolePermissions(targetRole, allModuleKeys)
    showNotification(`Granted all module permissions to ${targetRole.replace(/_/g, ' ')}`)
  }

  const handleSaveAll = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      showNotification('Permission configuration saved and applied to system in real-time!')
    }, 400)
  }

  const filteredModules = MODULE_LIST.filter(m => {
    const matchSearch = m.label.toLowerCase().includes(search.toLowerCase()) || m.key.toLowerCase().includes(search.toLowerCase()) || m.desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = categoryFilter === 'all' || m.category === categoryFilter
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-bold border border-slate-700/80 backdrop-blur-md"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Permissions Matrix & RBAC Flow"
        subtitle="Configure live role-based access control. Permission changes reflect dynamically across sidebar menus, routes, and action buttons."
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={resetPermissionsToDefault}
              className="btn-secondary btn-sm flex items-center gap-1.5 cursor-pointer"
              title="Reset matrix to standard client PRD defaults"
            >
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="btn-primary btn-sm flex items-center gap-1.5 shadow-md shadow-indigo-500/20 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} /> Save Configuration
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {ROLE_METADATA.map(r => {
          const isOwner = r.role === 'platform_owner'
          const perms = permissionsConfig[r.role] || []
          const grantedCount = isOwner ? MODULE_LIST.length : perms.length

          return (
            <div key={r.role} className="card p-4 flex flex-col justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Badge variant={r.badgeVariant}>{r.name}</Badge>
                  {isOwner ? (
                    <span className="text-2xs font-extrabold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full">Root</span>
                  ) : (
                    <span className="text-2xs font-bold text-slate-500">{grantedCount}/{MODULE_LIST.length} Modules</span>
                  )}
                </div>
                <p className="text-2xs text-slate-500 font-medium leading-relaxed mb-3">{r.desc}</p>
              </div>

              {!isOwner && (
                <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => handleGrantAll(r.role)}
                    className="text-2xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex-1 text-center py-1 cursor-pointer"
                  >
                    Grant All
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <button
                    onClick={() => setBulkRolePermissions(r.role, ['dashboard'])}
                    className="text-2xs font-bold text-rose-500 hover:underline flex-1 text-center py-1 cursor-pointer"
                  >
                    Revoke
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Filter & Search Bar */}
      <FilterBar search={search} onSearch={setSearch} placeholder="Search modules, features, or permissions...">
        <select
          className="select input-sm w-auto min-w-[160px]"
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>
          <option value="Core">Core & Platform</option>
          <option value="Integrations">Integrations & Protocol</option>
          <option value="PIM & Catalog">PIM & Master Catalog</option>
          <option value="Sync Engines">Synchronization Engines</option>
          <option value="Monitoring & Ops">Monitoring & Operations</option>
          <option value="Security & Settings">Security & Settings</option>
        </select>
      </FilterBar>

      {/* Interactive Permission Matrix Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="min-w-[220px]">Module / Feature</th>
                <th className="min-w-[130px]">Category</th>
                {ROLE_METADATA.map(r => (
                  <th key={r.role} className="text-center min-w-[140px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{r.name}</span>
                      <span className="text-2xs text-slate-400 font-normal">
                        {r.role === 'platform_owner' ? 'Root (*)' : `${(permissionsConfig[r.role] || []).length} active`}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredModules.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No modules match search query "{search}"
                  </td>
                </tr>
              )}
              {filteredModules.map(module => (
                <tr key={module.key} className="hover:bg-slate-50/80 dark:hover:bg-slate-850/50 transition-colors">
                  <td>
                    <div>
                      <p className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Lock size={13} className="text-primary-500 opacity-70" />
                        {module.label}
                      </p>
                      <p className="text-2xs text-slate-400 mt-0.5 font-medium">{module.desc}</p>
                    </div>
                  </td>
                  <td>
                    <span className="text-2xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                      {module.category}
                    </span>
                  </td>
                  {ROLE_METADATA.map(r => {
                    const isOwner = r.role === 'platform_owner'
                    const rolePerms = permissionsConfig[r.role] || []
                    const hasAccess = isOwner || rolePerms.includes('*') || rolePerms.includes(module.key)

                    return (
                      <td key={r.role} className="text-center">
                        {isOwner ? (
                          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 font-extrabold text-xs">
                            <CheckCircle2 size={13} className="text-purple-600 dark:text-purple-400" /> Granted
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleToggle(r.role, module.key, hasAccess)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              hasAccess ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                            title={`Click to ${hasAccess ? 'Revoke' : 'Grant'} ${module.label} access for ${r.name}`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                hasAccess ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
