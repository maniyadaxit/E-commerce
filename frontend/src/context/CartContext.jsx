import { createContext, useEffect, useMemo, useState } from "react";
import {
  addCartItem,
  clearCart as clearServerCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../api/cartApi";
import { validateCoupon } from "../api/ordersApi";
import { useAuth } from "../hooks/useAuth";

const GUEST_CART_KEY = "aurora_gems_guest_cart";
const COUPON_STORAGE_KEY = "aurora_gems_coupon";

export const CartContext = createContext(null);

function normalizeGuestItem(item) {
  const quantity = Math.max(Number(item.quantity) || 1, 1);
  const price = Number(item.price) || 0;

  return {
    ...item,
    quantity,
    price,
    lineTotal: price * quantity,
  };
}

function buildGuestCart(items) {
  const normalizedItems = items.map(normalizeGuestItem);
  const subtotal = normalizedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const totalItems = normalizedItems.reduce((sum, item) => sum + item.quantity, 0);

  return { items: normalizedItems, subtotal, totalItems };
}

function readGuestCart() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const items = JSON.parse(window.localStorage.getItem(GUEST_CART_KEY) || "[]");
    return Array.isArray(items) ? items.map(normalizeGuestItem) : [];
  } catch {
    return [];
  }
}

function writeGuestCart(items) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items.map(normalizeGuestItem)));
}

function readStoredCoupon() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    if (typeof parsed === "string") {
      return {
        code: parsed.trim().toUpperCase(),
        discountAmount: 0,
        finalTotal: 0,
        cartTotal: null,
        message: "",
      };
    }

    if (parsed?.code) {
      return {
        code: String(parsed.code).trim().toUpperCase(),
        discountAmount: Number(parsed.discountAmount) || 0,
        finalTotal: Number(parsed.finalTotal) || 0,
        cartTotal: Number.isFinite(parsed.cartTotal) ? Number(parsed.cartTotal) : null,
        message: parsed.message || "",
      };
    }

    return null;
  } catch {
    const legacyCode = window.sessionStorage.getItem(COUPON_STORAGE_KEY);
    return legacyCode
      ? {
          code: legacyCode.trim().toUpperCase(),
          discountAmount: 0,
          finalTotal: 0,
          cartTotal: null,
          message: "",
        }
      : null;
  }
}

function writeStoredCoupon(coupon) {
  if (typeof window === "undefined") {
    return;
  }

  if (!coupon) {
    window.sessionStorage.removeItem(COUPON_STORAGE_KEY);
    return;
  }

  window.sessionStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
}

function extractCouponMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.errors?.[0] ||
    error?.message ||
    "Unable to apply this coupon right now."
  );
}

