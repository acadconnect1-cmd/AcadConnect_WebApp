'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMounted } from '@/hooks/use-mounted'
import {
  Users2,
  Building2,
  BookmarkCheck,
  Compass,
  Eye,
  Globe2,
  ShieldCheck,
  Activity,
  Check,
  ShieldAlert
} from 'lucide-react'



interface Pillar {
  tabTitle: string
  title: string
  description: string
  metric: string
}

const pillars: Pillar[] = [
  {
    tabTitle: 'The Friction',
    title: 'Fragmented Academic Search',
    description: 'Traditional faculty recruitment is opaque, relying on generic job boards and taking months of manual screening by search committees to verify basic scholarly credentials.',
    metric: 'The Problem'
  },
  {
    tabTitle: 'The Trust',
    title: 'Verified Scholarly Profiles',
    description: 'We authenticate academic profiles using verified institutional email credentials and live ORCID registry lookups, securing degrees and publications at the source.',
    metric: 'The Verification'
  },
  {
    tabTitle: 'The Alignment',
    title: 'Smart Research Matching',
    description: 'Our citation affinity and matching algorithms scan candidates publications to align their research niche with a department specific curriculum goals.',
    metric: 'The Innovation'
  },
  {
    tabTitle: 'The Synergy',
    title: 'Merit-First Hiring Ecosystem',
    description: 'Bridging the administrative gap, we enable seamless, transparent communication between qualified scholars and university search committees.',
    metric: 'The Outcome'
  }
]


