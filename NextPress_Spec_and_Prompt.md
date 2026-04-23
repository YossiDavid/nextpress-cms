# NextPress — מסמך אפיון מלא + Claude Code Prompt

---

## חזון המוצר

**NextPress** הוא CMS + eCommerce open-source מודרני, בנוי על Next.js + Node.js, שמחליף את WordPress בסטאק עכשווי. מיועד למפתחים שרוצים את הגמישות של WordPress — עם TypeScript, hooks system, plugin architecture — בלי PHP ובלי legacy.

**מודל עסקי:** Open Core + Cloud
- **Open Source (MIT):** ה-core engine, CMS, eCommerce, plugin/hook system
- **NextPress Cloud:** Hosted version — install בקליק, ניהול updates, backups, CDN

---

## ארכיטקטורה טכנית

### Monorepo Structure (pnpm + Turborepo)

```
nextpress/
├── apps/
│   ├── web/                  # Next.js App Router — frontend + Admin UI
│   └── server/               # Express + BullMQ — crons, queues, webhooks
├── packages/
│   ├── core/                 # Hook system, plugin loader, shared logic
│   ├── db/                   # Prisma schema + migrations (PostgreSQL)
│   ├── types/                # Shared TypeScript types
│   └── theme-engine/         # Next.js theme resolver + slot system
├── themes/
│   └── default/              # Default Next.js theme (starter)
├── plugins/
│   └── woocommerce-compat/   # Example plugin
├── docker-compose.yml
├── docker-compose.prod.yml
└── package.json
```

### Stack

| Layer | Technology |
|---|---|
| Frontend + Admin | Next.js 15 (App Router) |
| Backend / Jobs | Express + BullMQ + Redis |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth v5 (credentials + OAuth) |
| File Storage | Local (dev) / S3-compatible (prod) |
| Theme Engine | Next.js only (no multi-framework) |
| Package Manager | pnpm + Turborepo |
| Containerization | Docker Compose |
| Language | TypeScript (strict mode) |

---

## תוכנית עבודה — Phases

### Phase 1 — Foundation (MVP) 🏗️
**מטרה:** מערכת שאפשר להשתמש בה לניהול תוכן בסיסי

#### 1.1 Monorepo Setup
- [ ] pnpm workspaces + Turborepo
- [ ] TypeScript strict config משותף
- [ ] ESLint + Prettier
- [ ] Docker Compose (Next.js + Express + PostgreSQL + Redis)
- [ ] `npx create-nextpress` CLI scaffold

#### 1.2 Database Schema (Prisma)
- [ ] `User` — auth, roles (admin/editor/viewer)
- [ ] `PostType` — dynamic content types (כמו CPT בוורדפרס)
- [ ] `Post` — entries של כל post type
- [ ] `Field` — field definitions per post type
- [ ] `FieldValue` — EAV pattern לשמירת ערכים דינמיים
- [ ] `Media` — file uploads
- [ ] `Option` — key/value settings (כמו wp_options)
- [ ] `Menu` + `MenuItem`

#### 1.3 Core Hook System (`packages/core`)
- [ ] `HookSystem` class — addAction / doAction / addFilter / applyFilters
- [ ] Priority support (כמו וורדפרס)
- [ ] Async hooks support
- [ ] TypeScript generics לtype-safe filters

#### 1.4 Admin UI (Next.js App Router)
- [ ] `/admin` — dashboard
- [ ] `/admin/post-types` — ניהול content types
- [ ] `/admin/post-types/[type]` — רשימת entries
- [ ] `/admin/post-types/[type]/new` + `/edit/[id]` — עורך
- [ ] `/admin/media` — media library
- [ ] `/admin/settings` — הגדרות מערכת
- [ ] `/admin/plugins` — רשימת plugins מותקנים
- [ ] RTL + עברית כשפת ממשק ברירת מחדל

#### 1.5 REST API
- [ ] `GET/POST /api/v1/posts/[type]`
- [ ] `GET/PUT/DELETE /api/v1/posts/[type]/[id]`
- [ ] `POST /api/v1/media/upload`
- [ ] `GET /api/v1/settings`
- [ ] Authentication via API keys (כמו WooCommerce REST API)

---

### Phase 2 — eCommerce 🛒
**מטרה:** חנות מלאה מ-A עד Z

