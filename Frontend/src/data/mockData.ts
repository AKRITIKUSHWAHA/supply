import type {
  Supplier, Product, SyncJob, ValidationItem, ImportQueueItem,
  Store, LogEntry, DashboardMetrics, Category, Brand, VariantType,
  User, Role
} from '../types'

// ─── Dashboard Metrics ────────────────────────────────────
export const mockDashboardMetrics: DashboardMetrics = {
  connectedSuppliers: 23,
  disconnectedSuppliers: 4,
  totalSuppliers: 27,
  totalProducts: 84329,
  pendingProducts: 1247,
  failedProducts: 312,
  publishedProducts: 82770,
  productsImportedToday: 1420,
  productsReadyToPublish: 982,
  duplicateProducts: 14,
  missingImages: 86,
  missingCategories: 32,
  missingPricing: 19,
  productsAwaitingReview: 142,
  inventorySyncStatus: 'healthy',
  pricingSyncStatus: 'degraded',
  imageSyncStatus: 'healthy',
  runningJobs: 5,
  completedJobs: 1284,
  failedJobs: 17,
  queuedJobs: 23,
  apiStatus: 'operational',
  ftpStatus: 'operational',
  systemHealth: 94,
  queueSize: 248,
  storesSynced: 6,
  totalStores: 7,
}

// ─── Sync Chart Data ──────────────────────────────────────
export const mockSyncChartData = [
  { date: 'Jul 17', inventory: 420, pricing: 380, image: 190 },
  { date: 'Jul 18', inventory: 512, pricing: 470, image: 230 },
  { date: 'Jul 19', inventory: 389, pricing: 310, image: 180 },
  { date: 'Jul 20', inventory: 645, pricing: 590, image: 310 },
  { date: 'Jul 21', inventory: 530, pricing: 480, image: 275 },
  { date: 'Jul 22', inventory: 720, pricing: 640, image: 360 },
  { date: 'Jul 23', inventory: 680, pricing: 590, image: 340 },
  { date: 'Jul 24', inventory: 580, pricing: 520, image: 290 },
]

export const mockProductsBySupplier = [
  { name: 'TechParts Inc', products: 18420 },
  { name: 'GlobalSource Ltd', products: 14800 },
  { name: 'PrimeSup Co', products: 11200 },
  { name: 'AcmeDistrib', products: 9800 },
  { name: 'QuickShip LLC', products: 7300 },
  { name: 'Others', products: 22809 },
]

