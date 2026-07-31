import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Truck, Plug, Database, Package, Tag, Award,
  Layers, ArrowLeftRight, ShieldCheck, RefreshCw, DollarSign,
  Image, Store, Globe, Briefcase, Download, FileText, Activity,
  BarChart3, Users, UserCog, Lock, Settings, ChevronDown,
  ChevronRight, Zap, X, Menu, User, LogOut, Sliders, Plus, Star
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useFavorites } from '../../context/FavoritesContext'
import { cn, getInitials } from '../../utils'

interface NavItem {
  id: string
  label: string
  icon: React.ReactNode
  path?: string
  module?: string
  children?: NavItem[]
}


const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard',    label: 'Dashboard',          icon: <LayoutDashboard size={18} />, path: '/',           module: 'dashboard' },
  {
    id: 'catalog', label: 'Catalog', icon: <Database size={18} />, module: 'catalog',
    children: [
      { id: 'products',      label: 'Products',      icon: <Package size={16} />,  path: '/catalog/products',      module: 'products' },
      { id: 'categories',    label: 'Categories',    icon: <Tag size={16} />,      path: '/catalog/categories',    module: 'categories' },
      { id: 'brands',        label: 'Brands',        icon: <Award size={16} />,    path: '/catalog/brands',        module: 'brands' },
      { id: 'manufacturers', label: 'Manufacturers', icon: <Truck size={16} />,    path: '/catalog/manufacturers', module: 'manufacturers' },
      { id: 'variants',      label: 'Variants',      icon: <Layers size={16} />,   path: '/catalog/variants',      module: 'variants' },
      { id: 'media',         label: 'Media Library', icon: <Image size={16} />,    path: '/catalog/media',         module: 'media' },
    ],
  },
  {
    id: 'suppliers', label: 'Suppliers', icon: <Truck size={18} />, module: 'suppliers',
    children: [
      { id: 'supplier-mgmt',       label: 'Supplier Management', icon: <Truck size={16} />, path: '/suppliers',            module: 'suppliers' },
      { id: 'supplier-onboarding', label: 'Supplier Onboarding', icon: <Plus size={16} />,  path: '/suppliers/onboarding', module: 'suppliers' },
    ],
  },
  { id: 'stores', label: 'Stores', icon: <Store size={18} />, path: '/stores', module: 'store_management' },
  {
    id: 'mapping', label: 'Data Mapping', icon: <ArrowLeftRight size={18} />, module: 'mapping',
    children: [
      { id: 'product-mapping',   label: 'Product Mapping',   icon: <Package size={16} />,  path: '/mapping/products',   module: 'mapping' },
      { id: 'category-mapping',  label: 'Category Mapping',  icon: <Tag size={16} />,      path: '/mapping/categories', module: 'mapping' },
      { id: 'brand-mapping',     label: 'Brand Mapping',     icon: <Award size={16} />,    path: '/mapping/brands',     module: 'mapping' },
      { id: 'variant-mapping',   label: 'Variant Mapping',   icon: <Layers size={16} />,   path: '/mapping/variants',   module: 'mapping' },
      { id: 'attribute-mapping', label: 'Attribute Mapping', icon: <Sliders size={16} />, path: '/mapping/attributes', module: 'mapping' },
    ],
  },
  { id: 'validation', label: 'Validation Center', icon: <ShieldCheck size={18} />, path: '/validation', module: 'validation' },
  {
    id: 'sync', label: 'Synchronization', icon: <RefreshCw size={18} />, module: 'inventory_sync',
    children: [
      { id: 'sync-jobs',      label: 'Queue Management', icon: <Briefcase size={16} />, path: '/sync/jobs',      module: 'sync_jobs' },
      { id: 'inventory-sync', label: 'Inventory Sync',   icon: <RefreshCw size={16} />, path: '/sync/inventory', module: 'inventory_sync' },
      { id: 'pricing-sync',   label: 'Pricing Sync',     icon: <DollarSign size={16} />,path: '/sync/pricing',   module: 'pricing_sync' },
      { id: 'image-sync',     label: 'Image Sync',       icon: <Image size={16} />,     path: '/sync/images',    module: 'image_sync' },
      { id: 'website-sync',   label: 'Store Synchronization', icon: <Globe size={16} />,     path: '/sync/website',   module: 'website_sync' },
    ],
  },
  { id: 'reports', label: 'Reports', icon: <BarChart3 size={18} />, path: '/reports', module: 'reports' },
  { id: 'activity-logs', label: 'Activity & Logs', icon: <FileText size={18} />, path: '/logs', module: 'logs' },
  {
    id: 'administration', label: 'Administration', icon: <UserCog size={18} />, module: 'users',
    children: [
      { id: 'users',         label: 'Users',         icon: <Users size={16} />,    path: '/users',         module: 'users' },
      { id: 'roles',         label: 'Roles',         icon: <UserCog size={16} />,  path: '/roles',         module: 'roles' },
      { id: 'permissions',   label: 'Permissions',   icon: <Lock size={16} />,     path: '/permissions',   module: 'permissions' },
      { id: 'notifications', label: 'Notifications', icon: <Zap size={16} />,      path: '/notifications', module: 'settings' },
      { id: 'settings',      label: 'Settings',      icon: <Settings size={16} />, path: '/settings',      module: 'settings' },
    ],
  },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

