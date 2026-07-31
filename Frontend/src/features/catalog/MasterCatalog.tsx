import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Package,
  ArrowUpRight,
  Trash2,
  UploadCloud,
  Layers,
  Tag,
  DollarSign,
  Boxes,
  Check,
  Download,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { SectionHeader, FilterBar, Tabs, ConfirmDialog, Select } from '../../components/ui'
import { Modal } from '../../components/ui/Modal'
import { statusToVariant, timeAgo } from '../../utils'
import type { Product, ProductStatus, ValidationStatus } from '../../types'

import { useAuth } from '../../context/AuthContext'
import { useSuppliers } from '../../context/SupplierContext'
import { useProducts } from '../../context/ProductContext'

export const MasterCatalog: React.FC = () => {
  const { role } = useAuth()
  const { suppliersList } = useSuppliers()
  const { productsList, setProductsList } = useProducts()
  const canManageCatalog = role === 'platform_owner' || role === 'administrator' || role === 'catalog_manager'
  const canDelete = role === 'platform_owner' || role === 'administrator'
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Modals state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    brand: '',
    categoryName: '',
    supplierName: 'TechParts International',
    retailPrice: 99.99,
    costPrice: 65.0,
    stock: 50,
    metaTitle: '',
    metaDescription: '',
    focusKeyword: '',
  })

  const showNotification = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // --- Filtering ---
  const filteredProducts = productsList.filter(product => {
    // Search filter
    const matchesSearch =
      product.name.toLowerCase().includes(search.toLowerCase()) ||
      product.sku.toLowerCase().includes(search.toLowerCase()) ||
      (product.brand && product.brand.toLowerCase().includes(search.toLowerCase()))

    // Tab filter
    let matchesTab = true
    if (tab === 'published') matchesTab = product.status === 'published'
    if (tab === 'needs_validation') matchesTab = product.validationStatus === 'failed'
    if (tab === 'draft') matchesTab = product.status === 'draft'
    if (tab === 'failed') matchesTab = product.status === 'failed'

    // Dropdown Status Filter
    let matchesStatus = true
    if (statusFilter !== 'all') {
      matchesStatus = product.status === statusFilter
    }

    // Dropdown Supplier Filter
    let matchesSupplier = true
    if (supplierFilter !== 'all') {
      matchesSupplier = product.supplierName === supplierFilter
    }

    return matchesSearch && matchesTab && matchesStatus && matchesSupplier
  })

  // Pagination calculation
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // --- Multi-select Handlers ---
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pageIds = paginatedProducts.map(p => p.id)
      setSelectedIds(Array.from(new Set([...selectedIds, ...pageIds])))
    } else {
      const pageIds = paginatedProducts.map(p => p.id)
      setSelectedIds(selectedIds.filter(id => !pageIds.includes(id)))
    }
  }

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  // --- Bulk Actions ---
  const handleBulkPublish = () => {
    if (selectedIds.length === 0) return
    setProductsList(prev =>
      prev.map(p =>
        selectedIds.includes(p.id)
          ? { ...p, status: 'published', validationStatus: 'passed' }
          : p
      )
    )
    showNotification(`${selectedIds.length} products published successfully!`)
    setSelectedIds([])
  }

  const handleBulkValidate = () => {
    if (selectedIds.length === 0) return
    setProductsList(prev =>
      prev.map(p =>
        selectedIds.includes(p.id) ? { ...p, validationStatus: 'passed' } : p
      )
    )
    showNotification(`${selectedIds.length} products validated cleanly!`)
    setSelectedIds([])
  }

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    setDeleteConfirmOpen(true)
  }

  const confirmBulkDelete = () => {
    setProductsList(prev => prev.filter(p => !selectedIds.includes(p.id)))
    showNotification(`${selectedIds.length} products deleted.`)
    setSelectedIds([])
    setDeleteConfirmOpen(false)
  }

  // --- Single Actions ---
  const handleSingleDelete = (id: string, name: string) => {
    setProductsList(prev => prev.filter(p => p.id !== id))
    showNotification(`Product "${name}" deleted.`)
  }

  // --- Create Product ---
  const handleCreateProduct = () => {
    if (!newProduct.name.trim() || !newProduct.sku.trim()) {
      alert('Please fill out Name and SKU.')
      return
    }

    const created: Product = {
      id: `p_${Date.now()}`,
      masterId: `MSTR-${newProduct.sku.toUpperCase()}`,
      masterSku: newProduct.sku.toUpperCase(),
      supplierSku: newProduct.sku.toUpperCase(),
      sku: newProduct.sku.toUpperCase(),
      name: newProduct.name,
      brand: newProduct.brand || 'Generic',
      categoryName: newProduct.categoryName || 'General',
      supplierId: 's1',
      supplierName: newProduct.supplierName,
      pricing: {
        supplierPrice: Number(newProduct.costPrice),
        costPrice: Number(newProduct.costPrice),
        wholesalePrice: Number(newProduct.costPrice) * 1.2,
        retailPrice: Number(newProduct.retailPrice),
        mapPrice: Number(newProduct.retailPrice),
        currency: 'USD',
        margin:
          ((Number(newProduct.retailPrice) - Number(newProduct.costPrice)) /
            Number(newProduct.retailPrice)) *
          100,
        lastUpdated: new Date().toISOString(),
      },
      inventory: {
        supplierStock: Number(newProduct.stock),
        warehouseStock: Number(newProduct.stock),
        totalStock: Number(newProduct.stock),
        availableStock: Number(newProduct.stock),
        reservedStock: 0,
        lowStockThreshold: 10,
        status: Number(newProduct.stock) > 0 ? 'in_stock' : 'out_of_stock',
        lastSynced: new Date().toISOString(),
      },
      seo: {
        metaTitle: newProduct.metaTitle,
        metaDescription: newProduct.metaDescription,
        focusKeyword: newProduct.focusKeyword,
      },
      status: 'published',
      validationStatus: 'passed',
      images: [
        {
          id: 'img1',
          url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=150&auto=format&fit=crop&q=80',
          isPrimary: true,
          syncStatus: 'synced',
          position: 0,
        },
      ],
      attributes: [],
      variants: [],
      stores: ['store1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setProductsList([created, ...productsList])
    setAddModalOpen(false)
    setNewProduct({
      name: '',
      sku: '',
      brand: '',
      categoryName: '',
      supplierName: 'TechParts International',
      retailPrice: 99.99,
      costPrice: 65.0,
      stock: 50,
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
    })
    showNotification(`Product "${created.name}" created successfully!`)
  }

  // --- Save Edit Product ---
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p)
    setNewProduct({
      name: p.name,
      sku: p.sku,
      brand: p.brand || '',
      categoryName: p.categoryName || '',
      supplierName: p.supplierName,
      retailPrice: p.pricing.retailPrice,
      costPrice: p.pricing.costPrice,
      stock: p.inventory.availableStock,
      metaTitle: p.seo?.metaTitle || '',
      metaDescription: p.seo?.metaDescription || '',
      focusKeyword: p.seo?.focusKeyword || '',
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    if (!editingProduct) return
    setProductsList(prev =>
      prev.map(p => {
        if (p.id === editingProduct.id) {
          const ret = Number(newProduct.retailPrice)
          const cost = Number(newProduct.costPrice)
          return {
            ...p,
            name: newSupplierVal(newProduct.name, p.name),
            sku: newProduct.sku.toUpperCase(),
            brand: newProduct.brand,
            categoryName: newProduct.categoryName,
            pricing: {
              ...p.pricing,
              retailPrice: ret,
              costPrice: cost,
              margin: ((ret - cost) / ret) * 100,
            },
            inventory: {
              ...p.inventory,
              availableStock: Number(newProduct.stock),
              totalStock: Number(newProduct.stock),
              status: Number(newProduct.stock) > 0 ? 'in_stock' : 'out_of_stock',
            },
            seo: {
              metaTitle: newProduct.metaTitle,
              metaDescription: newProduct.metaDescription,
              focusKeyword: newProduct.focusKeyword,
            },
            updatedAt: new Date().toISOString(),
          }
        }
        return p
      })
    )
    setEditModalOpen(false)
    setEditingProduct(null)
    showNotification(`Product "${newProduct.name}" updated successfully!`)
  }

  const newSupplierVal = (val: string, fallback: string) => (val.trim() ? val : fallback)

  const handleExportCatalogCSV = () => {
    showNotification('Generating Master Catalog CSV export...')
    const csvHeaders = 'SKU,Product Name,Supplier,Category,Brand,Retail Price,Cost Price,Stock,Status,Validation\n'
    const csvRows = productsList.map(p =>
      `"${p.sku}","${p.name.replace(/"/g, '""')}","${p.supplierName}","${p.categoryName || ''}","${p.brand || ''}",${p.pricing.retailPrice},${p.pricing.costPrice},${p.inventory.availableStock},"${p.status}","${p.validationStatus}"`
    ).join('\n')
    const csvContent = csvHeaders + csvRows
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `SupplyBridge_Master_Catalog_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showNotification('Master Catalog CSV file downloaded!')
  }

  const tabs = [
    { id: 'all', label: 'All Products', count: productsList.length },
    { id: 'published', label: 'Published', count: productsList.filter(p => p.status === 'published').length },
    { id: 'needs_validation', label: 'Needs Validation', count: productsList.filter(p => p.validationStatus === 'failed').length },
    { id: 'draft', label: 'Draft', count: productsList.filter(p => p.status === 'draft').length },
    { id: 'failed', label: 'Failed', count: productsList.filter(p => p.status === 'failed').length },
  ]

  return (
    <div className="relative space-y-4 md:space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold"
          >
            <CheckCircle2 size={16} className="text-emerald-400" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <SectionHeader
        title="Master Catalog"
        subtitle="Single source of truth for all product data across suppliers and stores"
        actions={
          <div className={`grid ${canManageCatalog ? 'grid-cols-3' : 'grid-cols-2'} gap-1.5 w-full sm:flex sm:w-auto sm:items-center sm:gap-2`}>
            <button
              onClick={handleExportCatalogCSV}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial"
              title="Download Catalog CSV File"
            >
              <Download size={14} className="text-emerald-600 dark:text-emerald-400" /> Export
            </button>
            <button
              onClick={() => {
                setSearch('')
                setStatusFilter('all')
                setSupplierFilter('all')
                showNotification('Filters reset.')
              }}
              className="btn-secondary btn-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
            >
              <Filter size={14} /> Reset
            </button>
            {canManageCatalog && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="btn-primary btn-sm flex items-center justify-center gap-1.5 flex-1 sm:flex-initial"
              >
                <Plus size={14} /> Add Product
              </button>
            )}
          </div>
        }
      />

      <Tabs tabs={tabs} active={tab} onChange={setTab} />

      <FilterBar search={search} onSearch={v => { setSearch(v); setCurrentPage(1); }} placeholder="Search by product name, SKU, or brand...">
        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <Select
            className="w-full"
            value={supplierFilter}
            onChange={v => { setSupplierFilter(v); setCurrentPage(1); }}
            options={[
              { label: 'All Suppliers', value: 'all' },
              ...suppliersList.map(s => ({ label: s.name, value: s.name }))
            ]}
          />
          <Select
            className="w-full"
            value={statusFilter}
            onChange={v => { setStatusFilter(v); setCurrentPage(1); }}
            options={[
              { label: 'All Status', value: 'all' },
              { label: 'Published', value: 'published' },
              { label: 'Needs Review', value: 'validation_required' },
              { label: 'Draft', value: 'draft' },
              { label: 'Failed', value: 'failed' }
            ]}
          />
        </div>
      </FilterBar>

      {/* Bulk Actions Toolbar — Display cleanly when items selected */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap items-center gap-2 p-3 bg-primary-50/80 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800 rounded-xl shadow-sm overflow-hidden"
          >
            <input
              type="checkbox"
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
              checked={
                paginatedProducts.length > 0 &&
                paginatedProducts.every(p => selectedIds.includes(p.id))
              }
              onChange={e => handleSelectAll(e.target.checked)}
            />
            <span className="text-xs font-bold text-primary-900 dark:text-primary-200">
              {selectedIds.length} items selected
            </span>
            <div className="flex items-center gap-1.5 ml-auto flex-wrap">
              <button
                onClick={handleBulkPublish}
                className="btn-primary btn-sm"
              >
                Bulk Publish
              </button>
              <button
                onClick={handleBulkValidate}
                className="btn-secondary btn-sm bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/60 border-amber-200 dark:border-amber-900/60 font-semibold"
              >
                Bulk Validate
              </button>
              <button
                onClick={handleBulkDelete}
                className="btn-secondary btn-sm bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 border-rose-200 dark:border-rose-900/60 font-semibold"
              >
                Bulk Delete
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product Table */}
      <div className="card overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th className="w-10 text-center">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                    checked={
                      paginatedProducts.length > 0 &&
                      paginatedProducts.every(p => selectedIds.includes(p.id))
                    }
                    onChange={e => handleSelectAll(e.target.checked)}
                  />
                </th>

                <th>Product</th>
                <th>SKU</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Retail Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Validation</th>
                <th>Updated</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedProducts.length === 0 && (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-slate-400 font-medium">
                    No products found matching your filter criteria.
                  </td>
                </tr>
              )}
              {paginatedProducts.map(product => {
                const isSelected = selectedIds.includes(product.id)

                return (
                  <tr
                    key={product.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary-50/50' : 'hover:bg-slate-50/80'
                      }`}
                    onClick={() => setViewProduct(product)}
                  >
                    <td className="text-center mobile-hidden" onClick={e => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                        checked={isSelected}
                        onChange={() => handleSelectOne(product.id)}
                      />
                    </td>
                    <td data-label="Product">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 border border-slate-200 overflow-hidden shadow-2xs">
                          {product.images.length > 0 ? (
                            <img
                              src={product.images[0].url}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package size={18} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-slate-100 text-sm max-w-[220px] truncate leading-snug">
                            {product.name}
                          </p>
                          <p className="text-xs text-slate-400 dark:text-slate-400 font-medium mt-0.5">
                            {product.brand || '—'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td data-label="SKU">
                      <code className="mono text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 whitespace-nowrap inline-block tracking-tight">
                        {product.sku}
                      </code>
                    </td>
                    <td data-label="Supplier">
                      <span className="text-xs text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                        {product.supplierName}
                      </span>
                    </td>
                    <td data-label="Category" className="mobile-hidden">
                      <span className="text-xs text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
                        {product.categoryName || '—'}
                      </span>
                    </td>
                    <td data-label="Price">
                      <div className="whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                          ${product.pricing.retailPrice.toFixed(2)}
                        </span>
                        <span className="text-2xs text-emerald-600 dark:text-emerald-400 ml-1.5 font-bold">
                          +{product.pricing.margin.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td data-label="Stock">
                      <Badge variant={statusToVariant(product.inventory.status)}>
                        {product.inventory.availableStock.toLocaleString()}
                      </Badge>
                    </td>
                    <td data-label="Status">
                      <Badge variant={statusToVariant(product.status)}>
                        {product.status.replace(/_/g, ' ')}
                      </Badge>
                    </td>
                    <td data-label="Validation" className="mobile-hidden">
                      <Badge variant={statusToVariant(product.validationStatus)}>
                        {product.validationStatus}
                      </Badge>
                    </td>
                    <td data-label="Updated" className="mobile-hidden">
                      <span className="text-xs text-slate-400 dark:text-slate-400 font-mono whitespace-nowrap">
                        {timeAgo(product.updatedAt)}
                      </span>
                    </td>
                    <td data-label="" className="text-center mobile-full">
                      <div
                        className="flex items-center justify-end md:justify-center gap-1.5 w-full md:w-auto"
                        onClick={e => e.stopPropagation()}
                      >
                        <button
                          onClick={() => setViewProduct(product)}
                          className="btn-icon text-slate-400 hover:text-slate-700"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>

                        {canManageCatalog && (
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="btn-icon text-slate-400 hover:text-primary-600"
                            title="Edit Product"
                          >
                            <Edit2 size={14} />
                          </button>
                        )}

                        {canDelete && (
                          <button
                            onClick={() => handleSingleDelete(product.id, product.name)}
                            className="btn-icon text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete Product"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3.5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>Showing</span>
            <span className="font-bold text-slate-900">
              {filteredProducts.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
            </span>
            <span>to</span>
            <span className="font-bold text-slate-900">
              {Math.min(currentPage * pageSize, filteredProducts.length)}
            </span>
            <span>of</span>
            <span className="font-bold text-slate-900">{filteredProducts.length}</span>
            <span>products</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="btn-secondary btn-sm flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            <span className="text-slate-700 font-bold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary btn-sm flex items-center gap-1 disabled:opacity-40 cursor-pointer"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal */}
      {viewProduct && (
        <Modal
          open
          onClose={() => setViewProduct(null)}
          title={viewProduct.name}
          subtitle={`SKU: ${viewProduct.sku} • Supplier: ${viewProduct.supplierName}`}
          size="lg"
          footer={
            <>
              <button onClick={() => setViewProduct(null)} className="btn-secondary">Close</button>
              {canManageCatalog && (
                <button
                  onClick={() => {
                    const target = viewProduct
                    setViewProduct(null)
                    handleOpenEdit(target)
                  }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <Edit2 size={14} /> Edit Product
                </button>
              )}
            </>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                {viewProduct.images.length > 0 ? (
                  <img src={viewProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-slate-900 text-base">{viewProduct.name}</h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">Master SKU: {viewProduct.masterId}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={statusToVariant(viewProduct.status)}>{viewProduct.status}</Badge>
                  <Badge variant={statusToVariant(viewProduct.validationStatus)}>{viewProduct.validationStatus}</Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Retail Price', value: `$${viewProduct.pricing.retailPrice.toFixed(2)}` },
                { label: 'Cost Price', value: `$${viewProduct.pricing.costPrice.toFixed(2)}` },
                { label: 'Margin', value: `${viewProduct.pricing.margin.toFixed(1)}%` },
                { label: 'Available Stock', value: viewProduct.inventory.availableStock.toLocaleString() },
                { label: 'Category', value: viewProduct.categoryName || 'General' },
                { label: 'Brand', value: viewProduct.brand || '—' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-2xs text-slate-400 font-semibold mb-1 uppercase tracking-wider">{item.label}</p>
                  <p className="text-sm font-bold text-slate-800">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {/* Add Product Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Catalog Product"
        subtitle="Create a new Master SKU in SupplyBridge PIM"
        footer={
          <>
            <button onClick={() => setAddModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleCreateProduct} className="btn-primary">Create Product</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Product Name *</label>
            <input
              className="input"
              placeholder="e.g. AMD Ryzen 9 7950X Processor"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Master SKU *</label>
              <input
                className="input font-mono uppercase"
                placeholder="CPU-RYZEN-7950X"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Brand</label>
              <input
                className="input"
                placeholder="e.g. AMD"
                value={newProduct.brand}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Category</label>
              <input
                className="input"
                placeholder="e.g. Processors"
                value={newProduct.categoryName}
                onChange={e => setNewProduct({ ...newProduct, categoryName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Supplier</label>
              <select
                className="select"
                value={newProduct.supplierName}
                onChange={e => setNewProduct({ ...newProduct, supplierName: e.target.value })}
              >
                {suppliersList.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Retail Price ($)</label>
              <input
                type="number"
                className="input"
                value={newProduct.retailPrice}
                onChange={e => setNewProduct({ ...newProduct, retailPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Cost Price ($)</label>
              <input
                type="number"
                className="input"
                value={newProduct.costPrice}
                onChange={e => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Stock</label>
              <input
                type="number"
                className="input"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">SEO & Metadata</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Title</label>
                <input
                  className="input"
                  placeholder="SEO Title (leave empty to use product name)"
                  value={newProduct.metaTitle}
                  onChange={e => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Focus Keyword</label>
                <input
                  className="input"
                  placeholder="e.g. SSD, Motherboard"
                  value={newProduct.focusKeyword}
                  onChange={e => setNewProduct({ ...newProduct, focusKeyword: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Description</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Brief summary for search engine snippet..."
                value={newProduct.metaDescription}
                onChange={e => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Catalog Product"
        subtitle={`Updating Master SKU: ${editingProduct?.sku}`}
        footer={
          <>
            <button onClick={() => setEditModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSaveEdit} className="btn-primary">Save Changes</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Product Name *</label>
            <input
              className="input"
              value={newProduct.name}
              onChange={e => setNewProduct({ ...newProduct, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Master SKU *</label>
              <input
                className="input font-mono uppercase"
                value={newProduct.sku}
                onChange={e => setNewProduct({ ...newProduct, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Brand</label>
              <input
                className="input"
                value={newProduct.brand}
                onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Category</label>
              <input
                className="input"
                placeholder="e.g. Processors"
                value={newProduct.categoryName}
                onChange={e => setNewProduct({ ...newProduct, categoryName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Supplier</label>
              <select
                className="select"
                value={newProduct.supplierName}
                onChange={e => setNewProduct({ ...newProduct, supplierName: e.target.value })}
              >
                {suppliersList.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Retail Price ($)</label>
              <input
                type="number"
                className="input"
                value={newProduct.retailPrice}
                onChange={e => setNewProduct({ ...newProduct, retailPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Cost Price ($)</label>
              <input
                type="number"
                className="input"
                value={newProduct.costPrice}
                onChange={e => setNewProduct({ ...newProduct, costPrice: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1.5">Stock</label>
              <input
                type="number"
                className="input"
                value={newProduct.stock}
                onChange={e => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4 mt-2">
            <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">SEO & Metadata</h5>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Title</label>
                <input
                  className="input"
                  placeholder="SEO Title (leave empty to use product name)"
                  value={newProduct.metaTitle}
                  onChange={e => setNewProduct({ ...newProduct, metaTitle: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-600 block mb-1.5">Focus Keyword</label>
                <input
                  className="input"
                  placeholder="e.g. SSD, Motherboard"
                  value={newProduct.focusKeyword}
                  onChange={e => setNewProduct({ ...newProduct, focusKeyword: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Meta Description</label>
              <textarea
                className="input"
                rows={2}
                placeholder="Brief summary for search engine snippet..."
                value={newProduct.metaDescription}
                onChange={e => setNewProduct({ ...newProduct, metaDescription: e.target.value })}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Confirm Bulk Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedIds.length} selected products from the Master Catalog?`}
        confirmLabel="Yes, Delete Products"
        danger
      />


      {/* --- PRODUCT DETAIL DRAWER / MODAL --- */}
      {viewProduct && (
        <Modal
          open
          title={viewProduct.name}
          subtitle={`SKU: ${viewProduct.sku} · Supplier: ${viewProduct.supplierName}`}
          onClose={() => setViewProduct(null)}
          size="xl"
        >
          <div className="space-y-5">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
                {viewProduct.images.length > 0 ? (
                  <img src={viewProduct.images[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Package size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1">
                <h4 className="text-base font-bold text-slate-900">{viewProduct.name}</h4>
                <p className="text-xs text-slate-500">
                  Category: <span className="font-semibold text-slate-700">{viewProduct.categoryName || 'General'}</span> | Brand: <span className="font-semibold text-slate-700">{viewProduct.brand || 'Generic'}</span>
                </p>
              </div>
              <Badge variant={statusToVariant(viewProduct.status)}>
                {viewProduct.status}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Retail Price</p>
                <p className="text-lg font-bold text-slate-900">${viewProduct.pricing.retailPrice.toFixed(2)}</p>
                <p className="text-xs text-emerald-600 font-semibold">+{viewProduct.pricing.margin.toFixed(1)}% Margin</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Cost Price</p>
                <p className="text-lg font-bold text-slate-900">${viewProduct.pricing.costPrice.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-2xs text-slate-400 font-semibold uppercase">Available Stock</p>
                <p className="text-lg font-bold text-slate-900">{viewProduct.inventory.availableStock.toLocaleString()} units</p>
              </div>
            </div>

            {/* Google Search Snippet Preview */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-2xs">Google Search Engine Preview</p>
              <div className="bg-white p-3 rounded-lg border border-slate-200 font-sans">
                <p className="text-xs text-slate-400 font-mono truncate">https://pim.supplybridge.com/products/{viewProduct.sku.toLowerCase()}</p>
                <p className="text-sm text-blue-800 font-medium hover:underline cursor-pointer truncate">
                  {viewProduct.seo?.metaTitle || viewProduct.name}
                </p>
                <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                  {viewProduct.seo?.metaDescription || viewProduct.description || 'No search description added yet. Edit metadata to improve search visibility.'}
                </p>
                {viewProduct.seo?.focusKeyword && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-3xs font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      Keyword: {viewProduct.seo.focusKeyword}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-slate-700 uppercase tracking-wider text-2xs">Publishing & Channel Assignments</p>
              <div className="flex gap-2">
                <Badge variant="purple">Shift4Shop US Store</Badge>
                <Badge variant="info">Shift4Shop EU Store</Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
