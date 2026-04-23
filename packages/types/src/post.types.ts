export type FieldType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'RICHTEXT'
  | 'NUMBER'
  | 'BOOLEAN'
  | 'DATE'
  | 'IMAGE'
  | 'GALLERY'
  | 'SELECT'
  | 'MULTISELECT'
  | 'RELATION'
  | 'JSON';

export type PostStatus = 'DRAFT' | 'PUBLISHED' | 'SCHEDULED' | 'TRASH';

export type UserRole = 'ADMIN' | 'EDITOR' | 'VIEWER';

export type OrderStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'FAILED';

export type CouponType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';

export interface PostTypeConfig {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  isBuiltIn?: boolean;
  hasArchive?: boolean;
}

export interface FieldDefinitionConfig {
  slug: string;
  label: string;
  type: FieldType;
  required?: boolean;
  defaultVal?: string;
  options?: { label: string; value: string }[];
  order?: number;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  variantId?: string;
  variantName?: string;
}

export interface Cart {
  items: CartItem[];
  couponCode?: string;
  subtotal: number;
  discount: number;
  total: number;
}

export interface ApiResponse<T> {
  success: true;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
}

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResult<T> = ApiResponse<T> | ApiError;
