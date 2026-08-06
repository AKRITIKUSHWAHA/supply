import { API_BASE_URL } from '../../config/api'
import React, { useState, useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, ShieldAlert, RefreshCw, Lock, LogOut } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { UserProfileModal } from '../ui/UserProfileModal'
import { useAuth } from '../../context/AuthContext'
import { getFirstAccessibleRoute } from '../../utils'

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(false)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('supplybridge_theme')
    if (saved !== null) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const location = useLocation()
  const navigate = useNavigate()
  const { role, hasPermission, logout } = useAuth()

  useEffect(() => {
    if (location.pathname === '/' && !hasPermission('dashboard')) {
      const fallback = getFirstAccessibleRoute(hasPermission)
      navigate(fallback, { replace: true })
    }
  }, [role, location.pathname, hasPermission, navigate])

  const checkMaintenanceStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`)
      const data = await res.json()
      if (data && data.maintenanceMode !== undefined) {
        setMaintenanceMode(data.maintenanceMode)
      }
    } catch (err) {
      console.error('Failed to check maintenance status:', err)
    }
  }

  useEffect(() => {
    checkMaintenanceStatus()

    const handleSettingsUpdated = () => {
      checkMaintenanceStatus()
    }
    window.addEventListener('supplybridge_settings_updated', handleSettingsUpdated)
    const interval = setInterval(checkMaintenanceStatus, 15000)

    return () => {
      window.removeEventListener('supplybridge_settings_updated', handleSettingsUpdated)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
      localStorage.setItem('supplybridge_theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
      localStorage.setItem('supplybridge_theme', 'light')
    }
  }, [darkMode])

  const toggleDark = () => {
    setDarkMode((prev) => !prev)
  }

  const isAdmin = role === 'platform_owner' || role === 'administrator'

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-surface-bg text-slate-900'}`}>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Always visible in AppShell layout */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0 lg:z-auto lg:flex
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Admin Maintenance Banner */}
        {maintenanceMode && isAdmin && (
          <div className="bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-2 flex items-center justify-between gap-2 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 animate-bounce" />
              <span>
                <strong>MAINTENANCE MODE IS ACTIVE:</strong> All non-admin user access is currently blocked across SupplyBridge APIs and Frontend.
              </span>
            </div>
            <span className="bg-slate-950 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">Admin Override Active</span>
          </div>
        )}

        {/* Non-Admin Maintenance Warning Banner */}
        {maintenanceMode && !isAdmin && (
          <div className="bg-amber-500 text-slate-950 text-xs font-semibold px-4 py-2 flex items-center justify-between gap-2 shadow-sm shrink-0">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0 animate-bounce" />
              <span>
                <strong>SYSTEM UNDER MAINTENANCE:</strong> Platform data access is temporarily restricted for {role.replace(/_/g, ' ')}.
              </span>
            </div>
            <span className="bg-slate-950 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider">Restricted Access</span>
          </div>
        )}

        <Header
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />

        <main className="flex-1 overflow-y-auto">
          {maintenanceMode && !isAdmin ? (
            /* NON-ADMIN MAINTENANCE SHIELD CARD (Rendered inside AppShell layout so Sidebar & Header stay visible) */
            <div className="min-h-[80vh] flex items-center justify-center p-4">
              <div className="max-w-md w-full text-center space-y-6 card p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
                <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-amber-500/5">
                  <ShieldAlert size={36} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">System Under Maintenance</h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    SupplyBridge Enterprise PIM is currently undergoing scheduled maintenance. Access to <strong>{location.pathname}</strong> is temporarily restricted.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700">
                  <Lock size={14} className="text-amber-500" />
                  <span>Logged in as: <strong className="capitalize text-slate-900 dark:text-slate-100">{role.replace(/_/g, ' ')}</strong> (Access Restricted)</span>
                </div>

                <div className="pt-2 flex flex-col gap-2.5">
                  <button
                    onClick={checkMaintenanceStatus}
                    className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 font-bold text-xs shadow-md"
                  >
                    <RefreshCw size={15} /> Check System Status
                  </button>

                  <div className="p-3.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 rounded-xl text-xs text-amber-700 dark:text-amber-300 leading-relaxed font-medium text-left flex items-start gap-2.5">
                    <AlertTriangle size={18} className="shrink-0 text-amber-500 mt-0.5" />
                    <span>Scheduled system updates are currently in progress. All data features will automatically resume as soon as administrator completes maintenance.</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="p-3 sm:p-5 lg:p-6 pb-6 sm:pb-8 w-full max-w-full min-h-full"
            >
              <Outlet />
            </motion.div>
          )}
        </main>
      </div>

      {/* Interactive Global User Profile Modal */}
      <UserProfileModal />
    </div>
  )
}
