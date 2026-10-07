import { api } from "@/lib/api/client";
import type { User, Address } from "@/lib/api/types";

export const usersApi = {
  getMe: () => api.get<User>("/users/me"),

  updateMe: (data: { firstName?: string; lastName?: string; phone?: string }) =>
    api.patch<User>("/users/me", data),

  listAddresses: () => api.get<Address[]>("/users/me/addresses"),

  addAddress: (data: {
    fullName: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country?: string;
    isDefault?: boolean;
  }) => api.post<Address>("/users/me/addresses", data),

  updateAddress: (
    addressId: string,
    data: {
      fullName?: string;
      phone?: string;
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    },
  ) => api.patch<Address>(`/users/me/addresses/${addressId}`, data),

  deleteAddress: (addressId: string) =>
    api.delete<void>(`/users/me/addresses/${addressId}`),

  setDefaultAddress: (addressId: string) =>
    api.patch<Address>(`/users/me/addresses/${addressId}/default`),
};
