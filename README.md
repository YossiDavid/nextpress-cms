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

---

## Installation

### Prerequisites

- Node.js 20+
- pnpm 9+
- A [Supabase](https://supabase.com) project (free tier is fine)
- Supabase CLI: `npm i -g supabase`

---

### Step 1 — Clone and install

```bash
git clone https://github.com/nextpress-cms/nextpress.git
cd nextpress
pnpm install
```

---

### Step 2 — Create a Supabase project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard) and create a new project.
2. Wait for provisioning to complete (~1 minute).
3. From **Settings → Database**, copy the two connection strings.
4. From **Settings → API**, copy the `URL`, `anon`/`publishable` key, and `service_role` key.

---

### Step 3 — Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Open `.env.local` and set:

| Variable | Where to find it |
|----------|-----------------|
| `DATABASE_URL` | Supabase → Settings → Database → **Connection pooling** URI (port 6543, add `?pgbouncer=true`) |
| `DIRECT_URL` | Supabase → Settings → Database → **Direct connection** URI (port 5432) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase → Settings → API → `anon` / `publishable` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key |
| `NEXT_PUBLIC_URL` | `http://localhost:3000` for local dev |
| `ADMIN_EMAIL` | Email for your first admin account |
| `SITE_TITLE` | Your site name |

---

### Step 4 — Configure and push Supabase auth settings

The `supabase/config.toml` file contains all auth configuration (allowed redirect URLs, password requirements, email settings).

Link to your remote project and push the config:

```bash
supabase link --project-ref <your-project-ref>
supabase config push
```

Your project ref is the subdomain in your Supabase URL: `https://<project-ref>.supabase.co`

---

### Step 5 — Run database migrations

```bash
pnpm db:migrate
```

This applies all Prisma migrations to your Supabase Postgres database.

---

### Step 6 — Create the first admin user

Because auth is handled by Supabase, the admin user must be created there first:

1. Go to your Supabase Dashboard → **Authentication → Users**
2. Click **Add user → Create new user**
3. Enter your `ADMIN_EMAIL` and a password
4. Copy the **UUID** shown for the new user

Then seed the database (creates the matching Prisma row + default content):

```bash
ADMIN_UUID=<paste-uuid-here> pnpm db:seed
```

Or add `ADMIN_UUID` to `.env.local` first and just run `pnpm db:seed`.

---

### Step 7 — Start the dev server

```bash
pnpm dev:web
```

| URL | What |
|-----|------|
| `http://localhost:3000` | Frontend |
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:3001` | Background job server (optional) |

Log in at `/admin/login` with the credentials you set in Supabase.

---

### Full stack with Docker Compose (optional)

Runs the web app, background job server, and Redis together. Supabase is still external.

```bash
cp .env.example .env.local   # fill in all values including Supabase keys
docker compose up -d
docker compose exec web pnpm db:migrate
```

---

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase Postgres pooled connection (port 6543, `?pgbouncer=true`) | ✓ |
| `DIRECT_URL` | Supabase Postgres direct connection (port 5432, for migrations) | ✓ |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | ✓ |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key | ✓ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only, never expose to client) | ✓ |
| `NEXT_PUBLIC_URL` | Public app URL | ✓ |
| `ADMIN_EMAIL` | Email for the first admin (used by `db:seed`) | ✓ |
| `ADMIN_UUID` | Supabase Auth UUID for the first admin (used by `db:seed`) | ✓ |
| `SITE_TITLE` | Site name shown in admin and emails | — |
| `UPLOAD_DIR` | Local file upload directory | `./uploads` |
| `UPLOAD_URL` | Public base URL for uploads | `http://localhost:3000/uploads` |
| `REDIS_URL` | Redis connection string (only needed for background job server) | — |
| `RESEND_API_KEY` | Resend API key for transactional email | — |
| `STRIPE_SECRET_KEY` | Stripe secret key for payments | — |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | — |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | — |

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend + Admin | Next.js 15 App Router (TypeScript strict) |
| Database ORM | Prisma + PostgreSQL |
| Auth | Supabase Auth (`@supabase/ssr`) |
| Background Jobs | Express + BullMQ + Redis |
| Monorepo | pnpm workspaces + Turborepo |
| Containerization | Docker Compose |

---

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
├── supabase/
│   └── config.toml     # Auth URL config, email settings, redirect allowlist
└── themes/
    └── default/        # Default theme (header, footer, templates)
```

---

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

---

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
    hooks.addAction('post.afterSave', async (post) => {
      console.log('Post saved:', (post as { title: string }).title);
    });

    hooks.addFilter('product.price', async (price) => {
      return (price as number) * 0.9; // 10% discount
    });
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

---

## REST API

All endpoints require authentication via session cookie or `Authorization: Bearer <api-key>` header.

### Posts

```
GET    /api/v1/posts/:type          List posts (?page, ?limit, ?status, ?search)
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

### Current user

```
GET    /api/v1/me                   Returns authenticated user's id, email, name, role
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

---

## Architecture

```
Browser
  │
  ├── GET /           → (frontend) layout + page.tsx  (RSC, reads DB directly)
  ├── GET /admin/*    → (admin) layout + pages        (RSC + Client Components)
  │                                                    Protected by Supabase Auth middleware
  └── POST /api/v1/*  → Route Handlers                (session + API key auth)

Background
  └── apps/server     → Express HTTP + BullMQ workers
        ├── email queue    (send transactional emails)
        ├── media queue    (resize/optimize images)
        └── cron scheduler (publish scheduled posts)

Database
  └── Supabase Postgres via Prisma
        ├── Posts / PostTypes / FieldDefinitions / FieldValues
        ├── Users (id = Supabase Auth UUID)
        ├── Orders / OrderItems / Customers / Coupons
        ├── Media
        ├── Menus / MenuItems
        └── Options / ApiKeys
```

---

## License

MIT
