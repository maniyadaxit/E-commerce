import { useEffect, useState } from "react";
import { getCollections } from "../api/catalogApi";

export function useStoreCollections(limit) {
  const [collections, setCollections] = useState([]);

  useEffect(() => {
    let active = true;

    async function loadCollections() {
      try {
        const data = await getCollections();
        if (!active) {
          return;
        }
        setCollections(limit ? (data || []).slice(0, limit) : data || []);
      } catch {
        if (active) {
          setCollections([]);
        }
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        loadCollections();
      }
    }

    loadCollections();

    const intervalId = window.setInterval(loadCollections, 30000);
    window.addEventListener("focus", loadCollections);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      active = false;
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadCollections);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [limit]);

  return collections;
}