const NavGroup: React.FC<{ item: NavItem; onClose: () => void }> = ({ item, onClose }) => {
  const [expanded, setExpanded] = useState(true)
  const location = useLocation()
  const { hasPermission } = useAuth()
  
  const visibleChildren = item.children?.filter(c => !c.module || hasPermission(c.module)) || []
  if (visibleChildren.length === 0) return null

  const isChildActive = visibleChildren.some(c => {
    if (!c.path) return false
    return c.path === '/suppliers' ? location.pathname === '/suppliers' : location.pathname.startsWith(c.path)
  })

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn('sidebar-item w-full justify-between', isChildActive && 'text-amber-400 font-bold bg-slate-800/80 border-l-2 border-amber-500 pl-3')}
      >
        <span className="flex items-center gap-3">
          <span className="opacity-80">{item.icon}</span>
          {item.label}
        </span>
        <motion.span
          animate={{ rotate: expanded ? 90 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight size={14} className="opacity-50" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-3.5 pl-3 border-l border-slate-800/80 mt-0.5 mb-0.5 space-y-0.5">
              {visibleChildren.map(child => (
                <NavLink
                  key={child.id}
                  to={child.path!}
                  end={child.path === '/suppliers'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn('sidebar-item text-xs', isActive && 'sidebar-item-active')
                  }
                >
                  <span className="opacity-70">{child.icon}</span>
                  {child.label}
                </NavLink>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { hasPermission, currentUser, openCurrentUserProfile, logout } = useAuth()
  const { favorites, removeFavorite } = useFavorites()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.module && !hasPermission(item.module)) return false
    if (item.children) {
      const validChildren = item.children.filter(c => !c.module || hasPermission(c.module))
      return validChildren.length > 0
    }
    return true
  })

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-40 lg:hidden cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 lg:static lg:translate-x-0 flex flex-col h-full bg-gradient-sidebar border-r border-slate-800/80 transition-transform duration-300 ease-in-out flex-shrink-0",
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        )}
      >
        {/* Premium Brand Logo */}
        <div className="px-4 py-4 border-b border-slate-800/80 flex items-center justify-between flex-shrink-0 bg-slate-950/60 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Glowing 3D Brand Icon Badge with Pulse Ring */}
            <div className="relative group cursor-pointer">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-violet-600 to-cyan-400 p-[2px] shadow-glow-primary transition-all duration-300 group-hover:scale-105">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                  <Zap size={20} className="text-amber-400 fill-amber-400/20 drop-shadow-md animate-pulse" />
                </div>
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-pulse shadow-glow-emerald" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-white text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent drop-shadow-xs">
                  SupplyBridge
                </span>
                <span className="text-[9px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider shadow-xs border border-amber-400/40">
                  PRO
                </span>
              </div>
              <span className="block text-[10px] text-amber-400 dark:text-cyan-400 font-extrabold tracking-widest uppercase">
                Enterprise PIM Middleware
              </span>
            </div>
          </div>

          <button onClick={onClose} className="lg:hidden btn-icon text-slate-400 hover:text-white hover:bg-slate-800">
            <X size={18} />
          </button>
        </div>

        {/* Nav list */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1 scrollbar-hide">


          {visibleItems.map(item => {

            if (item.children) {
              return <NavGroup key={item.id} item={item} onClose={onClose} />
            }
            return (
              <NavLink
                key={item.id}
                to={item.path!}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  cn('sidebar-item', isActive && 'sidebar-item-active')
                }
              >
                <span className="opacity-80">{item.icon}</span>
                {item.label}
              </NavLink>
            )
          })}

        </nav>

        {/* User Profile Footer Card */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/80 space-y-2 backdrop-blur-md flex-shrink-0">
          <div
            onClick={() => { onClose(); openCurrentUserProfile(); }}
            className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-primary-500/40 hover:bg-slate-850 transition-all duration-200 cursor-pointer group"
            title="Click to view profile"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-aurora flex items-center justify-center text-xs font-black text-white shadow-glow-primary flex-shrink-0 group-hover:scale-105 transition-transform">
              {getInitials(currentUser.name)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate group-hover:text-cyan-300 transition-colors">{currentUser.name}</p>
              <p className="text-2xs text-slate-400 truncate font-medium capitalize">{currentUser.role.replace('_', ' ')}</p>
            </div>
            <User size={14} className="text-slate-400 group-hover:text-white transition-colors" />
          </div>

          {/* Direct Logout Button in Sidebar Footer */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/20 transition-all duration-200 shadow-glow-rose"
          >
            <LogOut size={14} />
            Logout
          </button>

          <div className="flex items-center justify-between px-2 pt-1">
            <span className="text-2xs text-slate-500 font-semibold uppercase tracking-wider">System Status</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-slow shadow-glow-emerald" />
              <span className="text-2xs text-emerald-400 font-bold">Operational</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
