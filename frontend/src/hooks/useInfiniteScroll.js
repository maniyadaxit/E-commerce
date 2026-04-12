import { useEffect, useRef } from "react";

export function useInfiniteScroll(onIntersect, enabled = true) {
  const ref = useRef(null);

  useEffect(() => {
    if (!enabled || !ref.current) return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            onIntersect();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, onIntersect]);

  return ref;
}
