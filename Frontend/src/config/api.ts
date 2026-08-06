// Central API Configuration for SupplyBridge

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 'https://supplybridge-backend-production.up.railway.app'
).replace(/\/$/, '')

export const API_URL = `${API_BASE_URL}/api`
