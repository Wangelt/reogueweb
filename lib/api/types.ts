// Existing transport types — unchanged
export type ApiSuccess<T> = {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
};

export type ApiErrorBody = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId: string;
};

export type ApiResult<T> = ApiSuccess<T> | ApiErrorBody;

export type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  auth?: boolean;
  token?: string;
};

// ─── Domain types ────────────────────────────────────────────────

export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent?: string | Category;
  isActive: boolean;
  sortOrder: number;
  image?: string;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export type Gender = "WOMEN" | "MEN" | "UNISEX" | "KIDS";
export type ProductCondition = "LIKE_NEW" | "EXCELLENT" | "GOOD" | "FAIR";
export type ProductStatus = "DRAFT" | "ACTIVE" | "OUT_OF_STOCK" | "ARCHIVED";

export interface ProductImage {
  id: string;
  url: string;
  publicId: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string;
  category: string | Category;
  subcategory?: string | Category;
  gender: Gender;
  size: string;
  color: string;
  material?: string;
  condition: ProductCondition;
  conditionDescription?: string;
  originalPrice: number;
  sellingPrice: number;
  discount?: number;
  sku: string;
  tags?: string[];
  featured: boolean;
  salesCount?: number;
  status: ProductStatus;
  images: ProductImage[];
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  category?: string;
  subcategory?: string;
  gender?: string;
  brand?: string;
  size?: string;
  color?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  search?: string;
  sort?: string;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
}

export interface WishlistItem {
  id: string;
  productId: string;
  product: Product;
  addedAt: string;
}

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export interface OrderStatusEntry {
  status: OrderStatus;
  note?: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  address: Address;
  subtotal: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  statusHistory: OrderStatusEntry[];
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
  updatedAt: string;
}

export type CouponType = "PERCENTAGE" | "FIXED";

export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  startDate: string;
  expiryDate: string;
  usageLimit?: number;
  perUserLimit?: number;
  usageCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponValidation {
  valid: boolean;
  discount: number;
  coupon?: Coupon;
}

export interface Inventory {
  productId: string;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: "IN" | "OUT" | "ADJUSTMENT";
  delta: number;
  reason?: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalCustomers: number;
  totalProducts: number;
  pendingOrders: number;
  lowStockProducts: number;
  recentOrders: Order[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