// ─── Suppliers ────────────────────────────────────────────
export const mockSuppliers: Supplier[] = [
  {
    id: 's1', name: 'TechParts International', code: 'TPI', contactName: 'Robert Kim',
    contactEmail: 'rkim@techparts.com', contactPhone: '+1-555-0101', website: 'https://techparts.com',
    country: 'United States', connectionType: 'api', status: 'connected',
    productCount: 18420, lastSync: '2026-07-24T04:30:00Z', nextSync: '2026-07-24T10:30:00Z',
    errorCount: 0, createdAt: '2024-03-15T00:00:00Z',
    credentials: { apiUrl: 'https://api.techparts.com/v2', apiKey: 'tpi_k3y_****' },
    importHistory: [], tags: ['electronics', 'preferred'],
  },
  {
    id: 's2', name: 'GlobalSource Limited', code: 'GSL', contactName: 'Sarah Chen',
    contactEmail: 'schen@globalsource.io', country: 'United Kingdom', connectionType: 'ftp',
    status: 'connected', productCount: 14800, lastSync: '2026-07-24T02:00:00Z',
    nextSync: '2026-07-24T14:00:00Z', errorCount: 3, createdAt: '2024-05-20T00:00:00Z',
    credentials: { ftpHost: 'ftp.globalsource.io', ftpPort: 21, ftpUsername: 'gsl_user' },
    importHistory: [], tags: ['auto-parts'],
  },
  {
    id: 's3', name: 'PrimeSupply Corp', code: 'PSC', contactName: 'James Miller',
    contactEmail: 'jmiller@primesupply.com', country: 'Canada', connectionType: 'xml',
    status: 'connected', productCount: 11200, lastSync: '2026-07-24T03:15:00Z',
    nextSync: '2026-07-24T09:15:00Z', errorCount: 1, createdAt: '2024-06-10T00:00:00Z',
    credentials: { apiUrl: 'https://feeds.primesupply.com/products.xml' },
    importHistory: [], tags: ['home-goods'],
  },
  {
    id: 's4', name: 'AcmeDistributors', code: 'ACME', contactName: 'Lisa Thompson',
    contactEmail: 'lisa@acmedist.com', country: 'Germany', connectionType: 'csv',
    status: 'error', productCount: 9800, lastSync: '2026-07-23T18:00:00Z',
    errorCount: 47, createdAt: '2024-07-01T00:00:00Z',
    credentials: { ftpHost: 'sftp.acmedist.com', ftpUsername: 'acme_sftp' },
    importHistory: [], tags: ['industrial'],
  },
  {
    id: 's5', name: 'QuickShip LLC', code: 'QS', contactName: 'Mike Davis',
    contactEmail: 'mdavis@quickship.us', country: 'United States', connectionType: 'sftp',
    status: 'connected', productCount: 7300, lastSync: '2026-07-24T05:00:00Z',
    nextSync: '2026-07-24T11:00:00Z', errorCount: 0, createdAt: '2024-08-15T00:00:00Z',
    credentials: { ftpHost: 'sftp.quickship.us', ftpPort: 22, ftpUsername: 'qs_feed' },
    importHistory: [], tags: ['sporting-goods', 'preferred'],
  },
  {
    id: 's6', name: 'MegaTrade Co', code: 'MTC', contactName: 'Anna Novak',
    contactEmail: 'anovak@megatrade.eu', country: 'Poland', connectionType: 'excel',
    status: 'disconnected', productCount: 4200, errorCount: 12, createdAt: '2025-01-10T00:00:00Z',
    credentials: {}, importHistory: [], tags: ['clothing'],
  },
  {
    id: 's7', name: 'NovaTech Supplies', code: 'NTS', contactName: 'David Park',
    contactEmail: 'dpark@novatech.kr', country: 'South Korea', connectionType: 'api',
    status: 'connected', productCount: 6100, lastSync: '2026-07-24T04:00:00Z',
    nextSync: '2026-07-24T10:00:00Z', errorCount: 2, createdAt: '2025-02-20T00:00:00Z',
    credentials: { apiUrl: 'https://api.novatech.kr/v1', apiKey: 'nts_****' },
    importHistory: [], tags: ['electronics', 'smart-home'],
  },
  {
    id: 's8', name: 'EastWest Imports', code: 'EWI', contactName: 'Carmen Santos',
    contactEmail: 'csantos@ewimports.mx', country: 'Mexico', connectionType: 'ftp',
    status: 'syncing', productCount: 3800, lastSync: '2026-07-24T05:30:00Z',
    errorCount: 0, createdAt: '2025-03-05T00:00:00Z',
    credentials: { ftpHost: 'ftp.ewimports.mx', ftpPort: 21 },
    importHistory: [], tags: ['home-decor'],
  },
]

