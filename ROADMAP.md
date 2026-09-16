# Oja - Project Roadmap

Ọjà (Yoruba for "market") is a full-stack multi-tenant e-commerce platform.

## Architecture

```
oja/                      # Single repo (root is source of truth)
  oja-app/          # Admin dashboard (React + Vite + TypeScript)
  oja-storefront/   # Public storefront renderer (React + Vite + TypeScript)
  oja-backend/      # API server (Python + FastAPI + PostgreSQL)
  packages/
    ui/             # Shared component library (@oja/ui)
    data/           # Shared data utilities (@oja/data)
    motion-design/  # Shared animation utilities (@oja/motion-design)
```

> The three apps were originally separate repositories used as git submodules.
> Their histories were merged into this single repo (Sep 2026) via `git subtree add` —
> the root repo is now the single point of truth and the submodules were removed.

## Merged Commit History

All commits across the three projects, sorted chronologically (oldest first).
(Hashes predating the subtree merge refer to the original oja-app / oja-storefront /
oja-backend repos; after Sep 16, 2026 all history lives in the `oja` repo.)

### Phase 1: Foundation (Jan 19 - Jan 26, 2026)

| Date       | Project     | Commit  | Summary |
|------------|-------------|---------|---------|
| 2026-01-19 | backend     | 2295319 | connect db; implement create and read for user |
| 2026-01-20 | backend     | fa61f96 | seed initial permissions; implement grant single permission, grant multiple permissions, list my permissions |
| 2026-01-20 | backend     | ef00ac9 | implement revoke permissions |
| 2026-01-20 | backend     | 8d1bb8c | update initial permissions migrations; add storefronts and products tables; add storefront_products and product_variants table; add CRUD for storefronts |
| 2026-01-20 | backend     | 4923c3b | cleanup and minor refactor |
| 2026-01-20 | backend     | 63d9861 | update user and permissions to have better errors |
| 2026-01-20 | backend     | e0497ec | better errors for storefront; cleanup pycache |
| 2026-01-21 | backend     | 0a76f86 | add application logic to prevent permissions being granted to entities not in the same tenant |
| 2026-01-21 | backend     | c44c777 | update rls |
| 2026-01-21 | backend     | fcd374b | update permissions; implement CRUD for products |
| 2026-01-23 | backend     | cfa1ec6 | return permissions with user response |
| 2026-01-23 | backend     | 40394a1 | add fetch users route with pagination |
| 2026-01-24 | backend     | f90f018 | add documentation to existing schemas |
| 2026-01-24 | backend     | 65282cb | add docs for services |
| 2026-01-24 | backend     | 4829b1a | implement groups feature |
| 2026-01-24 | backend     | 38b1ec6 | apply better pagination |
| 2026-01-24 | backend     | 3d71d33 | QOL changes to APIs |
| 2026-01-24 | backend     | 09090bd | changes to users |
| 2026-01-24 | app         | 2912658 | initial commit |
| 2026-01-24 | app         | 836a811 | update routes |
| 2026-01-24 | app         | b894aaf | implement APIs for groups |
| 2026-01-25 | backend     | 444b2e8 | update storefront implementation |
| 2026-01-25 | backend     | c4531b5 | fix add users to group query; add list all permissions API |
| 2026-01-25 | backend     | 43a4316 | implement user permission management |
| 2026-01-25 | backend     | b24d082 | implement user groups management |
| 2026-01-25 | app         | 1eab1fc | minor refactor; implement storefront |
| 2026-01-25 | app         | 93b8e77 | create edit group and users |
| 2026-01-25 | app         | c2e3f64 | fix /api typo on API function calls; add group detail, add members to group, grant permissions to group |
| 2026-01-25 | app         | 4f71442 | add user detail, permissions pages |
| 2026-01-26 | backend     | adb0351 | minor change to get all groups response |
| 2026-01-26 | backend     | 9c89bc4 | reinforce root users |
| 2026-01-26 | backend     | 7ec11a6 | add table for storefront designs, add field for product images |
| 2026-01-26 | app         | 89584ee | incremental changes to users group management |
| 2026-01-26 | app         | 00a1333 | add delete confirmation dialog |

### Phase 2: Product & Storefront Management (Jan 30 - Feb 14, 2026)

| Date       | Project     | Commit  | Summary |
|------------|-------------|---------|---------|
| 2026-01-30 | backend     | ec4006c | implement analytics; API to display dashboard analytics |
| 2026-01-30 | app         | bcae376 | implement and integrate products |
| 2026-01-31 | backend     | f61354f | update code for products management APIs |
| 2026-01-31 | backend     | 03a518a | implement storefront products management APIs |
| 2026-01-31 | app         | 28d3d6b | integrate storefront products management |
| 2026-02-02 | app         | 7449d05 | QOL changes |
| 2026-02-09 | app         | 1e14ccd | integrate cloudinary for image uploads |
| 2026-02-09 | app         | 2bca7b1 | QOL changes |
| 2026-02-09 | app         | 823d8ce | pre-liminary storefront designer implementation |
| 2026-02-10 | app         | c0ad2a4 | update components |
| 2026-02-12 | app         | ecf7274 | update storefront designer 1 |
| 2026-02-12 | app         | 9334594 | update storefront designer 2 |
| 2026-02-13 | app         | 727cf15 | update storefront designer 3 |
| 2026-02-14 | backend     | c659aa1 | add services for public storefront |
| 2026-02-14 | app         | 873b00b | update storefront designer 4 |
| 2026-02-14 | app         | 46b7ac7 | QOL changes |
| 2026-02-14 | storefront  | 45dcde1 | initial commit |
| 2026-02-14 | storefront  | 9351b7f | add landing page |
| 2026-02-14 | storefront  | 5aa1e5c | update landing page |
| 2026-02-14 | storefront  | 2be68b3 | QOL changes |

