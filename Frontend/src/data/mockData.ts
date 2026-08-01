import type {
  Supplier, Product, SyncJob, ValidationItem, ImportQueueItem,
  Store, LogEntry, DashboardMetrics, Category, Brand, VariantType,
  User, Role
} from '../types'

// ─── Dashboard Metrics ────────────────────────────────────
export const mockDashboardMetrics: DashboardMetrics = {
  connectedSuppliers: 0,
  disconnectedSuppliers: 0,
  totalSuppliers: 0,
  totalProducts: 0,
  pendingProducts: 0,
  failedProducts: 0,
  publishedProducts: 0,
  productsImportedToday: 0,
  productsReadyToPublish: 0,
  duplicateProducts: 0,
  missingImages: 0,
  missingCategories: 0,
  missingPricing: 0,
  productsAwaitingReview: 0,
  inventorySyncStatus: 'healthy',
  pricingSyncStatus: 'healthy',
  imageSyncStatus: 'healthy',
  runningJobs: 0,
  completedJobs: 0,
  failedJobs: 0,
  queuedJobs: 0,
  apiStatus: 'operational',
  ftpStatus: 'operational',
  systemHealth: 100,
  queueSize: 0,
  storesSynced: 0,
  totalStores: 0,
}

// ─── Sync Chart Data ──────────────────────────────────────
export const mockSyncChartData: any[] = []

export const mockProductsBySupplier: any[] = []

// ─── Suppliers ────────────────────────────────────────────
export const mockSuppliers: Supplier[] = []

// ─── Products ─────────────────────────────────────────────
export const mockProducts: Product[] = []

// ─── Categories ───────────────────────────────────────────
export const mockCategories: Category[] = []

// ─── Brands ───────────────────────────────────────────────
export const mockBrands: Brand[] = []

// ─── Variant Types ────────────────────────────────────────
export const mockVariantTypes: VariantType[] = []

// ─── Sync Jobs ────────────────────────────────────────────
export const mockSyncJobs: SyncJob[] = []

// ─── Validation Items ─────────────────────────────────────
export const mockValidationItems: ValidationItem[] = []

// ─── Import Queue ─────────────────────────────────────────
export const mockImportQueue: ImportQueueItem[] = []

// ─── Stores ───────────────────────────────────────────────
export const mockStores: Store[] = []

// ─── Logs ─────────────────────────────────────────────────
export const mockLogs: LogEntry[] = []

export const mockUsers: User[] = []

// ─── Roles ────────────────────────────────────────────────
export const mockRoles: Role[] = []

// ─── Activity Feed ────────────────────────────────────────
export const mockActivities: any[] = []
