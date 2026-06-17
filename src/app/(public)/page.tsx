import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { HomeHeroClient } from '@/components/layout/HomeHeroClient'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Building2,
  MapPin,
  Sparkles,
  Award,
  ShieldCheck,
  ArrowRight,
  Quote,
  GraduationCap,
  Globe2,
  BookOpenCheck
} from 'lucide-react'

export const metadata = {
  title: 'AcadConnect | Premier Academic Recruitment Platform',
  description: 'Connecting top universities and research institutions with world-class faculty, researchers, and academic leaders.',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  // Server-side redirect if authenticated
  if (session) {
    const userRole = session.user.user_metadata?.role as string | undefined
    if (userRole === 'admin') {
      redirect('/admin/dashboard')
    } else if (userRole === 'institution_member') {
      // Fetch recruiter's first active institution membership
      const { data: memberships } = await supabase
        .from('institution_members')
        .select('institution_id, institutions(slug)')
        .eq('profile_id', session.user.id)

      const activeSlugs = memberships
        ?.map((m: { institutions: { slug: string } | null }) => m.institutions?.slug)
        .filter(Boolean) as string[]

      if (activeSlugs && activeSlugs.length > 0) {
        redirect(`/inst/${activeSlugs[0]}/dashboard`)
      }
      redirect('/inst/dashboard')
    } else {
      // Default fallback is Faculty dashboard
      redirect('/dashboard')
    }
  }

  // Get first 3 published jobs from Supabase
  const { data: featuredJobsData } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      department,
      location,
      employment_type,
      work_mode,
      salary_currency,
      salary_range_min,
      salary_range_max,
      created_at,
      institutions (
        name
      )
    `)
    .eq('status', 'published')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(3)

  const featuredJobs = (featuredJobsData || []).map((job: any) => ({
    id: job.id,
    title: job.title,
    department: job.department,
    location: job.location,
    employment_type: job.employment_type,
    work_mode: job.work_mode,
    salary_currency: job.salary_currency,
    salary_range_min: Number(job.salary_range_min || 0),
    salary_range_max: Number(job.salary_range_max || 0),
    created_at: job.created_at,
    institution: {
      name: job.institutions?.name || 'Unknown Institution',
    }
  }))

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Hero Section */}
      <HomeHeroClient />

      {/* Trusted Institutions (Logo Cloud) */}
      <section className="py-12 bg-muted/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8 text-center">
          <p className="text-xs font-bold text-muted-foreground/85 uppercase tracking-widest mb-8">
            Trusted by Top Global Universities
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-70 grayscale hover:grayscale-0 transition-all duration-300">
            <div className="flex flex-col items-center">
              <GraduationCap className="h-8 w-8 text-foreground mb-1 animate-bounce" />
              <span className="font-extrabold text-xs tracking-widest text-foreground">PACIFIC STATE</span>
            </div>
            <div className="flex flex-col items-center">
              <Building2 className="h-8 w-8 text-foreground mb-1" />
              <span className="font-extrabold text-xs tracking-widest text-foreground">METRO TECH</span>
            </div>
            <div className="flex flex-col items-center">
              <BookOpenCheck className="h-8 w-8 text-foreground mb-1" />
              <span className="font-extrabold text-xs tracking-widest text-foreground">APPLIED LABS</span>
            </div>
            <div className="flex flex-col items-center">
              <Award className="h-8 w-8 text-foreground mb-1" />
              <span className="font-extrabold text-xs tracking-widest text-foreground">EXCELSIOR</span>
            </div>
            <div className="flex flex-col items-center">
              <Globe2 className="h-8 w-8 text-foreground mb-1" />
              <span className="font-extrabold text-xs tracking-widest text-foreground">NORDIC LABS</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
            Streamlining Global Recruitment
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto">
            A tailored ecosystem for the modern academic landscape.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* For Educators */}
          <Card className="border border-border/70 bg-card p-6 md:p-8 rounded-2xl hover-premium">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                For Educators
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  01
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1">Build Your Academic Profile</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Showcase your publications, citation records, and teaching philosophy in a professional, clean format.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  02
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1">Get Smart-Matched</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Our platform suggests vacancies aligning with your specific research niche and career trajectories.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  03
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1">Direct Institution Contact</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Apply directly to university search committees and monitor application pipelines in real-time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* For Institutions */}
          <Card className="border border-border/70 bg-muted/40 p-6 md:p-8 rounded-2xl hover-premium">
            <CardHeader className="p-0 mb-8">
              <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                For Institutions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  01
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1">Showcase Your Department</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Attract elite talent by highlighting your department&apos;s research facilities, lab assets, and university culture.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  02
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1">Advanced Candidate Gating</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Filter prospects by rank, field specializations, and publication credentials.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                  03
                </div>
                <div>
                  <h4 className="text-base font-bold text-foreground mb-1">Secure Selection Process</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Coordinate committee evaluations, feedback tallies, and virtual screenings within one compliant portal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bento Grid Platform Features */}
      <section className="py-24 bg-muted/30 border-y border-border/50 px-6 md:px-8">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              Designed for Higher Education
            </h2>
            <p className="text-muted-foreground text-base max-w-2xl mx-auto">
              Purpose-built tools that respect the integrity of academic recruitment.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Bento Box 1 */}
            <Card className="border border-border/70 bg-card hover:border-primary/30 transition-all duration-300 md:col-span-2 shadow-xs">
              <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center h-full">
                <div className="flex-1 space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Smart matching</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Proprietary matching algorithms that connect researchers based on citation influence and specialized research trajectories rather than simple keyword matches.
                  </p>
                </div>
                <div className="w-full md:w-64 h-40 bg-muted/30 rounded-2xl flex items-center justify-center relative overflow-hidden border border-border/50 shrink-0">
                  <svg className="absolute inset-0 w-full h-full p-6 text-primary/10" viewBox="0 0 200 100" fill="none">
                    <path d="M10 80 Q 50 10, 100 50 T 190 20" stroke="currentColor" strokeWidth="2" />
                    <circle cx="10" cy="80" r="4" fill="var(--color-primary)" className="animate-ping" />
                    <circle cx="100" cy="50" r="4" fill="var(--color-primary)" />
                    <circle cx="190" cy="20" r="4" fill="var(--color-primary)" />
                    <path d="M10 80 L 100 50 M 100 50 L 190 20" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 3" />
                  </svg>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-md relative z-10">Citation Network</span>
                </div>
              </CardContent>
            </Card>

            {/* Bento Box 2 */}
            <Card className="border border-border/10 bg-gradient-to-br from-slate-900 to-slate-950 text-white p-8 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                  <Building2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Institutional Branding</h3>
                <p className="text-slate-300 text-sm leading-relaxed font-medium">
                  Create beautiful, high-impact landing hubs for your departments to showcase faculty projects, lab assets, and university life.
                </p>
              </div>
              <div className="mt-8 flex justify-end">
                <Badge variant="outline" className="border-white/20 text-white bg-white/5 rounded-lg">
                  Brand Portals
                </Badge>
              </div>
            </Card>

            {/* Bento Box 3 */}
            <Card className="border border-border/70 bg-card hover:border-primary/30 transition-all duration-300 md:col-span-3 shadow-xs">
              <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-56 h-32 bg-muted/30 rounded-2xl flex flex-col items-center justify-center border border-border/50 shrink-0 p-4 space-y-2">
                  <div className="flex items-center gap-2 bg-card border border-border/50 px-3.5 py-2 rounded-xl shadow-xs">
                    <ShieldCheck className="h-5 w-5 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold text-foreground">ORCID Verified</p>
                      <p className="text-[8px] text-muted-foreground font-semibold">Credential Checked</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-foreground">Verified Academic Profiles</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed font-medium">
                    Every educator profile is authenticated using institutional email addresses or linked ORCID credentials. This guarantees a safe, high-trust ecosystem of verified researchers and credentialed teachers.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Positions */}
      <section className="py-24 px-6 md:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Featured Academic Positions
            </h2>
            <p className="text-muted-foreground text-sm">
              Latest opportunities from leading research institutions.
            </p>
          </div>
          <Button variant="ghost" render={<Link href="/jobs" />} className="text-primary gap-1 group self-start hover:bg-muted rounded-xl">
            View all jobs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {featuredJobs.map((job) => (
            <Card key={job.id} className="border border-border/70 bg-card hover:border-primary/30 group flex flex-col h-full hover-premium">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center font-bold text-primary text-xs border border-primary/10 ring-1 ring-primary/5">
                    {job.institution.name.substring(0, 2).toUpperCase()}
                  </div>
                  <Badge variant="secondary" className="text-[10px] font-bold tracking-wider uppercase bg-muted/60 text-muted-foreground border border-border/30">
                    {job.employment_type}
                  </Badge>
                </div>
                <h3 className="text-base font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[44px]">
                  {job.title}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold mt-1">{job.institution.name}</p>
              </CardHeader>
              <CardContent className="pb-6 flex-1 flex flex-col justify-between">
                <div className="space-y-2 mb-6">
                  <div className="flex items-center text-muted-foreground text-xs gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs gap-2">
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-primary/70" />
                    <span>{job.department}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground text-xs gap-2 pt-1">
                    <span className="font-semibold text-foreground/80">
                      {job.salary_currency} {job.salary_range_min.toLocaleString()} - {job.salary_range_max.toLocaleString()}
                    </span>
                  </div>
                </div>
                <Button render={<Link href={`/jobs/${job.id}`} />} className="w-full justify-center rounded-xl py-2">
                  Apply Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Testimonial & Stats Section */}
      <section className="py-24 bg-muted/40 border-y border-border/50">
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="text-xs font-bold text-primary uppercase tracking-widest">
                  Success Stories
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Voices from the Academic Community
              </h2>
              <div className="relative pl-6 border-l-2 border-primary/30">
                <Quote className="h-10 w-10 text-primary/10 absolute -top-4 -left-4 -scale-y-100" />
                <p className="text-lg italic leading-relaxed text-muted-foreground mb-6">
                  &quot;AcadConnect has fundamentally changed how we approach talent acquisition. The quality of applicants for our tenure-track positions has seen a significant boost in both diversity and academic achievement.&quot;
                </p>
                <div>
                  <p className="font-bold text-foreground">Dr. Elena Rodriguez</p>
                  <p className="text-sm text-muted-foreground">Head of Applied Sciences, Pacific Northwest University</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border border-border/60 bg-card/60 p-6 rounded-2xl shadow-xs">
                <CardContent className="p-0">
                  <p className="text-3xl md:text-4xl font-extrabold text-primary mb-1">94%</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Institutional Satisfaction</p>
                </CardContent>
              </Card>
              <Card className="border border-border/60 bg-card/60 p-6 rounded-2xl mt-6 shadow-xs">
                <CardContent className="p-0">
                  <p className="text-3xl md:text-4xl font-extrabold text-primary mb-1">12k+</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Research Fellows</p>
                </CardContent>
              </Card>
              <Card className="border border-border/60 bg-card/60 p-6 rounded-2xl shadow-xs">
                <CardContent className="p-0">
                  <p className="text-3xl md:text-4xl font-extrabold text-primary mb-1">200+</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Countries Represented</p>
                </CardContent>
              </Card>
              <Card className="border border-border/60 bg-card/60 p-6 rounded-2xl mt-6 shadow-xs">
                <CardContent className="p-0">
                  <p className="text-3xl md:text-4xl font-extrabold text-primary mb-1">30m</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Aggregated Citations</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-24 px-6 md:px-8">
        <div className="max-w-7xl mx-auto bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-12 md:p-20 text-center relative overflow-hidden shadow-2xl border border-border/10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl" />
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Ready to elevate your academic career?
            </h2>
            <p className="text-slate-300 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
              Join thousands of professors and researchers who have found their ideal academic home through AcadConnect.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
              <Button
                size="lg"
                render={<Link href="/auth/register" />}
                className="bg-white hover:bg-slate-100 text-slate-900 font-bold shadow-lg rounded-xl"
              >
                Get Started for Free
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/auth/register?role=institution_member" />}
                className="border-white/30 text-white bg-transparent hover:bg-white/10 hover:text-white hover:border-white/50 font-bold rounded-xl"
              >
                Find Your Next Star Faculty
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