function buildCouponPayload(response, cartTotal) {
  return {
    code: response.code,
    discountAmount: response.discountAmount,
    finalTotal: response.finalTotal,
    cartTotal,
    message: response.message,
  };
}

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState({ items: [], subtotal: 0, totalItems: 0 });
  const [loading, setLoading] = useState(true);
  const [couponState, setCouponState] = useState(() => {
    const storedCoupon = readStoredCoupon();

    return {
      appliedCoupon: storedCoupon,
      status: storedCoupon ? "success" : "idle",
      message: storedCoupon?.message || "",
      loading: false,
    };
  });

  useEffect(() => {
    async function sync() {
      if (isAuthenticated) {
        const guestItems = readGuestCart();
        if (guestItems.length) {
          await Promise.all(
            guestItems.map((item) =>
              addCartItem({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                customizationText: item.customizationText,
              })
            )
          );
          writeGuestCart([]);
        }
        const data = await getCart();
        setCart(data);
      } else {
        setCart(buildGuestCart(readGuestCart()));
      }
      setLoading(false);
    }

    sync();
  }, [isAuthenticated]);

  useEffect(() => {
    const appliedCoupon = couponState.appliedCoupon;

    if (loading) {
      return undefined;
    }

    if (!appliedCoupon?.code || !cart.items?.length || cart.subtotal <= 0) {
      if (appliedCoupon) {
        writeStoredCoupon(null);
        setCouponState((prev) => ({
          ...prev,
          appliedCoupon: null,
          status: "idle",
          message: "",
          loading: false,
        }));
      }
      return undefined;
    }

    if (appliedCoupon.cartTotal === cart.subtotal && appliedCoupon.discountAmount >= 0) {
      return undefined;
    }

    let ignore = false;

    async function revalidateCoupon() {
      setCouponState((prev) => ({ ...prev, loading: true }));

      try {
        const response = await validateCoupon({
          code: appliedCoupon.code,
          cartTotal: cart.subtotal,
        });
        if (ignore) {
          return;
        }

        const nextCoupon = buildCouponPayload(response, cart.subtotal);
        writeStoredCoupon(nextCoupon);
        setCouponState({
          appliedCoupon: nextCoupon,
          status: "success",
          message: response.message,
          loading: false,
        });
      } catch (error) {
        if (ignore) {
          return;
        }

        writeStoredCoupon(null);
        setCouponState({
          appliedCoupon: null,
          status: "error",
          message: `Coupon removed: ${extractCouponMessage(error)}`,
          loading: false,
        });
      }
    }

    revalidateCoupon();

    return () => {
      ignore = true;
    };
  }, [cart.items?.length, cart.subtotal, couponState.appliedCoupon, loading]);

  const value = useMemo(
    () => ({
      cart,
      loading,
      count: cart.totalItems || cart.items?.length || 0,
      appliedCoupon: couponState.appliedCoupon,
      couponStatus: couponState.status,
      couponMessage: couponState.message,
      couponLoading: couponState.loading,
      discountTotal: couponState.appliedCoupon?.discountAmount || 0,
      payableTotal:
        couponState.appliedCoupon?.finalTotal ?? Math.max(cart.subtotal, 0),
      async applyCoupon(code) {
        const normalizedCode = code.trim().toUpperCase();

        if (!normalizedCode) {
          setCouponState({
            appliedCoupon: null,
            status: "error",
            message: "Enter a coupon code first.",
            loading: false,
          });
          writeStoredCoupon(null);
          return false;
        }

        setCouponState((prev) => ({ ...prev, loading: true }));

        try {
          const response = await validateCoupon({
            code: normalizedCode,
            cartTotal: cart.subtotal,
          });
          const nextCoupon = buildCouponPayload(response, cart.subtotal);
          writeStoredCoupon(nextCoupon);
          setCouponState({
            appliedCoupon: nextCoupon,
            status: "success",
            message: response.message,
            loading: false,
          });
          return true;
        } catch (error) {
          writeStoredCoupon(null);
          setCouponState({
            appliedCoupon: null,
            status: "error",
            message: extractCouponMessage(error),
            loading: false,
          });
          return false;
        }
      },
      clearCoupon() {
        writeStoredCoupon(null);
        setCouponState({
          appliedCoupon: null,
          status: "idle",
          message: "",
          loading: false,
        });
      },
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
        const nextItems = [...guestItems, normalizeGuestItem({ ...item, id: crypto.randomUUID() })];
        writeGuestCart(nextItems);
        setCart(buildGuestCart(nextItems));
      },
      async updateItem(id, quantity) {
        if (isAuthenticated) {
          setCart(await updateCartItem(id, { quantity }));
          return;
        }

        const nextItems = readGuestCart().map((item) =>
          item.id === id ? normalizeGuestItem({ ...item, quantity }) : item
        );
        writeGuestCart(nextItems);
        setCart(buildGuestCart(nextItems));
      },
      async removeItem(id) {
        if (isAuthenticated) {
          await removeCartItem(id);
          setCart(await getCart());
          return;
        }

        const nextItems = readGuestCart().filter((item) => item.id !== id);
        writeGuestCart(nextItems);
        setCart(buildGuestCart(nextItems));
      },
      async clear() {
        writeStoredCoupon(null);
        setCouponState({
          appliedCoupon: null,
          status: "idle",
          message: "",
          loading: false,
        });

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
          return;
        }

        setCart(buildGuestCart(readGuestCart()));
      },
    }),
    [cart, couponState, isAuthenticated, loading]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
