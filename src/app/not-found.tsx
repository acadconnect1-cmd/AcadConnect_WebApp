'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, 
  ArrowLeft, 
  Home, 
  Search, 
  Building2, 
  PhoneCall, 
  Compass 
} from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  const links = [
    {
      href: '/jobs',
      title: 'Explore Vacancies',
      desc: 'Browse current faculty positions and academic listings.',
      icon: <Search className="h-5 w-5 text-primary" />
    },
    {
      href: '/auth/login?role=institution_member',
      title: 'Institution Portal',
      desc: 'Access your search committee or recruiter workspace.',
      icon: <Building2 className="h-5 w-5 text-primary" />
    },
    {
      href: '/about',
      title: 'Platform Overview',
      desc: 'Learn about our matching verification standards.',
      icon: <Compass className="h-5 w-5 text-primary" />
    },
    {
      href: '/contact',
      title: 'Support & Help Desk',
      desc: 'Submit a ticket to resolve credential or route errors.',
      icon: <PhoneCall className="h-5 w-5 text-primary" />
    }
  ]

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-6 py-16 md:py-24 overflow-hidden">
      
      {/* Premium background gradient overlays */}
      <div className="absolute inset-x-0 top-0 -z-10 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[350px] w-[350px] rounded-full bg-primary/3 blur-[120px] pointer-events-none" />

      <div className="max-w-xl w-full space-y-8 text-center">
        
        {/* Logo Badge */}
        <div className="flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs ring-1 ring-primary/15">
              <GraduationCap className="h-5.5 w-5.5" />
            </div>
            <span className="font-semibold text-lg tracking-tight">
              Acad<span className="text-primary font-bold">Connect</span>
            </span>
          </Link>
        </div>

        {/* 404 Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
            Error 404
          </div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Page Not Found
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            The university workspace, application path, or resource you are trying to access does not exist or has been relocated.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="w-full rounded-xl font-semibold gap-2 border-border/80 hover:bg-muted justify-center cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            Go Back
          </Button>
          <Button
            render={<Link href="/" />}
            className="w-full rounded-xl font-semibold gap-2 justify-center shadow-xs"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </div>

        {/* Helpful Resources Directory */}
        <div className="border-t border-border/50 pt-8 mt-4 space-y-4">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-left px-1">Useful Directories</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {links.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                className="group p-4 rounded-xl border border-border/60 bg-card/50 backdrop-blur-md hover:bg-card hover:border-primary/30 transition-all duration-300 shadow-xs flex gap-3.5 items-start"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 group-hover:scale-105 transition-transform shrink-0">
                  {link.icon}
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                    {link.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground leading-normal line-clamp-2">
                    {link.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