#### 2.1 Post Types מובנים
- [ ] `Product` — שם, תיאור, מחיר, SKU, stock
- [ ] `ProductVariation` — גדלים, צבעים, variants
- [ ] `ProductCategory` + `ProductTag`
- [ ] `Order` — items, status, customer
- [ ] `Customer` — פרופיל, היסטוריית הזמנות
- [ ] `Coupon`

#### 2.2 Cart & Checkout
- [ ] Cart — server-side session + client state
- [ ] Checkout flow — פרטים → תשלום → אישור
- [ ] Order management בadmin

#### 2.3 Payment Plugin System
```typescript
interface PaymentProvider {
  id: string;
  name: string;
  createSession(order: Order): Promise<{ url: string }>;
  handleWebhook(payload: unknown): Promise<WebhookResult>;
  refund(orderId: string, amount: number): Promise<RefundResult>;
}
```
- [ ] Plugin: Stripe
- [ ] Plugin: CardCom (ישראל)
- [ ] Plugin: PayPlus (ישראל)

#### 2.4 Shipping & Tax
- [ ] Shipping zones + methods כ-plugins
- [ ] Tax rules (כולל מע"מ ישראלי)

---

### Phase 3 — Plugin Ecosystem 🔌
**מטרה:** מפתחים חיצוניים יכולים לכתוב plugins

#### 3.1 Plugin Manifest
```typescript
interface NextPressPlugin {
  id: string;
  version: string;
  name: string;
  description: string;
  author: string;
  register(hooks: HookSystem, db: PrismaClient): void;
}
```

#### 3.2 Plugin Loader
- [ ] Auto-discovery מ-`/plugins` folder
- [ ] Install via `npx nextpress plugin add <name>`
- [ ] Plugin settings pages בadmin

#### 3.3 Hook Points מובנים
```typescript
// Content hooks
'post.beforeSave' | 'post.afterSave' | 'post.beforeDelete'

// eCommerce hooks  
'order.created' | 'order.completed' | 'order.refunded'
'cart.updated' | 'checkout.before' | 'checkout.after'

// Filter hooks
'post.fields' | 'product.price' | 'order.total'
'api.response' | 'admin.menu'
```

---

### Phase 4 — Theme System 🎨
**מטרה:** מפתחים יכולים לבנות ולמכור themes

#### 4.1 Theme Structure
```
themes/my-theme/
├── package.json          # theme manifest
├── theme.config.ts       # slots, settings
├── app/
│   ├── layout.tsx
│   ├── page.tsx          # homepage
│   ├── [slug]/page.tsx   # single post
│   └── shop/             # ecommerce pages
└── components/
```

#### 4.2 Theme Slots System
- [ ] Header / Footer slots
- [ ] Sidebar widgets
- [ ] Single post template override
- [ ] Product page template override

---

### Phase 5 — Cloud & Distribution ☁️
- [ ] `npx create-nextpress` — interactive setup wizard
- [ ] One-click deploy to Railway / Render / DigitalOcean
- [ ] NextPress Cloud dashboard — multi-site management
- [ ] Auto-updates system
- [ ] Marketplace לplugins + themes

---

## MVP — מה בדיוק נבנה בגרסה 0.1

### ✅ נכנס ל-MVP
1. Monorepo מוכן עם Docker Compose (Next.js + Express + PostgreSQL + Redis)
2. Prisma schema מלא לכל ה-MVP entities
3. Hook System מלא עם TypeScript generics
4. Admin UI — dashboard, post types CRUD, media library, settings
5. 3 Post Types מובנים: Page, Post, Product
6. REST API v1 מלא עם API key auth
7. Cart + Checkout בסיסי (ללא תשלום אמיתי — mock provider)
8. Plugin loader מ-`/plugins` folder
9. Default theme ב-Next.js

### ❌ לא נכנס ל-MVP
- Payment providers אמיתיים (Stripe, CardCom)
- Theme marketplace
- Cloud dashboard
- Multi-site
- עורך ויזואלי (page builder)

---

## Claude Code Prompt

```
You are building NextPress — a modern, open-source WordPress alternative built on Next.js + Node.js + TypeScript.

## Project Overview
NextPress is a CMS + eCommerce platform with WordPress-like developer experience (hooks, filters, plugins, post types) but built on a modern stack. It must be production-ready, fully typed, and developer-friendly.

## Tech Stack
- **Monorepo:** pnpm workspaces + Turborepo
- **Frontend + Admin:** Next.js 15 App Router (TypeScript strict)
- **Background Jobs:** Express + BullMQ + Redis
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth v5
- **Containerization:** Docker Compose
- **Package Manager:** pnpm

## Repository Structure to Create

```
nextpress/
├── apps/
│   ├── web/                        # Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── (frontend)/         # Public site routes
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── (admin)/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── layout.tsx  # Admin shell with sidebar nav
│   │   │   │   │   ├── page.tsx    # Dashboard with stats
│   │   │   │   │   ├── post-types/
│   │   │   │   │   │   ├── page.tsx          # List all post types
│   │   │   │   │   │   └── [type]/
│   │   │   │   │   │       ├── page.tsx      # List entries
│   │   │   │   │   │       ├── new/page.tsx
│   │   │   │   │   │       └── [id]/page.tsx # Edit entry
│   │   │   │   │   ├── media/page.tsx
│   │   │   │   │   ├── settings/page.tsx
│   │   │   │   │   └── plugins/page.tsx
│   │   │   └── api/
│   │   │       ├── auth/[...nextauth]/route.ts
│   │   │       └── v1/
│   │   │           ├── posts/[type]/route.ts
│   │   │           ├── posts/[type]/[id]/route.ts
│   │   │           └── media/upload/route.ts
│   │   ├── components/
│   │   │   ├── admin/              # Admin UI components
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── PostEditor.tsx  # Dynamic field editor
│   │   │   │   ├── FieldRenderer.tsx
│   │   │   │   └── MediaLibrary.tsx
│   │   │   └── frontend/           # Public site components
│   │   └── package.json
│   └── server/                     # Express server
│       ├── src/
│       │   ├── index.ts
│       │   ├── queues/             # BullMQ queues
│       │   │   ├── email.queue.ts
│       │   │   └── media.queue.ts
│       │   └── crons/
│       │       └── scheduler.ts
│       └── package.json
├── packages/
│   ├── core/
│   │   ├── src/
│   │   │   ├── hooks.ts            # Hook system
│   │   │   ├── plugin-loader.ts    # Plugin discovery + registration
│   │   │   └── index.ts
│   │   └── package.json
│   ├── db/
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Full schema
│   │   ├── src/
│   │   │   └── index.ts            # Prisma client singleton
│   │   └── package.json
│   └── types/
│       ├── src/
│       │   ├── post.types.ts
│       │   ├── plugin.types.ts
│       │   ├── payment.types.ts
│       │   └── index.ts
│       └── package.json
├── plugins/                        # Example plugins directory
│   └── .gitkeep
├── themes/
│   └── default/                    # Default Next.js theme
│       ├── app/
│       └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

## Step 1: Monorepo Foundation

Create all configuration files:

**package.json (root):**
```json
{
  "name": "nextpress",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "db:migrate": "turbo db:migrate",
    "db:studio": "cd packages/db && pnpm prisma studio"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.5.0"
  }
}
```

**pnpm-workspace.yaml:**
```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "plugins/*"
  - "themes/*"
```

**turbo.json:**
```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev": { "cache": false, "persistent": true },
    "db:migrate": { "cache": false }
  }
}
```

## Step 2: Prisma Schema

Create `packages/db/prisma/schema.prisma` with ALL of the following models:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// === AUTH ===

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  passwordHash  String?
  role          UserRole  @default(EDITOR)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  posts         Post[]
  sessions      Session[]
}

