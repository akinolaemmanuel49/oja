# oja-app — Admin Dashboard

Admin console for the Ọjà multi-tenant e-commerce platform: product management,
user/group/permission administration, and a visual storefront designer with live preview.

## Stack

React + TypeScript + Vite + Tailwind CSS, built on the shared `@oja/ui`,
`@oja/data`, and `@oja/motion-design` workspace packages.

## Development

Run from the repository root (npm workspaces):

```bash
npm install
npm run dev --workspace=oja-app
```

Or via Docker:

```bash
docker compose up app
```

## Features

- Product CRUD with variants, SKUs, inventory, and bulk operations
- User, group, and permission management
- Visual storefront designer (drag-and-drop components, mobile single-column layout)
- True-modal storefront preview with a standalone new-tab page
- Full tenant data isolation

See the root [README](https://github.com/akinolaemmanuel49/oja) for architecture
overview and [docs](../docs/) for design and database documentation.