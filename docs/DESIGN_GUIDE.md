# Ọjà Design Guide

## Design Philosophy

> **Sleek & Dynamic** — A marketplace console that feels premium, alive, and modern. Clean neutrals as the canvas, with ambient gradients that energize key surfaces without overwhelming the content-focused storefront theme system.

### Core Principles

1. **Motion as feedback, not decoration** — Every animation communicates state, hierarchy, or flow. No gratuitous movement.
2. **Spring physics for natural feel** — All interactive animations use spring-based easing (not linear CSS ease) for a tactile, responsive feel.
3. **Staged entrances** — Content reveals progressively (parent → children) on page load and scroll. Elements enter in logical reading order.
4. **Reduced-motion respect** — All animations gate behind `prefers-reduced-motion: reduce`. Users who prefer reduced motion see final states immediately.

---

## Color System

### Dashboard (oja-app)

| Token | Value | Usage |
|-------|-------|-------|
| `--background` | `#F8FAFC` (slate-50) | Page background |
| `--surface` | `#FFFFFF` | Cards, panels |
| `--primary` | `#2563EB` (blue-600) | Primary actions, active nav, links |
| `--accent` | `linear-gradient(135deg, #2563EB, #7C3AED)` | Hero sections, brand mark, ambient blobs |
| `--muted` | `#F1F5F9` (slate-100) | Subtle backgrounds, skeleton |
| `--border` | `#E2E8F0` (slate-200) | Card borders, dividers |
| `--destructive` | `#EF4444` (red-500) | Errors, delete actions |
| `--success` | `#22C55E` (green-500) | Success states, in-stock badges |
| `--warning` | `#F59E0B` (amber-500) | Warnings, session expired |

### Storefront (oja-storefront)

The storefront keeps its **runtime-editable theme** (tenant-defined primary/secondary/accent/text). Motion animations are context-agnostic and never hardcode brand colors. All hover/entrance effects use `currentColor`, `opacity`, `transform`, and `box-shadow` — never fill colors.

---

## Typography

| Context | Font | Weights | Notes |
|---------|------|---------|-------|
| Dashboard UI | Inter | 400, 500, 600, 700 | Tight letter-spacing on headings (-0.02em) |
| Storefront | Tenant theme font | — | Unchanged, runtime-defined |
| Monospace | system-ui | — | For SKUs, codes |

---

## Motion System

### Layer 1 — Page/Route Transitions

**Library:** `motion/react` → `AnimatePresence` + `RouteTransition`

- Fade + subtle upward slide (20px → 0)
- Duration: 200–300ms, spring with low bounce (damping: 25, stiffness: 300)
- Applied via `<AnimatePresence mode="wait">` wrapping the dashboard `<Outlet />`

### Layer 2 — Entrance Reveals (Viewport-triggered)

**Library:** `motion/react` → `useInView` + stagger variants

- **FadeUp:** opacity 0→1, y 20→0 (most common)
- **ScaleIn:** opacity 0→1, scale 0.95→1 (cards, dialogs)
- **SlideIn:** opacity 0→1, x ±30→0 (sidebar panels)
- **Stagger:** Parent container staggers children with 60ms interval

Used on: stat cards, product grids, user/group lists, form cards, feature sections.

### Layer 3 — Micro-interactions

| Element | Effect | Spring |
|---------|--------|--------|
| Buttons | `whileHover` scale 1.02, `whileTap` scale 0.97 | stiffness: 400, damping: 30 |
| Cards | `whileHover` y: -4 + shadow deepen | stiffness: 300, damping: 20 |
| Nav active item | Icon slides to accent color + soft glow pill | CSS transition 200ms |
| Toasts (sonner) | Spring entrance (built-in) | — |
| Sidebar collapse | Width 256→72px, labels fade out | CSS transition 300ms |
| Image hover | `group-hover:scale-105` | CSS transition 300ms |

