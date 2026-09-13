import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  ShieldCheck,
  Award,
  Truck,
  Building2,
  Scale,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  TreePine,
  Thermometer,
  Zap,
} from 'lucide-react'
import { QRCodeGenerator } from '../shared/QRCodeGenerator'
import toast from 'react-hot-toast'

export interface DigitalPassportData {
  batchId: string
  wasteType: string
  quantityTons: number
  generatorName: string
  generatorCert?: string
  originLocation: string
  originCoords: [number, number]
  moistureAtDeparture: number
  departureTime: string
  vehicleId: string
  driverName: string
  driverCredential?: string
  corridorRoute: string
  distanceKm: number
  vrpDieselReductionPct: number
  dieselConsumedLiters: number
  facilityName: string
  facilityLocation: string
  kilnType: string
  kilnTempC: number
  conversionYieldPct: number
  biocharYieldTons: number
  syngasRecoveryKWh?: number
  fixedCarbonPct: number
  hToCRatio: number
  permanenceYears: number
  avoidedLandfillCO2e: number
  durableStorageCO2e: number
  transportDeductionCO2e: number
  processDeductionCO2e: number
  netCO2eBenefit: number
  carbonCreditsMinted: number
  sha256Hash: string
  timestampSealed: string
  verraStandard: string
}

export const DEFAULT_PASSPORT_DATA: DigitalPassportData = {
  batchId: 'W2C-2026-000124',
  wasteType: 'Agricultural Crop Residue (Rice Husk & Stubble)',
  quantityTons: 100,
  generatorName: 'Khanna Agro Biomass Producers Cluster',
  generatorCert: 'AGR-PB-2024-8849-CERT',
  originLocation: 'Khanna Farm Gate #4, Ludhiana District, Punjab, India',
  originCoords: [30.7046, 76.2219],
  moistureAtDeparture: 14.2,
  departureTime: '2026-09-12 08:30 IST',
  vehicleId: 'PB-10-BX-9042 (BS-VI Clean Diesel Tipper)',
  driverName: 'Harpreet Singh',
  driverCredential: 'CRED-IN-LOG-89104',
  corridorRoute: 'GT Road NH-44 Industrial Freight Corridor',
  distanceKm: 42.4,
  vrpDieselReductionPct: 18,
  dieselConsumedLiters: 11.8,
  facilityName: 'Ludhiana Biochar Industrial Sink Ltd.',
  facilityLocation: 'Industrial Focal Point Phase-VIII, Ludhiana, Punjab',
  kilnType: 'Continuous High-Temperature Slow Pyrolysis Retort Unit #3',
  kilnTempC: 650,
  conversionYieldPct: 32.0,
  biocharYieldTons: 32.0,
  syngasRecoveryKWh: 4200,
  fixedCarbonPct: 78.4,
  hToCRatio: 0.38,
  permanenceYears: 100,
  avoidedLandfillCO2e: 98.0,
  durableStorageCO2e: 91.8,
  transportDeductionCO2e: 0.7,
  processDeductionCO2e: 1.2,
  netCO2eBenefit: 82.4,
  carbonCreditsMinted: 115,
  sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  timestampSealed: '2026-09-12T14:45:00.000Z',
  verraStandard: 'Verra VM0044 Biochar & IPCC Tier 2 Solid Waste Protocol',
}

interface DigitalPassportModalProps {
  passport?: DigitalPassportData
  onClose: () => void
  onOpenCertificate?: () => void
}

