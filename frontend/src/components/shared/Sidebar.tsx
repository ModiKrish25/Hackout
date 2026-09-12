import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  ListFilter,
  Layers,
  MapPin,
  Settings,
  BarChart3,
  FileText,
  ChevronLeft,
  ChevronRight,
  Leaf,
  Shield,
  Activity,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { mockDb } from '../../api/mockData'

export const Sidebar: React.FC = () => {
  const { role, user } = useAuth()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  // Live count badges from mockDb
  const listingsCount = mockDb.getListings().filter((l) => l.status === 'listed').length
  const pendingMatchesCount = mockDb.getMatches(user?.id || 201, 'pending').length
  const carbonRecordsCount = mockDb.getCarbonRecords().length

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-slate-200/80 glass-panel transition-all duration-300 relative z-20 ${
        collapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors z-30 cursor-pointer"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
      </button>

      {/* Role Identity Header */}
      <div className="p-4 border-b border-slate-100 flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 shadow-2xs">
          {role === 'generator' && <Leaf className="h-5 w-5" />}
          {role === 'facility' && <Activity className="h-5 w-5" />}
          {(role === 'municipality' || role === 'admin') && <Shield className="h-5 w-5" />}
        </div>

        {!collapsed && (
          <div className="min-w-0 flex-1">
            <h3 className="text-xs font-bold text-slate-900 truncate uppercase tracking-wider font-heading">
              {role === 'generator' && 'Generator Portal'}
              {role === 'facility' && 'Facility Hub'}
              {(role === 'municipality' || role === 'admin') && 'Municipal Command'}
            </h3>
            <p className="text-[11px] text-slate-400 truncate">{user?.name || 'Active Officer'}</p>
          </div>
        )}
      </div>

      {/* Navigation Links with Count Badges */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {/* Generator Menu Items */}
        {role === 'generator' && (
          <>
            <Link
              to="/generator/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/generator/dashboard'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0 text-emerald-700" />
              {!collapsed && <span>Dashboard</span>}
            </Link>

            <Link
              to="/generator/listings/new"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/generator/listings/new'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <PlusCircle className="h-4 w-4 shrink-0 text-emerald-700" />
              {!collapsed && <span>Post Listing</span>}
            </Link>

            <Link
              to="/generator/listings"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/generator/listings'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <ListFilter className="h-4 w-4 shrink-0 text-emerald-700" />
                {!collapsed && <span>My Listings</span>}
              </div>
              {!collapsed && listingsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-200 text-emerald-900">
                  {listingsCount}
                </span>
              )}
            </Link>
          </>
        )}

        {/* Facility Menu Items */}
        {role === 'facility' && (
          <>
            <Link
              to="/facility/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/facility/dashboard'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 shrink-0 text-emerald-700" />
              {!collapsed && <span>Dashboard</span>}
            </Link>

            <Link
              to="/facility/matches"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/facility/matches'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Layers className="h-4 w-4 shrink-0 text-emerald-700" />
                {!collapsed && <span>Incoming Matches</span>}
              </div>
              {!collapsed && pendingMatchesCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                  {pendingMatchesCount}
                </span>
              )}
            </Link>

            <Link
              to={`/facility/routes/${new Date().toISOString().split('T')[0]}`}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname.includes('/facility/routes')
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 shrink-0 text-emerald-700" />
                {!collapsed && <span>Route View</span>}
              </div>
              {!collapsed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Today
                </span>
              )}
            </Link>

            <Link
              to="/facility/settings"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/facility/settings'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Settings className="h-4 w-4 shrink-0 text-emerald-700" />
              {!collapsed && <span>Facility Settings</span>}
            </Link>
          </>
        )}

        {/* Municipality Menu Items */}
        {(role === 'municipality' || role === 'admin') && (
          <>
            <Link
              to="/municipal/overview"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/municipal/overview'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <BarChart3 className="h-4 w-4 shrink-0 text-emerald-700" />
              {!collapsed && <span>Regional Overview</span>}
            </Link>

            <Link
              to="/municipal/reports"
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/municipal/reports'
                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 shrink-0 text-emerald-700" />
                {!collapsed && <span>Reports & Export</span>}
              </div>
              {!collapsed && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                  {carbonRecordsCount}
                </span>
              )}
            </Link>
          </>
        )}
      </nav>

      {/* Bottom Mini Status Banner */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-100 space-y-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800">Circular Network</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-500">Live GIS & Carbon Auditing Active</p>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar
