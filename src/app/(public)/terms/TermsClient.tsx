'use client'

import { useState, useEffect } from 'react'
import { 
  Scale, 
  Printer, 
  Search, 
  CheckCircle2, 
  ShieldAlert,
  Globe, 
  FileText, 
  ArrowRight,
  BookOpen,
  DollarSign
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface Section {
  id: string
  title: string
  icon: React.ReactNode
  content: React.ReactNode
}

export function TermsClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSection, setActiveSection] = useState('acceptance')

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
      const sections = ['acceptance', 'description', 'accounts', 'conduct', 'fees', 'ip', 'liability', 'governing']
      
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
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      icon: <BookOpen className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            Welcome to AcadConnect. These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement made between you, whether personally or on behalf of an entity (&quot;you,&quot; &quot;user,&quot; &quot;candidate,&quot; or &quot;institution&quot;) and AcadConnect (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), concerning your access to and use of the AcadConnect website, applications, and related services.
          </p>
          <p>
            By accessing or using our platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree with all of these Terms, you are prohibited from using the platform and must discontinue use immediately.
          </p>
          <div className="p-4.5 rounded-2xl border border-primary/15 bg-primary/5 dark:bg-primary/10 flex gap-3.5 items-start">
            <Scale className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>Please Read Carefully:</strong> These Terms contain clauses governing our verification requirements, subscription policies, disclaimers, limits of liability, and dispute resolution guidelines, which are subject to the exclusive jurisdiction of the courts of <strong>Jodhpur, Rajasthan, India</strong>.
            </p>
          </div>
        </div>
      )
    },
    {
      id: 'description',
      title: '2. Service Description',
      icon: <FileText className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            AcadConnect is a premium matchmaking and recruitment platform built exclusively for higher education. We facilitate connections between two distinct parties:
          </p>
          <ul className="space-y-2.5 text-sm pl-1">
            <li className="flex gap-3 items-start">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Faculty Candidates (Scholars):</strong> Users looking for tenure-track, research, or instructional roles, who can build profiles, link publications, and submit application packages.
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <CheckCircle2 className="h-4.5 w-4.5 text-primary shrink-0 mt-0.5" />
              <div>
                <strong>Institutions (Universities & Colleges):</strong> Accredited entities looking to post academic vacancies, evaluate candidates, and coordinate with search committees.
              </div>
            </li>
          </ul>
          <p>
            We act as a facilitating broker. We do not participate in employment negotiations, verify the internal policies of search committees, or guarantee that vacancies will be filled or that candidates will secure employment.
          </p>
        </div>
      )
    },
    {
      id: 'accounts',
      title: '3. Accounts & Verification',
      icon: <CheckCircle2 className="h-4.5 w-4.5" />,
      content: (
        <div className="space-y-4">
          <p>
            To maintain a high-trust network, users must comply with our strict verification guidelines:
          </p>
          <ul className="space-y-3 pl-1 text-sm">
            <li className="flex gap-3 items-start">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">A</span>
              <div>
                <strong>Identity Accuracy:</strong> You agree to provide true, current, and complete profile info. Representing yourself under a pseudonym, misrepresenting academic rankings, or falsifying publication metrics is grounds for immediate termination.
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">B</span>
              <div>
                <strong>ORCID Verification:</strong> Candidates connect their profile with their ORCID iD to confirm academic authorship. You authorize us to pull and display publication information retrieved via ORCID.
              </div>
            </li>
            <li className="flex gap-3 items-start">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold shrink-0">C</span>
              <div>
                <strong>Institution Verification:</strong> Recruiters must verify their association with an accredited institution. Vacancy listings will remain invisible to candidates until the institution account has been audited and set to <em>approved</em> verification status by our administrators.
              </div>
            </li>
          </ul>
        </div>
      )
    },
    {
      id: 'conduct',
      title: '4. Acceptable Conduct',
      icon: <ShieldAlert className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            You agree to use our platform solely for professional academic recruitment purposes. Prohibited activities include, but are not limited to:
          </p>
          <ul className="space-y-2.5 pl-1 text-sm list-disc list-inside">
            <li>Submitting false, plagiarized, or misleading academic publications, degrees, or CV details.</li>
            <li>Posting generic, non-academic, or duplicate job vacancies.</li>
            <li>Using automated scripts, scrapers, or indexers to harvest CV lists, candidate details, or contact data.</li>
            <li>Circumventing platform barriers, metadata verification steps, or security parameters.</li>
            <li>Sending unsolicited promotional messages (spam) to search committees or candidates.</li>
          </ul>
          <p className="text-xs text-muted-foreground">
            Violations of this section can result in civil or criminal liabilities, immediate suspension of account credentials, and blacklisting of associated email domains.
          </p>
        </div>
      )
    },
    {
      id: 'fees',
      title: '5. Fees, Billing & Subscriptions',
      icon: <DollarSign className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            Our current platform features and pricing configurations are set as follows:
          </p>
          <div className="p-4 rounded-xl border border-border/80 bg-muted/30 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">Free Tier & Premium Features</h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Candidates can access the platform, search vacancies, and submit applications free of charge. Institutions are currently granted access to a Free Tier allowing basic vacancy listings. Premium upgrade options, including advanced screening filters and recruitment pipeline integrations, will be introduced under structured subscription plans in the future.
            </p>
          </div>
          <p className="text-sm">
            All paid transactions, when activated, will be governed by explicit checkout terms detailing subscription cycles, renewal parameters, and refund boundaries.
          </p>
        </div>
      )
    },
    {
      id: 'ip',
      title: '6. Intellectual Property Rights',
      icon: <Globe className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            We respect the ownership of academic material:
          </p>
          <p>
            <strong>Your Content:</strong> You retain all ownership rights in the files, CV summaries, statements, and publications you upload or link to AcadConnect. By posting materials, you grant us a non-exclusive, worldwide, royalty-free license to host, parse, index, and display your documents to facilitate matching and recruiter evaluations.
          </p>
          <p>
            <strong>Our Proprietary Assets:</strong> All platform elements, including software code, databases, matching algorithms, graphic interfaces, logos, and layouts are the exclusive property of AcadConnect and are protected by Indian and international copyright and trademark laws.
          </p>
        </div>
      )
    },
    {
      id: 'liability',
      title: '7. Disclaimers & Liability limits',
      icon: <ShieldAlert className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            THE PLATFORM AND SERVICES ARE PROVIDED ON AN &quot;AS-IS&quot; AND &quot;AS-AVAILABLE&quot; BASIS. WE DISCLAIM ALL WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>
          <p>
            WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT ANY PARTICULAR VACANCY LISTING WILL REMAIN ACTIVE.
          </p>
          <p>
            IN NO EVENT SHALL ACADCONNECT, ITS CO-FOUNDERS, OR REPRESENTATIVES BE LIABLE FOR ANY INDIRECT, SPECIAL, INCIDENTAL, PUNITIVE, OR CONSEQUENTIAL DAMAGES (INCLUDING LOSS OF EMPLOYMENT OPPORTUNITIES, DATA LOSS, OR BUSINESS INTERRUPTION) ARISING OUT OF YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU TO US, IF ANY, IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </p>
        </div>
      )
    },
    {
      id: 'governing',
      title: '8. Governing Law & Jurisdiction',
      icon: <Scale className="h-4 w-4" />,
      content: (
        <div className="space-y-4">
          <p>
            These Terms and any non-contractual obligations arising out of or in connection with them shall be governed by, and construed in accordance with, the laws of India.
          </p>
          <p>
            Any dispute, controversy, or claim arising out of or relating to these Terms, including the validity, invalidity, breach, or termination thereof, shall be submitted to the exclusive jurisdiction of the competent courts located in <strong>Jodhpur, Rajasthan, India</strong>.
          </p>
          <div className="p-4 rounded-xl border border-border/80 bg-muted/20 text-xs text-muted-foreground space-y-2">
            <p><strong>Contact & Notices:</strong></p>
            <p>For official legal notifications or questions regarding these Terms, please contact:</p>
            <p>Email: <strong>legal@acadconnect.org</strong></p>
            <p>Address: AcadConnect Legal Operations, Jodhpur, Rajasthan, 342001, India</p>
          </div>
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
      
      {/* Background gradients */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute left-1/3 top-[250px] -z-10 h-[300px] w-[300px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="mx-auto max-w-7xl px-6 py-12 md:py-20">
        
        {/* Header Hero Section */}
        <div className="mb-12 border-b border-border/60 pb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3.5 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-semibold tracking-wide text-primary">
              <Scale className="h-3.5 w-3.5" />
              Platform Standards Agreement
            </div>
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
              Terms of Service
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed">
              Last updated: June 17, 2026. These terms govern the use of our faculty matching network, academic profiles, search tools, and university membership systems.
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

        {/* Quick Summary Card */}
        <Card className="mb-12 border-primary/10 bg-card/60 backdrop-blur-md overflow-hidden rounded-2xl shadow-sm shadow-primary/3">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
              <FileText className="h-6 w-6" />
            </div>
            <div className="space-y-2.5">
              <h3 className="font-semibold text-lg text-foreground">User-Friendly Summary</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                By signing up for AcadConnect, you agree to represent your academic credentials and publications accurately (including linking verified ORCID assets) and to use the service strictly for job search and candidate evaluations. We run a high-integrity, secure platform. All activities and subscriptions are governed under courts in Jodhpur, Rajasthan, India.
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
                placeholder="Search terms sections..."
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
