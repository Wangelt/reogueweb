"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authApi } from "@/lib/api/auth";
import { usersApi } from "@/lib/api/users";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";
import type { Cart, User, WishlistItem } from "@/lib/api/types";

// ─── Auth Context ──────────────────────────────────────────────

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthCtx | null>(null);

function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email: string, password: string) => {
    setLoading(true);
    try {
      const { user: u } = await authApi.login(email, password);
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(
    async (data: {
      email: string;
      password: string;
      firstName: string;
      lastName: string;
      phone?: string;
    }) => {
      setLoading(true);
      try {
        await authApi.register(data);
        const { user: u } = await authApi.login(data.email, data.password);
        setUser(u);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    const match = document.cookie.match(/rv_refresh=([^;]+)/);
    if (match?.[1]) {
      await authApi.logout(decodeURIComponent(match[1])).catch(() => {});
    }
    setUser(null);
    window.location.href = "/";
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const u = await usersApi.getMe();
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within Providers");
  return ctx;
}

// ─── Cart Context ──────────────────────────────────────────────

interface CartCtx {
  cart: Cart | null;
  loading: boolean;
  count: number;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  reload: () => Promise<void>;
}

const CartContext = createContext<CartCtx | null>(null);

function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    if (!user) { setCart(null); return; }
    try { setCart(await cartApi.get()); } catch { setCart(null); }
  }, [user]);

  useEffect(() => { void reload(); }, [reload]);

  const count = useMemo(
    () => cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0,
    [cart],
  );

  const addItem = useCallback(async (productId: string, quantity: number) => {
    setLoading(true);
    try { setCart(await cartApi.addItem(productId, quantity)); }
    finally { setLoading(false); }
  }, []);

  const updateItem = useCallback(async (itemId: string, quantity: number) => {
    setLoading(true);
    try { setCart(await cartApi.updateItem(itemId, quantity)); }
    finally { setLoading(false); }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    setLoading(true);
    try { setCart(await cartApi.removeItem(itemId)); }
    finally { setLoading(false); }
  }, []);

  const clearCart = useCallback(async () => {
    setLoading(true);
    try { await cartApi.clear(); setCart(null); }
    finally { setLoading(false); }
  }, []);

  return (
    <CartContext.Provider value={{ cart, loading, count, addItem, updateItem, removeItem, clearCart, reload }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within Providers");
  return ctx;
}

// ─── Wishlist Context ──────────────────────────────────────────

interface WishlistCtx {
  items: WishlistItem[];
  loading: boolean;
  isWishlisted: (productId: string) => boolean;
  addItem: (productId: string) => Promise<void>;
  removeByProductId: (productId: string) => Promise<void>;
}

const WishlistContext = createContext<WishlistCtx | null>(null);

function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { setItems([]); return; }
    wishlistApi.get().then(setItems).catch(() => setItems([]));
  }, [user]);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.productId === productId),
    [items],
  );

  const addItem = useCallback(async (productId: string) => {
    setLoading(true);
    try {
      const item = await wishlistApi.addItem(productId);
      setItems((prev) => [...prev, item]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeByProductId = useCallback(async (productId: string) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;
    setLoading(true);
    try {
      await wishlistApi.removeItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } finally {
      setLoading(false);
    }
  }, [items]);

  return (
    <WishlistContext.Provider value={{ items, loading, isWishlisted, addItem, removeByProductId }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within Providers");
  return ctx;
}

// ─── Combined Providers ────────────────────────────────────────

export function Providers({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: User | null;
}) {
  return (
    <AuthProvider initialUser={initialUser}>
      <CartProvider>
        <WishlistProvider>{children}</WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}
