"use client";

import { useAuth } from "@/hooks/use-auth";
import { Cake } from "@/types";
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  cakeId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  selectedSize?: string;
  selectedFeatures?: string[];
}

interface CartContextType {
  items: CartItem[];
  addItem: (
    cake: Cake,
    quantity?: number,
    options?: { size?: string; features?: string[] },
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (typeof window !== "undefined" && isAuthenticated && user) {
      const storageKey = `cart_${user.id}`;
      const savedCart = localStorage.getItem(storageKey);
      if (savedCart) {
        try {
          const parsed = JSON.parse(savedCart);
          setItems(parsed);
        } catch (e) {
          console.error("Failed to parse cart from localStorage", e);
          setItems([]);
        }
      } else {
        setItems([]);
      }
    } else {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAuthenticated]);

  // Save cart to localStorage on changes
  useEffect(() => {
    if (isAuthenticated && user) {
      const storageKey = `cart_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify(items));
    }
  }, [items, user, isAuthenticated]);

  const addItem = (
    cake: Cake,
    quantity = 1,
    options?: { size?: string; features?: string[] },
  ) => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart");
      return;
    }

    // Create a unique key for the item based on cakeId and selected options
    const itemKey = `${cake.id}-${options?.size || "default"}-${(options?.features || []).sort().join(",")}`;

    setItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === itemKey,
      );

      if (existingItemIndex > -1) {
        return prevItems.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prevItems,
        {
          id: itemKey,
          cakeId: cake.id,
          name: cake.name,
          price: cake.price,
          quantity,
          image: cake.image,
          selectedSize: options?.size,
          selectedFeatures: options?.features,
        },
      ];
    });

    toast.success(`${cake.name} added to cart`);
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
    toast.info("Item removed from cart");
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem("cart");
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
