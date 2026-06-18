'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, GraduationCap, Building2, BookOpenCheck, Globe2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ScholarNode {
  id: string
  initials: string
  name: string
  university: string
  match: string
  field: string
  x: number
  y: number
  targetX: number
  targetY: number
}

const scholars: ScholarNode[] = [
  {
    id: 'sj',
    initials: 'SJ',
    name: 'Dr. Sarah Jenkins',
    university: 'SCIENCE DEPT',
    match: '98%',
    field: 'Artificial Intelligence',
    x: 20,
    y: 25,
    targetX: 80,
    targetY: 30
  },
  {
    id: 'er',
    initials: 'ER',
    name: 'Dr. Elena Rodriguez',
    university: 'RESEARCH HUB',
    match: '97%',
    field: 'Higher Ed Administration',
    x: 80,
    y: 20,
    targetX: 50,
    targetY: 10
  },
  {
    id: 'mv',
    initials: 'MV',
    name: 'Marcus Vance',
    university: 'BUSINESS SCHOOL',
    match: '95%',
    field: 'ATS Integration',
    x: 25,
    y: 75,
    targetX: 50,
    targetY: 90
  },
  {
    id: 'al',
    initials: 'AL',
    name: 'Dr. A. Lundqvist',
    university: 'TECH LAB',
    match: '94%',
    field: 'Quantum Computing',
    x: 75,
    y: 70,
    targetX: 20,
    targetY: 55
  }
]