// ─── Products ─────────────────────────────────────────────
export const mockProducts: Product[] = [
  {
    id: 'p1', sku: 'MB-TPI-X570-001', masterSku: 'MB-X570-001', name: 'AMD X570 ATX Gaming Motherboard',
    description: 'High-performance ATX motherboard featuring AMD X570 chipset with PCIe 4.0 support.',
    brand: 'ASUS', brandId: 'b1', categoryId: 'cat3', categoryName: 'Motherboards',
    supplierId: 's1', supplierName: 'TechParts International', supplierSku: 'ASUS-ROG-X570-E',
    status: 'published', validationStatus: 'passed',
    images: [{ id: 'img1', url: 'https://placehold.co/400x400/4f46e5/white?text=X570', altText: 'X570 Motherboard', isPrimary: true, syncStatus: 'synced' }],
    variants: [], attributes: [{ id: 'a1', name: 'Socket', value: 'AM4', group: 'Specs' }, { id: 'a2', name: 'Form Factor', value: 'ATX', group: 'Specs' }],
    pricing: { supplierPrice: 245.00, costPrice: 245.00, retailPrice: 299.99, compareAtPrice: 349.99, margin: 18.3, currency: 'USD', lastUpdated: '2026-07-20T00:00:00Z' },
    inventory: { supplierStock: 450, warehouseStock: 120, reservedStock: 15, availableStock: 105, lowStockThreshold: 50, status: 'in_stock', lastSynced: '2026-07-24T04:30:00Z' },
    createdAt: '2024-04-10T00:00:00Z', updatedAt: '2026-07-20T00:00:00Z', publishedAt: '2024-04-15T00:00:00Z', stores: ['store1', 'store2'],
  },
  {
    id: 'p2', sku: 'RAM-TPI-DDR5-001', masterSku: 'RAM-DDR5-001', name: 'DDR5 32GB 6000MHz Gaming RAM Kit',
    description: '32GB DDR5 memory kit designed for high-performance gaming and content creation.',
    brand: 'Corsair', brandId: 'b2', categoryId: 'cat4', categoryName: 'Memory',
    supplierId: 's1', supplierName: 'TechParts International', supplierSku: 'CMK32GX5M2B6000C36',
    status: 'published', validationStatus: 'passed',
    images: [{ id: 'img2', url: 'https://placehold.co/400x400/06b6d4/white?text=DDR5', altText: 'DDR5 RAM', isPrimary: true, syncStatus: 'synced' }],
    variants: [], attributes: [],
    pricing: { supplierPrice: 89.00, costPrice: 89.00, retailPrice: 119.99, margin: 25.8, currency: 'USD', lastUpdated: '2026-07-22T00:00:00Z' },
    inventory: { supplierStock: 1200, warehouseStock: 340, reservedStock: 45, availableStock: 295, lowStockThreshold: 100, status: 'in_stock', lastSynced: '2026-07-24T04:30:00Z' },
    createdAt: '2024-05-01T00:00:00Z', updatedAt: '2026-07-22T00:00:00Z', publishedAt: '2024-05-05T00:00:00Z', stores: ['store1'],
  },
  {
    id: 'p3', sku: 'GPU-TPI-4090-001', masterSku: 'GPU-4090-001', name: 'NVIDIA RTX 4090 24GB Graphics Card',
    supplierId: 's1', supplierName: 'TechParts International', supplierSku: 'ASUS-TUF-4090-OC',
    brand: 'ASUS', categoryName: 'Graphics Cards', status: 'validation_required', validationStatus: 'pending',
    images: [], variants: [], attributes: [],
    pricing: { supplierPrice: 1450.00, costPrice: 1450.00, retailPrice: 1699.99, margin: 14.7, currency: 'USD', lastUpdated: '2026-07-23T00:00:00Z' },
    inventory: { supplierStock: 45, warehouseStock: 8, reservedStock: 3, availableStock: 5, lowStockThreshold: 10, status: 'low_stock', lastSynced: '2026-07-24T04:30:00Z' },
    createdAt: '2026-07-15T00:00:00Z', updatedAt: '2026-07-24T00:00:00Z', stores: [],
  },
  {
    id: 'p4', sku: 'SSD-GSL-980P-001', masterSku: 'SSD-980P-001', name: 'Samsung 980 Pro 2TB NVMe SSD',
    supplierId: 's2', supplierName: 'GlobalSource Limited', supplierSku: 'MZ-V8P2T0B/AM',
    brand: 'Samsung', categoryName: 'Storage', status: 'published', validationStatus: 'passed',
    images: [{ id: 'img4', url: 'https://placehold.co/400x400/10b981/white?text=SSD', altText: 'NVMe SSD', isPrimary: true, syncStatus: 'synced' }],
    variants: [], attributes: [],
    pricing: { supplierPrice: 119.00, costPrice: 119.00, retailPrice: 149.99, margin: 20.7, currency: 'USD', lastUpdated: '2026-07-21T00:00:00Z' },
    inventory: { supplierStock: 830, warehouseStock: 210, reservedStock: 30, availableStock: 180, lowStockThreshold: 80, status: 'in_stock', lastSynced: '2026-07-24T02:00:00Z' },
    createdAt: '2024-06-01T00:00:00Z', updatedAt: '2026-07-21T00:00:00Z', publishedAt: '2024-06-05T00:00:00Z', stores: ['store1', 'store2', 'store3'],
  },
  {
    id: 'p5', sku: 'CPU-TPI-7950X-001', masterSku: 'CPU-7950X-001', name: 'AMD Ryzen 9 7950X Processor',
    supplierId: 's1', supplierName: 'TechParts International', supplierSku: '100-100000514WOF',
    brand: 'AMD', categoryName: 'Processors', status: 'failed', validationStatus: 'failed',
    images: [], variants: [], attributes: [],
    pricing: { supplierPrice: 520.00, costPrice: 520.00, retailPrice: 649.99, margin: 20.0, currency: 'USD', lastUpdated: '2026-07-20T00:00:00Z' },
    inventory: { supplierStock: 0, warehouseStock: 0, reservedStock: 0, availableStock: 0, lowStockThreshold: 20, status: 'out_of_stock', lastSynced: '2026-07-23T04:30:00Z' },
    createdAt: '2026-07-10T00:00:00Z', updatedAt: '2026-07-24T00:00:00Z', stores: [],
  },
]

