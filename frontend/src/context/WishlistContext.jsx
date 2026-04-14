import { createContext, useEffect, useMemo, useState } from "react";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../api/wishlistApi";
import { useAuth } from "../hooks/useAuth";

const GUEST_WISHLIST_KEY = "aurora_gems_guest_wishlist";

export const WishlistContext = createContext(null);

function readGuestWishlist() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
    return Array.isArray(parsed)
      ? parsed.filter((entry) => entry && typeof entry === "object" && entry.id)
      : [];
  } catch {
    return [];
  }
}

function writeGuestWishlist(items) {
  window.localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(items));
}

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function sync() {
      if (isAuthenticated) {
        const guestItems = readGuestWishlist();
        if (guestItems.length) {
          await Promise.all(guestItems.map((item) => addToWishlist(item.id)));
          writeGuestWishlist([]);
        }
        setItems(await getWishlist());
      } else {
        setItems(readGuestWishlist());
      }
      setLoading(false);
    }

    sync();
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      items,
      loading,
      count: items.length,
      isSaved(productId) {
        return items.some((item) => item.id === productId);
      },
      async toggle(product) {
        if (isAuthenticated) {
          const exists = items.some((item) => item.id === product.id);
          if (exists) {
            await removeFromWishlist(product.id);
          } else {
            await addToWishlist(product.id);
          }
          setItems(await getWishlist());
          return;
        }

        const guestItems = readGuestWishlist();
        const exists = guestItems.some((item) => item.id === product.id);
        const nextItems = exists
          ? guestItems.filter((item) => item.id !== product.id)
          : [
              ...guestItems,
              {
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                mrp: product.mrp,
                metal: product.metal,
                primaryImageUrl: product.primaryImageUrl,
                hoverImageUrl: product.hoverImageUrl,
              },
            ];
        writeGuestWishlist(nextItems);
        setItems(nextItems);
      },
    }),
    [isAuthenticated, items, loading]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}