export const DigitalPassportModal: React.FC<DigitalPassportModalProps> = ({
  passport = DEFAULT_PASSPORT_DATA,
  onClose,
  onOpenCertificate,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'origin' | 'transit' | 'facility' | 'carbon'>('summary')
  const [copiedHash, setCopiedHash] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedHash(true)
    toast.success('SHA-256 Audit Hash copied to clipboard!')
    setTimeout(() => setCopiedHash(false), 2500)
  }

  const printPassport = () => {
    window.print()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden my-auto text-white flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Hologram Seal */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4 relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3.5">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-extrabold font-heading text-white">
                  Waste-to-Carbon Digital Passport
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-400/30 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  On-Chain Provenance
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Verifiable Product Passport complying with EU DPP, IPCC Tier 2, and Verra VM0044 standards.
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={printPassport}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Print / Save PDF"
            >
              <Printer className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition cursor-pointer"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Batch ID Banner with Cryptographic Hash */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 uppercase font-bold text-[10px]">Batch Identifier:</span>
            <span className="font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {passport.batchId}
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
            <span className="hidden sm:inline text-slate-500">SHA-256:</span>
            <span className="text-slate-300 truncate max-w-[200px] sm:max-w-[280px]">
              {passport.sha256Hash}
            </span>
            <button
              type="button"
              onClick={() => copyToClipboard(passport.sha256Hash)}
              className="p-1 text-slate-400 hover:text-emerald-400 transition cursor-pointer"
              title="Copy Hash"
            >
              {copiedHash ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 sm:px-6 pt-3 border-b border-slate-800 bg-slate-900/50 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'summary'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview &amp; QR Seal
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('origin')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'origin'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            1. Origin &amp; Custody
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transit')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'transit'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            2. Logistics &amp; VRP Transit
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('facility')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'facility'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            3. Kiln Intake &amp; Pyrolysis
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('carbon')}
            className={`pb-2.5 px-3 border-b-2 transition whitespace-nowrap cursor-pointer ${
              activeTab === 'carbon'
                ? 'border-emerald-400 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            4. Carbon Permanence Ledger
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: SUMMARY & QR SEAL                                                  */}
          {/* ========================================================================= */}
          {activeTab === 'summary' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Top Hero Grid: QR + Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* QR Code & Scan Panel */}
                <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col items-center text-center justify-center space-y-3">
                  <div className="p-2 bg-white rounded-2xl shadow-xl">
                    <QRCodeGenerator value={`https://waste2carbon.org/track/${passport.batchId}`} size={130} />
                  </div>
                  <div>
                    <span className="font-mono text-xs font-extrabold text-emerald-400 block">
                      SCAN FOR PUBLIC AUDIT
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Decentralized URL &bull; Cryptographically Verified
                    </span>
                  </div>
                </div>

                {/* Core Net Benefits Card */}
                <div className="md:col-span-2 p-5 rounded-2xl bg-gradient-to-br from-emerald-950/50 to-teal-950/30 border border-emerald-500/30 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Certified Ecological Net Impact
                      </span>
                      <span className="text-xs font-mono text-slate-400">{passport.departureTime}</span>
                    </div>

                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">
                        +{passport.netCO2eBenefit}
                      </span>
                      <span className="text-base sm:text-lg font-bold text-emerald-300">
                        tCO₂e Permanently Sequestered
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      This certificate validates the complete lifecycle transformation of{' '}
                      <strong className="text-white">{passport.quantityTons} metric tons</strong> of {passport.wasteType} into{' '}
                      <strong className="text-emerald-300">{passport.biocharYieldTons} tons</strong> of biochar with 100+ year permanence.
                    </p>
                  </div>

                  {/* 4 Quick Stat Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Landfill Avoided</span>
                      <strong className="text-emerald-400">+{passport.avoidedLandfillCO2e} tCO₂e</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Durable Biochar</span>
                      <strong className="text-teal-400">+{passport.durableStorageCO2e} tCO₂e</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">VRP Transit Saving</span>
                      <strong className="text-blue-400">-{passport.vrpDieselReductionPct}% Diesel</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-slate-900/90 border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-sans">Credits Minted</span>
                      <strong className="text-amber-400">{passport.carbonCreditsMinted} Credits</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lifecycle Value Chain Timeline */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-heading flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span>End-to-End Chain of Custody</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Step 1 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-emerald-400 font-bold block">01 / ORIGIN</span>
                    <strong className="text-white block font-heading truncate">{passport.generatorName}</strong>
                    <span className="text-slate-400 text-[11px] block">{passport.quantityTons}t &bull; {passport.moistureAtDeparture}% Moisture</span>
                  </div>

                  {/* Step 2 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-blue-400 font-bold block">02 / LOGISTICS</span>
                    <strong className="text-white block font-heading truncate">{passport.vehicleId.split(' ')[0]}</strong>
                    <span className="text-slate-400 text-[11px] block">{passport.distanceKm} km &bull; -18% Fuel Saved</span>
                  </div>

                  {/* Step 3 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-teal-400 font-bold block">03 / PYROLYSIS</span>
                    <strong className="text-white block font-heading truncate">{passport.facilityName.split(' ')[0]}</strong>
                    <span className="text-slate-400 text-[11px] block">{passport.kilnTempC}°C &bull; {passport.conversionYieldPct}% Yield</span>
                  </div>

                  {/* Step 4 */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 font-bold block">04 / LEDGER</span>
                    <strong className="text-white block font-heading truncate">{passport.carbonCreditsMinted} Verified Credits</strong>
                    <span className="text-slate-400 text-[11px] block">VM0044 &bull; 100+ Yr Rating</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: ORIGIN & CUSTODY                                                   */}
          {/* ========================================================================= */}
          {activeTab === 'origin' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Scale className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Biomass Origin &amp; Departure Weighbridge Assay
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    QA Certified
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Producer / Generator:</span>
                    <strong className="text-white text-sm">{passport.generatorName}</strong>
                    <p className="text-slate-400 text-[11px]">{passport.originLocation}</p>
                    <span className="font-mono text-emerald-400 text-[10px] block">
                      GPS: {passport.originCoords[0]}° N, {passport.originCoords[1]}° E
                    </span>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
                    <span className="text-slate-400 block">Agricultural Certification ID:</span>
                    <strong className="font-mono text-white text-sm">{passport.generatorCert}</strong>
                    <span className="text-slate-400 text-[11px] block">Departure Timestamp:</span>
                    <strong className="text-white">{passport.departureTime}</strong>
                  </div>
                </div>
              </div>

              {/* Feedstock Lab Assay Table */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-heading block">
                  Feedstock Chemical &amp; Moisture Assay at Farm Gate
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Moisture Content</span>
                    <strong className="text-emerald-400 text-sm">{passport.moistureAtDeparture}%</strong>
                    <span className="text-[9px] text-slate-500 block">Air-dried stubble</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Fixed Carbon</span>
                    <strong className="text-teal-400 text-sm">18.4%</strong>
                    <span className="text-[9px] text-slate-500 block">Proximate analysis</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Volatile Matter</span>
                    <strong className="text-blue-400 text-sm">64.8%</strong>
                    <span className="text-[9px] text-slate-500 block">Syngas precursor</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Inorganic Ash</span>
                    <strong className="text-amber-400 text-sm">16.8%</strong>
                    <span className="text-[9px] text-slate-500 block">Silica-rich rice husk</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: LOGISTICS & TRANSIT                                                */}
          {/* ========================================================================= */}
          {activeTab === 'transit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-blue-400" />
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Consolidated Logistics &amp; VRP Transit Log
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-400 border border-blue-400/30">
                    VRP Optimized
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Haulage Vehicle:</span>
                    <strong className="text-white text-sm">{passport.vehicleId}</strong>
                    <span className="text-slate-400 text-[11px] block">Assigned Driver:</span>
                    <strong className="text-white">{passport.driverName} ({passport.driverCredential})</strong>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
                    <span className="text-slate-400 block">Transit Corridor:</span>
                    <strong className="text-white text-sm">{passport.corridorRoute}</strong>
                    <span className="text-slate-400 text-[11px] block">Optimized Haul Distance:</span>
                    <strong className="text-emerald-400 text-sm font-mono">{passport.distanceKm} km</strong>
                  </div>
                </div>
              </div>

              {/* Fuel & Emission Savings Grid */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-heading block">
                  Telemetric Fuel &amp; Transport Deduction Audit
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Diesel Consumed</span>
                    <strong className="text-amber-400 text-sm">{passport.dieselConsumedLiters} L</strong>
                    <span className="text-[9px] text-slate-500 block">0.28 L/km rate</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Route Fuel Saved</span>
                    <strong className="text-emerald-400 text-sm">-{passport.vrpDieselReductionPct}%</strong>
                    <span className="text-[9px] text-slate-500 block">vs direct unrouted haul</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Transport Emission</span>
                    <strong className="text-red-400 text-sm">-{passport.transportDeductionCO2e} tCO₂e</strong>
                    <span className="text-[9px] text-slate-500 block">DEFRA freight factor</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Chain Security</span>
                    <strong className="text-blue-400 text-sm">Geofenced</strong>
                    <span className="text-[9px] text-slate-500 block">Gate-to-gate verified</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: FACILITY & PYROLYSIS                                               */}
          {/* ========================================================================= */}
          {activeTab === 'facility' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-teal-400" />
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      Biochar Pyrolysis &amp; Industrial Conversion Assays
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-teal-500/20 text-teal-400 border border-teal-400/30">
                    IBI Standard Compliant
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="text-slate-400 block">Processing Offtake Facility:</span>
                    <strong className="text-white text-sm">{passport.facilityName}</strong>
                    <p className="text-slate-400 text-[11px]">{passport.facilityLocation}</p>
                  </div>

                  <div className="space-y-1 sm:border-l sm:border-slate-800 sm:pl-4">
                    <span className="text-slate-400 block">Pyrolysis Reactor Specs:</span>
                    <strong className="text-white text-sm">{passport.kilnType}</strong>
                    <span className="text-slate-400 text-[11px] block">Continuous operating mode &bull; Inert N₂ purge</span>
                  </div>
                </div>
              </div>

              {/* Pyrolysis Operating Conditions & Mass Balance */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 font-heading block">
                  Reactor Operating Parameters &amp; Yield Mass Balance
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Retort Temperature</span>
                    <strong className="text-amber-400 text-sm flex items-center gap-1">
                      <Thermometer className="h-3.5 w-3.5" />
                      {passport.kilnTempC} °C
                    </strong>
                    <span className="text-[9px] text-slate-500 block">Slow pyrolysis regime</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Biochar Yield</span>
                    <strong className="text-teal-400 text-sm">
                      {passport.conversionYieldPct}% ({passport.biocharYieldTons}t)
                    </strong>
                    <span className="text-[9px] text-slate-500 block">High fixed carbon fraction</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">H:C Molar Ratio</span>
                    <strong className="text-emerald-400 text-sm">{passport.hToCRatio}</strong>
                    <span className="text-[9px] text-slate-500 block">&lt; 0.70 IBI threshold</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Recaptured Syngas</span>
                    <strong className="text-blue-400 text-sm flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" />
                      {passport.syngasRecoveryKWh} kWh
                    </strong>
                    <span className="text-[9px] text-slate-500 block">Offsets parasitic power</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: CARBON LEDGER & AUDIT                                              */}
          {/* ========================================================================= */}
          {activeTab === 'carbon' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TreePine className="h-5 w-5 text-emerald-400" />
                    <h3 className="text-sm font-extrabold text-white font-heading">
                      IPCC Tier 2 &amp; Verra VM0044 Carbon Accounting Ledger
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-400/30">
                    100+ Year Permanence
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Calculated using stoichiometric carbon retention: Biochar &times; C_org &times; (44/12) &times; F_perm, net of baseline open dump anaerobic decomposition and telemetric transportation footprint.
                </p>
              </div>

              {/* 5-Step Equation Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-300">1. Baseline Landfill / Open Fire Avoidance:</span>
                  <span className="font-extrabold text-emerald-400">+{passport.avoidedLandfillCO2e} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-300">2. Durable High-Permanence Biochar Storage:</span>
                  <span className="font-extrabold text-teal-400">+{passport.durableStorageCO2e} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-300">3. VRP Optimized Transport Deduction:</span>
                  <span className="font-extrabold text-red-400">-{passport.transportDeductionCO2e} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center py-1.5 border-b border-slate-800">
                  <span className="text-slate-300">4. Kiln Parasitic Energy &amp; Pretreatment:</span>
                  <span className="font-extrabold text-red-400">-{passport.processDeductionCO2e} tCO₂e</span>
                </div>
                <div className="flex justify-between items-center pt-2 text-sm font-extrabold">
                  <span className="text-white font-heading">5. NET VERIFIED CARBON BENEFIT:</span>
                  <span className="text-emerald-400 font-mono text-base">+{passport.netCO2eBenefit} tCO₂e</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Auditing Standard:</span>
            <span className="text-xs font-mono font-bold text-slate-200">{passport.verraStandard}</span>
          </div>

          <div className="flex items-center gap-3">
            {onOpenCertificate && (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <Award className="h-4 w-4 text-amber-400" />
                <span>View Full Certificate</span>
              </button>
            )}
            <button
              type="button"
              onClick={printPassport}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/25 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Export Official DPP</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
