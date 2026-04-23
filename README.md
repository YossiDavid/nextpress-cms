# NextPress

A modern, developer-first WordPress alternative built with Next.js 15, TypeScript, and PostgreSQL.

## What is NextPress?

NextPress is a headless CMS + e-commerce platform with a full admin UI. It gives you:

- **Flexible content types** — define custom post types and fields via the admin or API
- **Built-in e-commerce** — products, orders, customers, coupons
- **Plugin system** — extend functionality with typed hooks (actions + filters)
- **REST API** — full CRUD API with session + API key auth
- **Media library** — upload and manage files
- **Background jobs** — email queue, media processing via BullMQ
- **Scheduled publishing** — cron-based post scheduler

## Quick Start

### Option 1 — CLI (simplest)

```bash
npx create-nextpress my-site
```

The CLI scaffolds the project, generates a secure `AUTH_SECRET`, and optionally runs migrations + seed automatically.

### Option 2 — Local dev (Postgres only, no Redis required)

Requirements: Node.js 20+, pnpm 9+, Docker

```bash
git clone https://github.com/nextpress-cms/nextpress.git
cd nextpress
cp .env.example .env.local   # edit ADMIN_EMAIL and ADMIN_PASSWORD

docker compose -f docker-compose.dev.yml up -d   # start Postgres only
pnpm install
pnpm db:migrate
pnpm db:seed
pnpm dev:web                                      # Next.js only, no Redis needed
```

### Option 3 — Full stack with Docker Compose

Runs the web app, background job server, Postgres, and Redis together.

```bash
git clone https://github.com/nextpress-cms/nextpress.git
cd nextpress
cp .env.example .env.local

docker compose up -d
docker compose exec web pnpm db:migrate
docker compose exec web pnpm db:seed
```