### Phase 3: Containerization & Stabilization (May - Jun, 2026)

| Date       | Project     | Commit  | Summary |
|------------|-------------|---------|---------|
| 2026-05-08 | storefront  | 742eaa6 | update: ranged product price |
| 2026-05-10 | backend     | aa9e1a5 | update: compose |
| 2026-05-10 | backend     | 543cdb1 | update: update Dockerfile |
| 2026-05-10 | backend     | 56b4b84 | update: attempt to fix cookie bug |
| 2026-05-20 | root        | ef6e7c1 | update |
| 2026-05-20 | app         | d382096 | create Dockerfile and .dockerignore |
| 2026-05-20 | app         | f4ef0a7 | update: prepare for containerization |
| 2026-05-20 | backend     | 2fa0d1c | create .dockerignore |
| 2026-05-20 | backend     | 9ba80b1 | update: prepare for containerization |
| 2026-05-20 | storefront  | 139dab6 | update dockerfile |
| 2026-05-20 | storefront  | 6da9278 | update: prepare for containerization |
| 2026-06-16 | storefront  | 0cd99e4 | update: add seo |
| 2026-06-16 | app         | 4bed809 | update: minor bug fixes |
| 2026-06-16 | backend     | ad39739 | update: minor bug fixes |
| 2026-06-17 | app         | 3c00464 | update: hack sidebar bug |
| 2026-06-17 | backend     | 1fb1d6a | update: remove debug route |
| 2026-06-17 | root        | 337c553, 77788c9 | update |

### Phase 4: Shared UI Library & Design Overhaul (Sep 4, 2026)

| Date       | Project     | Commit  | Summary |
|------------|-------------|---------|---------|
| 2026-09-04 | root        | 2a3be70 | feat: add @oja/ui + @oja/data + @oja/motion-design packages, wire monorepo workspaces |
| 2026-09-04 | root        | 920b141 | feat: raise dialog z-index, point submodules to designer-product-detail-ux work |
| 2026-09-04 | app         | a8bc157 | refactor: migrate to @oja/ui + @oja/data, drop shadcn/radix/sonner, fix designer drag & preview |
| 2026-09-04 | storefront  | d724cd2 | refactor: migrate to @oja/ui, drop shadcn/radix/sonner, add structured data |
| 2026-09-04 | root        | 527a8a4 | refactor: point submodules to designer-product-detail-ux gallery/switch fixes |
| 2026-09-04 | app         | e86e583 | feat: true-modal storefront preview with new-tab standalone page, modern product image gallery |
| 2026-09-04 | storefront  | fcbdfe5 | feat: replicate modern product image gallery in storefront renderer |
| 2026-09-04 | app         | bedf412 | fix: generate @oja/ui utilities via @source, visible switch + gallery sizing |
| 2026-09-04 | storefront  | 2355f69 | fix: generate @oja/ui utilities via @source, constrain product image gallery size |
| 2026-09-04 | app         | 0c26bf9 | feat: mobile single-column layout for designer and storefront grids |
| 2026-09-04 | storefront  | 0a2a1b4 | feat: mobile single-column layout for storefront grids |
| 2026-09-04 | root        | db110cc | feat: point submodules to mobile single-column layouts |

### Phase 5: Polish (Sep 6, 2026)

| Date       | Project     | Commit  | Summary |
|------------|-------------|---------|---------|
| 2026-09-06 | root        | d63e8fe | feat: increase button sizes across @oja/ui |
| 2026-09-06 | backend     | f9b9723 | update: minor changes |
| 2026-09-06 | root        | 529aeca | update |

### Phase 6: Monorepo Consolidation (Sep 16, 2026)

| Date       | Project | Commit   | Summary |
|------------|---------|----------|---------|
| 2026-09-16 | root    | 77e8f09  | chore: remove submodules, prepare for subtree merge |
| 2026-09-16 | root    | 9929782  | Add 'oja-app/' from commit '0c26bf9' (subtree) |
| 2026-09-16 | root    | f70da8b  | Add 'oja-storefront/' from commit '0a2a1b4' (subtree) |
| 2026-09-16 | root    | 34f47dd  | Add 'oja-backend/' from commit 'f9b9723' (subtree) |
| 2026-09-16 | root    | 4a28b17  | refactor: consolidate submodules into single monorepo (root-context Dockerfiles, single compose definition, unified lockfile, unignore docker-compose.yml) |

## Current Status

- **oja-app** (admin dashboard): Product management, user/group/permissions system, visual storefront designer with live preview, true-modal preview, mobile-responsive layout
- **oja-storefront** (public storefront): Landing page, product listing, product detail with modern image gallery (zoom, keyboard nav, thumbnails), SEO, mobile single-column grids
- **oja-backend** (API): FastAPI + PostgreSQL, multi-tenant auth (HTTP-only cookies), user/group/permissions CRUD, product/storefront management, analytics endpoints, containerized
- **packages/ui** (@oja/ui): Shared component library (Button, Card, Dialog, Sheet, Tabs, Switch, Select, Table, Tooltip, etc.) — all apps now use this
- **packages/data** (@oja/data): Shared data utilities
- **packages/motion-design** (@oja/motion-design): Shared animation utilities

## What's Left / Next Steps

- [ ] Payment integration (test mode)
- [ ] Password recovery and email verification
- [ ] Full tenant settings UI
- [ ] Custom domain mapping
- [ ] Tenant analytics dashboard
- [ ] Comprehensive test coverage
- [ ] Archive the now-deprecated leaf repos (oja-app, oja-storefront, oja-backend) on GitHub