export function AboutClient() {
  const [activePillar, setActivePillar] = useState(0)
  const mounted = useMounted()

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-20 px-6 md:px-8 bg-linear-to-b from-primary/5 via-background to-background border-b border-border/50">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/0.03,_transparent)]" />
        
        <div className="max-w-7xl mx-auto space-y-16">
          
          {/* Top Section: Large Asymmetrical Page Title */}
          <div className="text-left max-w-4xl border-l-2 border-primary/35 pl-6 sm:pl-8 space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-[10px] font-extrabold uppercase tracking-wider w-fit">
              <Building2 className="h-3.5 w-3.5" />
              <span>About AcadConnect</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.05]">
              Restoring trust in <br />
              <span className="text-gradient">Academic Recruitment</span>.
            </h1>
          </div>

          {/* Bottom Section: Split Grid */}
          <div className="grid lg:grid-cols-12 gap-12 items-start pt-4">
            
            {/* Left Column: Vision Statement & CTAs */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-medium">
                AcadConnect was founded with a clear directive: to eliminate manual credential scanning, verify scholarly identities at the source, and foster seamless synergy between university committees and exceptional researchers.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                By integrating ORCID databases, national graduate registries, and citation indexing, we build a cryptographic trust circle that makes academic merit transparent.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button
                  size="lg"
                  render={<Link href="/jobs" />}
                  className="rounded-xl px-8 font-bold hover:shadow-md hover:scale-[1.01] transition-all duration-300"
                >
                  Explore Vacancies
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  render={<Link href="/contact" />}
                  className="rounded-xl px-8 border-border/80 text-foreground font-semibold hover:bg-muted"
                >
                  Become a Partner
                </Button>
              </div>
            </div>

            {/* Right Column: Live Interactive Credential Verification Ledger */}
            <div className="lg:col-span-5 hidden lg:block">
              <CredentialVerificationLedger />
            </div>

          </div>

        </div>
      </section>

      {/* Platform Values Section */}
      <section className="bg-muted/30 py-16 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border border-border/60 bg-card p-8 hover-premium transition-all duration-300">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary ring-1 ring-primary/15">
                  <BookmarkCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">100% Verify</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Verification Rate</p>
                  <p className="text-xs text-muted-foreground/80 mt-2 font-medium">Every vacancy and academic profile is domain-checked and credential-verified before indexing.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card p-8 hover-premium transition-all duration-300">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary ring-1 ring-primary/15">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Direct Path</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Committee Channels</p>
                  <p className="text-xs text-muted-foreground/80 mt-2 font-medium">Applications bypass third-party recruitment agencies and land straight in department review queues.</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-border/60 bg-card p-8 hover-premium transition-all duration-300">
              <CardContent className="p-0 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary ring-1 ring-primary/15">
                  <Users2 className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-foreground tracking-tight">Built for Scholars</h3>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-1">Academic Context</p>
                  <p className="text-xs text-muted-foreground/80 mt-2 font-medium">Designed specifically around publication history, research citations, and academic tenure track structures.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Our Story & Interactive Timeline Section */}
      <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          {/* Left Column: Interactive Pillars (Practicality) */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2 text-left">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Our Approach</h2>
              <p className="text-sm text-muted-foreground font-medium">Select a pillar below to explore our platform philosophy.</p>
            </div>
            
            {/* Pillars selector */}
            <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 border-b lg:border-b-0 lg:border-l border-border/60 pr-4 lg:pl-0">
              {pillars.map((p, idx) => {
                const isActive = activePillar === idx
                const buttonClassName = `flex items-center gap-4 text-left px-4 py-3 rounded-xl transition-all duration-200 shrink-0 lg:shrink lg:border-l-2 lg:-ml-[2px] ${
                  isActive 
                    ? 'bg-primary/5 lg:border-primary text-primary font-bold shadow-xs' 
                    : 'lg:border-transparent text-muted-foreground hover:bg-muted/40 hover:text-foreground font-semibold'
                }`

                if (!mounted) {
                  return (
                    <div
                      key={idx}
                      className={`${buttonClassName} cursor-pointer select-none`}
                      aria-hidden="true"
                    >
                      <span className="text-xs truncate">{p.tabTitle}</span>
                    </div>
                  )
                }

                return (
                  <button
                    key={idx}
                    onClick={() => setActivePillar(idx)}
                    className={buttonClassName}
                    suppressHydrationWarning={true}
                  >
                    <span className="text-xs truncate">{p.tabTitle}</span>
                  </button>
                )
              })}
            </div>

            {/* Active Pillar Card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-border/70 bg-muted/20 p-5 rounded-2xl shadow-xs text-left">
                  <CardContent className="p-0 space-y-3">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">{pillars[activePillar].metric}</p>
                    <h4 className="text-base font-bold text-foreground">{pillars[activePillar].title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                      {pillars[activePillar].description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>
          
          {/* Right Column: Historical Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative rounded-3xl overflow-hidden border border-border/60 aspect-video md:aspect-5/3 bg-card/65 flex items-center justify-center p-6 shadow-md hover:border-primary/10 transition-colors duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent -z-10" />
              <div className="relative pl-6 border-l-2 border-primary/30 max-w-md text-left space-y-3">
                <p className="text-base md:text-lg italic leading-relaxed text-foreground font-medium">
                  &quot;AcadConnect emerged from a singular observation: the recruitment landscape in higher education was fragmented, opaque, and inefficient. We prioritized academic integrity over generic recruitment metrics.&quot;
                </p>
                <div>
                  <p className="font-bold text-xs text-foreground">Academic Founding Committee</p>
                  <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Jodhpur, Rajasthan, India</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 text-muted-foreground text-sm leading-relaxed font-medium text-left">
              <p>
                Conceived to address systemic recruitment friction, AcadConnect bridges the gap in academic hiring. Our founders, a mix of former university deans and technology pioneers, envisioned a platform that prioritized verified scholarly credentials and direct matches.
              </p>
              <p>
                We spent two years consulting with research institutions and independent colleges to understand their unique administrative guidelines and tenure-track assessment checklists.
              </p>
              <p>
                Today, AcadConnect serves as the digital infrastructure for academic search committees across four continents, ensuring that the right minds find their classrooms and labs smoothly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision (Asymmetric Layout with Global Map SVG) */}
      <section className="py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden border-y border-border/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/0.03,_transparent)]" />
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-12">
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-semibold">
                <Compass className="h-3.5 w-3.5" /> Our Mission
              </div>
              <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-100">
                To democratize access to elite educational roles, fostering a global community where talent is recognized by merit and institutions thrive through diverse intellectual capital.
              </p>
            </div>
            
            <div className="space-y-3 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-slate-300 text-xs font-semibold">
                <Eye className="h-3.5 w-3.5" /> Our Vision
              </div>
              <p className="text-xl md:text-2xl font-semibold leading-relaxed text-slate-100">
                To become the universal standard for academic professional identity, bridging the gap between historical excellence and future innovation in education technology.
              </p>
            </div>
          </div>
          
          {/* Right Column: Global Connection SVG Map Graphic */}
          <div className="hidden lg:flex relative aspect-square w-full rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xs flex items-center justify-center p-6">
            <svg className="w-full h-full text-slate-400 opacity-60" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* World outline latitude grids */}
              <ellipse cx="100" cy="100" rx="90" ry="60" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
              <ellipse cx="100" cy="100" rx="60" ry="40" stroke="currentColor" strokeWidth="0.5" />
              <line x1="10" y1="100" x2="190" y2="100" stroke="currentColor" strokeWidth="0.5" />
              <line x1="100" y1="10" x2="100" y2="190" stroke="currentColor" strokeWidth="0.5" />

              {/* Major academic hubs */}
              {/* Jodhpur/India */}
              <g className="translate-x-[125px] translate-y-[90px]">
                <circle cx="0" cy="0" r="3" className="fill-white" />
                <circle cx="0" cy="0" r="7" className="stroke-white/30 fill-none animate-pulse" />
                <text x="5" y="-3" className="fill-slate-300 text-[6px] font-bold">Jodhpur Hub</text>
              </g>

              {/* Oxford/London */}
              <g className="translate-x-[95px] translate-y-[60px]">
                <circle cx="0" cy="0" r="3" className="fill-white" />
                <circle cx="0" cy="0" r="7" className="stroke-white/30 fill-none" />
                <text x="5" y="-3" className="fill-slate-300 text-[6px] font-bold">UK Hub</text>
              </g>

              {/* Tokyo */}
              <g className="translate-x-[160px] translate-y-[85px]">
                <circle cx="0" cy="0" r="3" className="fill-white" />
                <text x="-15" y="-3" className="fill-slate-300 text-[6px] font-bold">Tokyo Hub</text>
              </g>

              {/* Sydney */}
              <g className="translate-x-[150px] translate-y-[145px]">
                <circle cx="0" cy="0" r="3" className="fill-white" />
                <text x="5" y="-3" className="fill-slate-300 text-[6px] font-bold">Sydney Hub</text>
              </g>

              {/* Connection curves */}
              <path d="M 50 70 Q 72.5 55 95 60" stroke="white" strokeWidth="0.75" strokeDasharray="2 2" className="text-white/40" />
              <path d="M 95 60 Q 127.5 62.5 160 85" stroke="white" strokeWidth="0.75" />
              <path d="M 160 85 Q 155 115 150 145" stroke="white" strokeWidth="0.5" strokeDasharray="3 3" />
              <path d="M 50 70 Q 100 120 150 145" stroke="white" strokeWidth="0.75" />
            </svg>
            <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[9px] text-slate-300 font-bold uppercase tracking-wider bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
              <Globe2 className="h-3 w-3" /> Global Network Mapping
            </div>
          </div>
        </div>
      </section>


    </div>
  )
}