// ─── Categories ───────────────────────────────────────────
export const mockCategories: Category[] = [
  { id: 'cat1', name: 'Electronics', slug: 'electronics', productCount: 45200, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat2', name: 'Computers & Laptops', slug: 'computers-laptops', parentId: 'cat1', productCount: 18400, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat3', name: 'Motherboards', slug: 'motherboards', parentId: 'cat2', productCount: 1240, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat4', name: 'Memory (RAM)', slug: 'memory-ram', parentId: 'cat2', productCount: 890, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'cat5', name: 'Home & Garden', slug: 'home-garden', productCount: 12300, status: 'active', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'cat6', name: 'Sporting Goods', slug: 'sporting-goods', productCount: 8900, status: 'active', createdAt: '2024-02-01T00:00:00Z' },
  { id: 'cat7', name: 'Industrial', slug: 'industrial', productCount: 6200, status: 'inactive', createdAt: '2024-03-01T00:00:00Z' },
]

// ─── Brands ───────────────────────────────────────────────
export const mockBrands: Brand[] = [
  { id: 'b1', name: 'ASUS', slug: 'asus', productCount: 4200, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'b2', name: 'Corsair', slug: 'corsair', productCount: 3100, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'b3', name: 'Samsung', slug: 'samsung', productCount: 5800, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'b4', name: 'AMD', slug: 'amd', productCount: 1200, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'b5', name: 'Intel', slug: 'intel', productCount: 980, status: 'active', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'b6', name: 'Logitech', slug: 'logitech', productCount: 2400, status: 'active', createdAt: '2024-02-01T00:00:00Z' },
]

// ─── Variant Types ────────────────────────────────────────
export const mockVariantTypes: VariantType[] = [
  { id: 'v1', name: 'Color', values: ['Black', 'White', 'Silver', 'Red', 'Blue'], productCount: 12400, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'v2', name: 'Size', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], productCount: 8900, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'v3', name: 'Storage', values: ['128GB', '256GB', '512GB', '1TB', '2TB'], productCount: 3200, createdAt: '2024-01-01T00:00:00Z' },
  { id: 'v4', name: 'RAM', values: ['8GB', '16GB', '32GB', '64GB'], productCount: 2100, createdAt: '2024-02-01T00:00:00Z' },
]