enum UserRole {
  ADMIN
  EDITOR
  VIEWER
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// === CMS CORE ===

model PostType {
  id          String   @id @default(cuid())
  slug        String   @unique  // "post", "page", "product"
  name        String            // "Posts", "Pages", "Products"
  description String?
  icon        String?           // lucide icon name
  isBuiltIn   Boolean  @default(false)
  hasArchive  Boolean  @default(true)
  createdAt   DateTime @default(now())
  fields      FieldDefinition[]
  posts       Post[]
}

model FieldDefinition {
  id          String    @id @default(cuid())
  postTypeId  String
  slug        String    // "price", "gallery", "description"
  label       String    // "Price", "Gallery"
  type        FieldType
  required    Boolean   @default(false)
  defaultVal  String?
  options     Json?     // for select/radio: [{label, value}]
  order       Int       @default(0)
  postType    PostType  @relation(fields: [postTypeId], references: [id], onDelete: Cascade)

  @@unique([postTypeId, slug])
}

enum FieldType {
  TEXT
  TEXTAREA
  RICHTEXT
  NUMBER
  BOOLEAN
  DATE
  IMAGE
  GALLERY
  SELECT
  MULTISELECT
  RELATION
  JSON
}

model Post {
  id          String      @id @default(cuid())
  postTypeId  String
  title       String
  slug        String
  status      PostStatus  @default(DRAFT)
  authorId    String?
  publishedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  postType    PostType    @relation(fields: [postTypeId], references: [id])
  author      User?       @relation(fields: [authorId], references: [id])
  fieldValues FieldValue[]
  orderItems  OrderItem[]

  @@unique([postTypeId, slug])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
  TRASH
}

model FieldValue {
  id         String  @id @default(cuid())
  postId     String
  fieldSlug  String
  value      String? // stored as string, parsed by field type
  post       Post    @relation(fields: [postId], references: [id], onDelete: Cascade)

  @@unique([postId, fieldSlug])
}

// === MEDIA ===

model Media {
  id        String   @id @default(cuid())
  filename  String
  mimeType  String
  size      Int
  url       String
  width     Int?
  height    Int?
  alt       String?
  createdAt DateTime @default(now())
}

// === OPTIONS (like wp_options) ===

model Option {
  key       String  @id
  value     String
  autoload  Boolean @default(true)
}

// === ECOMMERCE ===

model Order {
  id              String      @id @default(cuid())
  orderNumber     String      @unique @default(cuid())
  status          OrderStatus @default(PENDING)
  customerId      String?
  customerEmail   String
  customerName    String
  billingAddress  Json
  shippingAddress Json?
  subtotal        Decimal     @db.Decimal(10, 2)
  tax             Decimal     @db.Decimal(10, 2) @default(0)
  shipping        Decimal     @db.Decimal(10, 2) @default(0)
  total           Decimal     @db.Decimal(10, 2)
  currency        String      @default("ILS")
  paymentProvider String?
  paymentRef      String?
  notes           String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  items           OrderItem[]
  customer        Customer?   @relation(fields: [customerId], references: [id])
}

enum OrderStatus {
  PENDING
  PROCESSING
  COMPLETED
  CANCELLED
  REFUNDED
  FAILED
}

model OrderItem {
  id        String  @id @default(cuid())
  orderId   String
  productId String
  name      String
  sku       String?
  price     Decimal @db.Decimal(10, 2)
  quantity  Int
  total     Decimal @db.Decimal(10, 2)
  meta      Json?
  order     Order   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product   Post    @relation(fields: [productId], references: [id])
}

model Customer {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  phone     String?
  createdAt DateTime @default(now())
  orders    Order[]
}

model Coupon {
  id           String      @id @default(cuid())
  code         String      @unique
  type         CouponType
  amount       Decimal     @db.Decimal(10, 2)
  minOrderAmt  Decimal?    @db.Decimal(10, 2)
  usageLimit   Int?
  usageCount   Int         @default(0)
  expiresAt    DateTime?
  active       Boolean     @default(true)
  createdAt    DateTime    @default(now())
}

enum CouponType {
  PERCENT
  FIXED
  FREE_SHIPPING
}

// === MENUS ===

model Menu {
  id        String     @id @default(cuid())
  name      String
  slug      String     @unique
  items     MenuItem[]
}

model MenuItem {
  id       String     @id @default(cuid())
  menuId   String
  label    String
  url      String?
  postId   String?
  parentId String?
  order    Int        @default(0)
  menu     Menu       @relation(fields: [menuId], references: [id], onDelete: Cascade)
  parent   MenuItem?  @relation("MenuItemChildren", fields: [parentId], references: [id])
  children MenuItem[] @relation("MenuItemChildren")
}

// === API KEYS ===

model ApiKey {
  id          String    @id @default(cuid())
  name        String
  key         String    @unique
  permissions String[]  // ["read", "write", "admin"]
  lastUsedAt  DateTime?
  createdAt   DateTime  @default(now())
}
```

## Step 3: Hook System

Create `packages/core/src/hooks.ts`:

```typescript
type Priority = number;
type HookCallback<T = any> = (...args: any[]) => T | Promise<T>;

interface RegisteredHook<T = any> {
  callback: HookCallback<T>;
  priority: Priority;
}

export class HookSystem {
  private actions = new Map<string, RegisteredHook[]>();
  private filters = new Map<string, RegisteredHook[]>();

