import React, { createContext, useContext, useState } from "react";
import { Product, Customer, PaymentMethod, SaleItem } from "../lib/types";

export interface CartItem {
  product: Product;
  quantity: number;
  discount: number;
  customPrice?: number;
}

interface CartContextType {
  cart: CartItem[];
  selectedCustomer: Customer | null;
  paymentMethod: PaymentMethod;
  paymentReference: string;
  notes: string;
  isCreditSale: boolean;
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateItemDiscount: (productId: string, discount: number) => void;
  setSelectedCustomer: (customer: Customer | null) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setPaymentReference: (ref: string) => void;
  setNotes: (notes: string) => void;
  setIsCreditSale: (isCredit: boolean) => void;
  clearCart: () => void;
  toSaleItems: () => SaleItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("mpesa");
  const [paymentReference, setPaymentReference] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isCreditSale, setIsCreditSale] = useState<boolean>(false);

  const addToCart = (product: Product, quantity: number = 1) => {
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

  const updateItemDiscount = (productId: string, discount: number) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, discount: Math.max(0, discount) } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setSelectedCustomer(null);
    setPaymentMethod("mpesa");
    setPaymentReference("");
    setNotes("");
    setIsCreditSale(false);
  };

  const subtotal = cart.reduce((sum, item) => {
    const price = item.customPrice ?? item.product.sellingPrice;
    return sum + price * item.quantity;
  }, 0);

  const discountTotal = cart.reduce((sum, item) => sum + item.discount, 0);
  const taxableAmount = Math.max(0, subtotal - discountTotal);
  const taxTotal = Math.round((taxableAmount * 16) / 116); // 16% VAT inclusive
  const totalAmount = Math.max(0, subtotal - discountTotal);

  const toSaleItems = (): SaleItem[] => {
    return cart.map((item) => {
      const unitPrice = item.customPrice ?? item.product.sellingPrice;
      const total = unitPrice * item.quantity - item.discount;
      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice,
        buyingPrice: item.product.buyingPrice,
        discount: item.discount,
        total,
      };
    });
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        selectedCustomer,
        paymentMethod,
        paymentReference,
        notes,
        isCreditSale,
        subtotal,
        discountTotal,
        taxTotal,
        totalAmount,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateItemDiscount,
        setSelectedCustomer,
        setPaymentMethod,
        setPaymentReference,
        setNotes,
        setIsCreditSale,
        clearCart,
        toSaleItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};