export function HomeHeroClient() {
  const [hoveredScholar, setHoveredScholar] = useState<ScholarNode | null>(null)

  return (
    <section className="relative overflow-hidden pt-28 pb-32 px-6 md:px-8 bg-linear-to-b from-primary/5 via-background to-background">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--color-primary)/0.03,_transparent)]" />
      
      <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-16 items-center">
        
        {/* Left Column: Headline and CTAs */}
        <div className="lg:col-span-7 space-y-8 text-left">
          
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/25 bg-primary/5 text-primary text-[10px] font-extrabold uppercase tracking-wider w-fit">
              <GraduationCap className="h-3.5 w-3.5" />
              <span>Verified Scholar Network</span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] text-left">
              Connecting Elite <span className="text-gradient">Faculty</span> with Global Research Institutions.
            </h1>
            
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed font-medium">
              A secure, credential-authenticated matching network linking tenure-track scholars, senior professors, and academic leaders with verified university positions.
            </p>
          </div>

          {/* Quick Search Console */}
          <div className="max-w-xl">
            <form
              action="/jobs"
              method="GET"
              className="w-full bg-card/70 border border-border/80 p-2.5 rounded-2xl shadow-md flex flex-col sm:flex-row items-center gap-2 hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-center flex-1 w-full px-3 py-1 sm:py-0">
                <Search className="h-4 w-4 text-muted-foreground mr-2.5 shrink-0" />
                <input
                  name="q"
                  type="text"
                  placeholder="Fields (AI, Biology, Physics...)"
                  className="w-full bg-transparent border-none outline-hidden text-xs placeholder:text-muted-foreground/80 focus:ring-0 text-foreground"
                  required
                />
              </div>
              
              <Button
                type="submit"
                size="sm"
                className="w-full sm:w-auto h-9 px-5 rounded-xl font-bold transition-all duration-300 hover:scale-[1.01] shrink-0 cursor-pointer text-xs"
              >
                Search
              </Button>
            </form>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-6 pt-2">
            <Button
              size="lg"
              render={<Link href="/auth/register" />}
              className="rounded-xl px-8 font-bold hover:shadow-md hover:scale-[1.01] transition-all duration-300 cursor-pointer"
            >
              Join as Scholar
            </Button>
            <Link 
              href="/auth/register?role=institution_member" 
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-foreground hover:text-primary transition-colors group"
            >
              Register Institution <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

        </div>

        {/* Right Column: Custom Interactive Matching Network Mesh (Frameless) */}
        <div className="lg:col-span-5 hidden lg:block relative h-[450px]">
          
          {/* Central Hub Node */}
          <div className="absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] z-10">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-24 h-24 rounded-full bg-primary/10 border border-primary/20 animate-pulse" />
              <div className="absolute w-16 h-16 rounded-full bg-primary/15 border border-primary/25" />
              <div className="w-12 h-12 rounded-full bg-card border-2 border-primary shadow-lg flex items-center justify-center text-primary">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Dotted Connection Grid Canvas */}
          <svg className="absolute inset-0 w-full h-full text-primary/10 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Draw active hovered matching paths */}
            {hoveredScholar && (
              <>
                <motion.line
                  x1={`${hoveredScholar.x}%`}
                  y1={`${hoveredScholar.y}%`}
                  x2="50%"
                  y2="50%"
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -20 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
                <motion.line
                  x1="50%"
                  y1="50%"
                  x2={`${hoveredScholar.targetX}%`}
                  y2={`${hoveredScholar.targetY}%`}
                  stroke="var(--color-primary)"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                  initial={{ strokeDashoffset: 0 }}
                  animate={{ strokeDashoffset: -20 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              </>
            )}
          </svg>

          {/* Floating University Nodes */}
          {/* North Node: RESEARCH HUB */}
          <div className="absolute top-[10%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
            <div className="bg-card border border-border/80 px-3.5 py-2 rounded-2xl shadow-xs flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-extrabold tracking-wider text-foreground">RESEARCH HUB</span>
            </div>
          </div>

          {/* East Node: SCIENCE DEPT */}
          <div className="absolute top-[30%] left-[80%] -translate-x-[50%] -translate-y-[50%]">
            <div className="bg-card border border-border/80 px-3.5 py-2 rounded-2xl shadow-xs flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-extrabold tracking-wider text-foreground">SCIENCE DEPT</span>
            </div>
          </div>

          {/* South Node: BUSINESS SCHOOL */}
          <div className="absolute top-[90%] left-[50%] -translate-x-[50%] -translate-y-[50%]">
            <div className="bg-card border border-border/80 px-3.5 py-2 rounded-2xl shadow-xs flex items-center gap-2">
              <BookOpenCheck className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-extrabold tracking-wider text-foreground">BUSINESS SCHOOL</span>
            </div>
          </div>

          {/* West Node: TECH LAB */}
          <div className="absolute top-[55%] left-[20%] -translate-x-[50%] -translate-y-[50%]">
            <div className="bg-card border border-border/80 px-3.5 py-2 rounded-2xl shadow-xs flex items-center gap-2">
              <Globe2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-extrabold tracking-wider text-foreground">TECH LAB</span>
            </div>
          </div>

          {/* Floating Scholar Nodes */}
          {scholars.map(scholar => {
            const isHovered = hoveredScholar?.id === scholar.id;
            return (
              <motion.div
                key={scholar.id}
                className="absolute z-10 cursor-pointer"
                style={{ left: `${scholar.x}%`, top: `${scholar.y}%` }}
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: scholar.id === 'sj' ? 4 : scholar.id === 'er' ? 5 : scholar.id === 'mv' ? 4.5 : 6,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
                onMouseEnter={() => setHoveredScholar(scholar)}
                onMouseLeave={() => setHoveredScholar(null)}
              >
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full bg-card border-2 flex items-center justify-center font-bold text-xs shadow-md transition-colors duration-300 ${
                    isHovered 
                      ? 'border-primary text-primary bg-primary/5' 
                      : 'border-border/80 text-muted-foreground'
                  }`}>
                    {scholar.initials}
                  </div>
                  {/* Micro pulsing match indicator */}
                  <span className="absolute right-0.5 bottom-0.5 flex h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse" />

                  {/* Clean, frameless floating tooltip bubble directly over the hovered node */}
                  <AnimatePresence>
                    {isHovered && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3.5 w-52 p-3 bg-card/95 backdrop-blur-md border border-border/80 rounded-2xl shadow-xl z-20 pointer-events-none text-left"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-[10px] font-bold text-foreground truncate">{scholar.name}</span>
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shrink-0">
                              <CheckCircle2 className="w-2.5 h-2.5" /> {scholar.match}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground font-semibold truncate leading-none">
                            {scholar.field}
                          </p>
                          <p className="text-[8px] text-primary/80 font-bold uppercase tracking-wider mt-0.5 truncate leading-none">
                            Matched: {scholar.university}
                          </p>
                        </div>
                        
                        {/* Tooltip triangle indicator */}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2.5 h-2.5 bg-card border-r border-b border-border/80 rotate-45" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}



        </div>

      </div>
    </section>
  )
}
