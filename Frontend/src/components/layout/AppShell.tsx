import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { UserProfileModal } from '../ui/UserProfileModal'

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('supplybridge_theme')
    if (saved !== null) {
      return saved === 'dark'
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const location = useLocation()

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // Sync dark mode class on html & body elements on state change and initial mount
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
    setDarkMode(prev => !prev)
  }

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-surface-bg text-slate-900'}`}>

      {/* Mobile Backdrop — click to close sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — fixed drawer on mobile, always visible on desktop */}
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
        <Header
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDark={toggleDark}
        />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="p-3 sm:p-5 lg:p-6 pb-6 sm:pb-8 w-full max-w-full min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Interactive Global User Profile Modal */}
      <UserProfileModal />
    </div>
  )
}
