import type { PrismaClient } from '@prisma/client';
import type { FieldDefinitionConfig, PostTypeConfig } from './post.types';

// Minimal HookSystem interface to avoid circular dependency with @nextpress/core
export interface HookSystem {
  addAction(hook: string, callback: (...args: unknown[]) => void | Promise<void>, priority?: number): void;
  doAction(hook: string, ...args: unknown[]): Promise<void>;
  addFilter<T>(hook: string, callback: (...args: unknown[]) => T | Promise<T>, priority?: number): void;
  applyFilters<T>(hook: string, value: T, ...args: unknown[]): Promise<T>;
  removeAction(hook: string, callback: (...args: unknown[]) => void | Promise<void>): void;
  removeFilter(hook: string, callback: (...args: unknown[]) => unknown): void;
  hasAction(hook: string): boolean;
  hasFilter(hook: string): boolean;
}

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
  registerPostType?: (postType: PostTypeConfig & { fields: FieldDefinitionConfig[] }) => void;
  registerPaymentProvider?: (provider: PaymentProvider) => void;
}

export interface PaymentProvider {
  id: string;
  name: string;
  icon?: string;
  createSession(order: OrderData): Promise<{ url: string; sessionId: string }>;
  handleWebhook(payload: unknown, signature: string): Promise<WebhookResult>;
  refund(orderId: string, amount: number): Promise<RefundResult>;
}

export interface OrderData {
  id: string;
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  total: string;
  currency: string;
  items: Array<{
    name: string;
    price: string;
    quantity: number;
  }>;
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
  component: string;
}

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
