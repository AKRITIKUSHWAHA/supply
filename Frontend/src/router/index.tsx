import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ProtectedRoute } from '../components/common/ProtectedRoute'
import { AccessDenied } from '../components/common/AccessDenied'
import { Dashboard } from '../features/dashboard/Dashboard'
import { Suppliers } from '../features/suppliers/Suppliers'
import { Integrations } from '../features/integrations/Integrations'
import { MasterCatalog } from '../features/catalog/MasterCatalog'
import { Categories } from '../features/catalog/Categories'
import { Brands } from '../features/catalog/Brands'
import { Manufacturers } from '../features/catalog/Manufacturers'
import { Variants } from '../features/catalog/Variants'
import { MediaLibrary } from '../features/catalog/MediaLibrary'
import { SupplierOnboardingWizard } from '../features/suppliers/SupplierOnboardingWizard'
import { ProductMapping } from '../features/mapping/ProductMapping'
import { CategoryMapping } from '../features/mapping/CategoryMapping'
import { BrandMapping } from '../features/mapping/BrandMapping'
import { VariantMapping } from '../features/mapping/VariantMapping'
import { AttributeMapping } from '../features/mapping/AttributeMapping'
import { ValidationCenter } from '../features/validation/ValidationCenter'
import { InventorySync } from '../features/sync/InventorySync'
import { PricingSync } from '../features/sync/PricingSync'
import { ImageSync } from '../features/sync/ImageSync'
import { StoreManagement } from '../features/stores/StoreManagement'
import { WebsiteSync } from '../features/sync/WebsiteSync'
import { SyncJobs } from '../features/sync/SyncJobs'
import { ImportQueue } from '../features/import/ImportQueue'
import { Logs } from '../features/logs/Logs'
import { Notifications } from '../features/notifications/Notifications'
import { Monitoring } from '../features/monitoring/Monitoring'
import { Reports } from '../features/reports/Reports'
import { Users } from '../features/users/Users'
import { Roles } from '../features/users/Roles'
import { Permissions } from '../features/users/Permissions'
import { Settings } from '../features/settings/Settings'

export const AppRouter: React.FC = () => (
  <BrowserRouter>
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Dashboard />} />
        <Route path="suppliers" element={<ProtectedRoute module="suppliers" moduleName="Suppliers"><Suppliers /></ProtectedRoute>} />
        <Route path="suppliers/onboarding" element={<ProtectedRoute module="suppliers" moduleName="Supplier Onboarding"><SupplierOnboardingWizard /></ProtectedRoute>} />
        <Route path="integrations" element={<ProtectedRoute module="integrations" moduleName="Integration Configuration"><Integrations /></ProtectedRoute>} />
        <Route path="catalog">
          <Route index element={<ProtectedRoute module="catalog" moduleName="Master Catalog"><MasterCatalog /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute module="products" moduleName="Products Catalog"><MasterCatalog /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute module="categories" moduleName="Categories"><Categories /></ProtectedRoute>} />
          <Route path="brands" element={<ProtectedRoute module="brands" moduleName="Brands"><Brands /></ProtectedRoute>} />
          <Route path="manufacturers" element={<ProtectedRoute module="manufacturers" moduleName="Manufacturers"><Manufacturers /></ProtectedRoute>} />
          <Route path="variants" element={<ProtectedRoute module="variants" moduleName="Variants"><Variants /></ProtectedRoute>} />
          <Route path="media" element={<ProtectedRoute module="media" moduleName="Media Library"><MediaLibrary /></ProtectedRoute>} />
        </Route>
        <Route path="mapping">
          <Route index element={<ProtectedRoute module="mapping" moduleName="Product Mapping"><ProductMapping /></ProtectedRoute>} />
          <Route path="products" element={<ProtectedRoute module="mapping" moduleName="Product Mapping"><ProductMapping /></ProtectedRoute>} />
          <Route path="categories" element={<ProtectedRoute module="mapping" moduleName="Category Mapping"><CategoryMapping /></ProtectedRoute>} />
          <Route path="brands" element={<ProtectedRoute module="mapping" moduleName="Brand Mapping"><BrandMapping /></ProtectedRoute>} />
          <Route path="variants" element={<ProtectedRoute module="mapping" moduleName="Variant Mapping"><VariantMapping /></ProtectedRoute>} />
          <Route path="attributes" element={<ProtectedRoute module="mapping" moduleName="Attribute Mapping"><AttributeMapping /></ProtectedRoute>} />
        </Route>
        <Route path="validation" element={<ProtectedRoute module="validation" moduleName="Validation Center"><ValidationCenter /></ProtectedRoute>} />
        <Route path="sync">
          <Route path="inventory" element={<ProtectedRoute module="inventory_sync" moduleName="Inventory Sync"><InventorySync /></ProtectedRoute>} />
          <Route path="pricing" element={<ProtectedRoute module="pricing_sync" moduleName="Pricing Sync"><PricingSync /></ProtectedRoute>} />
          <Route path="images" element={<ProtectedRoute module="image_sync" moduleName="Image Sync"><ImageSync /></ProtectedRoute>} />
          <Route path="website" element={<ProtectedRoute module="website_sync" moduleName="Store Synchronization"><WebsiteSync /></ProtectedRoute>} />
          <Route path="jobs" element={<ProtectedRoute module="sync_jobs" moduleName="Queue Management"><SyncJobs /></ProtectedRoute>} />
        </Route>
        {/* Direct Route Aliases */}
        <Route path="inventory_sync" element={<Navigate to="/sync/inventory" replace />} />
        <Route path="pricing_sync" element={<Navigate to="/sync/pricing" replace />} />
        <Route path="image_sync" element={<Navigate to="/sync/images" replace />} />
        <Route path="website_sync" element={<Navigate to="/sync/website" replace />} />
        <Route path="sync_jobs" element={<Navigate to="/sync/jobs" replace />} />
        <Route path="store_management" element={<Navigate to="/stores" replace />} />
        <Route path="stores" element={<ProtectedRoute module="store_management" moduleName="Store Management"><StoreManagement /></ProtectedRoute>} />
        <Route path="import-queue" element={<ProtectedRoute module="import_queue" moduleName="Import Queue"><ImportQueue /></ProtectedRoute>} />
        <Route path="logs" element={<ProtectedRoute module="logs" moduleName="System Logs"><Logs /></ProtectedRoute>} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="monitoring" element={<ProtectedRoute module="monitoring" moduleName="System Monitoring"><Monitoring /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute module="reports" moduleName="Reports"><Reports /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute module="users" moduleName="User Management"><Users /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute module="roles" moduleName="Roles Management"><Roles /></ProtectedRoute>} />
        <Route path="permissions" element={<ProtectedRoute module="permissions" moduleName="Permissions Matrix"><Permissions /></ProtectedRoute>} />
        <Route path="settings" element={<ProtectedRoute module="settings" moduleName="System Settings"><Settings /></ProtectedRoute>} />
        <Route path="403" element={<AccessDenied />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  </BrowserRouter>
)
