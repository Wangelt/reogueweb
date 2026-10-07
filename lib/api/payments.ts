import { api } from "@/lib/api/client";
import type { Order } from "@/lib/api/types";

export const paymentsApi = {
  verify: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) => api.post<Order>("/payments/verify", data),
};
