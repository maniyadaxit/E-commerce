import { createContext, useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  clearCart as clearServerCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cartApi";
import { useAuth } from "../hooks/useAuth";

const GUEST_CART_KEY = "aurora_gems_guest_cart";

export const CartContext = createContext(null);

function readGuestCart() {
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_CART_KEY) || "[]");
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function sync() {
      if (isAuthenticated) {
        const guestItems = readGuestCart();
        if (guestItems.length) {
          await Promise.all(guestItems.map((item) => addCartItem(item)));
          writeGuestCart([]);
        }
        const data = await getCart();
        setCart(data);
      } else {
        const guestItems = readGuestCart();
        const subtotal = guestItems.reduce(
          (sum, item) => sum + (item.price || 0) * item.quantity,
          0
        );
        const totalItems = guestItems.reduce((sum, item) => sum + item.quantity, 0);
        setCart({ items: guestItems, subtotal, totalItems });
      }
      setLoading(false);
    }

    sync();
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      count: cart.totalItems || cart.items?.length || 0,
      async addItem(item) {
        if (isAuthenticated) {
          setCart(
            await addCartItem({
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity,
              customizationText: item.customizationText,
            })
          );
          return;
        }
        const guestItems = readGuestCart();
        const nextItems = [...guestItems, { ...item, id: crypto.randomUUID() }];
        writeGuestCart(nextItems);
        setCart({
          items: nextItems,
          subtotal: 0,
          totalItems: nextItems.reduce((sum, entry) => sum + entry.quantity, 0),
        });
      },
      async updateItem(id, quantity) {
        if (isAuthenticated) {
          setCart(await updateCartItem(id, { quantity }));
          return;
        }
        const nextItems = readGuestCart().map((item) =>
          item.id === id ? { ...item, quantity } : item
        );
        writeGuestCart(nextItems);
        setCart((prev) => ({ ...prev, items: nextItems }));
      },
      async removeItem(id) {
        if (isAuthenticated) {
          await removeCartItem(id);
          setCart(await getCart());
          return;
        }
        const nextItems = readGuestCart().filter((item) => item.id !== id);
        writeGuestCart(nextItems);
        setCart((prev) => ({ ...prev, items: nextItems }));
      },
      async clear() {
        if (isAuthenticated) {
          await clearServerCart();
          setCart(await getCart());
          return;
        }
        writeGuestCart([]);
        setCart({ items: [], subtotal: 0, totalItems: 0 });
      },
      async refresh() {
        if (isAuthenticated) {
          setCart(await getCart());
        }
      },
    }),
    [cart, isAuthenticated, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
