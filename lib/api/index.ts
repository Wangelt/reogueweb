export { api, apiClient } from "@/lib/api/client";
export { ApiError } from "@/lib/api/errors";
export { getAccessToken } from "@/lib/api/tokens";
export type {
  ApiErrorBody,
  ApiResult,
  ApiSuccess,
  RequestOptions,
  User,
  UserRole,
  AuthTokens,
  Address,
  Category,
  Product,
  ProductFilters,
  Gender,
  ProductCondition,
  ProductStatus,
  CartItem,
  Cart,
  WishlistItem,
  Order,
  OrderItem,
  OrderStatus,
  OrderStatusEntry,
  Coupon,
  CouponType,
  CouponValidation,
  Inventory,
  InventoryMovement,
  DashboardStats,
  PaginatedResponse,
} from "@/lib/api/types";

export { authApi } from "@/lib/api/auth";
export { usersApi } from "@/lib/api/users";
export { categoriesApi } from "@/lib/api/categories";
export { productsApi } from "@/lib/api/products";
export { cartApi } from "@/lib/api/cart";
export { wishlistApi } from "@/lib/api/wishlist";
export { ordersApi } from "@/lib/api/orders";
export { paymentsApi } from "@/lib/api/payments";
export { couponsApi } from "@/lib/api/coupons";
export { adminDashboardApi } from "@/lib/api/admin/dashboard";
export { adminProductsApi } from "@/lib/api/admin/products";
export { adminCategoriesApi } from "@/lib/api/admin/categories";
export { adminOrdersApi } from "@/lib/api/admin/orders";
export { adminUsersApi } from "@/lib/api/admin/users";
export { adminInventoryApi } from "@/lib/api/admin/inventory";
export { adminCouponsApi } from "@/lib/api/admin/coupons";