### Layer 4 — Ambient / Brand Motion

- **Login page:** Slow animated gradient background (8–12s drift cycle)
- **Navbar brand:** Subtle gradient shimmer on the ọjà logotype
- **Skeleton loaders:** Soft pulsing glow (upgraded from flat gray pulse)
- **HeroCarousel:** Crossfade with slight Ken Burns scale (1.0 → 1.05)

### Layer 5 — Animated Numbers

Dashboard stat counts animate from 0 → value with a spring on mount:
- Spring: damping 30, stiffness 120
- Duration: ~1.5s natural settle
- Respects `prefers-reduced-motion` (shows final value immediately)
- Format: `Intl.NumberFormat("en-US")` for locale-aware commas

---

## Shared Package

All motion primitives live in `packages/motion-design/` (`@oja/motion-design`):

| Export | Purpose |
|--------|---------|
| `<FadeUp>` | Viewport-triggered fade-up entrance |
| `<FadeIn>` | Simple opacity entrance |
| `<ScaleIn>` | Pop-in entrance |
| `<SlideIn direction="left">` | Slide from side |
| `<Stagger>` + `<StaggerItem>` | Staggered list entrance |
| `<RouteTransition>` | Page enter/exit wrapper |
| `<MotionCard>` | Card with entrance + hover lift |
| `<HoverLift>` | Any element gets hover lift |
| `<AnimatedNumber>` | Count-up with spring physics |
| `fadeUp`, `fadeIn`, `scaleIn` | Variant objects |
| `staggerContainer`, `staggerFast`, `staggerSlow` | Stagger variants |
| `springDefault`, `springGentle`, `springSnappy`, `springBouncy` | Spring presets |

---

## SEO Strategy

### Landing Page (oja-storefront, no subdomain)

- **Structured data:** `WebSite` + `Organization` JSON-LD
- **Meta tags:** title, description, keywords, OpenGraph, Twitter Card
- **Canonical URL:** dynamic from `VITE_MAIN_APP_URL`
- **Semantic HTML:** proper heading hierarchy, landmark roles

### Store Pages (oja-storefront, subdomain)

- **Structured data:** `Product` + `Offer` JSON-LD per product page; `ItemList` for product listings
- **Meta tags:** per-page title/description from store data; OpenGraph with product images
- **Canonical URL:** per-page canonical from `getStorefrontUrl()`
- **`noindex`** on error/loading states, 404 pages

---

## File Structure

```
packages/motion-design/
  src/
    index.ts          — Public API exports
    variants.ts       — Animation variant definitions + spring presets
    components.tsx    — React motion primitives (FadeUp, Stagger, etc.)

oja-app/src/
  index.css           — Design tokens, ambient gradients, reduced-motion
  components/
    motion/           — (re-exports from @oja/motion-design for convenience)

oja-storefront/src/
  index.css           — Design tokens, ambient gradients, reduced-motion
  components/
    motion/           — (re-exports from @oja/motion-design for convenience)
```

---

## Accessibility

- All animations respect `prefers-reduced-motion: reduce`
- No animation relies solely on color to convey meaning
- Focus rings are always visible (not animated away)
- `aria-label` on interactive motion elements
- Skeleton loaders use `aria-busy` attribute

---

## Implementation Phases

| Phase | Scope | Files touched |
|-------|-------|---------------|
| 1. Foundation | Install deps, shared package, CSS tokens | package.json ×3, index.css ×2, packages/motion-design/* |
| 2. Dashboard animations | Login, layout, sidebar, nav, home, lists, forms | ~25 components in oja-app |
| 3. Storefront animations | Landing page, hero, renderer, loader/error | ~10 components in oja-storefront |
| 4. SEO improvements | Landing page + store pages structured data | SEO.tsx, useSEO.tsx, LandingPage.tsx, index.html ×2 |
| 5. Verification | Lint + build both apps | CI scripts |
