import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  createProduct,
  deleteProduct,
  uploadOwnerProductImages,
} from "../api/adminApi";
import { getCollections, getProducts } from "../api/catalogApi";
import { Button } from "../components/ui/Button";

const schema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  metal: z.string().min(1),
  basePrice: z.coerce.number().min(1000),
  mrp: z.coerce.number().min(1000),
  stockQty: z.coerce.number().min(0),
  weightGrams: z.coerce.number().min(0.1),
  primaryCollectionId: z.string().min(1),
});

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      metal: "SILVER",
      basePrice: 299900,
      mrp: 349900,
      stockQty: 10,
      weightGrams: 8.5,
      primaryCollectionId: "",
    },
  });

  const refresh = async () => {
    const [productData, collectionData] = await Promise.all([
      getProducts({ size: 20 }),
      getCollections(),
    ]);
    setProducts(productData.items || []);
    setCollections(collectionData || []);
  };

  useEffect(() => {
    refresh().catch(() => {
      setProducts([]);
      setCollections([]);
    });
  }, []);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-ink">Products</h1>
          {products.map((product) => (
            <div key={product.id} className="rounded-[2rem] bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-ink">{product.name}</p>
                  <p className="text-sm text-copy/60">{product.slug}</p>
                </div>
                <Button variant="secondary" onClick={() => deleteProduct(product.id).then(refresh)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <h2 className="font-display text-4xl text-ink">Add Product</h2>
          <form
            className="mt-6 space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              setBusy(true);
              setError("");
              try {
                if (!imageFiles.length) {
                  throw new Error("Upload at least one product image before creating the product.");
                }

                const uploads = await uploadOwnerProductImages(imageFiles);
                await createProduct({
                  name: values.name,
                  description: values.description,
                  metal: values.metal,
                  basePrice: values.basePrice,
                  mrp: values.mrp,
                  bestseller: true,
                  active: true,
                  allowCustomization: false,
                  stockQty: values.stockQty,
                  weightGrams: values.weightGrams,
                  primaryCollectionId: values.primaryCollectionId,
                  collectionIds: [values.primaryCollectionId],
                  variants: [
                    {
                      colour: "SILVER",
                      size: null,
                      sku: `SKU-${Date.now()}`,
                      stockQty: values.stockQty,
                    },
                  ],
                  images: [
                    ...uploads.map((upload, index) => ({
                      colour: null,
                      url: upload.url,
                      altText:
                        index === 0
                          ? `${values.name} main view`
                          : `${values.name} angle ${index + 1}`,
                      sortOrder: index + 1,
                      primary: index === 0,
                    })),
                  ],
                  attributes: {
                    style: ["Everyday"],
                    recipient: ["For Her"],
                  },
                });
                form.reset();
                setImageFiles([]);
                await refresh();
              } catch (actionError) {
                setError(
                  actionError?.response?.data?.message ||
                    actionError?.message ||
                    "Product creation failed. Check the form values and owner access."
                );
              } finally {
                setBusy(false);
              }
            })}
          >
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Name" {...form.register("name")} />
            <textarea className="w-full rounded-[1.5rem] border border-ink/10 px-5 py-3" rows="4" placeholder="Description" {...form.register("description")} />
            <select className="w-full rounded-full border border-ink/10 px-5 py-3" {...form.register("metal")}>
              {["SILVER", "GOLD", "GOLD_PLATED", "LAB_DIAMOND"].map((metal) => (
                <option key={metal} value={metal}>
                  {metal}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-full border border-ink/10 px-5 py-3" placeholder="Base price (paise)" {...form.register("basePrice")} />
              <input className="rounded-full border border-ink/10 px-5 py-3" placeholder="MRP (paise)" {...form.register("mrp")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-full border border-ink/10 px-5 py-3" placeholder="Stock qty" {...form.register("stockQty")} />
              <input className="rounded-full border border-ink/10 px-5 py-3" placeholder="Weight grams" {...form.register("weightGrams")} />
            </div>
            <select className="w-full rounded-full border border-ink/10 px-5 py-3" {...form.register("primaryCollectionId")}>
              <option value="">Select collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => setImageFiles(Array.from(event.target.files || []))}
            />
            {imageFiles.length ? (
              <div className="rounded-[1.5rem] border border-ink/10 bg-white px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/50">
                  Selected images
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {imageFiles.map((file, index) => (
                    <span
                      key={`${file.name}-${index}`}
                      className="rounded-full bg-cream px-3 py-1 text-xs text-copy/80"
                    >
                      {index === 0 ? "Cover" : `Angle ${index + 1}`}: {file.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="text-xs text-copy/60">
              Upload multiple product images for different angles. The first image becomes the cover image on the storefront.
            </p>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              type="submit"
              className="w-full"
              disabled={busy || !collections.length}
            >
              {busy ? "Creating..." : "Create Product"}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
