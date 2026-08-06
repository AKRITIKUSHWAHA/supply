import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { getFirstAccessibleRoute } from '../../utils'

interface ProtectedRouteProps {
  module: string
  moduleName?: string
  children: React.ReactElement
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ module, children }) => {
  const { hasPermission } = useAuth()

  if (!hasPermission(module)) {
    const fallbackRoute = getFirstAccessibleRoute(hasPermission)
    return <Navigate to={fallbackRoute} replace />
  }

  return children
}
