import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { SupplierProvider } from './context/SupplierContext'
import { ProductProvider } from './context/ProductContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AppRouter } from './router'
import './index.css'

// Global fetch interceptor to attach active user role header for Backend Maintenance Mode & Authorization checks
const originalFetch = window.fetch
window.fetch = async function (...args) {
  let [resource, config] = args
  const urlStr = typeof resource === 'string' ? resource : (resource as Request).url || ''

  if (urlStr.includes('localhost:5000/api')) {
    config = config || {}
    const headers = new Headers(config.headers || {})
    if (!headers.has('x-user-role')) {
      const activeRole = localStorage.getItem('supplybridge_role') || 'platform_owner'
      headers.set('x-user-role', activeRole)
    }
    config.headers = headers
  }

  return originalFetch.call(window, resource, config)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SupplierProvider>
        <ProductProvider>
          <FavoritesProvider>
            <AppRouter />
          </FavoritesProvider>
        </ProductProvider>
      </SupplierProvider>
    </AuthProvider>
  </React.StrictMode>,
)
