import React, { useState, useRef, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Bell, Search, ChevronDown, Menu, Sun, Moon, Zap, User, LogOut, X,
  Package, Truck, FileText, Layers, ShieldCheck, Briefcase, Award, Tag, AlertTriangle, Star
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import { getInitials } from '../../utils'
import type { UserRole } from '../../types'

const ROLE_LABELS: Record<UserRole, string> = {
  platform_owner:      'Platform Owner',
  administrator:       'Administrator',
  catalog_manager:     'Catalog Manager',
  integration_manager: 'Integration Manager',
  operations_staff:    'Operations Staff',
}



interface SearchItem {
  id: string
  title: string
  subtitle: string
  category: 'products' | 'suppliers' | 'manufacturers' | 'brands' | 'categories' | 'skus' | 'jobs' | 'logs'
  badge: string
  badgeColor: string
  path: string
  icon: React.ReactNode
}

const SEARCH_DATABASE: SearchItem[] = [
  // Products & SKUs
  { id: 'p1', title: 'AMD Ryzen 9 7950X Processor 16-Core', subtitle: 'Master SKU: CPU-AMD-7950X · AMD Processor Category', category: 'products', badge: 'Product', badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60', path: '/catalog/products', icon: <Package size={16} className="text-emerald-600 dark:text-emerald-400" /> },
  { id: 'p2', title: 'NVIDIA GeForce RTX 4090 24GB OC Edition', subtitle: 'Master SKU: GPU-NV-4090 · NVIDIA Graphics Card', category: 'products', badge: 'Product', badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60', path: '/catalog/products', icon: <Package size={16} className="text-emerald-600 dark:text-emerald-400" /> },
  { id: 'p3', title: 'DDR5 32GB 6000MHz RGB Memory Kit', subtitle: 'Master SKU: RAM-DDR5-001 · Corsair PC RAM', category: 'products', badge: 'Product', badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60', path: '/catalog/products', icon: <Package size={16} className="text-emerald-600 dark:text-emerald-400" /> },
  { id: 'p4', title: 'Samsung 990 Pro 2TB NVMe PCIe 4.0 SSD', subtitle: 'Master SKU: SSD-990P-2TB · Samsung Storage', category: 'products', badge: 'Product', badgeColor: 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-900/60', path: '/catalog/products', icon: <Package size={16} className="text-emerald-600 dark:text-emerald-400" /> },
  { id: 'sku1', title: 'SKU: CPU-AMD-7950X', subtitle: 'Product: AMD Ryzen 9 7950X · Supplier: TechParts Int.', category: 'skus', badge: 'SKU', badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900/60', path: '/catalog/products', icon: <Tag size={16} className="text-indigo-600 dark:text-indigo-400" /> },
  { id: 'sku2', title: 'SKU: GPU-NV-4090', subtitle: 'Product: NVIDIA RTX 4090 · Supplier: TechParts Int.', category: 'skus', badge: 'SKU', badgeColor: 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900/60', path: '/catalog/products', icon: <Tag size={16} className="text-indigo-600 dark:text-indigo-400" /> },

  // Suppliers
  { id: 'sup1', title: 'TechParts International', subtitle: 'Protocol: REST API v2 · 18,420 SKUs Active Feed', category: 'suppliers', badge: 'Supplier', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/60', path: '/suppliers', icon: <Truck size={16} className="text-amber-600 dark:text-amber-400" /> },
  { id: 'sup2', title: 'GlobalSource Ltd.', subtitle: 'Protocol: SFTP (CSV) · 14,800 SKUs Active Feed', category: 'suppliers', badge: 'Supplier', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/60', path: '/suppliers', icon: <Truck size={16} className="text-amber-600 dark:text-amber-400" /> },
  { id: 'sup3', title: 'PrimeSupply Corp', subtitle: 'Protocol: FTP (XML) · 11,200 SKUs Active Feed', category: 'suppliers', badge: 'Supplier', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/60', path: '/suppliers', icon: <Truck size={16} className="text-amber-600 dark:text-amber-400" /> },
  { id: 'sup4', title: 'Acme Distributors', subtitle: 'Protocol: Excel Feed Upload · 9,800 SKUs Feed', category: 'suppliers', badge: 'Supplier', badgeColor: 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/60 dark:text-amber-400 dark:border-amber-900/60', path: '/suppliers', icon: <Truck size={16} className="text-amber-600 dark:text-amber-400" /> },

  // Manufacturers & Brands
  { id: 'm1', title: 'NVIDIA Corporation', subtitle: 'Manufacturer Partner · GPU & AI Accelerators', category: 'manufacturers', badge: 'Manufacturer', badgeColor: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900/60', path: '/catalog/manufacturers', icon: <Award size={16} className="text-purple-600 dark:text-purple-400" /> },
  { id: 'm2', title: 'Advanced Micro Devices (AMD)', subtitle: 'Manufacturer Partner · CPUs & GPUs', category: 'manufacturers', badge: 'Manufacturer', badgeColor: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-900/60', path: '/catalog/manufacturers', icon: <Award size={16} className="text-purple-600 dark:text-purple-400" /> },
  { id: 'b1', title: 'Corsair Components', subtitle: 'Brand Partner · PC Memory, Power Supplies & Cooling', category: 'brands', badge: 'Brand', badgeColor: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/60 dark:text-pink-400 dark:border-pink-900/60', path: '/catalog/brands', icon: <Award size={16} className="text-pink-600 dark:text-pink-400" /> },
  { id: 'b2', title: 'Samsung Electronics', subtitle: 'Brand Partner · High Performance Solid State Drives', category: 'brands', badge: 'Brand', badgeColor: 'bg-pink-50 text-pink-600 border-pink-200 dark:bg-pink-950/60 dark:text-pink-400 dark:border-pink-900/60', path: '/catalog/brands', icon: <Award size={16} className="text-pink-600 dark:text-pink-400" /> },

  // Categories
  { id: 'c1', title: 'Computer Processors (CPUs)', subtitle: 'Category Taxonomy · 1,420 Master SKUs', category: 'categories', badge: 'Category', badgeColor: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/60', path: '/catalog/categories', icon: <Tag size={16} className="text-blue-600 dark:text-blue-400" /> },
  { id: 'c2', title: 'Graphics Cards (GPUs)', subtitle: 'Category Taxonomy · 2,100 Master SKUs', category: 'categories', badge: 'Category', badgeColor: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-900/60', path: '/catalog/categories', icon: <Tag size={16} className="text-blue-600 dark:text-blue-400" /> },

  // Jobs
  { id: 'j1', title: 'Full Catalog Inventory Sync', subtitle: 'Background Execution Job ID: job_84290 · 100% Synced', category: 'jobs', badge: 'Sync Job', badgeColor: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-900/60', path: '/sync/jobs', icon: <Briefcase size={16} className="text-cyan-600 dark:text-cyan-400" /> },
  { id: 'j2', title: 'Storefront Price Push Execution', subtitle: 'Background Execution Job ID: job_84291 · Running', category: 'jobs', badge: 'Sync Job', badgeColor: 'bg-cyan-50 text-cyan-600 border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-400 dark:border-cyan-900/60', path: '/sync/jobs', icon: <Briefcase size={16} className="text-cyan-600 dark:text-cyan-400" /> },

  // Logs & Validation Errors
  { id: 'l1', title: 'Missing Pricing Error (SKU-ERR-994)', subtitle: 'Validation Issue: Retail price missing · Pending Review', category: 'logs', badge: 'Validation Log', badgeColor: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/60', path: '/validation', icon: <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" /> },
  { id: 'l2', title: 'Duplicate UPC Code Error (SKU-ERR-102)', subtitle: 'Validation Issue: Duplicate UPC detected · Pending Review', category: 'logs', badge: 'Validation Log', badgeColor: 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/60 dark:text-rose-400 dark:border-rose-900/60', path: '/validation', icon: <AlertTriangle size={16} className="text-rose-600 dark:text-rose-400" /> },
]

interface HeaderProps {
  onMenuClick: () => void
  darkMode: boolean
  onToggleDark: () => void
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, darkMode, onToggleDark }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser, role, logout, openCurrentUserProfile } = useAuth()
  const { favorites, isFavorite, toggleFavorite, removeFavorite } = useFavorites()
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showFavoritesDropdown, setShowFavoritesDropdown] = useState(false)
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchCategory, setSearchCategory] = useState('all')

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)
  const favRef = useRef<HTMLDivElement>(null)

  // Map active route to page item label
  const currentPath = location.pathname
  const isCurrentPinned = isFavorite(currentPath)

  const getActivePageItem = () => {
    if (currentPath === '/') return { id: 'dashboard', label: 'Dashboard', path: '/' }
    if (currentPath.startsWith('/catalog/products')) return { id: 'products', label: 'Products Catalog', path: '/catalog/products' }
    if (currentPath.startsWith('/catalog/categories')) return { id: 'categories', label: 'Categories Taxonomy', path: '/catalog/categories' }
    if (currentPath.startsWith('/catalog/brands')) return { id: 'brands', label: 'Brands Directory', path: '/catalog/brands' }
    if (currentPath.startsWith('/catalog/manufacturers')) return { id: 'manufacturers', label: 'Manufacturers', path: '/catalog/manufacturers' }
    if (currentPath.startsWith('/validation')) return { id: 'validation', label: 'Validation Center', path: '/validation' }
    if (currentPath.startsWith('/sync/jobs')) return { id: 'sync-jobs', label: 'Sync Queue Management', path: '/sync/jobs' }
    if (currentPath.startsWith('/sync/inventory')) return { id: 'inventory-sync', label: 'Inventory Sync', path: '/sync/inventory' }
    if (currentPath.startsWith('/reports')) return { id: 'reports', label: 'Reports & Analytics', path: '/reports' }
    if (currentPath.startsWith('/logs')) return { id: 'logs', label: 'Activity Logs', path: '/logs' }
    if (currentPath.startsWith('/settings')) return { id: 'settings', label: 'Platform Settings', path: '/settings' }
    return { id: currentPath.replace('/', '') || 'root', label: currentPath === '/' ? 'Dashboard' : currentPath.split('/')[1], path: currentPath }
  }

  const activePageItem = getActivePageItem()

  // ⌘K Shortcut Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowSearchModal(prev => !prev)
      }
      if (e.key === 'Escape') {
        setShowSearchModal(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false)
      }
      if (favRef.current && !favRef.current.contains(e.target as Node)) {
        setShowFavoritesDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // --- Dynamic Search Result Filtering ---
  const filteredSearchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    return SEARCH_DATABASE.filter(item => {
      // Category Match
      const matchCategory = searchCategory === 'all' || item.category === searchCategory

      // Query Match
      const matchQuery =
        query === '' ||
        item.title.toLowerCase().includes(query) ||
        item.subtitle.toLowerCase().includes(query) ||
        item.badge.toLowerCase().includes(query)

      return matchCategory && matchQuery
    })
  }, [searchQuery, searchCategory])

  const handleSelectResult = (path: string) => {
    setShowSearchModal(false)
    navigate(path)
  }

  const notifications = [
    { id: 1, message: 'QuickShip sync failed — 256 items', time: '1 min ago', type: 'error' },
    { id: 2, message: 'AcmeDistributors FTP connection error', time: '23 min ago', type: 'warning' },
    { id: 3, message: 'Inventory sync completed — PrimeSup', time: '32 min ago', type: 'success' },
    { id: 4, message: '5 products pending validation review', time: '1 hr ago', type: 'info' },
  ]

  return (
    <>
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 h-14 flex items-center px-3 sm:px-4 gap-3 sm:gap-4 transition-colors duration-200">
        {/* Mobile menu & Glowing Brand Badge */}
        <div className="flex items-center gap-2 lg:hidden">
          <button onClick={onMenuClick} className="btn-icon text-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-violet-600 to-cyan-400 p-[1.5px] shadow-sm flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center text-white">
                <Zap size={15} className="text-amber-400 fill-amber-400/20 animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Trigger */}
        <div
          className="relative flex-1 max-w-sm hidden sm:block cursor-pointer"
          onClick={() => setShowSearchModal(true)}
        >
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            readOnly
            placeholder="Search products, suppliers, brands, SKUs, jobs..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-700/60 focus:bg-white dark:focus:bg-slate-900 focus:border-slate-200 dark:focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 dark:text-slate-100 cursor-pointer"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden xl:inline-block px-1.5 py-0.5 text-2xs font-medium text-slate-400 dark:text-slate-500 bg-slate-200 dark:bg-slate-700/80 rounded">⌘K</kbd>
        </div>

        {/* ⭐ Front-End Quick Access Favorites Button Pills Bar */}
        <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto scrollbar-hide max-w-md py-1">
          {favorites.map(fav => {
            const isActive = currentPath === fav.path || (fav.path !== '/' && currentPath.startsWith(fav.path))
            return (
              <Link
                key={fav.id}
                to={fav.path}
                className={`px-2.5 py-1 rounded-xl text-2xs font-bold flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer shadow-2xs border ${
                  isActive
                    ? 'bg-amber-500 text-white border-amber-600 shadow-amber-500/20 font-black'
                    : 'bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700/80 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400'
                }`}
                title={`Go to ${fav.label}`}
              >
                <Star size={11} className={isActive ? 'fill-white text-white' : 'fill-amber-400 text-amber-400'} />
                <span className="truncate max-w-[110px]">{fav.label}</span>
                <span
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    removeFavorite(fav.id)
                  }}
                  className="hover:text-rose-500 p-0.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/80 transition-colors"
                  title="Unpin Favorite"
                >
                  <X size={10} />
                </span>
              </Link>
            )
          })}
        </div>


        <div className="flex items-center gap-1 ml-auto">
          {/* ⭐ Pin Active Page Button */}
          <button
            type="button"
            onClick={() => toggleFavorite(activePageItem)}
            className={`btn-icon transition-colors relative cursor-pointer ${
              isCurrentPinned
                ? 'text-amber-400 bg-amber-500/10 border-amber-400/30'
                : 'text-slate-400 dark:text-slate-500 hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isCurrentPinned ? `Unpin ${activePageItem.label} from Favorites` : `Pin ${activePageItem.label} to Favorites`}
          >
            <Star size={18} className={isCurrentPinned ? 'fill-amber-400 text-amber-400' : ''} />
          </button>

          {/* ⭐ Favorites Dropdown Quick Menu */}
          <div className="relative" ref={favRef}>
            <button
              onClick={() => setShowFavoritesDropdown(!showFavoritesDropdown)}
              className="btn-icon relative dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              title="Favorite Pinned Pages"
            >
              <Star size={18} className={favorites.length > 0 ? 'fill-amber-400/20 text-amber-400' : 'text-slate-400'} />
              {favorites.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-900" />
              )}
            </button>
            {showFavoritesDropdown && (
              <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:w-72 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Star size={14} className="fill-amber-400 text-amber-400" /> Favorites ({favorites.length})
                  </span>
                  <span className="text-2xs text-slate-400 font-mono">User Pinned</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto">
                  {favorites.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 italic">
                      No pinned pages yet. Click the ⭐ icon on top header to pin any page!
                    </div>
                  ) : (
                    favorites.map(fav => (
                      <div key={fav.id} className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between group">
                        <Link
                          to={fav.path}
                          onClick={() => setShowFavoritesDropdown(false)}
                          className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-amber-500 truncate"
                        >
                          <Star size={13} className="fill-amber-400 text-amber-400 flex-shrink-0" />
                          <span className="truncate">{fav.label}</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeFavorite(fav.id)}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
                          title="Unpin"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDark}
            className={`btn-icon transition-colors ${darkMode ? 'text-amber-400 bg-slate-800 hover:bg-slate-700' : 'text-slate-600 hover:bg-slate-100'}`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={18} className="text-amber-400" /> : <Moon size={18} className="text-slate-600" />}
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="btn-icon relative dark:text-slate-300 dark:hover:bg-slate-800"
              title="Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            </button>
            {showNotifications && (
              <div className="fixed inset-x-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-10 sm:w-80 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card-lg z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">Notifications</span>
                  <span className="badge-danger">4 new</span>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-72 overflow-y-auto">
                  {notifications.map(n => (
                    <Link
                      key={n.id}
                      to="/notifications"
                      onClick={() => setShowNotifications(false)}
                      className="px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer block text-left"
                    >
                      <p className="text-sm text-slate-700 dark:text-slate-200 leading-snug">{n.message}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{n.time}</p>
                    </Link>
                  ))}
                </div>
                <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setShowNotifications(false)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:text-primary-700 block w-full py-1"
                  >
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          <div className="relative ml-1" ref={profileRef}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              title="User Profile & Account"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-primary flex items-center justify-center text-xs font-bold text-white shadow-sm ring-2 ring-primary-500/20">
                {getInitials(currentUser.name)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">{currentUser.name}</p>
                <p className="text-2xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{ROLE_LABELS[role]}</p>
              </div>
              <ChevronDown size={14} className="text-slate-400 dark:text-slate-500 hidden sm:block" />
            </button>

            {showProfileMenu && (
              <div className="fixed right-3 top-14 sm:absolute sm:inset-x-auto sm:right-0 sm:top-11 w-60 card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card-lg z-50 p-2 overflow-hidden">
                {/* User info preview header */}
                <div
                  onClick={() => { setShowProfileMenu(false); openCurrentUserProfile(); }}
                  className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl mb-1.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border border-slate-100 dark:border-slate-750"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-primary flex items-center justify-center text-sm font-bold text-white">
                    {getInitials(currentUser.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{currentUser.name}</p>
                    <p className="text-2xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                </div>

                {/* View Profile Action */}
                <button
                  onClick={() => { setShowProfileMenu(false); openCurrentUserProfile(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2"
                >
                  <User size={14} className="text-slate-500 dark:text-slate-400" />
                  View Full Profile
                </button>

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1.5" />

                {/* Logout Action */}
                <button
                  onClick={() => { setShowProfileMenu(false); logout(); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <LogOut size={14} className="text-rose-500" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal Overlay */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Modal Search Bar Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <Search size={18} className="text-primary-600 dark:text-primary-400" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search Products, Suppliers, Manufacturers, Brands, Categories, SKUs, Jobs, Logs..."
                className="w-full text-sm bg-transparent outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 font-medium"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="btn-icon text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search Category Filter Pills */}
            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-slate-50/50 dark:bg-slate-950/40">
              {[
                { id: 'all', label: 'All Results' },
                { id: 'products', label: 'Products' },
                { id: 'suppliers', label: 'Suppliers' },
                { id: 'manufacturers', label: 'Manufacturers' },
                { id: 'brands', label: 'Brands' },
                { id: 'categories', label: 'Categories' },
                { id: 'skus', label: 'SKUs' },
                { id: 'jobs', label: 'Jobs' },
                { id: 'logs', label: 'Logs' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSearchCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-2xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    searchCategory === cat.id
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Results List / Command Palette Body */}
            <div className="p-4 overflow-y-auto space-y-4 flex-1 max-h-[400px]">
              {searchQuery.trim() === '' && searchCategory === 'all' ? (
                <div className="space-y-4">
                  {/* Quick Navigation Shortcuts */}
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Quick Navigation Shortcuts</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Master Catalog', path: '/catalog/products', icon: <Package size={14} className="text-primary-600 dark:text-primary-400" /> },
                        { label: 'Validation Center', path: '/validation', icon: <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> },
                        { label: 'Supplier Management', path: '/suppliers', icon: <Truck size={14} className="text-amber-600 dark:text-amber-400" /> },
                        { label: 'Queue Management', path: '/sync/jobs', icon: <Briefcase size={14} className="text-cyan-600 dark:text-cyan-400" /> },
                        { label: 'Inventory Sync', path: '/sync/inventory', icon: <Layers size={14} className="text-indigo-600 dark:text-indigo-400" /> },
                        { label: 'Operational Reports', path: '/reports', icon: <FileText size={14} className="text-violet-600 dark:text-violet-400" /> },
                      ].map(item => (
                        <div
                          key={item.path}
                          onClick={() => handleSelectResult(item.path)}
                          className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer"
                        >
                          {item.icon}
                          <span className="truncate">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Popular Searches */}
                  <div>
                    <p className="text-2xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">Popular Searches</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {['RTX 4090', 'TechParts International', 'CPU-AMD-7950X', 'Missing Pricing', 'Full Sync Job'].map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSearchQuery(tag)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/40 text-slate-600 dark:text-slate-300 hover:text-primary-600 text-2xs font-semibold transition-all border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : filteredSearchResults.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  No matching results found for <span className="font-bold text-slate-600 dark:text-slate-300">"{searchQuery || searchCategory}"</span>.
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredSearchResults.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectResult(item.path)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60 flex items-center justify-between hover:border-primary-300 dark:hover:border-primary-700 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                          {item.icon}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.title}</p>
                          <p className="text-2xs text-slate-400 mt-0.5">{item.subtitle}</p>
                        </div>
                      </div>
                      <span className={`text-2xs font-bold px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-2xs text-slate-400 font-semibold">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-800 rounded font-mono">ESC</kbd> to close</span>
              <span>SupplyBridge Enterprise Global Search</span>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
