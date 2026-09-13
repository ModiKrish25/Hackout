import React from 'react'
import { HeroSection } from '../../components/home/HeroSection'
import { ArchitecturePipelineSection } from '../../components/home/ArchitecturePipelineSection'
import { Link } from 'react-router-dom'
import {
  Recycle,
  Leaf,
  ShieldCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-800 font-sans flex flex-col">
      {/* Hero Section */}
      <HeroSection />

      {/* Proposed Architectural Enhancements Interactive Pipeline */}
      <ArchitecturePipelineSection />

      {/* Value Chain Showcase Section in Clean White, Light Green & Shades of Gray */}
      <section className="bg-slate-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              Circular Waste-to-Carbon Architecture
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 font-heading tracking-tight sm:text-4xl">
              From Organic Stream to Verified Carbon Ingestion
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              A single decentralized registry closing the loop between waste producers, bio-refining plants, and municipal environmental authorities.
            </p>
          </div>

          {/* 3 Pillars for the 3 Ecosystem Roles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Generator */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-8 space-y-4 relative">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <Leaf className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wide">For Producers</span>
                <h3 className="text-xl font-bold text-slate-900 font-heading">Waste Generators</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                List agricultural crop residues, commercial food organics, or manure. Get matched with nearby facilities and receive monetary off-take + carbon offset credits.
              </p>
              <div className="pt-2">
                <Link
                  to="/generator/dashboard"
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                >
                  Explore Generator Features &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 2: Facility */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-8 space-y-4 relative">
              <div className="h-12 w-12 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-600">
                <Recycle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">For Bio-Plants</span>
                <h3 className="text-xl font-bold text-slate-900 font-heading">Processing Facilities</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Review candidate feedstocks, accept scheduled batch deliveries, and run optimized TSP vehicle routes with turn-by-turn GIS coordinates.
              </p>
              <div className="pt-2">
                <Link
                  to="/facility/dashboard"
                  className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                >
                  Explore Facility Operations &rarr;
                </Link>
              </div>
            </div>

            {/* Pillar 3: Municipality */}
            <div className="glass-panel glass-panel-hover rounded-2xl p-6 sm:p-8 space-y-4 relative">
              <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-blue-700 uppercase tracking-wide">For Oversight</span>
                <h3 className="text-xl font-bold text-slate-900 font-heading">Municipal Authorities</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Monitor live regional accumulation heatmaps, calculate EPA car equivalents, enforce diversion quotas, and export certified ESG carbon audit sheets.
              </p>
              <div className="pt-2">
                <Link
                  to="/municipal/overview"
                  className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1"
                >
                  Explore Municipal Command &rarr;
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Platform Metrics Banner */}
          <div className="glass-panel-green rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-bold text-slate-900 font-heading">Ready to test the live platform?</h3>
              <p className="text-xs text-slate-600">
                Switch personas instantly from the top navbar or launch your role-specific dashboard.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/generator/dashboard"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>Launch App</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Logo from Image 2 */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 sm:px-8 text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Waste2Carbon Logo" className="h-9 w-9 object-contain" />
            <div>
              <span className="font-bold text-sm tracking-wide text-white">WASTE<span className="text-emerald-400">2CARBON</span> &bull; COMPLIANCE &amp; VALUE CHAIN</span>
              <p className="text-[11px] text-slate-400">Waste-to-Carbon-Value Chain Tracker</p>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            &copy; 2026 Waste2Carbon Platform. 100% Environmental &amp; PCB Compliance Architecture.
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
