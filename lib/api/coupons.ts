import { api } from "@/lib/api/client";
import type { CouponValidation } from "@/lib/api/types";

export const couponsApi = {
  validate: (code: string, subtotal: number) =>
    api.get<CouponValidation>(`/coupons/validate?code=${encodeURIComponent(code)}&subtotal=${subtotal}`),
};
