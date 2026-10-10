import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { Product, User, UserRole, Sale } from "../lib/types";
import { authApi } from "../lib/api/auth";

export interface StoreCartItem {
  product: Product;
  quantity: number;
  discount: number;
}

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "completed";

export interface TrackedOrder {
  id: string;
  orderNumber: string;
  items: StoreCartItem[];
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  customerName?: string;
  shippingAddress?: string;
  estimatedDelivery?: string;
}

interface StoreContextType {
  // Authentication
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;

  // Products
  products: Product[];
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  filterCategory: string;
  setFilterCategory: (category: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredProducts: Product[];

  // Cart
  cart: StoreCartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;

  // Wishlist
  wishlist: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;

  // Order Tracking
  orders: TrackedOrder[];
  activeOrder: TrackedOrder | null;
  trackOrder: (orderId: string) => TrackedOrder | undefined;
  createOrder: (orderData: Partial<TrackedOrder>) => TrackedOrder;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem("sme_store_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [role, setRole] = useState<UserRole>("owner");

  const isAuthenticated = !!user;

  const login = async (email: string, userRole: UserRole = "owner", password?: string) => {
    try {
      const res = await authApi.login(email, password || "password123");
      setUser(res.user);
      setRole(userRole);
      setToken(res.token);
      localStorage.setItem("sme_store_user", JSON.stringify(res.user));
      return true;
    } catch {
      const currentUser = await authApi.getCurrentUser().catch(() => null);
      if (currentUser) {
        setUser(currentUser);
        setRole(userRole);
        localStorage.setItem("sme_store_user", JSON.stringify(currentUser));
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sme_store_user");
    authApi.logout();
  };

  // Products State
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    import("../lib/api/products").then(({ productsApi }) => {
      productsApi.getProducts().then((data) => {
        if (Array.isArray(data)) setProducts(data);
      }).catch(console.error);
    });
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const matchesCategory = filterCategory === "all" || item.categoryId === filterCategory || item.categoryName.toLowerCase() === filterCategory.toLowerCase();
      const matchesSearch = !searchQuery || item.name.toLowerCase().includes(searchQuery.toLowerCase()) || item.sku.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, filterCategory, searchQuery]);

  // Cart State
  const [cart, setCart] = useState<StoreCartItem[]>(() => {
    try {
      const saved = localStorage.getItem("sme_store_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sme_store_cart", JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity, discount: 0 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => setCart([]);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.discount, 0);
  }, [cart]);

  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxTotal = Math.round((taxableAmount * 16) / 116);
  const totalAmount = Math.max(0, subtotal - discountTotal);

  // Wishlist State
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem("sme_store_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("sme_store_wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (product: Product) => {
    setWishlist((prev) => {
      if (prev.some((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId: string) => {
    setWishlist((prev) => prev.filter((p) => p.id !== productId));
  };

  const toggleWishlist = (product: Product) => {
    if (wishlist.some((p) => p.id === product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const isInWishlist = (productId: string) => wishlist.some((p) => p.id === productId);

  // Order Tracking State
  const [orders, setOrders] = useState<TrackedOrder[]>(() => {
    try {
      const saved = localStorage.getItem("sme_store_orders");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [activeOrder, setActiveOrder] = useState<TrackedOrder | null>(null);

  useEffect(() => {
    localStorage.setItem("sme_store_orders", JSON.stringify(orders));
  }, [orders]);

  const trackOrder = (orderId: string) => {
    const found = orders.find((o) => o.id === orderId || o.orderNumber.toLowerCase() === orderId.toLowerCase());
    if (found) setActiveOrder(found);
    return found;
  };

  const createOrder = (orderData: Partial<TrackedOrder>): TrackedOrder => {
    const newOrder: TrackedOrder = {
      id: `ord-${Date.now()}`,
      orderNumber: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      items: [...cart],
      totalAmount,
      status: "pending",
      createdAt: new Date().toISOString(),
      ...orderData,
    };
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);
    clearCart();
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    if (activeOrder && activeOrder.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status } : null));
    }
  };

  return (
    <StoreContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        token,
        login,
        logout,
        products,
        selectedProduct,
        setSelectedProduct,
        filterCategory,
        setFilterCategory,
        searchQuery,
        setSearchQuery,
        filteredProducts,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        discountTotal,
        taxTotal,
        totalAmount,
        wishlist,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist,
        orders,
        activeOrder,
        trackOrder,
        createOrder,
        updateOrderStatus,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used within a StoreProvider");
  return context;
};
