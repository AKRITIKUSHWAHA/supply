import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { SupplierProvider } from './context/SupplierContext'
import { ProductProvider } from './context/ProductContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { GlobalErrorAlertContainer } from './components/common/GlobalErrorAlert'
import { AppRouter } from './router'
import './index.css'

// Global fetch interceptor to attach active user role header & auto-trigger Global Popup Alerts on HTTP API errors
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

  try {
    const response = await originalFetch.call(window, resource, config)

    // Intercept 4xx and 5xx API Response Errors and trigger Global Popup Alert
    if (!response.ok && urlStr.includes('localhost:5000/api')) {
      const cloned = response.clone()
      cloned.json().then(data => {
        const errorMsg = data.error || data.message || `API Request failed with HTTP Status ${response.status}`
        if (window.showErrorAlert) {
          window.showErrorAlert(errorMsg, `API Error (${response.status})`)
        }
      }).catch(() => {
        if (window.showErrorAlert) {
          window.showErrorAlert(`API Request failed with HTTP Status ${response.status}`, `API Error (${response.status})`)
        }
      })
    }

    return response
  } catch (err: any) {
    // Intercept Network / Connection Failures
    const networkMsg = err.message || 'Unable to connect to Backend API. Please check server connection.'
    if (window.showErrorAlert && urlStr.includes('localhost:5000/api')) {
      window.showErrorAlert(networkMsg, 'Network Connection Error')
    }
    throw err
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SupplierProvider>
        <ProductProvider>
          <FavoritesProvider>
            <GlobalErrorAlertContainer />
            <AppRouter />
          </FavoritesProvider>
        </ProductProvider>
      </SupplierProvider>
    </AuthProvider>
  </React.StrictMode>,
)