// ─── Sync Jobs ────────────────────────────────────────────
export const mockSyncJobs: SyncJob[] = [
  { id: 'job1', name: 'Full Inventory Sync — TechParts', type: 'inventory', supplierId: 's1', supplierName: 'TechParts International', status: 'running', progress: 67, totalItems: 18420, processedItems: 12341, failedItems: 12, startedAt: '2026-07-24T05:00:00Z', triggeredBy: 'Scheduler', logs: [], canRetry: false },
  { id: 'job2', name: 'Pricing Sync — GlobalSource', type: 'pricing', supplierId: 's2', supplierName: 'GlobalSource Limited', status: 'running', progress: 34, totalItems: 14800, processedItems: 5032, failedItems: 0, startedAt: '2026-07-24T05:15:00Z', triggeredBy: 'admin@supplybridge.io', logs: [], canRetry: false },
  { id: 'job3', name: 'Image Sync — All Suppliers', type: 'image', status: 'queued', progress: 0, totalItems: 84329, processedItems: 0, failedItems: 0, scheduledAt: '2026-07-24T06:00:00Z', triggeredBy: 'Scheduler', logs: [], canRetry: false },
  { id: 'job4', name: 'Website Sync — Store US-1', type: 'website', storeId: 'store1', storeName: 'SupplyBridge US Store', status: 'completed', progress: 100, totalItems: 40000, processedItems: 39987, failedItems: 13, startedAt: '2026-07-24T03:00:00Z', completedAt: '2026-07-24T04:45:00Z', triggeredBy: 'Scheduler', logs: [], canRetry: false },
  { id: 'job5', name: 'Full Sync — QuickShip', type: 'full', supplierId: 's5', supplierName: 'QuickShip LLC', status: 'failed', progress: 23, totalItems: 7300, processedItems: 1679, failedItems: 256, retryAttempts: 2, maxRetries: 3, startedAt: '2026-07-24T01:00:00Z', completedAt: '2026-07-24T01:23:00Z', triggeredBy: 'Scheduler', logs: ['Connection timeout after 120s', 'Retry 1 failed', 'Retry 2 failed', 'Job aborted'], canRetry: true },
  { id: 'job6', name: 'Inventory Sync — PrimeSup', type: 'inventory', supplierId: 's3', supplierName: 'PrimeSupply Corp', status: 'completed', progress: 100, totalItems: 11200, processedItems: 11200, failedItems: 0, startedAt: '2026-07-24T04:00:00Z', completedAt: '2026-07-24T04:28:00Z', triggeredBy: 'Scheduler', logs: [], canRetry: false },
]

// ─── Validation Items ─────────────────────────────────────
export const mockValidationItems: ValidationItem[] = [
  { id: 'vi1', productId: 'p3', productName: 'NVIDIA RTX 4090 24GB Graphics Card', supplierSku: 'ASUS-TUF-4090-OC', supplierId: 's1', supplierName: 'TechParts International', errors: [{ field: 'images', type: 'missing_image', message: 'Product has no primary images uploaded', severity: 'error' }, { field: 'category', type: 'invalid_category', message: 'Category name not mapped in Master Catalog', severity: 'warning' }], status: 'pending', createdAt: '2026-07-24T03:00:00Z' },
  { id: 'vi2', productId: 'p-new1', productName: 'Logitech MX Master 3S Mouse', supplierSku: 'LOG-MX-M3S', supplierId: 's2', supplierName: 'GlobalSource Limited', errors: [{ field: 'sku', type: 'duplicate_sku', message: 'SKU conflicts with existing catalog product', severity: 'error' }], status: 'review', createdAt: '2026-07-24T02:30:00Z' },
  { id: 'vi3', productId: 'p-new2', productName: 'Cable Management Kit 50pcs', supplierSku: 'ACME-CMK-50', supplierId: 's4', supplierName: 'AcmeDistributors', errors: [{ field: 'price', type: 'missing_price', message: 'Wholesale price and retail price are empty', severity: 'error' }, { field: 'upc', type: 'duplicate_upc', message: 'UPC barcode conflicts with existing product', severity: 'warning' }], status: 'pending', createdAt: '2026-07-24T01:00:00Z' },
  { id: 'vi4', productId: 'p-new3', productName: 'Industrial Fan 12V 120mm', supplierSku: 'ACME-IF-120', supplierId: 's4', supplierName: 'AcmeDistributors', errors: [{ field: 'images', type: 'missing_image', message: 'Product has no images', severity: 'error' }, { field: 'inventory', type: 'missing_inventory', message: 'Stock inventory quantity is null', severity: 'warning' }], status: 'pending', createdAt: '2026-07-23T22:00:00Z' },
  { id: 'vi5', productId: 'p-new4', productName: 'Ergonomic Office Chair - Black', supplierSku: 'QS-EOC-BLK', supplierId: 's5', supplierName: 'QuickShip LLC', errors: [], status: 'approved', createdAt: '2026-07-23T18:00:00Z', reviewedAt: '2026-07-23T19:00:00Z', reviewedBy: 'Sarah K.' },
  { id: 'vi6', productId: 'p-new5', productName: 'Pro Wireless Gaming Headset', supplierSku: 'QS-WGH-PRO', supplierId: 's5', supplierName: 'QuickShip LLC', errors: [{ field: 'variant', type: 'invalid_variant', message: 'Variant color options invalid', severity: 'warning' }, { field: 'attribute', type: 'missing_attribute', message: 'Required warranty attribute missing', severity: 'warning' }], status: 'pending', createdAt: '2026-07-23T16:00:00Z' },
  { id: 'vi7', productId: 'p-new6', productName: 'Samsung Odyssey G9 Monitor 49"', supplierSku: 'SAM-ODYSSEY-G9', supplierId: 's1', supplierName: 'TechParts International', errors: [], status: 'pending', createdAt: '2026-07-24T04:00:00Z' },
  { id: 'vi8', productId: 'p-new7', productName: 'Generic USB-C Cable 1m', supplierSku: 'GEN-USBC-1M', supplierId: 's4', supplierName: 'AcmeDistributors', errors: [{ field: 'sku', type: 'duplicate_sku', message: 'Invalid supplier catalog record', severity: 'error' }], status: 'rejected', createdAt: '2026-07-22T10:00:00Z', reviewedAt: '2026-07-22T11:00:00Z', reviewedBy: 'Alex M.' },
]

