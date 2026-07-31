import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from './context/AuthContext'
import { SupplierProvider } from './context/SupplierContext'
import { ProductProvider } from './context/ProductContext'
import { FavoritesProvider } from './context/FavoritesContext'
import { AppRouter } from './router'
import './index.css'

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

