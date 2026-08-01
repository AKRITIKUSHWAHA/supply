import React, { createContext, useContext, useState, useEffect } from 'react'
import type { Supplier } from '../types'

interface SupplierContextType {
  suppliersList: Supplier[]
  setSuppliersList: React.Dispatch<React.SetStateAction<Supplier[]>>
  refreshSuppliers: () => Promise<void>
}

const SupplierContext = createContext<SupplierContextType | null>(null)

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([])

  const refreshSuppliers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/suppliers')
      const data = await res.json()
      if (Array.isArray(data)) {
        setSuppliersList(data)
      }
    } catch (err) {
      console.error('Failed to fetch real suppliers:', err)
    }
  }

  useEffect(() => {
    refreshSuppliers()
  }, [])

  return (
    <SupplierContext.Provider value={{ suppliersList, setSuppliersList, refreshSuppliers }}>
      {children}
    </SupplierContext.Provider>
  )
}

export const useSuppliers = () => {
  const ctx = useContext(SupplierContext)
  if (!ctx) throw new Error('useSuppliers must be used inside SupplierProvider')
  return ctx
}
