import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Leaf,
  Layers,
  Users,
  Car,
  Download,
  Activity,
  Flame,
  PieChart as PieChartIcon,
  BarChart3,
  Sparkles,
} from 'lucide-react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import { mockDb } from '../../api/mockData'
import { MapView, type MapMarkerData } from '../../components/map/MapView'
import { StatCard } from '../../components/shared/StatCard'

// Monthly Diversion Trend Data
const MONTHLY_DIVERSION_DATA = [
  { month: 'Apr', tons: 165, co2Avoided: 244 },
  { month: 'May', tons: 230, co2Avoided: 340 },
  { month: 'Jun', tons: 310, co2Avoided: 458 },
  { month: 'Jul', tons: 385, co2Avoided: 569 },
  { month: 'Aug', tons: 490, co2Avoided: 725 },
  { month: 'Sep', tons: 620, co2Avoided: 917 },
]

// Lifecycle Stage Colors for Donut
const DONUT_COLORS = {
  listed: '#94a3b8', // slate-400
  pending: '#3b82f6', // blue-500
  matched: '#06b6d4', // cyan-500
  scheduled: '#f59e0b', // amber-500
  collected: '#8b5cf6', // purple-500
  processed: '#10b981', // emerald-500
}

export const MunicipalOverviewPage: React.FC = () => {
  const [heatmapEnabled, setHeatmapEnabled] = useState(true)
  const summary = mockDb.getMunicipalSummary()
  const mapData = mockDb.getMunicipalMapData()

  // Convert facilities and listings to map markers
  const markers: MapMarkerData[] = [
    ...mapData.facilities.map((f) => ({
      id: `facility-${f.id}`,
      lat: f.locationLat,
      lng: f.locationLng,
      type: 'facility' as const,
      title: f.name,
      subtitle: `${f.address} &bull; Intake: ${f.weeklyCapacityTons} t/wk`,
      status: 'Active Bio-Plant',
    })),
    ...mapData.listings.map((l) => ({
      id: `listing-${l.id}`,
      lat: l.locationLat,
      lng: l.locationLng,
      type: 'generator' as const,
      title: l.generatorName || 'Organic Producer',
      subtitle: l.address,
      quantityTons: l.quantityTons,
      wasteType: l.wasteType,
      status: l.status,
    })),
  ]

  // Donut chart dataset
  const donutData = summary.matchesByStatus.map((item) => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    color: DONUT_COLORS[item.status as keyof typeof DONUT_COLORS] || '#10b981',
  }))

  return (
    <div className="space-y-6">
      {/* Top Impact Banner */}
      <div className="glass-panel-green rounded-2xl p-6 sm:p-8 relative overflow-hidden border border-emerald-300/80 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white border border-emerald-300 text-emerald-800 inline-flex items-center gap-1.5 shadow-2xs">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Municipal Climate &amp; Zero-Waste Command
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Regional Circular Economy Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Real-time geospatial oversight tracking organic stream diversion, bio-refining utilization, and verified EPA landfill methane avoidance across Bengaluru Metropolitan Region.
            </p>
          </div>

          <Link
            to="/municipal/reports"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 self-start md:self-auto cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Audit Ledger &amp; Export</span>
          </Link>
        </div>

        {/* EPA Carbon Impact Equivalence Headline Callout */}
        <div className="mt-6 p-4 rounded-xl bg-white/95 border border-emerald-200 flex items-center gap-3.5 shadow-xs">
          <div className="h-11 w-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
            <Car className="h-6 w-6 stroke-[1.8]" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Official EPA Carbon Equivalence Metric
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 font-heading">
              Equivalent to removing{' '}
              <span className="text-emerald-700 underline decoration-emerald-300 underline-offset-4">
                {summary.carsOffTheRoadEquivalent} passenger vehicles
              </span>{' '}
              from the road for an entire year.
            </div>
          </div>
        </div>
      </div>

      {/* 4 Regional Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Tons Diverted"
          value={summary.totalTonsDiverted}
          unit="t"
          icon={Leaf}
          accentColor="emerald"
          trend={{ value: '+24.6%', isPositive: true, label: 'vs last quarter' }}
          subtitle="Cumulative organic biomass"
          progress={{
            value: summary.totalTonsDiverted,
            max: 2000,
            color: 'emerald',
          }}
        />
        <StatCard
          label="Total CO2 Sequestered"
          value={summary.totalCo2SequesteredTons}
          unit="tCO2e"
          icon={Activity}
          accentColor="teal"
          trend={{ value: '+19.2%', isPositive: true, label: 'avoidance rate' }}
          subtitle="Direct landfill methane averted"
          progress={{
            value: summary.totalCo2SequesteredTons,
            max: 3000,
            color: 'teal',
          }}
        />
        <StatCard
          label="Active Facilities"
          value={summary.totalFacilitiesActive}
          unit="plants"
          icon={Layers}
          accentColor="blue"
          trend={{ value: '100% Operational', isPositive: true }}
          subtitle="Biomethanation & Composting"
          progress={{
            value: summary.totalFacilitiesActive,
            max: 10,
            color: 'blue',
          }}
        />
        <StatCard
          label="Enrolled Generators"
          value={summary.totalGeneratorsParticipating}
          unit="sites"
          icon={Users}
          accentColor="slate"
          trend={{ value: '+8 this month', isPositive: true }}
          subtitle="Farms, markets, & food producers"
          progress={{
            value: summary.totalGeneratorsParticipating,
            max: 50,
            color: 'emerald',
          }}
        />
      </div>

      {/* Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Monthly Diversion Bar Chart */}
        <div className="lg:col-span-7 glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Monthly Diversion Volume (Tons)
              </h2>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              FY 2026 Trajectory
            </span>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MONTHLY_DIVERSION_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                  formatter={(val: any) => [`${val} Tons`, 'Biomass Diverted']}
                />
                <Bar dataKey="tons" fill="#10b981" radius={[8, 8, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Match Conversion Status Breakdown (Donut Chart) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900 font-heading">
                Match Conversion Status
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">Stage Breakdown</span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.96)',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                  formatter={(val: any, name: any) => [`${val} Batches`, name]}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Regional GIS Map with Toggleable Heatmap Layer & Multi-Entity Pins */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 space-y-4 border border-slate-200/90 shadow-sm bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 font-heading">
              Regional Waste Accumulation Heatmap &amp; Infrastructure
            </h2>
            <p className="text-xs text-slate-500">
              Live spatial density gradient vs bio-facility processing capacity coordinates
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                heatmapEnabled
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Flame className="h-3.5 w-3.5" />
              <span>Waste Heatmap: {heatmapEnabled ? 'Active' : 'Disabled'}</span>
            </button>
          </div>
        </div>

        {/* Live Leaflet MapView with Heatmap & Markers */}
        <div className="space-y-3">
          <MapView
            center={[12.9716, 77.5946]}
            zoom={12}
            height="460px"
            markers={markers}
            heatPoints={mapData.heatPoints}
            showHeatmap={heatmapEnabled}
            fitBoundsToMarkers={true}
          />

          <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200 gap-2">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="h-3 w-3 rounded-full bg-emerald-700 border border-white shadow-2xs"></span>
              Bio-Conversion Plants ({mapData.facilities.length})
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="h-3 w-3 rounded-full bg-emerald-500 border border-white shadow-2xs"></span>
              Enrolled Generators ({mapData.listings.length})
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="h-2.5 w-12 rounded-full bg-gradient-to-r from-emerald-300 via-amber-400 to-red-500 shadow-2xs"></span>
              Accumulation Density Gradient
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MunicipalOverviewPage
