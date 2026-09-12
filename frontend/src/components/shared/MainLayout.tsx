import React from 'react'
import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Sidebar } from './Sidebar'

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen eco-grid-bg text-slate-800 flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <footer className="glass-panel border-t border-slate-200/80 py-3.5 px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <span>Waste-to-Carbon Value Chain Tracker &bull; Waste2Carbon</span>
          <span>Verified Carbon Ingestion &amp; GIS Logistics Platform</span>
        </div>
      </footer>
    </div>
  )
}

export default MainLayout
