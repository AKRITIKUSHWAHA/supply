import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'

export interface FavoriteItem {
  id: string
  label: string
  path: string
  iconName?: string
}

interface FavoritesContextType {
  favorites: FavoriteItem[]
  isFavorite: (path: string) => boolean
  toggleFavorite: (item: FavoriteItem) => void
  removeFavorite: (id: string) => void
}

const DEFAULT_FAVORITES: FavoriteItem[] = [
  { id: 'products', label: 'Master Products Catalog', path: '/catalog/products', iconName: 'Package' },
  { id: 'product-mapping', label: 'Product Mapping', path: '/mapping/products', iconName: 'ArrowLeftRight' },
  { id: 'validation', label: 'Validation Center', path: '/validation', iconName: 'ShieldCheck' },
  { id: 'inventory-sync', label: 'Inventory Sync', path: '/sync/inventory', iconName: 'RefreshCw' },
]

const FavoritesContext = createContext<FavoritesContextType | null>(null)

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth()
  const storageKey = `supplybridge_favorites_${currentUser.id}`

  const [favorites, setFavorites] = useState<FavoriteItem[]>(() => {
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse saved favorites', e)
      }
    }
    return DEFAULT_FAVORITES
  })

  // Re-sync favorites when active demo user changes
  useEffect(() => {
    const key = `supplybridge_favorites_${currentUser.id}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        setFavorites(JSON.parse(saved))
      } catch (e) {
        setFavorites(DEFAULT_FAVORITES)
      }
    } else {
      setFavorites(DEFAULT_FAVORITES)
    }
  }, [currentUser.id])

  const isFavorite = (path: string) => {
    return favorites.some(f => f.path === path || (f.path !== '/' && path.startsWith(f.path)))
  }

  const toggleFavorite = (item: FavoriteItem) => {
    setFavorites(prev => {
      let updated: FavoriteItem[]
      if (prev.some(f => f.id === item.id || f.path === item.path)) {
        updated = prev.filter(f => f.id !== item.id && f.path !== item.path)
      } else {
        updated = [...prev, item]
      }
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => {
      const updated = prev.filter(f => f.id !== id)
      localStorage.setItem(storageKey, JSON.stringify(updated))
      return updated
    })
  }

  return (
    <FavoritesContext.Provider value={{ favorites, isFavorite, toggleFavorite, removeFavorite }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider')
  }
  return context
}