// ─── Import Queue ─────────────────────────────────────────
export const mockImportQueue: ImportQueueItem[] = [
  { id: 'iq1', supplierId: 's8', supplierName: 'EastWest Imports', connectionType: 'ftp', fileName: 'products_20260724.csv', status: 'processing', totalRecords: 3800, processedRecords: 1240, failedRecords: 3, createdAt: '2026-07-24T05:30:00Z', startedAt: '2026-07-24T05:31:00Z' },
  { id: 'iq2', supplierId: 's7', supplierName: 'NovaTech Supplies', connectionType: 'api', status: 'pending', totalRecords: 6100, processedRecords: 0, failedRecords: 0, createdAt: '2026-07-24T05:45:00Z' },
  { id: 'iq3', supplierId: 's3', supplierName: 'PrimeSupply Corp', connectionType: 'xml', fileName: 'catalog_feed.xml', status: 'completed', totalRecords: 11200, processedRecords: 11200, failedRecords: 0, createdAt: '2026-07-24T03:50:00Z', startedAt: '2026-07-24T04:00:00Z', completedAt: '2026-07-24T04:25:00Z' },
  { id: 'iq4', supplierId: 's4', supplierName: 'AcmeDistributors', connectionType: 'csv', fileName: 'acme_full_catalog.csv', status: 'failed', totalRecords: 9800, processedRecords: 2340, failedRecords: 456, createdAt: '2026-07-23T18:00:00Z', startedAt: '2026-07-23T18:05:00Z', completedAt: '2026-07-23T19:12:00Z', errorMessage: 'FTP connection dropped unexpectedly' },
]