  addAction(hook: string, callback: HookCallback<void>, priority = 10): void {
    const hooks = this.actions.get(hook) ?? [];
    hooks.push({ callback, priority });
    hooks.sort((a, b) => a.priority - b.priority);
    this.actions.set(hook, hooks);
  }

  async doAction(hook: string, ...args: any[]): Promise<void> {
    const hooks = this.actions.get(hook) ?? [];
    for (const { callback } of hooks) {
      await callback(...args);
    }
  }

  addFilter<T>(hook: string, callback: HookCallback<T>, priority = 10): void {
    const hooks = this.filters.get(hook) ?? [];
    hooks.push({ callback, priority });
    hooks.sort((a, b) => a.priority - b.priority);
    this.filters.set(hook, hooks);
  }

  async applyFilters<T>(hook: string, value: T, ...args: any[]): Promise<T> {
    const hooks = this.filters.get(hook) ?? [];
    let result = value;
    for (const { callback } of hooks) {
      result = await callback(result, ...args);
    }
    return result;
  }

  removeAction(hook: string, callback: HookCallback): void {
    const hooks = this.actions.get(hook) ?? [];
    this.actions.set(hook, hooks.filter(h => h.callback !== callback));
  }

  removeFilter(hook: string, callback: HookCallback): void {
    const hooks = this.filters.get(hook) ?? [];
    this.filters.set(hook, hooks.filter(h => h.callback !== callback));
  }

