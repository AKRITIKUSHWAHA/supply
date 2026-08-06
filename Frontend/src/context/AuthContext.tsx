import { API_BASE_URL } from '../config/api'
import React, { createContext, useContext, useState } from 'react'
import type { UserRole, User } from '../types'
import { Lock, Mail, Shield, Zap, ArrowRight, CheckCircle2, UserCheck, Layers, RefreshCw, Globe, Database, ShieldCheck } from 'lucide-react'

interface AuthContextType {
  currentUser: User
  role: UserRole
  setRole: (role: UserRole) => void
  permissionsConfig: Record<UserRole, string[]>
  updateRolePermission: (targetRole: UserRole, module: string, hasAccess: boolean) => void
  setBulkRolePermissions: (targetRole: UserRole, modules: string[]) => void
  resetPermissionsToDefault: () => void
  hasPermission: (module: string) => boolean
  logout: () => void
  viewProfileUser: User | null
  setViewProfileUser: (user: User | null) => void
  openCurrentUserProfile: () => void
}

export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  platform_owner:      ['*'],
  administrator:       ['dashboard', 'suppliers', 'catalog', 'products', 'categories', 'brands', 'manufacturers', 'variants', 'media', 'mapping', 'validation', 'inventory_sync', 'pricing_sync', 'image_sync', 'store_management', 'website_sync', 'sync_jobs', 'import_queue', 'logs', 'monitoring', 'reports'],
  catalog_manager:     ['dashboard', 'catalog', 'products', 'categories', 'brands', 'manufacturers', 'variants', 'media', 'mapping', 'validation', 'reports'],
  integration_manager: ['dashboard', 'suppliers', 'mapping', 'inventory_sync', 'pricing_sync', 'image_sync', 'website_sync', 'sync_jobs', 'logs', 'monitoring'],
  operations_staff:    ['dashboard', 'products', 'validation', 'sync_jobs', 'logs', 'reports'],
}

const demoUsers: Record<UserRole, User> = {
  platform_owner:      { id: 'u1', name: 'Alex Morrison', email: 'alex@supplybridge.io', role: 'platform_owner', status: 'active', createdAt: '2024-01-01T00:00:00Z', department: 'Executive Management' },
  administrator:       { id: 'u2', name: 'Sarah Kim', email: 'sarah@supplybridge.io', role: 'administrator', status: 'active', createdAt: '2024-02-15T00:00:00Z', department: 'Platform Operations' },
  catalog_manager:     { id: 'u3', name: 'James Patel', email: 'jpatel@supplybridge.io', role: 'catalog_manager', status: 'active', createdAt: '2024-04-01T00:00:00Z', department: 'Catalog & Merchandising' },
  integration_manager: { id: 'u4', name: 'Elena Rostova', email: 'elena@supplybridge.io', role: 'integration_manager', status: 'active', createdAt: '2024-05-10T00:00:00Z', department: 'Integrations & Protocols' },
  operations_staff:    { id: 'u6', name: 'David Vance', email: 'dvance@supplybridge.io', role: 'operations_staff', status: 'active', createdAt: '2024-06-12T00:00:00Z', department: 'Storefront Operations' },
}