// ─── Stores ───────────────────────────────────────────────
export const mockStores: Store[] = [
  { id: 'store1', name: 'SupplyBridge US Store', url: 'https://us.supplybridge.com', platform: 'Shift4Shop', status: 'active', productCount: 40000, syncStatus: 'synced', lastSync: '2026-07-24T04:45:00Z', region: 'North America', createdAt: '2024-01-01T00:00:00Z' },
  { id: 'store2', name: 'SupplyBridge EU Store', url: 'https://eu.supplybridge.com', platform: 'Shift4Shop', status: 'active', productCount: 28000, syncStatus: 'syncing', lastSync: '2026-07-24T03:00:00Z', region: 'Europe', createdAt: '2024-03-01T00:00:00Z' },
  { id: 'store3', name: 'TechHub Marketplace', url: 'https://techhub.shop', platform: 'Shift4Shop', status: 'active', productCount: 15000, syncStatus: 'synced', lastSync: '2026-07-24T02:30:00Z', region: 'North America', createdAt: '2024-06-01T00:00:00Z' },
  { id: 'store4', name: 'IndusStore UK', url: 'https://indusstore.co.uk', platform: 'Shift4Shop', status: 'active', productCount: 8500, syncStatus: 'synced', lastSync: '2026-07-24T01:00:00Z', region: 'Europe', createdAt: '2024-08-01T00:00:00Z' },
  { id: 'store5', name: 'QuickBuy CA', url: 'https://quickbuy.ca', platform: 'Shift4Shop', status: 'active', productCount: 6200, syncStatus: 'pending', region: 'North America', createdAt: '2025-01-01T00:00:00Z' },
  { id: 'store6', name: 'AutoParts Direct', url: 'https://autopartsdirect.com', platform: 'Shift4Shop', status: 'active', productCount: 12400, syncStatus: 'synced', lastSync: '2026-07-23T22:00:00Z', region: 'North America', createdAt: '2025-03-01T00:00:00Z' },
  { id: 'store7', name: 'SportGear Pro', url: 'https://sportgearpro.com', platform: 'Shift4Shop', status: 'error', productCount: 4100, syncStatus: 'failed', region: 'North America', createdAt: '2025-06-01T00:00:00Z' },
]

// ─── Logs ─────────────────────────────────────────────────
export const mockLogs: LogEntry[] = [
  { id: 'l1', type: 'sync', level: 'info', message: 'Inventory sync completed successfully', supplierId: 's3', supplierName: 'PrimeSupply Corp', jobId: 'job6', timestamp: '2026-07-24T04:28:00Z' },
  { id: 'l2', type: 'sync', level: 'error', message: 'Connection timeout during full sync', details: 'FTP connection dropped after 120s idle timeout. 3 retries exhausted.', supplierId: 's5', supplierName: 'QuickShip LLC', jobId: 'job5', timestamp: '2026-07-24T01:23:00Z' },
  { id: 'l3', type: 'api', level: 'warning', message: 'Rate limit approaching for TechParts API', details: 'Current rate: 4800/5000 req/hr', supplierId: 's1', supplierName: 'TechParts International', timestamp: '2026-07-24T05:02:00Z' },
  { id: 'l4', type: 'import', level: 'success', message: 'Import completed: 11,200 products from PrimeSup', supplierId: 's3', supplierName: 'PrimeSupply Corp', timestamp: '2026-07-24T04:25:00Z' },
  { id: 'l5', type: 'validation', level: 'warning', message: '3 products failed validation — missing images', timestamp: '2026-07-24T03:30:00Z' },
  { id: 'l6', type: 'audit', level: 'info', message: 'User admin@supplybridge.io triggered manual pricing sync', userId: 'u2', userName: 'Admin User', ip: '192.168.1.45', timestamp: '2026-07-24T05:15:00Z' },
  { id: 'l7', type: 'ftp', level: 'error', message: 'FTP authentication failed for AcmeDistributors', supplierId: 's4', supplierName: 'AcmeDistributors', timestamp: '2026-07-24T00:05:00Z' },
  { id: 'l8', type: 'sync', level: 'info', message: 'Website sync — US Store completed', jobId: 'job4', timestamp: '2026-07-24T04:45:00Z' },
  { id: 'l9', type: 'system', level: 'info', message: 'System health check passed — all services operational', timestamp: '2026-07-24T05:00:00Z' },
  { id: 'l10', type: 'error', level: 'error', message: 'Image download failed: 404 Not Found', details: 'URL: https://cdn.acmedist.com/images/product_47823.jpg — Product SKU: ACME-IF-120', timestamp: '2026-07-24T02:45:00Z' },
]

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Morrison', email: 'alex@supplybridge.io', role: 'platform_owner', status: 'active', lastLogin: '2026-07-24T05:00:00Z', createdAt: '2024-01-01T00:00:00Z', department: 'Technology' },
  { id: 'u2', name: 'Sarah Kim', email: 'sarah@supplybridge.io', role: 'administrator', status: 'active', lastLogin: '2026-07-24T04:30:00Z', createdAt: '2024-02-15T00:00:00Z', department: 'Operations' },
  { id: 'u3', name: 'James Patel', email: 'jpatel@supplybridge.io', role: 'catalog_manager', status: 'active', lastLogin: '2026-07-23T16:00:00Z', createdAt: '2024-04-01T00:00:00Z', department: 'Catalog' },
  { id: 'u4', name: 'Elena Rostova', email: 'elena@supplybridge.io', role: 'integration_manager', status: 'active', lastLogin: '2026-07-24T03:00:00Z', createdAt: '2024-05-10T00:00:00Z', department: 'Integrations' },
  { id: 'u6', name: 'David Vance', email: 'dvance@supplybridge.io', role: 'operations_staff', status: 'active', lastLogin: '2026-07-23T09:00:00Z', createdAt: '2024-07-20T00:00:00Z', department: 'Store Operations' },
  { id: 'u5', name: 'Priya Sharma', email: 'psharma@supplybridge.io', role: 'catalog_manager', status: 'invited', createdAt: '2026-07-20T00:00:00Z', department: 'Catalog' },
]