  hasAction(hook: string): boolean {
    return (this.actions.get(hook)?.length ?? 0) > 0;
  }

  hasFilter(hook: string): boolean {
    return (this.filters.get(hook)?.length ?? 0) > 0;
  }
}

export const hooks = new HookSystem();
```

## Step 4: Plugin System Types

Create `packages/types/src/plugin.types.ts`:

```typescript
import type { HookSystem } from '@nextpress/core';
import type { PrismaClient } from '@prisma/client';

export interface NextPressPlugin {
  id: string;
  name: string;
  version: string;
  description?: string;
  author?: string;
  register(context: PluginContext): void | Promise<void>;
}

export interface PluginContext {
  hooks: HookSystem;
  db: PrismaClient;
  registerAdminPage?: (page: AdminPage) => void;
  registerPostType?: (postType: PostTypeConfig) => void;
  registerPaymentProvider?: (provider: PaymentProvider) => void;
}

export interface PaymentProvider {
  id: string;
  name: string;
  icon?: string;
  createSession(order: Order): Promise<{ url: string; sessionId: string }>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
  refund(orderId: string, amount: number): Promise<RefundResult>;
}

export interface WebhookResult {
  success: boolean;
  orderId?: string;
  status?: string;
}

export interface RefundResult {
  success: boolean;
  refundId?: string;
  error?: string;
}

export interface AdminPage {
  path: string;
  label: string;
  icon?: string;
  component: string; // path to React component
}

export interface PostTypeConfig {
  slug: string;
  name: string;
  icon?: string;
  fields: FieldConfig[];
}

export interface FieldConfig {
  slug: string;
  label: string;
  type: string;
  required?: boolean;
  options?: { label: string; value: string }[];
}

// Built-in hook names for type safety
export type ActionHook =
  | 'post.beforeSave'
  | 'post.afterSave'
  | 'post.beforeDelete'
  | 'post.afterDelete'
  | 'order.created'
  | 'order.statusChanged'
  | 'order.completed'
  | 'order.refunded'
  | 'cart.updated'
  | 'checkout.before'
  | 'checkout.after'
  | 'media.uploaded'
  | 'plugin.activated'
  | 'plugin.deactivated'
  | 'nextpress.ready';

export type FilterHook =
  | 'post.fields'
  | 'post.beforeRender'
  | 'product.price'
  | 'order.total'
  | 'order.tax'
  | 'order.shipping'
  | 'api.response'
  | 'admin.menu'
  | 'admin.dashboard.widgets';
```

## Step 5: Admin UI

Build the Admin UI inside `apps/web/app/(admin)/admin/` with:

### Design Requirements for Admin UI:
- **Color scheme:** Dark sidebar (#0f1117) + white content area
- **Font:** Geist (Next.js default) for UI, system font fallback
- **Sidebar:** Fixed left sidebar with icon + label navigation
- **Language:** Hebrew RTL as default UI language (use `dir="rtl"` on admin layout)
- **Components:** Use shadcn/ui (already available via Next.js)
- **Icons:** Lucide React

### Sidebar navigation items (Hebrew):
```
📊 לוח בקרה        /admin
📝 פוסטים           /admin/post-types/post
📄 עמודים           /admin/post-types/page
🛍️ מוצרים          /admin/post-types/product
📦 הזמנות           /admin/orders
🖼️ מדיה             /admin/media
🔌 תוספים           /admin/plugins
⚙️ הגדרות          /admin/settings
```

### Dashboard page must show:
- Total posts count
- Total products count  
- Total orders count
- Recent orders table (last 5)
- Quick links to create new content

### Post Editor must support all FieldTypes:
- TEXT → `<input type="text">`
- TEXTAREA → `<textarea>`
- RICHTEXT → simple `<textarea>` for MVP (TipTap in v2)
- NUMBER → `<input type="number">`
- BOOLEAN → `<Switch>`
- DATE → `<input type="date">`
- IMAGE → Media picker button → opens MediaLibrary modal
- SELECT → `<Select>` with options from field definition
- MULTISELECT → checkbox group

## Step 6: REST API

Build `apps/web/app/api/v1/` routes:

### Authentication middleware:
All API routes require either:
1. Session cookie (admin users)
2. `Authorization: Bearer <api_key>` header

### Endpoints to implement:

```typescript
// GET /api/v1/posts/[type] — list with pagination, filtering
// Query params: page, limit, status, search, orderBy

// POST /api/v1/posts/[type] — create new post
// Body: { title, slug, status, fields: Record<string, any> }

// GET /api/v1/posts/[type]/[id] — single post with field values

// PUT /api/v1/posts/[type]/[id] — update post

// DELETE /api/v1/posts/[type]/[id] — soft delete (move to TRASH)

// POST /api/v1/media/upload — multipart form upload
// Returns: { id, url, filename, mimeType, size, width, height }

// GET /api/v1/settings — get all autoload options
// POST /api/v1/settings — set option { key, value }

// GET /api/v1/orders — list orders (admin only)
// GET /api/v1/orders/[id] — single order
// PUT /api/v1/orders/[id]/status — update order status
```

Response format (always):
```typescript
// Success
{ success: true, data: T, meta?: { total, page, limit } }

// Error  
{ success: false, error: { code: string, message: string } }
```

## Step 7: Docker Compose

**docker-compose.yml:**
```yaml
version: '3.9'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://nextpress:nextpress@db:5432/nextpress
      REDIS_URL: redis://redis:6379
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET:-dev-secret-change-in-production}
      NEXTAUTH_URL: http://localhost:3000
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./uploads:/app/uploads

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    ports:
      - "3001:3001"
    environment:
      DATABASE_URL: postgresql://nextpress:nextpress@db:5432/nextpress
      REDIS_URL: redis://redis:6379
    depends_on:
      db:
        condition: service_healthy
      redis:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: nextpress
      POSTGRES_PASSWORD: nextpress
      POSTGRES_DB: nextpress
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U nextpress"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
  redisdata:
