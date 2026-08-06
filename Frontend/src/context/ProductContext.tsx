import { API_BASE_URL } from '../config/api'
import React, { createContext, useContext, useState } from 'react'
import type { Product } from '../types'

interface ProductContextType {
  productsList: Product[]
  setProductsList: React.Dispatch<React.SetStateAction<Product[]>>
}

const ProductContext = createContext<ProductContextType | null>(null)

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productsList, setProductsList] = useState<Product[]>([])

  React.useEffect(() => {
    fetch(`${API_BASE_URL}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setProductsList(data as unknown as Product[])
        }
      })
      .catch(err => console.error('Failed to fetch real products:', err))
  }, [])

  return (
    <ProductContext.Provider value={{ productsList, setProductsList }}>
      {children}
    </ProductContext.Provider>
  )
}

export const useProducts = () => {
  const ctx = useContext(ProductContext)
  if (!ctx) throw new Error('useProducts must be used inside ProductProvider')
  return ctx
}
