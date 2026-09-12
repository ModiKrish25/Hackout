import React from 'react'
import {
  Mail,
  Shield,
  MapPin,
  Calendar,
  Phone,
  Building,
  CheckCircle2,
  KeyRound,
  Sparkles,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { MapView, type MapMarkerData } from '../../components/map/MapView'

export const ProfilePage: React.FC = () => {
  const { user, role, tokens } = useAuth()

  const lat = user?.location_lat || 12.9716
  const lng = user?.location_lng || 77.5946

  const profileMarker: MapMarkerData[] = [
    {
      id: 'profile-pin',
      lat,
      lng,
      type: role === 'facility' ? 'facility' : 'generator',
      title: user?.name || 'My Registered Entity',
      subtitle: `${user?.city || 'Bengaluru'}, ${user?.state || 'Karnataka'}`,
      status: 'Active',
    },
  ]

  const rolePermissions: Record<string, string[]> = {
    generator: [
      'Post organic feedstock batches (Agricultural, Food, Manure, Industrial)',
      'Algorithmic matchmaker with nearby bio-conversion plants',
      'Doorstep fleet pickup scheduling with dynamic tracking',
      'Gold Standard / Verra verified carbon credit registry',
    ],
    facility: [
      'Anaerobic biomethanation & pyrolysis capacity intake manager',
      'Automated batch proposal review (Accept & Schedule / Reject)',
      'Traveling Salesman Problem (TSP) multi-stop dispatch logistics',
      'Real-time weekly capacity buffer and tipping pit audits',
    ],
    municipality: [
      'Bangalore Metropolitan circular economy command & heatmaps',
      'EPA carbon equivalence vehicle offset calculations',
      'Regional spatial density gradient GIS visualization',
      'Full compliance ledger CSV export via PapaParse',
    ],
    admin: [
      'Full cross-role platform orchestration & override permissions',
      'Cryptographic identity & node registry issuance',
    ],
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Profile Card */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 space-y-6 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center font-extrabold text-2xl font-heading shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-heading">
                  {user?.name || 'Registered Officer'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wider">
                  {role}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Member ID: #{user?.id || '101'} &bull; Status: Active &bull; Verified Entity
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-2 text-xs text-slate-600">
            <Sparkles className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>Identity Secured</span>
          </div>
        </div>

        {/* Account Information Details */}
        <div className="space-y-4 pt-4 border-t border-slate-100 text-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Account &amp; Contact Information
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                Email Address
              </span>
              <p className="font-bold text-slate-900">{user?.email}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                Phone / WhatsApp
              </span>
              <p className="font-bold text-slate-900">{user?.phone || '+91 7778040173'}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                Operating Location
              </span>
              <p className="font-bold text-slate-900">
                {user?.city || 'Bengaluru'}, {user?.state || 'Karnataka'}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Enrolled Since
              </span>
              <p className="font-bold text-slate-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'September 2026'}
              </p>
            </div>
          </div>
        </div>

        {/* Role Authorization & Permissions */}
        <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Active Role Capabilities: {role?.toUpperCase()}
            </span>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>Full Tier Clearance</span>
            </div>
          </div>

          <div className="space-y-2">
            {(rolePermissions[role || 'generator'] || rolePermissions.generator).map((perm, idx) => (
              <div key={idx} className="flex items-start gap-2 text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-medium">{perm}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security / Tokens Status */}
        <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
            Security &amp; Session Tokens
          </span>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between font-mono text-[11px] text-slate-600">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-slate-400" />
              <span>Bearer Access Token Active</span>
            </div>
            <span className="text-emerald-700 font-bold">
              {tokens?.accessToken ? 'Valid (Signed)' : 'Demo Session Active'}
            </span>
          </div>
        </div>
      </div>

      {/* Operational Coordinates & Leaflet Mini-Map */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-200/90 shadow-sm bg-white/90 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Operational GIS Coordinates
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Pinned base coordinates for algorithmic distance matrix and regional mapping
            </p>
          </div>
          <span className="font-mono text-xs font-bold bg-slate-100 px-2.5 py-1 rounded-lg text-slate-800">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </span>
        </div>

        <MapView
          height="280px"
          center={[lat, lng]}
          zoom={13}
          markers={profileMarker}
          fitBoundsToMarkers={true}
        />
      </div>
    </div>
  )
}

export default ProfilePage
