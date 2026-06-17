---
name: Academic Excellence System
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#45474c'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777d'
  outline-variant: '#c5c6cd'
  surface-tint: '#545f73'
  primary: '#091426'
  on-primary: '#ffffff'
  primary-container: '#1e293b'
  on-primary-container: '#8590a6'
  inverse-primary: '#bcc7de'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#041528'
  on-tertiary: '#ffffff'
  tertiary-container: '#1a2a3e'
  on-tertiary-container: '#8191a9'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d8e3fb'
  primary-fixed-dim: '#bcc7de'
  on-primary-fixed: '#111c2d'
  on-primary-fixed-variant: '#3c475a'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  display:
    fontFamily: Inter
    fontSize: 60px
    fontWeight: '800'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 80px
---

## Brand & Style

This design system is built on a foundation of **Corporate Modernism** with a specific focus on academic credibility. The brand personality is professional, authoritative, and highly reliable, designed to instill confidence in both institutional recruiters and educational professionals.

The aesthetic leans into the "Professional SaaS" movement—prioritizing clarity, high-quality typography, and functional elegance. It avoids unnecessary decoration in favor of structural integrity, utilizing generous whitespace to reduce cognitive load during the job search and recruitment process. The emotional response should be one of focused productivity and institutional trust.

## Colors

The palette is anchored by **Deep Navy (#1e293b)**, representing the "Institutional Core." This color is used for primary headings and navigation elements to establish authority. **Academic Blue (#2563eb)** serves as the primary action color, reserved for buttons, active states, and critical links to drive conversion.

The background strategy utilizes **Soft Slate Grays**, specifically using `#f8fafc` for main page surfaces and `#ffffff` for cards and interactive components to create a subtle layered effect. Status colors should follow standard conventions (Success: Emerald, Warning: Amber, Error: Rose) but should be desaturated to maintain the professional tone.

## Typography

This design system utilizes **Inter** for all primary text to ensure maximum legibility across different resolutions. The heading hierarchy is aggressive, using tight letter-spacing and heavy weights to create a sense of importance.

For technical data points, such as job IDs or salary brackets, **JetBrains Mono** is used sparingly as a label font to provide a "data-rich" and modern SaaS feel. Line heights are kept generous in body text (1.5x) to facilitate long-form reading on Job Details pages.

## Layout & Spacing

The system employs a **Fixed Grid** approach for desktop, centering content within a 1280px container to maintain readability. A 12-column system is used for landing pages, while a 2-column "Sidebar-Main" layout (ratio 1:3) is preferred for Job Listings and Job Details pages.

Vertical rhythm is strictly 4px-based. Section spacing is intentionally large (80px+) to allow the professional aesthetic to "breathe." On mobile devices, margins shrink to 16px, and multi-column layouts stack vertically into a single column.

## Elevation & Depth

Hierarchy is established through **Tonal Layers** and **Low-Contrast Outlines**. Instead of heavy shadows, the system uses a single pixel border of `#e2e8f0` (Slate 200) to define containers.

Elevation is reserved for interactive states:
- **Level 0 (Surface):** `#f8fafc` background.
- **Level 1 (Cards):** White background with a 1px Slate 200 border.
- **Level 2 (Hover/Active):** A soft, diffused shadow (0px 4px 6px -1px rgba(0, 0, 0, 0.1)) that lifts the element slightly to indicate interactivity.
- **Overlays:** Modals and dropdowns use a "Glassmorphism" blur on the backdrop (8px) to maintain context without visual clutter.

## Shapes

The shape language is "Softly Geometric." A standard radius of **8px** (0.5rem) is applied to all standard components like input fields and buttons. Larger containers, such as job cards and feature blocks, utilize **12px or 16px** (rounded-lg/xl) to feel more approachable and modern.

Avatars and status indicators (chips) may use a full pill-shape to provide visual contrast against the predominantly rectangular grid.

## Components

### Buttons
- **Primary:** Academic Blue background, white text. 8px radius. Use for "Apply Now" and "Post a Job."
- **Secondary:** Deep Navy border (1px) with transparent background. Used for "Learn More."
- **Ghost:** No border or background unless hovered. Used for utility navigation.

### Cards
Job listing cards must feature a 1px border and a subtle transition effect on hover (border color changes to Academic Blue). Padding should be a minimum of 24px.

### Input Fields
Inputs use a white background, 1px Slate 200 border, and a 2px blue ring focus state. Labels are always positioned above the field in `label-sm` style.

### Badges/Chips
Used for job categories (e.g., "Full-time," "Remote"). These should have a very light tinted background of the primary color (e.g., Blue 50) with high-contrast text.

### Job Feed List
Individual items should be separated by a 1px horizontal divider or light vertical spacing with card containers. Metadata (location, salary, date) should use `label-md` for clear scanning.