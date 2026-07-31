import React from 'react'
import { useAuth } from '../../context/AuthContext'
import { AccessDenied } from './AccessDenied'

interface ProtectedRouteProps {
  module: string
  moduleName?: string
  children: React.ReactElement
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ module, moduleName, children }) => {
  const { hasPermission } = useAuth()

  if (!hasPermission(module)) {
    return <AccessDenied moduleName={moduleName || module} />
  }

  return children
}
