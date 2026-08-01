<<<<<<< HEAD
import React, { createContext, useContext, useState } from 'react'
=======
import React, { createContext, useContext, useState, useEffect } from 'react'
>>>>>>> d8a736a39cd7dc583a35cd8a605dec0158cf287f
import type { Supplier } from '../types'

interface SupplierContextType {
  suppliersList: Supplier[]
  setSuppliersList: React.Dispatch<React.SetStateAction<Supplier[]>>
  refreshSuppliers: () => Promise<void>
}

const SupplierContext = createContext<SupplierContextType | null>(null)

export const SupplierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([])

<<<<<<< HEAD
  React.useEffect(() => {
    fetch('http://localhost:5000/api/suppliers')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data)) {
          setSuppliersList(data as unknown as Supplier[])
        }
      })
      .catch(err => console.error('Failed to fetch real suppliers:', err))
=======
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
>>>>>>> d8a736a39cd7dc583a35cd8a605dec0158cf287f
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