Open [http://localhost:3000](http://localhost:3000) — frontend
Open [http://localhost:3000/admin](http://localhost:3000/admin) — admin panel
Credentials: whatever you set in `ADMIN_EMAIL` / `ADMIN_PASSWORD`

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Admin | Next.js 15 App Router (TypeScript strict) |
| Database ORM | Prisma + PostgreSQL |
| Auth | NextAuth v5 (Credentials provider) |
| Background Jobs | Express + BullMQ + Redis |
| Monorepo | pnpm workspaces + Turborepo |
| Containerization | Docker Compose |

## Project Structure

```
nextpress/
├── apps/
│   ├── web/            # Next.js 15 app (frontend + admin + API)
│   └── server/         # Express background job server
├── packages/
│   ├── db/             # Prisma schema + client singleton
│   ├── core/           # Hook system + plugin loader
│   ├── types/          # Shared TypeScript types
│   ├── theme-engine/   # SlotRegistry + ThemeConfig types
│   └── create-nextpress/ # npx create-nextpress CLI
├── plugins/            # Drop-in plugins directory
└── themes/
    └── default/        # Default theme (header, footer, templates)
```

## Creating a Theme

Copy or use `themes/default` as a starting point. A theme is a workspace package that exports React Server Components for named slots.

```typescript
// themes/my-theme/theme.config.ts
import type { ThemeConfig } from '@nextpress/theme-engine';

export const config: ThemeConfig = {
  id: 'my-theme',
  name: 'My Theme',
  version: '1.0.0',
  slots: {
    header: './components/Header',
    footer: './components/Footer',
    home: './components/HomePage',
    'post-single': './components/PostTemplate',
    'product-single': './components/ProductTemplate',
    archive: './components/ArchivePage',
  },
  settings: [
    { key: 'primary_color', label: 'Primary Color', type: 'color', default: '#000000' },
  ],
};
```

Each slot component is a React Server Component that receives typed props. See `themes/default` for full examples.

Activate your theme from the admin panel under **Settings > Active Theme**, or by upserting the `active_theme` option in the database.

## Writing a Plugin

Create a directory under `/plugins/my-plugin/index.ts`:

```typescript
import type { NextPressPlugin } from '@nextpress/types';

const myPlugin: NextPressPlugin = {
  id: 'my-plugin',
  name: 'My Plugin',
  version: '1.0.0',
  description: 'Example NextPress plugin',

  async register({ hooks, db }) {
    // React to post saves
    hooks.addAction('post.afterSave', async (post) => {
      console.log('Post saved:', (post as { title: string }).title);
    });

    // Filter product prices (e.g., apply membership discount)
    hooks.addFilter('product.price', async (price) => {
      return (price as number) * 0.9; // 10% discount
    });

    // Register a custom post type
    // hooks.doAction('nextpress.ready') fires after all plugins load
  },
};

export default myPlugin;
```

### Hook Reference

**Actions** (fire-and-forget side effects):

| Hook | When |
|------|------|
| `post.beforeSave` | Before a post is created/updated |
| `post.afterSave` | After a post is created/updated |
| `post.beforeDelete` | Before a post is trashed |
| `post.afterDelete` | After a post is trashed |
| `order.created` | New order placed |
| `order.statusChanged` | Order status updated |
| `order.completed` | Order marked completed |
| `media.uploaded` | File uploaded to media library |
| `nextpress.ready` | All plugins loaded |

**Filters** (transform a value):

| Hook | What it filters |
|------|----------------|
| `post.fields` | Field definitions for a post type |
| `product.price` | Product price before display |
| `order.total` | Order total during checkout |
| `api.response` | API response data |
| `admin.menu` | Admin sidebar navigation items |

## REST API

All endpoints require authentication via session cookie or `Authorization: Bearer <api-key>` header.

### Posts

```
GET    /api/v1/posts/:type          List posts (supports ?page, ?limit, ?status, ?search)
POST   /api/v1/posts/:type          Create post
GET    /api/v1/posts/:type/:id      Get post
PUT    /api/v1/posts/:type/:id      Update post
DELETE /api/v1/posts/:type/:id      Soft-delete (move to TRASH)
```

### Orders

```
GET    /api/v1/orders               List orders
GET    /api/v1/orders/:id           Get order
PUT    /api/v1/orders/:id/status    Update order status
```

### Media

```
POST   /api/v1/media/upload         Upload file (multipart/form-data)
```

### Settings

```
GET    /api/v1/settings             Get all autoload options
POST   /api/v1/settings             Upsert an option { key, value }
```

### Example: Create a post

```bash
curl -X POST http://localhost:3000/api/v1/posts/post \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <api-key>" \
  -d '{
    "title": "Hello World",
    "status": "PUBLISHED",
    "fields": {
      "content": "<p>My first post</p>",
      "excerpt": "A short summary"
    }
  }'
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | ✓ |
| `AUTH_SECRET` | Signing secret (min 32 chars) — generate with `openssl rand -base64 32` | ✓ |
| `NEXT_PUBLIC_URL` | Public app URL | ✓ |
| `ADMIN_EMAIL` | Initial admin account email (used by `db:seed`) | ✓ |
| `ADMIN_PASSWORD` | Initial admin account password | ✓ |
| `SITE_TITLE` | Site name shown in admin and emails | — |
| `UPLOAD_DIR` | Local file upload directory | `./uploads` |
| `UPLOAD_URL` | Public base URL for uploads | `http://localhost:3000/uploads` |
| `REDIS_URL` | Redis connection string (only needed for background server) | — |
| `RESEND_API_KEY` | Resend API key for transactional email | — |

Copy `.env.example` to `.env.local` and fill in the values.

## Architecture

```
Browser
  │
  ├── GET /           → (frontend) layout + page.tsx  (RSC, reads DB directly)
  ├── GET /admin/*    → (admin) layout + pages        (RSC + Client Components)
  │                                                    Protected by NextAuth middleware
  └── POST /api/v1/*  → Route Handlers                (session + API key auth)

Background
  └── apps/server     → Express HTTP + BullMQ workers
        ├── email queue    (send transactional emails)
        ├── media queue    (resize/optimize images)
        └── cron scheduler (publish scheduled posts)

Database
  └── PostgreSQL via Prisma
        ├── Posts / PostTypes / FieldDefinitions / FieldValues
        ├── Users / Sessions
        ├── Orders / OrderItems / Customers / Coupons
        ├── Media
        ├── Menus / MenuItems
        └── Options / ApiKeys
```

## License

MIT