function CredentialVerificationLedger() {
  const [step, setStep] = useState<0 | 1 | 2 | 3 | 4>(0) // 0: idle, 1: step 1, 2: step 2, 3: step 3, 4: complete
  const [loading, setLoading] = useState(false)

  const runSimulation = () => {
    setLoading(true)
    setStep(1)
    
    setTimeout(() => {
      setStep(2)
      setTimeout(() => {
        setStep(3)
        setTimeout(() => {
          setStep(4)
          setLoading(false)
        }, 1500)
      }, 1500)
    }, 1500)
  }

  const resetSimulation = () => {
    setStep(0)
    setLoading(false)
  }

  return (
    <Card className="border border-border/60 overflow-hidden rounded-3xl relative aspect-square w-full group shadow-xl bg-card/45 backdrop-blur-xs flex flex-col justify-between hover:border-primary/25 transition-all duration-500">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 -z-10" />
      
      <div className="p-6 md:p-8 flex flex-col h-full justify-between select-none">
        {/* Top Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className={`flex h-2.5 w-2.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-primary'}`} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Credential Integrity Ledger
            </span>
          </div>
          <button
            onClick={step === 4 ? resetSimulation : runSimulation}
            disabled={loading}
            className={`text-[10px] font-bold border rounded-full px-3 py-1 transition-all ${
              loading 
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                : step === 4 
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 cursor-pointer hover:bg-emerald-500/20'
                  : 'bg-primary/10 text-primary border-primary/20 cursor-pointer hover:bg-primary/20'
            }`}
          >
            {loading ? 'Verifying...' : step === 4 ? 'Reset Audit' : 'Simulate Audit'}
          </button>
        </div>

        <div className="border-b border-border/50 my-4" />

        {/* Ledger Log Console */}
        <div className="flex-1 flex flex-col justify-center space-y-4">
          
          {/* Step 1: ORCID Auth */}
          <div className={`flex items-start gap-4 transition-all duration-300 ${
            step >= 1 ? 'opacity-100' : 'opacity-40'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 ${
              step > 1 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : step === 1 
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/25 animate-pulse' 
                  : 'bg-muted/40 text-muted-foreground border-border/60'
            }`}>
              {step > 1 ? <Check className="w-4 h-4" /> : '1'}
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-extrabold text-foreground">ORCID Identity Integration</h4>
              <p className="text-[10px] text-muted-foreground/90 leading-normal font-semibold">
                {step === 1 
                  ? 'Syncing active registry nodes and validating researcher handshake...' 
                  : step > 1 
                    ? 'Handshake resolved. Authenticated ORCID node connection established.' 
                    : 'Awaiting pipeline initiation.'}
              </p>
            </div>
          </div>

          {/* Step 2: Degree Lookup */}
          <div className={`flex items-start gap-4 transition-all duration-300 ${
            step >= 2 ? 'opacity-100' : 'opacity-40'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 ${
              step > 2 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : step === 2 
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/25 animate-pulse' 
                  : 'bg-muted/40 text-muted-foreground border-border/60'
            }`}>
              {step > 2 ? <Check className="w-4 h-4" /> : '2'}
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-extrabold text-foreground">Degree Registry Authentication</h4>
              <p className="text-[10px] text-muted-foreground/90 leading-normal font-semibold">
                {step === 2 
                  ? 'Querying national graduate registries and matching metadata...' 
                  : step > 2 
                    ? 'Degree matching metadata verified: Ph.D. in AI confirmed.' 
                    : 'Awaiting step 1 resolution.'}
              </p>
            </div>
          </div>

          {/* Step 3: Citation Audit */}
          <div className={`flex items-start gap-4 transition-all duration-300 ${
            step >= 3 ? 'opacity-100' : 'opacity-40'
          }`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-bold shrink-0 ${
              step > 3 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : step === 3 
                  ? 'bg-amber-500/10 text-amber-600 border-amber-500/25 animate-pulse' 
                  : 'bg-muted/40 text-muted-foreground border-border/60'
            }`}>
              {step > 3 ? <Check className="w-4 h-4" /> : '3'}
            </div>
            <div className="text-left space-y-0.5">
              <h4 className="text-xs font-extrabold text-foreground">Research Citation Audit</h4>
              <p className="text-[10px] text-muted-foreground/90 leading-normal font-semibold">
                {step === 3 
                  ? 'Scanning publication repositories & indexing citation counts...' 
                  : step > 3 
                    ? 'Citation index parsed successfully. 18 indexed publications verified.' 
                    : 'Awaiting step 2 resolution.'}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom Status Panel */}
        <div className="border-t border-border/50 pt-4 mt-4 text-left">
          {step === 4 ? (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-3 text-emerald-600 transition-all duration-500">
              <Activity className="w-5 h-5 animate-pulse shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold">100% Authenticated Profile</p>
                <p className="text-[9px] text-emerald-700/80 font-bold uppercase tracking-widest mt-0.5">Verified Merit Record</p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-amber-600 transition-all duration-500">
              <Activity className="w-5 h-5 animate-spin shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold">Auditing credentials...</p>
                <p className="text-[9px] text-amber-700/80 font-bold uppercase tracking-widest mt-0.5">Processing Stage {step} of 3</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-muted/40 border border-border/60 rounded-2xl p-3 text-muted-foreground transition-all duration-300">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold">Registry Idle</p>
                <p className="text-[9px] text-muted-foreground/80 font-bold uppercase tracking-widest mt-0.5">Click Simulate Audit to run check</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </Card>
  )
}
