'use client'

import { useState, useEffect } from 'react'
import { 
  ShieldCheck, 
  Printer, 
  Search, 
  CheckCircle2, 
  Lock, 
  Globe, 
  FileText, 
  Mail, 
  ArrowRight,
  BookOpen
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function PrivacyClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('welcome')

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const headerOffset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
      setActiveSection(id)
    }
  }

  // Scrollspy logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120
      const sections = ['welcome', 'collection', 'verification', 'usage', 'security', 'transfers', 'rights', 'contact']
      
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print()
    }
  }

  const sections: Section[] = [
    {
      id: 'welcome',
      title: '1. Scope & Welcome',
      icon: <BookOpen className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            Welcome to AcadConnect (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We operate the global academic recruitment and matching platform designed to connect qualified faculty candidates with premier higher education institutions. We are committed to protecting your privacy and securing your personal and professional data.
          </p>
          <p>
            This Privacy Policy applies to all visitors, registered candidates (Faculty/Scholars), and registered recruiters (Institution Members) who access or use our platform, APIs, tools, or mobile-optimized web portals. It governs data processing activities conducted by AcadConnect, headquartered in <strong>Jodhpur, Rajasthan, India</strong>.
          </p>
          <div className="p-4.5 rounded-2xl border border-primary/15 bg-primary/5 dark:bg-primary/10 flex gap-3.5 items-start">
            <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Core Privacy Guarantee:</strong> AcadConnect operates on a strict matching-first policy. We do not sell, trade, or distribute your research achievements, CV uploads, or credentials to third-party advertisers or data brokers under any circumstances.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'collection',
      title: '2. Information We Collect',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            To provide a functional matching ecosystem, we collect several categories of personal and professional information directly from you or through verified academic registries:
          </p>
          <ul className="space-y-3 pl-1">
            <li className="flex gap-3 items-start text-sm">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Identity & Account Details:</strong> Legal name, verified professional email addresses, telephone contacts, academic ranks, and password hashes created during enrollment.
              </div>
            </li>
            <li className="flex gap-3 items-start text-sm">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Academic & Professional Profiles:</strong> Current and former institutional affiliations, faculty departments, ORCID IDs, curriculum vitae (CVs), lists of published research articles, citation records, and teaching statements.
              </div>
            </li>
            <li className="flex gap-3 items-start text-sm">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Institution Recruitment Records:</strong> Hiring manager contact information, official institution name, regional accreditation records, verification documents, subscription data, and job descriptions posted on the service.
              </div>
            </li>
            <li className="flex gap-3 items-start text-sm">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Technical Metadata:</strong> IP addresses, browser types, operating systems, session references, navigation paths, search queries, and interaction timestamps.
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'verification',
      title: '3. Credential Verifications',
      icon: <Lock className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            AcadConnect is built on high-trust credentials. We perform verification procedures to prevent administrative fraud and ensure candidate quality:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
            <div className="p-4 rounded-xl border border-border/80 bg-muted/40">
              <h4 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">1</span>
                ORCID Registry Linkage
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We pull verified publication data, research history, and contributor roles from ORCID via public API queries to establish scholarly authenticity.
              </p>
            </div>
            <div className="p-4 rounded-xl border border-border/80 bg-muted/40">
              <h4 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">2</span>
                Institutional Email Handshake
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scholars link their official institutional email domains (e.g., .edu, .ac.in). We check the validity of these domains to confirm current employment status.
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            We store only tokenized confirmation records returned from these verifications rather than capturing raw access passwords.
          </p>
        </div>
      )
    },
    {
      id: 'usage',
      title: '4. How We Use Information',
      icon: <CheckCircle2 className="h-4.5 w-4.5" />,
      content: (
        <div className="space-y-4">
          <p>
            We process your information strictly for the following purposes based on either consent or the necessity of contract performance:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm pl-1">
            <li>
              <strong>Matchmaking Services:</strong> Matching candidate research specialties, citation indices, and geographical preferences with open positions posted by institutions.
            </li>
            <li>
              <strong>Recruiter Review:</strong> Forwarding candidate application files, CVs, and statements to hiring managers at institutions where the candidate has explicitly applied.
            </li>
            <li>
              <strong>System Security:</strong> Auditing authentication logs, validating IP locations to detect unauthorized access, and implementing fraud-detection barriers.
            </li>
            <li>
              <strong>Product Performance:</strong> Debugging service components, managing load balance metrics, and evaluating search algorithm relevance.
            </li>
          </ol>
        </div>
      )
    },
    {
      id: 'security',
      title: '5. Data Security & Storage',
      icon: <Lock className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            We implement security measures designed to protect your data from accidental loss or unauthorized disclosure:
          </p>
          <ul className="space-y-2.5 text-sm pl-1 list-disc list-inside">
            <li>
              <strong>Encryption:</strong> All network traffic is encrypted in transit using TLS 1.3, and critical database columns are encrypted at rest using AES-256.
            </li>
            <li>
              <strong>Hosting infrastructure:</strong> Our database and auth storage is managed through Supabase and secure PostgreSQL architectures, built to withstand modern security vectors.
            </li>
            <li>
              <strong>Retention Policies:</strong> Personal data is retained only as long as necessary to fulfill matchmaking functions. If you choose to terminate your profile, your credentials, uploaded CV files, and historical job applications are marked for deletion from our active systems within 30 days.
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'transfers',
      title: '6. International Transfers',
      icon: <Globe className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            AcadConnect operates globally. Information collected from candidates and institutions worldwide is routed, stored, and processed in secure data centers, and managed from our primary operations hub in <strong>Jodhpur, Rajasthan, India</strong>.
          </p>
          <p>
            If you access our services from outside India, including the European Union (EU) or North America, please note that we transfer and process data in compliance with standard contractual clauses (SCCs) and adequate security frameworks to ensure equal data protection safeguards across borders.
          </p>
        </div>
      )
    },
    {
      id: 'rights',
      title: '7. User Rights (GDPR/DPDP)',
      icon: <ShieldCheck className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            Regardless of your geographic location, we respect your rights under the GDPR, the CCPA, and the India Digital Personal Data Protection Act, 2023 (DPDP Act):
          </p>
          <div className="space-y-3 border-l-2 border-primary/50 pl-4 py-1 text-sm">
            <p>
              <strong>Right to Access & Portability:</strong> You may request a complete JSON extract of your profile details, publication indexes, and active job applications at any time.
            </p>
            <p>
              <strong>Right to Correction:</strong> You have direct access via settings to modify, correct, or complete any inaccurate profile or institution description.
            </p>
            <p>
              <strong>Right to Erasure (&quot;Right to be Forgotten&quot;):</strong> You can initiate profile deletion, which clears personal profiles and removes CV assets from active storage.
            </p>
            <p>
              <strong>Right to object:</strong> You can opt out of automated credential reviews or search listing suggestions.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'contact',
      title: '8. Contact & Governing Authority',
      icon: <Mail className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            If you have questions about this policy, wish to exercise your data protection rights, or need to contact our Data Protection Officer (DPO), please contact us at:
          </p>
          <div className="p-5 rounded-2xl border border-border/80 bg-muted/20 space-y-2.5 text-sm">
            <p><strong>AcadConnect Privacy Support</strong></p>
            <p className="text-muted-foreground">Jodhpur, Rajasthan, 342001, India</p>
            <p className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <span>support@acadconnect.org</span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Any dispute arising out of this Privacy Policy shall be governed by the laws of India and subject to the exclusive jurisdiction of the courts located in Jodhpur, Rajasthan, India.
          </p>
        </div>
      )
    }
  ]

  // Filter sections by search query
  const filteredSections = sections.filter(section => 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="relative min-h-screen bg-background">
      
      {/* Visual background details */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute left-1/3 top-[250px] -z-10 h-[300px] w-[300px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        
        {/* Header Hero Section */}
        <div className="mb-12 border-b border-border/60 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Global Compliance Standard
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Last updated: June 17, 2026. This policy outlines how AcadConnect collects, stores, and protects candidate publications, identity details, and institutional datasets.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl font-semibold gap-2 border-border/80 hover:bg-muted"
            >
              <Printer className="h-4 w-4 text-muted-foreground" />
              Print / PDF
            </Button>
          </div>
        </div>

        {/* User-Friendly Summary Card */}
        <Card className="mb-12 border-primary/10 bg-card/60 backdrop-blur-md overflow-hidden rounded-2xl shadow-sm shadow-primary/3">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="font-semibold text-lg text-foreground">Quick Summary for Scholars & Search Committees</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We collect your professional information primarily to verify your identity, ORCID publication indices, and educational credentials so we can accurately match you with university positions. You retain full control over your profile data, and we do not sell or monetize personal profiles. Our operations are governed by Indian courts, specifically in Jodhpur, Rajasthan.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Asymmetrical Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: TOC and Search Sidebar (Desktop-only sticky) */}
          <aside className="lg:col-span-4 sticky top-28 space-y-6 hidden lg:block">
            
            {/* Search Input bar */}
            <div className="relative group">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search policy sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm text-foreground bg-muted/40 border border-border/80 rounded-xl pl-10 pr-4 py-2.5 focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-hidden transition-all duration-300 placeholder:text-muted-foreground/60"
              />
            </div>

            {/* Sticky Table of Contents navigation list */}
            <nav className="rounded-2xl border border-border/60 bg-card/50 backdrop-blur-md p-4 space-y-1.5 shadow-xs">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 mb-2.5">Table of Contents</p>
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all duration-200 cursor-pointer ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="shrink-0">{section.icon}</span>
                  <span className="truncate">{section.title}</span>
                  {activeSection === section.id && (
                    <ArrowRight className="h-3.5 w-3.5 ml-auto text-primary" />
                  )}
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Column: Complete Legal text */}
          <div className="lg:col-span-8 space-y-12">
            {filteredSections.length > 0 ? (
              filteredSections.map((section) => (
                <section
                  key={section.id}
                  id={section.id}
                  className="scroll-mt-28 space-y-4 border-b border-border/50 pb-8 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {section.icon}
                    </div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <div className="text-sm text-muted-foreground leading-relaxed pl-11 space-y-4">
                    {section.content}
                  </div>
                </section>
              ))
            ) : (
              <div className="text-center py-12 rounded-2xl border border-dashed border-border p-6 space-y-3">
                <Search className="h-8 w-8 mx-auto text-muted-foreground" />
                <h3 className="font-semibold text-base text-foreground">No matches found</h3>
                <p className="text-xs text-muted-foreground">Try refining your search term to view specific sections.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  )
}