```

## Step 8: Seed Data

Create `packages/db/src/seed.ts` that:
1. Creates built-in PostTypes: `post`, `page`, `product`
2. Adds default FieldDefinitions for each:
   - **post:** title (built-in), content (RICHTEXT), excerpt (TEXTAREA), featuredImage (IMAGE)
   - **page:** title (built-in), content (RICHTEXT), featuredImage (IMAGE)  
   - **product:** title (built-in), description (RICHTEXT), price (NUMBER, required), salePrice (NUMBER), sku (TEXT), stock (NUMBER), images (GALLERY), category (TEXT)
3. Creates admin user: email=`admin@nextpress.dev`, password=`admin123`
4. Creates default menu with basic nav items
5. Seeds options: `site_title`, `site_description`, `currency` (ILS), `admin_email`

## Step 9: Plugin Loader

Create `packages/core/src/plugin-loader.ts`:

```typescript
import type { NextPressPlugin, PluginContext } from '@nextpress/types';
import { hooks } from './hooks';
import { prisma } from '@nextpress/db';
import path from 'path';
import fs from 'fs/promises';

export class PluginLoader {
  private loaded: Map<string, NextPressPlugin> = new Map();
  private pluginsDir: string;

  constructor(pluginsDir: string) {
    this.pluginsDir = pluginsDir;
  }

