'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import {
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  HelpCircle
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface FAQItem {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: 'How do institutional subscriptions work?',
    answer: 'AcadConnect offers tiered annual subscriptions for institutions based on the volume of expected job postings. All plans include automated candidate screening tools, priority matching alerts, and custom employer branding pages.',
  },
  {
    question: 'Can I post a single job without a subscription?',
    answer: 'Yes, we offer a "Pay-as-you-go" model for single job postings. This is ideal for smaller departments or one-off administrative needs. Single postings remain active for 30 days and have access to our basic application screening portal.',
  },
  {
    question: 'How does candidate profile verification work?',
    answer: 'Educators verify their credentials using institutional email addresses (.edu, .ac.uk, etc.) or by linking their verified ORCID record. This ensures that only credentialed academics are active in our candidate pool.',
  },
  {
    question: 'What integrations do you support?',
    answer: 'We support single sign-on (SSO) for institutional portals, as well as CSV integrations with common applicant tracking systems (ATS). Premium and Enterprise plans also support direct API integrations.',
  },
]

export function ContactClient() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <div className="flex flex-col w-full min-h-screen relative overflow-hidden">
      {/* Blurred background glows */}
      <div className="absolute top-1/4 left-[-10%] -z-10 w-[400px] h-[400px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-[-10%] -z-10 w-[500px] h-[500px] rounded-full bg-indigo-500/3 blur-[150px] pointer-events-none" />

      {/* Hero Header */}
      <section className="relative pt-28 pb-16 px-6 md:px-8 border-b border-border/40 bg-linear-to-b from-primary/5 via-background to-background">
        <div className="max-w-7xl mx-auto text-center flex flex-col items-center">
          <div className="max-w-3xl space-y-5">
            <div className="inline-flex items-center gap-3">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                Communications & Partnerships
              </span>
            </div>
            
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-foreground leading-tight">
              Connect with our <span className="text-gradient">Academic Success Team</span>
            </h1>
            
            <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed font-medium">
              Bridging the gap between global institutions and scholars. Reach out directly via our official communication nodes below.
            </p>
          </div>
        </div>
      </section>

      {/* Asymmetric Columns Layout Grid */}
      <section className="py-20 px-6 md:px-8 max-w-7xl mx-auto w-full flex-1">
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Contact info & Abstract SVG (Grid 5/12) */}
          <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
            <Card className="border border-border/60 bg-card/65 backdrop-blur-md p-8 rounded-3xl shadow-xl shadow-foreground/2 overflow-hidden relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              
              {/* Premium Floating/Rotating Geometric Crystal SVG */}
              <div className="flex justify-center mb-8">
                <motion.div
                  className="w-44 h-44 flex items-center justify-center text-primary/75"
                  animate={{
                    rotate: 360,
                    y: [0, -6, 0],
                  }}
                  transition={{
                    rotate: { duration: 30, repeat: Infinity, ease: "linear" },
                    y: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="crystalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="var(--color-primary, #3b82f6)" stopOpacity="0.85" />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.15" />
                      </linearGradient>
                    </defs>
                    <polygon points="50,5 95,35 95,65 50,95 5,65 5,35" stroke="url(#crystalGrad)" strokeWidth="0.8" />
                    <polygon points="50,20 80,40 80,60 50,80 20,60 20,40" stroke="url(#crystalGrad)" strokeWidth="0.5" strokeDasharray="3 3" />
                    <line x1="50" y1="5" x2="50" y2="95" stroke="url(#crystalGrad)" strokeWidth="0.5" />
                    <line x1="5" y1="35" x2="95" y2="65" stroke="url(#crystalGrad)" strokeWidth="0.5" />
                    <line x1="5" y1="65" x2="95" y2="35" stroke="url(#crystalGrad)" strokeWidth="0.5" />
                    <circle cx="50" cy="50" r="16" stroke="url(#crystalGrad)" strokeWidth="0.8" />
                    <circle cx="50" cy="5" r="2" fill="var(--color-primary, #3b82f6)" />
                    <circle cx="95" cy="35" r="2" fill="var(--color-primary)" />
                    <circle cx="95" cy="65" r="2" fill="var(--color-primary)" />
                    <circle cx="50" cy="95" r="2" fill="var(--color-primary)" />
                    <circle cx="5" cy="65" r="2" fill="var(--color-primary)" />
                    <circle cx="5" cy="35" r="2" fill="var(--color-primary)" />
                  </svg>
                </motion.div>
              </div>

              {/* Direct Info list */}
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-foreground tracking-tight">AcadConnect Gateway</h3>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">HQ Operations Channels</p>
                </div>
                
                <div className="space-y-4 pt-4 border-t border-border/40">
                  {/* Native Email trigger */}
                  <a
                    href="mailto:support@acadconnect.com?subject=AcadConnect%20Inquiry"
                    className="flex items-center gap-4 p-3.5 rounded-2xl border border-border/50 hover:border-primary/30 bg-muted/10 hover:bg-muted/20 transition-all duration-300 group/link"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 ring-1 ring-primary/15 transition-all duration-300 group-hover/link:scale-105">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 group-hover/link:text-primary transition-colors">support@acadconnect.com</p>
                    </div>
                  </a>

                  {/* Native Voice trigger */}
                  <a
                    href="tel:+18005550199"
                    className="flex items-center gap-4 p-3.5 rounded-2xl border border-border/50 hover:border-primary/30 bg-muted/10 hover:bg-muted/20 transition-all duration-300 group/link"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 ring-1 ring-primary/15 transition-all duration-300 group-hover/link:scale-105">
                      <Phone className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 group-hover/link:text-primary transition-colors">+1 (800) 555-0199</p>
                    </div>
                  </a>

                  {/* Static Headquarters marker */}
                  <div className="flex items-start gap-4 p-3.5 rounded-2xl border border-border/50 bg-muted/10">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 ring-1 ring-primary/15 mt-0.5">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Headquarters</p>
                      <p className="text-sm font-bold text-foreground mt-0.5 leading-relaxed">
                        HQ Plaza, Shastri Nagar<br />
                        Jodhpur, Rajasthan, India
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Inline SVG HQ Map Card */}
            <Card className="border border-border/60 overflow-hidden rounded-3xl relative h-[140px] w-full shadow-lg shadow-foreground/2 bg-card/45 backdrop-blur-xs flex flex-col justify-between hover:border-primary/20 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 -z-10" />
              
              {/* Premium Globe Network SVG */}
              <div className="absolute inset-0 flex items-center justify-center p-4 opacity-55">
                <svg className="w-full h-full text-primary/15" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="0.5" />
                  <circle cx="100" cy="100" r="40" stroke="currentColor" strokeWidth="0.5" strokeDasharray="2 2" />
                  <line x1="100" y1="20" x2="100" y2="180" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="20" y1="100" x2="180" y2="100" stroke="currentColor" strokeWidth="0.5" />
                  <line x1="43.4" y1="43.4" x2="156.6" y2="156.6" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
                  <circle cx="60" cy="70" r="3" className="fill-muted-foreground/30" />
                  <circle cx="140" cy="80" r="3" className="fill-muted-foreground/30" />
                  <circle cx="80" cy="140" r="4" className="fill-muted-foreground/30" />
                  <path d="M 60 70 Q 100 50 140 80" stroke="currentColor" strokeWidth="0.75" strokeDasharray="2 2" />
                  <path d="M 60 70 Q 70 110 80 140" stroke="currentColor" strokeWidth="0.75" />
                  <g>
                    <circle cx="100" cy="80" r="9" className="stroke-primary/40 fill-primary/5 animate-pulse" strokeWidth="0.5" />
                    <circle cx="100" cy="80" r="2" className="fill-primary" />
                  </g>
                </svg>
              </div>

              <div className="z-10 p-4 flex flex-col justify-center items-center h-full text-center space-y-1">
                <MapPin className="h-4 w-4 text-primary mb-1 animate-bounce" />
                <p className="font-bold text-foreground text-sm">Jodhpur Operations Center</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Jodhpur, Rajasthan, India</p>
              </div>
            </Card>
          </div>

          {/* Right Column: FAQ Board (Grid 7/12) */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-3 border-b border-border/50 pb-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold">
                <HelpCircle className="h-3.5 w-3.5" /> FAQ
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                Frequently Asked Questions
              </h2>
              <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                Quick answers to common questions regarding subscriptions, verification, and credentials.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx
                return (
                  <div
                    key={idx}
                    className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-xs hover:border-primary/20 hover:shadow-xs transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 py-5 flex items-center justify-between text-left group cursor-pointer"
                    >
                      <span className="font-bold text-foreground text-sm md:text-base group-hover:text-primary transition-colors">
                        {faq.question}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 text-primary' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="border-t border-border/60"
                        >
                          <p className="p-6 text-sm text-muted-foreground leading-relaxed bg-muted/15 font-medium">
                            {faq.answer}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}
