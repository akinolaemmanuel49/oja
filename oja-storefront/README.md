# oja-storefront — Public Storefront

Public-facing storefront renderer for the Ọjà multi-tenant e-commerce platform.
Dynamically displays each tenant's customized store (runtime-editable theme) from the
design published in the admin dashboard.

## Stack

React + TypeScript + Vite + Tailwind CSS, built on the shared `@oja/ui`, `@oja/data`,
and `@oja/motion-design` workspace packages.

## Development

Run from the repository root (npm workspaces):

```bash
npm install
npm run dev --workspace=oja-storefront
```

Or via Docker:

```bash
docker compose up storefront
```

## Features

- Landing page with SEO structured data (WebSite + Organization)
- Product listings with `ItemList` structured data
- Product detail with modern image gallery (zoom, keyboard nav, thumbnails, lightbox)
- Per-page SEO (meta, OpenGraph, canonical URLs)
- Mobile single-column grids

See the root [README](https://github.com/akinolaemmanuel49/oja) for architecture
overview and [docs](../docs/) for design and database documentation.