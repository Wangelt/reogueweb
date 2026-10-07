import { api } from "@/lib/api/client";
import type { Coupon, CouponType } from "@/lib/api/types";

export const adminCouponsApi = {
  create: (data: {
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
    isActive?: boolean;
  }) => api.post<Coupon>("/coupons", data),

  list: () => api.get<Coupon[]>("/coupons"),

  getById: (couponId: string) => api.get<Coupon>(`/coupons/${couponId}`),

  update: (
    couponId: string,
    data: {
      description?: string;
      value?: number;
      minimumOrderAmount?: number;
      maximumDiscountAmount?: number;
      startDate?: string;
      expiryDate?: string;
      usageLimit?: number;
      perUserLimit?: number;
      isActive?: boolean;
    },
  ) => api.patch<Coupon>(`/coupons/${couponId}`, data),

  deactivate: (couponId: string) =>
    api.patch<Coupon>(`/coupons/${couponId}/deactivate`),
};
