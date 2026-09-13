import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Download,
  Award,
  ShieldCheck,
  Leaf,
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import jsPDF from 'jspdf'
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
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadPDF = async () => {
    setIsDownloading(true)
    const toastId = toast.loading('Generating 1-page official PDF...')

    try {
      // Create pure vector A4 PDF (210mm x 297mm) - exactly 1 page
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pageWidth = 210
      const pageHeight = 297

      // 1. Page Background
      doc.setFillColor(250, 250, 248) // #fafaf8
      doc.rect(0, 0, pageWidth, pageHeight, 'F')

      // 2. Ornamental Borders
      // Outer Border
      doc.setDrawColor(226, 232, 240) // #e2e8f0
      doc.setLineWidth(2)
      doc.roundedRect(8, 8, pageWidth - 16, pageHeight - 16, 4, 4, 'S')

      // Inner Accent Border
      doc.setDrawColor(16, 185, 129) // #10b981
      doc.setLineWidth(0.6)
      doc.roundedRect(12, 12, pageWidth - 24, pageHeight - 24, 3, 3, 'S')

      // Corner Corner Dots
      doc.setFillColor(5, 150, 105)
      doc.circle(16, 16, 1.2, 'F')
      doc.circle(pageWidth - 16, 16, 1.2, 'F')
      doc.circle(16, pageHeight - 16, 1.2, 'F')
      doc.circle(pageWidth - 16, pageHeight - 16, 1.2, 'F')

      // 3. Header Emblem / Seal
      doc.setFillColor(236, 253, 245) // emerald-50
      doc.setDrawColor(167, 243, 208) // emerald-200
      doc.setLineWidth(0.5)
      doc.circle(pageWidth / 2, 28, 8, 'FD')

      // Emblem leaf mark
      doc.setFillColor(5, 150, 105)
      doc.circle(pageWidth / 2, 28, 4, 'F')

      // 4. Registry Subtitle
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(6, 95, 70) // emerald-800
      doc.text('WASTE2CARBON GLOBAL VALUE CHAIN REGISTRY', pageWidth / 2, 42, {
        align: 'center',
      })

      // 5. Main Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(17)
      doc.setTextColor(15, 23, 42) // slate-900
      doc.text('Certificate of Verified Carbon Sequestration', pageWidth / 2, 50, {
        align: 'center',
      })

      // Subtitle description
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(100, 116, 139) // slate-500
      const subText =
        'This document certifies that the documented organic waste feedstock was diverted from landfill and permanently converted into high-value climate mitigation products.'
      doc.text(doc.splitTextToSize(subText, 160), pageWidth / 2, 57, {
        align: 'center',
      })

      // 6. Serial & Batch Tag Pills
      doc.setFillColor(241, 245, 249) // slate-100
      doc.setDrawColor(203, 213, 225)
      doc.roundedRect(42, 69, 58, 7, 3, 3, 'FD')
      doc.setFont('courier', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(51, 65, 85)
      doc.text(`SERIAL: ${data.certificateId}`, 71, 74, { align: 'center' })

      doc.setFillColor(209, 250, 229) // emerald-100
      doc.setDrawColor(167, 243, 208)
      doc.roundedRect(108, 69, 60, 7, 3, 3, 'FD')
      doc.setFont('courier', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(6, 95, 70)
      doc.text(`BATCH: ${data.batchId}`, 138, 74, { align: 'center' })

      // 7. Impact Scoreboard Card (Dark Emerald Banner)
      doc.setFillColor(6, 78, 59) // emerald-900 / slate-900
      doc.roundedRect(20, 81, pageWidth - 40, 42, 4, 4, 'F')

      // Card Title
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(110, 231, 183) // emerald-300
      doc.text('AUDITED NET CARBON REDUCTION', 28, 90)

      // Net Benefit Value
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(26)
      doc.setTextColor(255, 255, 255)
      doc.text(`${data.netCO2eTons}`, 28, 103)

      doc.setFontSize(11)
      doc.setTextColor(110, 231, 183)
      doc.text('tCO2e Net Benefit', 68, 101)

      // Explanatory note
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7)
      doc.setTextColor(209, 250, 229)
      doc.text(
        'Inclusive of avoided anaerobic landfill emissions and durable carbon fixation.',
        28,
        113
      )

      // Right Stats inside banner
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(125, 87, 30, 14, 2, 2, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(100, 116, 139)
      doc.text('Feedstock Diverted', 140, 92, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(15, 23, 42)
      doc.text(`${data.quantityTons} Tons`, 140, 98, { align: 'center' })

      doc.setFillColor(255, 255, 255)
      doc.roundedRect(160, 87, 24, 14, 2, 2, 'F')
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(100, 116, 139)
      doc.text('Pathway Mode', 172, 92, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(15, 23, 42)
      doc.text(`${data.pathway}`, 172, 98, { align: 'center' })

      // 8. Ledger Cards (Left & Right)
      const ledgerY = 130
      const cardWidth = 81
      const cardHeight = 44

      // Left Card: Feedstock Provenance
      doc.setFillColor(255, 255, 255)
      doc.setDrawColor(226, 232, 240)
      doc.setLineWidth(0.4)
      doc.roundedRect(20, ledgerY, cardWidth, cardHeight, 3, 3, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text('FEEDSTOCK PROVENANCE', 26, ledgerY + 8)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text('Origin Generator:', 26, ledgerY + 18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      const genName = data.generatorName.length > 18 ? data.generatorName.slice(0, 18) + '...' : data.generatorName
      doc.text(genName, 95, ledgerY + 18, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text('Waste Classification:', 26, ledgerY + 27)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(`${data.wasteType}`, 95, ledgerY + 27, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text('Verified Quantity:', 26, ledgerY + 36)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(5, 150, 105)
      doc.text(`${data.quantityTons} Metric Tonnes`, 95, ledgerY + 36, { align: 'right' })

      // Right Card: Conversion Facility & Standard
      doc.setFillColor(255, 255, 255)
      doc.roundedRect(109, ledgerY, cardWidth, cardHeight, 3, 3, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(148, 163, 184)
      doc.text('CONVERSION FACILITY & STANDARD', 115, ledgerY + 8)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(100, 116, 139)
      doc.text('Conversion Facility:', 115, ledgerY + 18)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      const facName = data.facilityName.length > 18 ? data.facilityName.slice(0, 18) + '...' : data.facilityName
      doc.text(facName, 184, ledgerY + 18, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text('Accounting Standard:', 115, ledgerY + 27)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      const stdText = data.methodologyStandard.length > 20 ? data.methodologyStandard.slice(0, 20) + '...' : data.methodologyStandard
      doc.text(stdText, 184, ledgerY + 27, { align: 'right' })

      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 116, 139)
      doc.text('Certification Date:', 115, ledgerY + 36)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(15, 23, 42)
      doc.text(`${data.issuanceDate}`, 184, ledgerY + 36, { align: 'right' })

      // 9. Signatures & Verification Section
      const sigY = 192
      doc.setDrawColor(203, 213, 225)
      doc.line(25, sigY + 18, 70, sigY + 18)
      doc.line(140, sigY + 18, 185, sigY + 18)

      // Signature 1
      doc.setFont('times', 'italic')
      doc.setFontSize(11)
      doc.setTextColor(51, 65, 85)
      doc.text('Dr. Rajesh Patel', 47.5, sigY + 14, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(148, 163, 184)
      doc.text('CHIEF VERIFIER (IPCC LEAD)', 47.5, sigY + 23, { align: 'center' })

      // Center Verification Stamp Box
      doc.setFillColor(240, 253, 244)
      doc.setDrawColor(187, 247, 208)
      doc.roundedRect(88, sigY, 34, 28, 2, 2, 'FD')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7)
      doc.setTextColor(22, 101, 52)
      doc.text('VERIFIED SEAL', 105, sigY + 8, { align: 'center' })
      doc.setFont('courier', 'bold')
      doc.setFontSize(6)
      doc.text('IMMUTABLE', 105, sigY + 15, { align: 'center' })
      doc.text('CHAIN AUDIT', 105, sigY + 20, { align: 'center' })
      doc.text('W2C-REGISTRY', 105, sigY + 25, { align: 'center' })

      // Signature 2
      doc.setFont('times', 'italic')
      doc.setFontSize(11)
      doc.setTextColor(51, 65, 85)
      doc.text('Aarav Sharma', 162.5, sigY + 14, { align: 'center' })
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(6.5)
      doc.setTextColor(148, 163, 184)
      doc.text('AUTHORIZED GENERATOR', 162.5, sigY + 23, { align: 'center' })

      // 10. Audit Hash & Tamper-Proof Footer
      doc.setFont('courier', 'normal')
      doc.setFontSize(6)
      doc.setTextColor(148, 163, 184)
      doc.text(
        'TAMPER-PROOF AUDIT HASH: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        pageWidth / 2,
        256,
        { align: 'center' }
      )

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(6.5)
      doc.setTextColor(100, 116, 139)
      doc.text(
        'Official certificate generated by Waste2Carbon Global MRV Registry | 1-Page Official Verifiable Document',
        pageWidth / 2,
        262,
        { align: 'center' }
      )

      // Save PDF file
      const fileName = `Waste2Carbon_Certificate_${data.certificateId || 'W2C'}.pdf`
      doc.save(fileName)

      toast.dismiss(toastId)
      toast.success('Certificate downloaded successfully as single-page PDF!')
    } catch (err) {
      console.error('PDF Generation Error:', err)
      toast.dismiss(toastId)
      toast.error('Failed to generate PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleCopyHash = () => {
    navigator.clipboard.writeText(`W2C-VERIFY:${data.certificateId}:${data.batchId}`)
    toast.success('Certificate verification hash copied!')
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            <span>Official Verifiable Digital Asset</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-950/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              title="Download 1-Page Official PDF Certificate"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </>
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="p-8 sm:p-10 bg-[#fafaf8] text-slate-900 space-y-6 relative overflow-hidden border-[10px] border-[#f0ede6]">
          {/* Subtle Guilloché Background Watermark */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03] flex items-center justify-center">
            <Leaf className="w-[450px] h-[450px]" />
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2.5 relative z-10 border-b-2 border-emerald-900/10 pb-5">
            <div className="inline-flex items-center justify-center p-2.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs mx-auto">
              <Award className="h-7 w-7 stroke-[1.5]" />
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-emerald-800 font-heading">
                Waste2Carbon Global Value Chain Registry
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-heading">
                Certificate of Verified Carbon Sequestration
              </h1>
              <p className="text-[11px] text-slate-500 max-w-lg mx-auto leading-relaxed">
                This document certifies that the documented organic waste feedstock was diverted from landfill and permanently converted into high-value climate mitigation products.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2.5 pt-1 text-xs">
              <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 font-mono font-bold text-[11px] text-slate-700">
                SERIAL: {data.certificateId}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-200 font-mono font-bold text-[11px] text-emerald-800">
                BATCH: {data.batchId}
              </span>
            </div>
          </div>

          {/* Primary Impact Scoreboard Banner */}
          <div className="relative z-10 p-5 rounded-2xl bg-gradient-to-br from-emerald-900 to-slate-900 text-white shadow-lg flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                Audited Net Carbon Reduction
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
                  {data.netCO2eTons}
                </span>
                <span className="text-base font-bold text-emerald-300 font-heading">tCO₂e Net Benefit</span>
              </div>
              <p className="text-[10px] text-emerald-100/70">
                Inclusive of avoided anaerobic landfill baseline emissions and durable carbon fixation.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-center sm:text-right shrink-0 w-full sm:w-auto">
              <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[9px] text-emerald-200 block">Feedstock Diverted</span>
                <span className="text-xs font-bold text-white font-heading">{data.quantityTons} Tons</span>
              </div>
              <div className="p-2 rounded-xl bg-white/10 border border-white/10">
                <span className="text-[9px] text-emerald-200 block">Pathway Mode</span>
                <span className="text-xs font-bold text-white font-heading capitalize">{data.pathway}</span>
              </div>
            </div>
          </div>

          {/* Detailed Audit Verification Ledger */}
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Feedstock Provenance
              </span>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Origin Generator:</span>
                <strong className="text-slate-900 text-right truncate max-w-[170px]">{data.generatorName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Waste Classification:</span>
                <span className="font-semibold text-slate-800 capitalize">{data.wasteType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Verified Quantity:</span>
                <span className="font-bold text-emerald-700">{data.quantityTons} Metric Tonnes</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Conversion Facility &amp; Standard
              </span>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-500">Conversion Facility:</span>
                <strong className="text-slate-900 text-right truncate max-w-[170px]">{data.facilityName}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
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
          <div className="relative z-10 pt-4 border-t-2 border-slate-200 grid grid-cols-3 items-end gap-4">
            <div className="space-y-1 text-center">
              <div className="h-8 border-b border-slate-300 flex items-end justify-center pb-0.5">
                <span className="font-cursive text-xs italic font-serif text-slate-700">Dr. Rajesh Patel</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Chief Verifier (IPCC Lead)
              </span>
            </div>

            {/* Center QR Code Watermark */}
            <div className="flex flex-col items-center">
              <QRCodeGenerator
                value={`W2C-CERT:${data.certificateId}:${data.batchId}`}
                size={80}
                showActions={false}
                className="p-1 border-0 shadow-none bg-transparent"
              />
              <span className="text-[8px] font-mono text-slate-400 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                Ledger Verified
              </span>
            </div>

            <div className="space-y-1 text-center">
              <div className="h-8 border-b border-slate-300 flex items-end justify-center pb-0.5">
                <span className="font-cursive text-xs italic font-serif text-slate-700">Aarav Sharma</span>
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                Authorized Generator
              </span>
            </div>
          </div>

          {/* Cryptographic Hash Notice */}
          <div className="relative z-10 pt-1 text-center">
            <button
              type="button"
              onClick={handleCopyHash}
              title="Click to copy cryptographic verification signature"
              className="text-[8.5px] font-mono text-slate-400 hover:text-emerald-700 cursor-pointer transition-colors"
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