  async loadAll(): Promise<void> {
    let entries: string[];
    try {
      entries = await fs.readdir(this.pluginsDir);
    } catch {
      return; // plugins dir doesn't exist yet
    }

    const context: PluginContext = { hooks, db: prisma };

    for (const entry of entries) {
      const indexPath = path.join(this.pluginsDir, entry, 'index.ts');
      try {
        const stat = await fs.stat(indexPath);
        if (!stat.isFile()) continue;
        
        const plugin = (await import(indexPath)).default as NextPressPlugin;
        await plugin.register(context);
        this.loaded.set(plugin.id, plugin);
        await hooks.doAction('plugin.activated', plugin);
        console.log(`[NextPress] Plugin loaded: ${plugin.name} v${plugin.version}`);
      } catch (err) {
        console.error(`[NextPress] Failed to load plugin: ${entry}`, err);
      }
    }
  }

  getLoaded(): NextPressPlugin[] {
    return Array.from(this.loaded.values());
  }
}
```

## Step 10: Built-in Product Post Type

When the `product` PostType is queried, the system should:
1. Read `price` field value from FieldValue
2. Apply `product.price` filter hook (allows plugins to modify price)
3. Return enriched product object

Add a simple Cart implementation as server-side session:
```typescript
// apps/web/lib/cart.ts
// Cart stored in encrypted cookie (iron-session or similar)
interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Cart {
  items: CartItem[];
  couponCode?: string;
  subtotal: number;
  total: number;
}
```

## Final Checklist Before Calling Done

- [ ] `pnpm install` runs without errors from root
- [ ] `docker-compose up` starts all services
- [ ] `pnpm db:migrate` runs Prisma migrations successfully
- [ ] `pnpm db:seed` creates admin user and built-in post types
- [ ] Admin UI is accessible at `http://localhost:3000/admin`
- [ ] Login works with `admin@nextpress.dev` / `admin123`
- [ ] Can create/edit/delete posts via admin UI
- [ ] Can upload media
- [ ] REST API returns correct responses with API key auth
- [ ] Hook system is importable from `@nextpress/core`
- [ ] All TypeScript strict checks pass (`pnpm typecheck`)

## Important Notes

1. **Hebrew RTL:** The admin layout must have `<html lang="he" dir="rtl">`. All admin UI text should be in Hebrew.
2. **Error handling:** All API routes must catch errors and return the standard `{ success: false, error: {...} }` format.
3. **Type safety:** Never use `any` in the codebase. Use proper TypeScript types from `@nextpress/types`.
4. **Prisma:** Always use the singleton client from `@nextpress/db`, never instantiate PrismaClient directly in app code.
5. **Environment:** Create `.env.example` at the root with all required variables documented.
6. **README:** Create a comprehensive README.md explaining setup, architecture, and how to write a plugin.
```

---

## רוד-מאפ מלא — Timeline

| Phase | מה | זמן משוער |
|---|---|---|
| **MVP (0.1)** | Monorepo + DB + Hooks + Admin + REST API + Cart | 3–4 שבועות |
| **0.2** | Payment plugins (Stripe + CardCom) + Orders full flow | 2–3 שבועות |
| **0.3** | Plugin ecosystem + CLI + Docs | 2–3 שבועות |
| **0.4** | Theme system + Default theme | 3–4 שבועות |
| **0.5** | Cloud dashboard + One-click deploy | 4–6 שבועות |
| **1.0** | Marketplace + Stable API | TBD |
