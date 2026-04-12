import { createContext, useEffect, useMemo, useState } from "react";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../api/wishlistApi";
import { mockProducts } from "../data/mockCatalog";
import { useAuth } from "../hooks/useAuth";

const GUEST_WISHLIST_KEY = "aurora_gems_guest_wishlist";

export const WishlistContext = createContext(null);

function readGuestWishlist() {
  try {
    return JSON.parse(window.localStorage.getItem(GUEST_WISHLIST_KEY) || "[]");
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
          await Promise.all(guestItems.map((id) => addToWishlist(id)));
          writeGuestWishlist([]);
        }
        setItems(await getWishlist());
      } else {
        const ids = readGuestWishlist();
        setItems(mockProducts.filter((product) => ids.includes(product.id)));
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

        const ids = readGuestWishlist();
        const exists = ids.includes(product.id);
        const nextIds = exists ? ids.filter((id) => id !== product.id) : [...ids, product.id];
        writeGuestWishlist(nextIds);
        setItems(mockProducts.filter((entry) => nextIds.includes(entry.id)));
      },
    }),
    [isAuthenticated, items, loading]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}