const ROLE_PRESETS: { role: UserRole; label: string; email: string; desc: string; color: string }[] = [
  { role: 'platform_owner',      label: 'Platform Owner',      email: 'alex@supplybridge.io',     desc: 'Full Platform Access & Control (*)', color: 'from-purple-600 to-indigo-600' },
  { role: 'administrator',       label: 'Administrator',       email: 'sarah@supplybridge.io',    desc: 'Daily Platform & Operational Admin', color: 'from-indigo-600 to-blue-600' },
  { role: 'catalog_manager',     label: 'Catalog Manager',     email: 'jpatel@supplybridge.io',   desc: 'PIM, Products, Media & Validation',   color: 'from-blue-600 to-cyan-600' },
  { role: 'integration_manager', label: 'Integration Manager', email: 'elena@supplybridge.io',    desc: 'Supplier Feeds, Data Pipelines & Mapping', color: 'from-cyan-600 to-teal-600' },
  { role: 'operations_staff',    label: 'Operations Staff',    email: 'dvance@supplybridge.io',   desc: 'Validation Review & Store Sync Operations', color: 'from-amber-600 to-orange-600' },
]

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('supplybridge_role') as UserRole
    return (savedRole && demoUsers[savedRole]) ? savedRole : 'platform_owner'
  })

  const [permissionsConfig, setPermissionsConfig] = useState<Record<UserRole, string[]>>(() => {
    const saved = localStorage.getItem('supplybridge_permissions_config')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        const catalogPerms = parsed.catalog_manager && Array.isArray(parsed.catalog_manager) && parsed.catalog_manager.length > 0
          ? Array.from(new Set([...parsed.catalog_manager, 'products', 'categories', 'brands', 'manufacturers', 'variants', 'media', 'catalog']))
          : DEFAULT_ROLE_PERMISSIONS.catalog_manager

        return {
          ...DEFAULT_ROLE_PERMISSIONS,
          ...parsed,
          catalog_manager: catalogPerms,
        }
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS
      }
    }
    return DEFAULT_ROLE_PERMISSIONS
  })

  const [viewProfileUser, setViewProfileUser] = useState<User | null>(null)
  const [isLoggedOut, setIsLoggedOutState] = useState<boolean>(() => {
    return localStorage.getItem('supplybridge_is_logged_out') === 'true'
  })

  // Login form states
  const [email, setEmail] = useState('alex@supplybridge.io')
  const [password, setPassword] = useState('••••••••••••')
  const [selectedRole, setSelectedRole] = useState<UserRole>('platform_owner')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const currentUser = demoUsers[role] || demoUsers['platform_owner']

  const setRole = (newRole: UserRole) => {
    localStorage.setItem('supplybridge_role', newRole)
    setRoleState(newRole)
  }

  const updateRolePermission = (targetRole: UserRole, moduleKey: string, hasAccess: boolean) => {
    setPermissionsConfig(prev => {
      const currentList = prev[targetRole] || []
      let updated: string[] = []
      if (hasAccess) {
        updated = currentList.includes(moduleKey) ? currentList : [...currentList, moduleKey]
      } else {
        updated = currentList.filter(m => m !== moduleKey)
      }
      const nextConfig = { ...prev, [targetRole]: updated }
      localStorage.setItem('supplybridge_permissions_config', JSON.stringify(nextConfig))
      return nextConfig
    })
  }

  const setBulkRolePermissions = (targetRole: UserRole, modules: string[]) => {
    setPermissionsConfig(prev => {
      const nextConfig = { ...prev, [targetRole]: modules }
      localStorage.setItem('supplybridge_permissions_config', JSON.stringify(nextConfig))
      return nextConfig
    })
  }

  const resetPermissionsToDefault = () => {
    setPermissionsConfig(DEFAULT_ROLE_PERMISSIONS)
    localStorage.setItem('supplybridge_permissions_config', JSON.stringify(DEFAULT_ROLE_PERMISSIONS))
  }

  const hasPermission = (moduleKey: string): boolean => {
    // Platform Owner ALWAYS has root access to all modules
    if (role === 'platform_owner') {
      return true
    }

    const perms = permissionsConfig[role] || DEFAULT_ROLE_PERMISSIONS[role] || ['*']
    if (!perms) return false
    if (perms.length === 0) return false

    return perms.includes('*') || perms.includes(moduleKey)
  }

  const logout = () => {
    localStorage.setItem('supplybridge_is_logged_out', 'true')
    setIsLoggedOutState(true)
  }

  const openCurrentUserProfile = () => {
    setViewProfileUser(currentUser)
  }

  const handleRoleSelect = (preset: typeof ROLE_PRESETS[0]) => {
    setSelectedRole(preset.role)
    setEmail(preset.email)
    setPassword('admin123')
  }

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)

    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    .then(res => res.json())
    .then(data => {
      if (data.status === 'success') {
        const userRole = data.data.user.role.toLowerCase().replace(' ', '_') as UserRole;
        setRole(userRole);
        
        if (data.data.user.permissions) {
          setPermissionsConfig(prev => {
            const nextConfig = { ...prev, [userRole]: data.data.user.permissions }
            localStorage.setItem('supplybridge_permissions_config', JSON.stringify(nextConfig))
            return nextConfig
          });
        }

        localStorage.setItem('supplybridge_is_logged_out', 'false');
        localStorage.setItem('supplybridge_token', data.accessToken);
        setIsLoggedOutState(false);
      } else {
        alert(data.message || 'Login failed');
      }
    })
    .catch(err => {
      console.error('Login error:', err);
      alert('Network error connecting to backend');
    })
    .finally(() => {
      setIsLoggingIn(false);
    });
  }

  if (isLoggedOut) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-100">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-0 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
          {/* Left Hero & Role Quick Selector */}
          <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-indigo-950/60 to-slate-900 p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800/80 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-indigo-600 p-[2px]">
                  <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                    <Zap size={20} className="text-amber-400 fill-amber-400/20 animate-pulse" />
                  </div>
                </div>
                <div>
                  <h1 className="text-lg font-black tracking-tight text-white">SupplyBridge</h1>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Enterprise PIM</p>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">Platform Login</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Select a demo profile to test role-based access matrix and PIM operations.
                </p>
              </div>

              {/* Role Presets Cards */}
              <div className="space-y-2">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Quick Demo Profiles</p>
                {ROLE_PRESETS.map((preset) => (
                  <button
                    key={preset.role}
                    type="button"
                    onClick={() => handleRoleSelect(preset)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between group ${
                      selectedRole === preset.role
                        ? 'bg-slate-800/90 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                        : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${preset.color} flex items-center justify-center shrink-0 shadow-md`}>
                        <ShieldCheck size={16} className="text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white truncate">{preset.label}</p>
                          {selectedRole === preset.role && (
                            <CheckCircle2 size={13} className="text-indigo-400 shrink-0" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 truncate">{preset.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/60 mt-6 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Shield size={12} className="text-emerald-400" /> End-to-End Encrypted
              </span>
              <span>v2.4.0 (Enterprise)</span>
            </div>
          </div>

          {/* Right Interactive Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-slate-900">
            <form onSubmit={handleLoginSubmit} className="space-y-5 max-w-md mx-auto w-full">
              <div className="p-3.5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center gap-3">
                <UserCheck size={20} className="text-indigo-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-white">Role Selected: <span className="text-indigo-300 capitalize">{selectedRole.replace(/_/g, ' ')}</span></p>
                  <p className="text-slate-400 text-[11px]">Signing in with verified enterprise credentials</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Mail size={14} className="text-indigo-400" /> Work Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="user@supplybridge.io"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Lock size={14} className="text-indigo-400" /> Password
                  </label>
                  <span className="text-[11px] text-indigo-400 hover:underline cursor-pointer">Forgot password?</span>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" /> Authenticating...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        setRole,
        permissionsConfig,
        updateRolePermission,
        setBulkRolePermissions,
        resetPermissionsToDefault,
        hasPermission,
        logout,
        viewProfileUser,
        setViewProfileUser,
        openCurrentUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
