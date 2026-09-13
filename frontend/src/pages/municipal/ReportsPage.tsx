import React, { useState } from 'react'
import {
  Search,
  Calendar,
  Layers,
  Leaf,
  Award,
  Building2,
  FileSpreadsheet,
  QrCode,
} from 'lucide-react'
import { mockDb } from '../../api/mockData'
import { CarbonCertificateModal, type CertificateData } from '../../components/carbon/CarbonCertificateModal'
import { BatchTrackingModal, type BatchTrackingDetails } from '../../components/tracking/BatchTrackingModal'
import Papa from 'papaparse'
import toast from 'react-hot-toast'

export const ReportsPage: React.FC = () => {
  const [wasteTypeFilter, setWasteTypeFilter] = useState('all')
  const [pathwayFilter, setPathwayFilter] = useState('all')
  const [startDate, setStartDate] = useState('2026-08-01')
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [searchQuery, setSearchQuery] = useState('')

  const [selectedRecordForCertificate, setSelectedRecordForCertificate] = useState<CertificateData | null>(null)
  const [selectedTrackingBatch, setSelectedTrackingBatch] = useState<BatchTrackingDetails | null>(null)

  const allRecords = mockDb.getCarbonRecords()

  const openCertificate = (record: (typeof allRecords)[0]) => {
    const batchId = `W2C-2026-00010${record.id}`
    setSelectedRecordForCertificate({
      certificateId: `W2C-CERT-2026-00${record.id}9`,
      batchId,
      wasteType: record.wasteType.replace('_', ' '),
      quantityTons: record.quantityTons,
      pathway: record.conversionPathway,
      netCO2eTons: record.netCarbonBenefitTons,
      landfillAvoidedTons: record.landfillMethaneBaselineTons,
      carbonStoredTons: record.co2SequesteredTons,
      generatorName: record.generatorName,
      facilityName: record.facilityName,
      issuanceDate: record.processedDate,
      methodologyStandard: 'Verra VM0044 & CDM ACM0022 Bio-Assay',
    })
  }

  const openTracking = (record: (typeof allRecords)[0]) => {
    const batchId = `W2C-2026-00010${record.id}`
    setSelectedTrackingBatch({
      batchId,
      listingId: record.id,
      wasteType: record.wasteType.replace('_', ' '),
      quantityTons: record.quantityTons,
      generatorName: record.generatorName,
      facilityName: record.facilityName,
      facilityType: record.conversionPathway,
      originAddress: `${record.generatorName} Facility Gate, Agri-Corridor`,
      destinationAddress: `${record.facilityName}, Bio-Conversion Plant #2`,
      driverName: 'Rajesh Kumar (Heavy Fleet #104)',
      truckNumber: 'KA-05-EV-4421',
      distanceKm: 28.5,
      createdAt: record.processedDate,
      currentStageIndex: 8, // 8 is CARBON IMPACT VERIFIED
    })
  }

  // Apply filters
  const filtered = allRecords.filter((r) => {
    const matchesWaste = wasteTypeFilter === 'all' || r.wasteType === wasteTypeFilter
    const matchesPathway =
      pathwayFilter === 'all' || r.conversionPathway.toLowerCase().includes(pathwayFilter.toLowerCase())
    const matchesSearch =
      r.generatorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.facilityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.conversionPathway.toLowerCase().includes(searchQuery.toLowerCase())

    const recordDate = r.processedDate
    const matchesDate = (!startDate || recordDate >= startDate) && (!endDate || recordDate <= endDate)

    return matchesWaste && matchesPathway && matchesSearch && matchesDate
  })

  // Summary totals
  const totalFilteredTons = filtered.reduce((acc, curr) => acc + curr.quantityTons, 0)
  const totalFilteredGrossCO2 = filtered.reduce((acc, curr) => acc + curr.co2SequesteredTons, 0)
  const totalFilteredNetCredits = filtered.reduce((acc, curr) => acc + curr.netCarbonBenefitTons, 0)

  // One-click CSV Export via PapaParse
  const handleExportCSV = () => {
    try {
      const exportData = filtered.map((r) => ({
        'Audit Record ID': `CR-${r.id}`,
        'Generator Name': r.generatorName,
        'Processing Facility': r.facilityName,
        'Waste Category': r.wasteType.toUpperCase(),
        'Quantity (Tons)': r.quantityTons,
        'Gross CO2 Sequestered (tCO2e)': r.co2SequesteredTons,
        'Landfill Methane Baseline (tCO2e)': r.landfillMethaneBaselineTons,
        'Net Carbon Credit (tCO2e)': r.netCarbonBenefitTons,
        'Conversion Pathway': r.conversionPathway,
        'Registry Verification Date': r.processedDate,
      }))

      const csv = Papa.unparse(exportData)
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.setAttribute('href', url)
      link.setAttribute(
        'download',
        `ecotrace_verified_carbon_audit_${new Date().toISOString().split('T')[0]}.csv`
      )
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success(`Exported ${filtered.length} audit records to CSV!`)
    } catch {
      toast.error('Failed to export CSV.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading tracking-tight">
              Carbon Value Chain Reports &amp; Audit Ledger
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Gold Standard / Verra
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Immutable carbon credit issuance records, methane avoidance audits, and offtake certification
          </p>
        </div>

        {/* Client-side One-Click Export CSV */}
        <button
          type="button"
          onClick={handleExportCSV}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/25 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <FileSpreadsheet className="h-4 w-4" />
          <span>Export Verified CSV ({filtered.length})</span>
        </button>
      </div>

      {/* Aggregate KPI Summary for Active Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-slate-200/90 bg-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Leaf className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Filtered Tonnage</span>
            <div className="text-xl font-extrabold text-slate-900 font-heading">
              {totalFilteredTons.toFixed(1)} <span className="text-xs font-normal text-slate-500">Tons</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-200/90 bg-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gross CO2 Sequestered</span>
            <div className="text-xl font-extrabold text-teal-800 font-heading">
              {totalFilteredGrossCO2.toFixed(1)} <span className="text-xs font-normal text-slate-500">tCO2e</span>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-200/90 bg-white flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Net Carbon Credits</span>
            <div className="text-xl font-extrabold text-blue-800 font-heading">
              {totalFilteredNetCredits.toFixed(1)} <span className="text-xs font-normal text-slate-500">Credits</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 space-y-4 border border-slate-200/90 shadow-sm bg-white/90">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search generator, facility, pathway..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Waste Category Selector */}
          <div className="md:col-span-3">
            <select
              value={wasteTypeFilter}
              onChange={(e) => setWasteTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Waste Categories</option>
              <option value="agricultural">Agricultural Residues</option>
              <option value="food">Food Waste</option>
              <option value="manure">Livestock Manure</option>
              <option value="industrial_organic">Industrial Organics</option>
            </select>
          </div>

          {/* Conversion Pathway Selector */}
          <div className="md:col-span-3">
            <select
              value={pathwayFilter}
              onChange={(e) => setPathwayFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs font-semibold bg-white border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Conversion Pathways</option>
              <option value="biomethanation">Anaerobic Biomethanation</option>
              <option value="pyrolysis">Pyrolysis &amp; Biochar</option>
              <option value="composting">In-Vessel Composting</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="md:col-span-2 flex items-center gap-1 bg-white border border-slate-200 px-2 py-1.5 rounded-xl text-[10px] text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-[10px] text-slate-700 bg-transparent focus:outline-none w-1/2"
              title="Start Date"
            />
            <span>-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-[10px] text-slate-700 bg-transparent focus:outline-none w-1/2"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Detailed Audit Table */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-200/90 shadow-sm overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="pb-3.5">Record ID</th>
                <th className="pb-3.5">Generator</th>
                <th className="pb-3.5">Facility</th>
                <th className="pb-3.5">Category</th>
                <th className="pb-3.5">Tons</th>
                <th className="pb-3.5">Gross CO2e</th>
                <th className="pb-3.5">Net Credit</th>
                <th className="pb-3.5">Conversion Pathway</th>
                <th className="pb-3.5">Audit Date</th>
                <th className="pb-3.5 text-right">Verification &amp; Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.map((record) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-mono font-bold text-slate-900">
                    <span className="text-slate-900">#CR-{record.id}</span>
                    <span className="block text-[10px] text-slate-400 font-normal font-mono">W2C-2026-00010{record.id}</span>
                  </td>
                  <td className="py-3.5 font-bold text-slate-900">
                    <div className="truncate max-w-[160px]">{record.generatorName}</div>
                  </td>
                  <td className="py-3.5 text-slate-700">
                    <div className="flex items-center gap-1.5 font-medium truncate max-w-[160px]">
                      <Building2 className="h-3 w-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{record.facilityName}</span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-wide">
                      {record.wasteType.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 font-extrabold text-slate-900 font-heading">
                    {record.quantityTons} <span className="text-[10px] text-slate-400 font-normal">t</span>
                  </td>
                  <td className="py-3.5 font-bold text-emerald-700">
                    {record.co2SequesteredTons} tCO2e
                  </td>
                  <td className="py-3.5 font-extrabold text-blue-700">
                    +{record.netCarbonBenefitTons}
                  </td>
                  <td className="py-3.5 text-slate-600">
                    <span className="truncate max-w-[150px] block font-medium">
                      {record.conversionPathway}
                    </span>
                  </td>
                  <td className="py-3.5 text-slate-500 font-mono text-[11px]">
                    {record.processedDate}
                  </td>
                  <td className="py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => openCertificate(record)}
                        title="View & download official verifiable carbon certificate"
                        className="p-1.5 px-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                      >
                        <Award className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Certificate</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => openTracking(record)}
                        title="View 10-stage lifecycle batch tracker"
                        className="p-1.5 px-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5 text-slate-600" />
                        <span>Track</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Carbon Certificate Modal */}
      {selectedRecordForCertificate && (
        <CarbonCertificateModal
          data={selectedRecordForCertificate}
          onClose={() => setSelectedRecordForCertificate(null)}
        />
      )}

      {/* 10-Stage Lifecycle Batch Tracking Modal */}
      {selectedTrackingBatch && (
        <BatchTrackingModal
          batch={selectedTrackingBatch}
          onClose={() => setSelectedTrackingBatch(null)}
        />
      )}
    </div>
  )
}

export default ReportsPage
