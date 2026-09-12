import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { UserRole } from '../types'

interface RoleGuardProps {
  allowedRoles: UserRole[]
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { role, user } = useAuth()

  if (!role || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to the user's appropriate home dashboard
    if (role === 'generator') {
      return <Navigate to="/generator/dashboard" replace />
    } else if (role === 'facility') {
      return <Navigate to="/facility/dashboard" replace />
    } else if (role === 'municipality' || role === 'admin') {
      return <Navigate to="/municipal/overview" replace />
    }
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
