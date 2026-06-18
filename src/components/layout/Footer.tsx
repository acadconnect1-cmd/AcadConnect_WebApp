'use client'

import Link from 'next/link'
import { GraduationCap } from 'lucide-react'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-border/50 bg-card/50 backdrop-blur-md text-card-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
        
        {/* Footer Top: Brand + Link Groups Grid */}
        <div className="grid grid-cols-2 gap-10 lg:grid-cols-5">
          
          {/* Column 1: Brand details (occupies double column space on large screen) */}
          <div className="col-span-2 lg:col-span-2 flex flex-col space-y-5">
            <Link href="/" className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-foreground transition-all duration-300 hover:scale-[1.01]">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-xs ring-1 ring-primary/15">
                <GraduationCap className="h-4.5 w-4.5" />
              </div>
              <span className="font-semibold text-lg tracking-tight">
                Acad<span className="text-primary font-bold">Connect</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground leading-relaxed">
              Bridging the gap between premier educational institutions and exceptional academic faculty worldwide.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-3 pt-2">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 shadow-xs border border-border/40"
                aria-label="Twitter"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 shadow-xs border border-border/40"
                aria-label="LinkedIn"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-muted/40 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-300 shadow-xs border border-border/40"
                aria-label="Instagram"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Platform Links */}
          <div className="flex flex-col space-y-4 col-span-1">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Platform</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=faculty" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  For Candidates
                </Link>
              </li>
              <li>
                <Link href="/auth/register?role=institution_member" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  For Institutions
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Company Links */}
          <div className="flex flex-col space-y-4 col-span-1">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Company</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Legal Links */}
          <div className="flex flex-col space-y-4 col-span-1">
            <h3 className="text-xs font-bold text-foreground tracking-wider uppercase">Legal</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors duration-200">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Footer Bottom: Divider + Copyright */}
        <div className="mt-16 border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {currentYear} AcadConnect. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Designed for Academic Excellence.
          </p>
        </div>

      </div>
    </footer>
  )
}
