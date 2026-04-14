import { useEffect, useState } from "react";

export function ImageGallery({ images = [] }) {
  const [active, setActive] = useState(images[0]?.url);

  useEffect(() => {
    setActive(images[0]?.url || "");
  }, [images]);

  if (!images.length) {
    return (
      <div className="rounded-[2rem] border border-dashed border-ink/12 bg-white px-6 py-12 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
          Product Media
        </p>
        <p className="mt-3 text-sm leading-7 text-copy/72">
          Images for this product have not been added yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-[2rem] bg-white shadow-soft">
        <img
          src={active || images[0]?.url}
          alt="Selected product"
          className="aspect-[4/5] w-full object-cover transition hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {images.map((image) => (
          <button
            key={image.id || image.url}
            type="button"
            className={`overflow-hidden rounded-2xl border ${active === image.url ? "border-accent" : "border-ink/10"}`}
            onClick={() => setActive(image.url)}
          >
            <img
              src={image.url}
              alt={image.altText || "Product thumbnail"}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
