import React, { createContext, useContext, useState } from 'react'
import { mockProducts } from '../data/mockData'
import type { Product } from '../types'

interface ProductContextType {
  productsList: Product[]
  setProductsList: React.Dispatch<React.SetStateAction<Product[]>>
}

const ProductContext = createContext<ProductContextType | null>(null)

export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [productsList, setProductsList] = useState<Product[]>(mockProducts)

  React.useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data) && data.length > 0) {
          // Map DB models to Frontend types if needed, or just set it
          // In a real app we'd map fields if they diverge, but for now we'll just set it
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
