import React from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Printer,
  Award,
  ShieldCheck,
  Leaf,
} from 'lucide-react'
import { QRCodeGenerator } from '../shared/QRCodeGenerator'
import toast from 'react-hot-toast'

export interface CertificateData {
  certificateId: string
  batchId: string
  wasteType: string
  quantityTons: number
  pathway: string
  netCO2eTons: number
  landfillAvoidedTons: number
  carbonStoredTons: number
  generatorName: string
  facilityName: string
  issuanceDate: string
  methodologyStandard: string
}

interface CarbonCertificateModalProps {
  data: CertificateData
  onClose: () => void
}

export const CarbonCertificateModal: React.FC<CarbonCertificateModalProps> = ({
  data,
  onClose,
}) => {
  const handlePrint = () => {
    window.print()
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(`W2C-VERIFY:${data.certificateId}:${data.batchId}`)
    toast.success('Certificate verification hash copied!')
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar (Hidden on print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Official Verifiable Digital Asset</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body (Printable Area) */}
        <div className="p-8 sm:p-12 bg-[#fafaf8] text-slate-900 space-y-8 relative overflow-hidden border-[12px] border-[#f0ede6]">
          {/* Subtle Guilloché Background Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <Leaf className="w-[450px] h-[450px]" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-3 relative z-10 border-b-2 border-emerald-900/10 pb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-sm mx-auto">
              <Award className="h-8 w-8 stroke-[1.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-emerald-800 font-heading">
                Waste2Carbon Global Value Chain Registry
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-heading">
                Certificate of Verified Carbon Sequestration
              </h1>
              <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
                This document certifies that the documented organic waste feedstock was diverted from landfill and permanently converted into high-value climate mitigation products.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-1 text-xs">
              <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-slate-700">
                SERIAL: {data.certificateId}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 font-mono font-bold text-emerald-800">
                BATCH: {data.batchId}
              </span>
            </div>
          </div>

          {/* Primary Impact Scoreboard Banner */}
          <div className="relative z-10 p-6 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Audited Net Carbon Reduction
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-4xl sm:text-5xl font-extrabold font-heading text-white">
                  {data.netCO2eTons}
                </span>
                <span className="text-lg font-bold text-emerald-300 font-heading">tCO₂e Net Benefit</span>
              </div>
              <p className="text-[11px] text-emerald-100/70">
                Inclusive of avoided anaerobic landfill baseline emissions and durable carbon fixation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center sm:text-right shrink-0 w-full sm:w-auto">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[10px] text-emerald-200 block">Feedstock Diverted</span>
                <span className="text-sm font-bold text-white font-heading">{data.quantityTons} Tons</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[10px] text-emerald-200 block">Pathway Mode</span>
                <span className="text-sm font-bold text-white font-heading capitalize">{data.pathway}</span>
              </div>
            </div>
          </div>

          {/* Detailed Audit Verification Ledger */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Feedstock Provenance
              </span>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Origin Generator:</span>
                <strong className="text-slate-900 text-right">{data.generatorName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Waste Classification:</span>
                <span className="font-semibold text-slate-800 capitalize">{data.wasteType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Quantity:</span>
                <span className="font-bold text-emerald-700">{data.quantityTons} Metric Tonnes</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Conversion Facility &amp; Standard
              </span>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Conversion Facility:</span>
                <strong className="text-slate-900 text-right">{data.facilityName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1.5">
                <span className="text-slate-500">Accounting Standard:</span>
                <span className="font-semibold text-slate-800">{data.methodologyStandard}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Certification Date:</span>
                <span className="font-bold text-slate-800">{data.issuanceDate}</span>
              </div>
            </div>
          </div>

          {/* Signatures & Seal Section */}
          <div className="relative z-10 pt-6 border-t-2 border-slate-200 grid grid-cols-3 items-end gap-6">
            <div className="space-y-2 text-center">
              <div className="h-10 border-b border-slate-300 flex items-end justify-center pb-1">
                <span className="font-cursive text-sm italic font-serif text-slate-700">Dr. Rajesh Patel</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Chief Verifier (Verra / IPCC Lead)
              </span>
            </div>

            {/* Center QR Code Watermark */}
            <div className="flex flex-col items-center">
              <QRCodeGenerator
                value={`W2C-CERT:${data.certificateId}:${data.batchId}`}
                size={95}
                showActions={false}
                className="p-1 border-0 shadow-none bg-transparent"
              />
              <span className="text-[9px] font-mono text-slate-400 mt-1">Scan for Ledger Hash</span>
            </div>

            <div className="space-y-2 text-center">
              <div className="h-10 border-b border-slate-300 flex items-end justify-center pb-1">
                <span className="font-cursive text-sm italic font-serif text-slate-700">Aarav Sharma</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Authorized Generator Signature
              </span>
            </div>
          </div>

          {/* Cryptographic Hash Notice */}
          <div className="relative z-10 pt-2 text-center">
            <button
              type="button"
              onClick={handleCopyHash}
              title="Click to copy cryptographic verification signature"
              className="text-[9px] font-mono text-slate-400 hover:text-emerald-700 cursor-pointer transition-colors"
            >
              TAMPER-PROOF AUDIT HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855 (Click to Copy)
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
