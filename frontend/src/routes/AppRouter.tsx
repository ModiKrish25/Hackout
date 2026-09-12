import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { RoleGuard } from './RoleGuard'
import { MainLayout } from '../components/shared/MainLayout'
import { useAuth } from '../context/AuthContext'

// Auth Pages
import { LoginPage } from '../pages/auth/LoginPage'
import { RegisterPage } from '../pages/auth/RegisterPage'

// Home Hero Page
import { HomePage } from '../pages/home/HomePage'

// Generator Pages
import { GeneratorDashboard } from '../pages/generator/GeneratorDashboard'
import { PostListingPage } from '../pages/generator/PostListingPage'
import { MyListingsPage } from '../pages/generator/MyListingsPage'
import { ListingDetailPage } from '../pages/generator/ListingDetailPage'

// Facility Pages
import { FacilityDashboard } from '../pages/facility/FacilityDashboard'
import { IncomingMatchesPage } from '../pages/facility/IncomingMatchesPage'
import { RouteViewPage } from '../pages/facility/RouteViewPage'
import { FacilitySettingsPage } from '../pages/facility/FacilitySettingsPage'

// Municipal Pages
import { MunicipalOverviewPage } from '../pages/municipal/MunicipalOverviewPage'
import { ReportsPage } from '../pages/municipal/ReportsPage'

// Shared Pages
import { ProfilePage } from '../pages/shared/ProfilePage'

// Initial Entrance: Opens directly on Login/Signin as requested by user
const RootEntry: React.FC = () => {
  const { isAuthenticated, role } = useAuth()

  // If already authenticated and has a session, redirect to their role dashboard
  if (isAuthenticated && role) {
    if (role === 'generator') return <Navigate to="/generator/dashboard" replace />
    if (role === 'facility') return <Navigate to="/facility/dashboard" replace />
    if (role === 'municipality') return <Navigate to="/municipal/overview" replace />
  }

  // Otherwise, default entrance is Login/Signin page
  return <LoginPage />
}

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default Entrance: Opening the website opens Login/Signin */}
        <Route path="/" element={<RootEntry />} />

        {/* Explicit Auth Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Public Home Hero Page */}
        <Route path="/home" element={<HomePage />} />

        {/* Protected Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            {/* Generator Role Routes */}
            <Route element={<RoleGuard allowedRoles={['generator']} />}>
              <Route path="/generator/dashboard" element={<GeneratorDashboard />} />
              <Route path="/generator/listings/new" element={<PostListingPage />} />
              <Route path="/generator/listings" element={<MyListingsPage />} />
              <Route path="/generator/listings/:id" element={<ListingDetailPage />} />
            </Route>

            {/* Facility Role Routes */}
            <Route element={<RoleGuard allowedRoles={['facility']} />}>
              <Route path="/facility/dashboard" element={<FacilityDashboard />} />
              <Route path="/facility/matches" element={<IncomingMatchesPage />} />
              <Route path="/facility/routes/:date" element={<RouteViewPage />} />
              <Route path="/facility/settings" element={<FacilitySettingsPage />} />
            </Route>

            {/* Municipality Role Routes */}
            <Route element={<RoleGuard allowedRoles={['municipality', 'admin']} />}>
              <Route path="/municipal/overview" element={<MunicipalOverviewPage />} />
              <Route path="/municipal/reports" element={<ReportsPage />} />
            </Route>

            {/* Shared Profile Route */}
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Fallback Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