// ─── Roles ────────────────────────────────────────────────
export const mockRoles: Role[] = [
  { id: 'r1', name: 'Platform Owner', slug: 'platform_owner', description: 'Full platform owner access. Can manage all modules, users, roles, and settings.', userCount: 1, permissions: ['*'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'r2', name: 'Administrator', slug: 'administrator', description: 'Daily platform administration, supplier inventory, pricing & catalog performance.', userCount: 1, permissions: ['dashboard', 'suppliers', 'integrations', 'catalog', 'mapping', 'validation', 'sync', 'logs', 'monitoring', 'reports', 'users'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'r3', name: 'Catalog Manager', slug: 'catalog_manager', description: 'Manages products, categories, variants, mapping, and validation queue.', userCount: 2, permissions: ['dashboard', 'catalog', 'categories', 'brands', 'variants', 'mapping', 'validation'], createdAt: '2024-01-01T00:00:00Z' },
  { id: 'r4', name: 'Integration Manager', slug: 'integration_manager', description: 'Manages supplier feeds, API & SFTP protocols, data mapping, and sync queue pipelines.', userCount: 1, permissions: ['dashboard', 'suppliers', 'mapping', 'inventory_sync', 'pricing_sync', 'sync_jobs', 'logs'], createdAt: '2024-05-01T00:00:00Z' },
  { id: 'r5', name: 'Operations Staff', slug: 'operations_staff', description: 'Storefront sync execution, product validation error review, and order fulfillment status.', userCount: 1, permissions: ['dashboard', 'products', 'validation', 'sync_jobs', 'logs', 'reports'], createdAt: '2024-06-01T00:00:00Z' },
]


// ─── Activity Feed ────────────────────────────────────────
export const mockActivities = [
  { id: 'act1', type: 'sync', message: 'Inventory sync completed for PrimeSupply Corp', time: '2 min ago', icon: 'check-circle', color: 'emerald' },
  { id: 'act2', type: 'import', message: '3,800 products queued for import from EastWest Imports', time: '8 min ago', icon: 'download', color: 'blue' },
  { id: 'act3', type: 'error', message: 'Connection failed for QuickShip LLC — retrying', time: '23 min ago', icon: 'alert-circle', color: 'rose' },
  { id: 'act4', type: 'validation', message: '5 products sent to Validation Center', time: '41 min ago', icon: 'shield-check', color: 'amber' },
  { id: 'act5', type: 'user', message: 'Sarah Kim triggered manual pricing sync', time: '1 hr ago', icon: 'user', color: 'violet' },
  { id: 'act6', type: 'sync', message: 'Website sync completed — US Store (39,987 products)', time: '1 hr ago', icon: 'globe', color: 'emerald' },
  { id: 'act7', type: 'supplier', message: 'New supplier EastWest Imports connected via FTP', time: '3 hr ago', icon: 'plug', color: 'blue' },
]
