import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { z } from "zod";
import {
  createCollection,
  createCoupon,
  createProduct,
  deleteProduct,
  getAdminCoupons,
  getAdminDashboard,
  getAdminOrders,
  getAdminProductInventory,
  getAdminReviews,
  getAdminUsers,
  moderateReview,
  setAdminUserStatus,
  uploadOwnerProductImages,
  updateAdminProductInventory,
} from "../api/adminApi";
import { getCollections, getProducts } from "../api/catalogApi";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";
import { formatDisplayDate } from "../utils/dateHelpers";
import { formatPrice } from "../utils/formatPrice";

const adminLinks = [
  {
    key: "overview",
    label: "Overview",
    href: "/owner",
    eyebrow: "Pulse",
    description: "Revenue, customers, and inventory health.",
  },
  {
    key: "products",
    label: "Products",
    href: "/owner/products",
    eyebrow: "Catalog",
    description: "Add new pieces and remove stale stock.",
  },
  {
    key: "collections",
    label: "Collections",
    href: "/owner/collections",
    eyebrow: "Merchandising",
    description: "Shape storefront discovery and curation.",
  },
  {
    key: "orders",
    label: "Orders",
    href: "/owner/orders",
    eyebrow: "Fulfillment",
    description: "Track order flow and payment mix.",
  },
  {
    key: "users",
    label: "Users",
    href: "/owner/users",
    eyebrow: "Customers",
    description: "Review accounts and access status.",
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/owner/reviews",
    eyebrow: "Moderation",
    description: "Approve or reject customer feedback.",
  },
  {
    key: "coupons",
    label: "Coupons",
    href: "/owner/coupons",
    eyebrow: "Promotions",
    description: "Launch offers and campaign codes.",
  },
];

const productSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  metal: z.string().min(1),
  basePrice: z.coerce.number().min(1000),
  mrp: z.coerce.number().min(1000),
  stockQty: z.coerce.number().min(0),
  weightGrams: z.coerce.number().min(0.1),
  primaryCollectionId: z.string().min(1),
});

const collectionSchema = z.object({
  name: z.string().min(2),
  handle: z.string().min(2),
  description: z.string().min(5),
  bannerImageUrl: z.string().url(),
});

const couponSchema = z.object({
  code: z.string().min(3),
  discountType: z.enum(["PERCENT", "FLAT"]),
  discountValue: z.coerce.number().min(1),
  minOrderValue: z.coerce.number().min(0),
  validFrom: z.string().min(1),
  validUntil: z.string().min(1),
});

const defaultProductValues = {
  name: "",
  description: "",
  metal: "SILVER",
  basePrice: 299900,
  mrp: 349900,
  stockQty: 10,
  weightGrams: 8.5,
  primaryCollectionId: "",
};

const defaultCollectionValues = {
  name: "",
  handle: "",
  description: "",
  bannerImageUrl: "https://placehold.co/1600x720/png?text=Collection",
};

function toDateTimeInputValue(value) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function buildDefaultCouponValues() {
  return {
    code: "",
    discountType: "PERCENT",
    discountValue: 10,
    minOrderValue: 199900,
    validFrom: toDateTimeInputValue(new Date()),
    validUntil: toDateTimeInputValue(new Date(Date.now() + 30 * 86400000)),
  };
}

function sumVariantStock(variants = []) {
  return variants.reduce((total, variant) => total + Number(variant.stockQty || 0), 0);
}

function resolveAdminSection(pathname) {
  const segment = pathname.split("/")[2];
  return adminLinks.some((link) => link.key === segment) ? segment : "overview";
}

function extractRequestError(error, fallbackMessage) {
  const responseData = error?.response?.data;
  if (Array.isArray(responseData?.errors) && responseData.errors.length) {
    return responseData.errors.join(" ");
  }
  if (typeof responseData?.message === "string" && responseData.message.trim()) {
    return responseData.message;
  }
  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }
  return fallbackMessage;
}

function PanelSection({ id, eyebrow, title, description, children }) {
  return (
    <section id={id} className="rounded-[2.5rem] bg-white p-6 shadow-soft md:p-8">
      <div className="border-b border-ink/8 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-4xl text-ink md:text-5xl">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-copy/72">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, caption }) {
  return (
    <div className="rounded-[2rem] border border-ink/8 bg-cream/60 p-5">
      <p className="text-sm text-copy/60">{label}</p>
      <p className="mt-3 font-display text-4xl text-ink">{value}</p>
      {caption ? (
        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-copy/45">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-ink/12 bg-cream/40 px-5 py-8 text-sm text-copy/65">
      {message}
    </div>
  );
}

function StatusPill({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-ink/6 text-ink/70",
    success: "bg-emerald-100 text-emerald-800",
    caution: "bg-amber-100 text-amber-800",
    accent: "bg-accent/18 text-ink",
    danger: "bg-rose-100 text-rose-800",
  };

  return (
    <span className={`rounded-full px-3 py-2 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function AdminDashboardPage() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const activeSection = resolveAdminSection(location.pathname);
  const storefrontUrl =
    import.meta.env.VITE_STOREFRONT_URL || "http://localhost:5173";
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [collections, setCollections] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [inventoryEditor, setInventoryEditor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState("");
  const [error, setError] = useState("");
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const productForm = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: defaultProductValues,
  });
  const collectionForm = useForm({
    resolver: zodResolver(collectionSchema),
    defaultValues: defaultCollectionValues,
  });
  const couponForm = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: buildDefaultCouponValues(),
  });

  async function refreshDashboard() {
    const data = await getAdminDashboard();
    setStats(data);
  }

  async function refreshCatalog() {
    const [productData, collectionData] = await Promise.all([
      getProducts({ size: 20 }),
      getCollections(),
    ]);
    setProducts(productData.items || []);
    setCollections(collectionData || []);
  }

  async function refreshOrders() {
    const data = await getAdminOrders({ page: 0, size: 20 });
    setOrders(data.items || []);
  }

  async function refreshUsers() {
    const data = await getAdminUsers();
    setUsers(data || []);
  }

  async function refreshReviews() {
    const data = await getAdminReviews();
    setReviews(data || []);
  }

  async function refreshCoupons() {
    const data = await getAdminCoupons();
    setCoupons(data || []);
  }

  async function openInventoryEditor(productId) {
    if (inventoryEditor?.id === productId) {
      setInventoryEditor(null);
      return;
    }

    setBusyAction(`load-inventory-${productId}`);
    setError("");
    try {
      const data = await getAdminProductInventory(productId);
      setInventoryEditor(data);
    } catch (actionError) {
      setError("Inventory details could not be loaded for this product.");
    } finally {
      setBusyAction("");
    }
  }

  function updateInventoryField(field, value) {
    setInventoryEditor((current) =>
      current
        ? {
            ...current,
            [field]: value,
          }
        : current
    );
  }

  function updateInventoryVariant(variantId, field, value) {
    setInventoryEditor((current) =>
      current
        ? {
            ...current,
            variants: current.variants.map((variant) =>
              variant.id === variantId
                ? {
                    ...variant,
                    [field]: value,
                  }
                : variant
            ),
          }
        : current
    );
  }

  async function saveInventoryEditor() {
    if (!inventoryEditor) {
      return;
    }

    const resolvedStockQty = inventoryEditor.variants.length
      ? sumVariantStock(inventoryEditor.variants)
      : Number(inventoryEditor.stockQty || 0);

    setBusyAction(`save-inventory-${inventoryEditor.id}`);
    setError("");
    try {
      const updated = await updateAdminProductInventory(inventoryEditor.id, {
        basePrice: Number(inventoryEditor.basePrice),
        mrp: Number(inventoryEditor.mrp),
        stockQty: resolvedStockQty,
        active: inventoryEditor.active,
        variants: inventoryEditor.variants.map((variant) => ({
          id: variant.id,
          price: Number(variant.price),
          stockQty: Number(variant.stockQty),
        })),
      });
      setInventoryEditor(updated);
      await Promise.all([refreshCatalog(), refreshDashboard()]);
    } catch (actionError) {
      setError("Stock and price update failed. Check the values and try again.");
    } finally {
      setBusyAction("");
    }
  }

  async function refreshAll() {
    setLoading(true);
    setError("");

    const results = await Promise.allSettled([
      getAdminDashboard(),
      Promise.all([getProducts({ size: 20 }), getCollections()]),
      getAdminOrders({ page: 0, size: 20 }),
      getAdminUsers(),
      getAdminReviews(),
      getAdminCoupons(),
    ]);

    const [
      dashboardResult,
      catalogResult,
      ordersResult,
      usersResult,
      reviewsResult,
      couponsResult,
    ] = results;

    if (dashboardResult.status === "fulfilled") {
      setStats(dashboardResult.value);
    }

    if (catalogResult.status === "fulfilled") {
      setProducts(catalogResult.value[0].items || []);
      setCollections(catalogResult.value[1] || []);
    }

    if (ordersResult.status === "fulfilled") {
      setOrders(ordersResult.value.items || []);
    }

    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value || []);
    }

    if (reviewsResult.status === "fulfilled") {
      setReviews(reviewsResult.value || []);
    }

    if (couponsResult.status === "fulfilled") {
      setCoupons(couponsResult.value || []);
    }

    if (results.every((result) => result.status === "rejected")) {
      setError(
        "The owner panel could not load. Check that the backend is running and your owner session is valid."
      );
    }

    setLastSyncedAt(new Date());
    setLoading(false);
  }

  useEffect(() => {
    refreshAll();
  }, []);

  useEffect(() => {
    if (collections.length > 0 && !productForm.getValues("primaryCollectionId")) {
      productForm.setValue("primaryCollectionId", collections[0].id);
    }
  }, [collections, productForm]);

  useEffect(() => {
    const targetId =
      activeSection === "overview" ? "admin-top" : `admin-section-${activeSection}`;
    const target = document.getElementById(targetId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeSection]);

  const pulseCards = [
    {
      label: "Revenue",
      value: stats ? formatPrice(stats.totalRevenue) : loading ? "Syncing" : "-",
      caption: "gross sales",
    },
    {
      label: "Orders Today",
      value: stats?.ordersToday ?? (loading ? "Syncing" : "-"),
      caption: "today",
    },
    {
      label: "Active Users",
      value: stats?.activeUsers ?? (loading ? "Syncing" : "-"),
      caption: "enabled accounts",
    },
    {
      label: "Low Stock",
      value: stats?.lowStockProducts ?? (loading ? "Syncing" : "-"),
      caption: "watch list",
    },
  ];

  return (
    <section className="section-shell py-8 md:py-10">
      <div id="admin-top" className="grid gap-6 xl:grid-cols-[280px,minmax(0,1fr)]">
        <aside className="self-start rounded-[2.5rem] bg-ink p-6 text-white shadow-soft xl:sticky xl:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
            Aurora Owner Desk
          </p>
          <h1 className="mt-4 font-display text-4xl leading-none md:text-5xl">
            Manage the full storefront from one panel.
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/74">
            Catalog, promotions, customers, moderation, and the order book now
            live in a single owner surface.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="accent"
              className="min-w-[120px]"
              onClick={refreshAll}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
            <Button
              as="a"
              href={storefrontUrl}
              target="_blank"
              rel="noreferrer"
              variant="secondary"
              className="min-w-[120px] border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
            >
              View Store
            </Button>
          </div>

          <div className="mt-8 space-y-2">
            {adminLinks.map((link) => {
              const isActive = activeSection === link.key;
              return (
                <Link
                  key={link.key}
                  to={link.href}
                  className={`block rounded-[1.5rem] px-4 py-4 transition ${
                    isActive
                      ? "bg-white text-ink"
                      : "bg-white/6 text-white/82 hover:bg-white/12"
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60">
                    {link.eyebrow}
                  </p>
                  <p className="mt-1 font-semibold">{link.label}</p>
                  <p className="mt-2 text-sm leading-5 opacity-70">
                    {link.description}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-[1.75rem] bg-white/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/58">
              Session
            </p>
            <p className="mt-2 font-semibold">{user?.name}</p>
            <p className="text-sm text-white/70">{user?.email}</p>
            <p className="mt-4 text-xs uppercase tracking-[0.18em] text-white/58">
              Last sync
            </p>
            <p className="mt-2 text-sm text-white/80">
              {lastSyncedAt
                ? lastSyncedAt.toLocaleTimeString("en-IN")
                : "Waiting for first fetch"}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-5 w-full border-white/20 bg-white/10 text-white hover:bg-white/15 hover:text-white"
              onClick={logout}
            >
              Sign Out
            </Button>
          </div>
        </aside>

        <div className="space-y-6">
          {error ? (
            <div className="rounded-[2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <PanelSection
            id="admin-section-overview"
            eyebrow="Snapshot"
            title="One place to run the customer site."
            description="This panel keeps the current operational picture visible while letting you change the live shopping experience without leaving the page."
          >
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {pulseCards.map((card) => (
                <MetricCard
                  key={card.label}
                  label={card.label}
                  value={card.value}
                  caption={card.caption}
                />
              ))}
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-[2rem] border border-ink/8 p-5">
                <p className="text-sm text-copy/60">Products live</p>
                <p className="mt-3 font-display text-4xl text-ink">
                  {products.length}
                </p>
              </div>
              <div className="rounded-[2rem] border border-ink/8 p-5">
                <p className="text-sm text-copy/60">Collections</p>
                <p className="mt-3 font-display text-4xl text-ink">
                  {collections.length}
                </p>
              </div>
              <div className="rounded-[2rem] border border-ink/8 p-5">
                <p className="text-sm text-copy/60">Recent orders loaded</p>
                <p className="mt-3 font-display text-4xl text-ink">
                  {orders.length}
                </p>
              </div>
              <div className="rounded-[2rem] border border-ink/8 p-5">
                <p className="text-sm text-copy/60">Pending reviews</p>
                <p className="mt-3 font-display text-4xl text-ink">
                  {reviews.length}
                </p>
              </div>
            </div>
          </PanelSection>

          <PanelSection
            id="admin-section-products"
            eyebrow="Catalog"
            title="Products"
            description="Keep the assortment fresh, control product pricing, and remove stale items from the live storefront."
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),380px]">
              <div className="space-y-4">
                {products.length ? (
                  products.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-[2rem] border border-ink/8 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-ink">{product.name}</p>
                          <p className="mt-1 text-sm text-copy/58">{product.slug}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <StatusPill tone="accent">{product.metal}</StatusPill>
                            <StatusPill
                              tone={product.active ? "success" : "caution"}
                            >
                              {product.active ? "Live" : "Hidden"}
                            </StatusPill>
                            {product.sale ? (
                              <StatusPill tone="caution">On Sale</StatusPill>
                            ) : null}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-ink">
                            {formatPrice(product.price)}
                          </p>
                          <p className="mt-1 text-sm text-copy/60">
                            MRP {formatPrice(product.mrp)}
                          </p>
                          <div className="mt-4 flex flex-wrap justify-end gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              disabled={busyAction === `load-inventory-${product.id}`}
                              onClick={() => openInventoryEditor(product.id)}
                            >
                              {busyAction === `load-inventory-${product.id}`
                                ? "Loading..."
                                : inventoryEditor?.id === product.id
                                  ? "Close Editor"
                                  : "Edit Stock & Price"}
                            </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={busyAction === `delete-product-${product.id}`}
                            onClick={async () => {
                              setBusyAction(`delete-product-${product.id}`);
                              setError("");
                              try {
                                await deleteProduct(product.id);
                                await Promise.all([
                                  refreshCatalog(),
                                  refreshDashboard(),
                                ]);
                              } catch (actionError) {
                                setError(
                                  "Product deletion failed. The backend rejected the request."
                                );
                              } finally {
                                setBusyAction("");
                              }
                            }}
                          >
                            {busyAction === `delete-product-${product.id}`
                              ? "Deleting..."
                              : "Delete"}
                          </Button>
                          </div>
                        </div>
                      </div>
                      {inventoryEditor?.id === product.id ? (
                        <div className="mt-5 rounded-[1.75rem] bg-cream/60 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copy/45">
                                Inventory Editor
                              </p>
                              <p className="mt-2 font-semibold text-ink">
                                {inventoryEditor.name}
                              </p>
                              <p className="mt-1 text-sm text-copy/60">
                                {inventoryEditor.primaryCollectionName || "No collection"}
                              </p>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-copy/72">
                              <input
                                type="checkbox"
                                checked={inventoryEditor.active}
                                onChange={(event) =>
                                  updateInventoryField("active", event.target.checked)
                                }
                              />
                              Product live
                            </label>
                          </div>

                          <div className="mt-5 grid gap-3 md:grid-cols-3">
                            <label className="text-sm text-copy/65">
                              <span className="mb-2 block">Base price (paise)</span>
                              <input
                                className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                                value={inventoryEditor.basePrice}
                                onChange={(event) =>
                                  updateInventoryField("basePrice", event.target.value)
                                }
                              />
                            </label>
                            <label className="text-sm text-copy/65">
                              <span className="mb-2 block">MRP (paise)</span>
                              <input
                                className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                                value={inventoryEditor.mrp}
                                onChange={(event) =>
                                  updateInventoryField("mrp", event.target.value)
                                }
                              />
                            </label>
                            <label className="text-sm text-copy/65">
                              <span className="mb-2 block">Total stock</span>
                              <input
                                className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                                value={
                                  inventoryEditor.variants.length
                                    ? sumVariantStock(inventoryEditor.variants)
                                    : inventoryEditor.stockQty
                                }
                                readOnly={inventoryEditor.variants.length > 0}
                                onChange={(event) =>
                                  updateInventoryField("stockQty", event.target.value)
                                }
                              />
                            </label>
                          </div>

                          {inventoryEditor.variants.length ? (
                            <div className="mt-5 space-y-3">
                              {inventoryEditor.variants.map((variant) => (
                                <div
                                  key={variant.id}
                                  className="grid gap-3 rounded-[1.5rem] border border-ink/8 bg-white p-4 md:grid-cols-[minmax(0,1fr),160px,140px]"
                                >
                                  <div>
                                    <p className="font-medium text-ink">
                                      {variant.sku}
                                    </p>
                                    <p className="mt-1 text-sm text-copy/58">
                                      {variant.colour}
                                      {variant.size ? ` • ${variant.size}` : ""}
                                    </p>
                                  </div>
                                  <label className="text-sm text-copy/65">
                                    <span className="mb-2 block">Variant price</span>
                                    <input
                                      className="w-full rounded-full border border-ink/10 px-4 py-3"
                                      value={variant.price}
                                      onChange={(event) =>
                                        updateInventoryVariant(
                                          variant.id,
                                          "price",
                                          event.target.value
                                        )
                                      }
                                    />
                                  </label>
                                  <label className="text-sm text-copy/65">
                                    <span className="mb-2 block">Variant stock</span>
                                    <input
                                      className="w-full rounded-full border border-ink/10 px-4 py-3"
                                      value={variant.stockQty}
                                      onChange={(event) =>
                                        updateInventoryVariant(
                                          variant.id,
                                          "stockQty",
                                          event.target.value
                                        )
                                      }
                                    />
                                  </label>
                                </div>
                              ))}
                            </div>
                          ) : null}

                          <div className="mt-5 flex flex-wrap gap-3">
                            <Button
                              type="button"
                              disabled={busyAction === `save-inventory-${product.id}`}
                              onClick={saveInventoryEditor}
                            >
                              {busyAction === `save-inventory-${product.id}`
                                ? "Saving..."
                                : "Save Stock & Price"}
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => setInventoryEditor(null)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <EmptyState message="No products are loaded yet." />
                )}
              </div>

              <div className="rounded-[2rem] bg-cream/60 p-5">
                <h3 className="font-display text-3xl text-ink">Create Product</h3>
                <p className="mt-2 text-sm leading-6 text-copy/68">
                  Add a new SKU straight into the live catalog. Create a
                  collection first if none exist yet.
                </p>

                <form
                  className="mt-6 space-y-3"
                  onSubmit={productForm.handleSubmit(async (values) => {
                    setBusyAction("create-product");
                    setError("");
                    const selectedCollectionId = values.primaryCollectionId;
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
                        primaryCollectionId: selectedCollectionId,
                        collectionIds: [selectedCollectionId],
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
                      productForm.reset({
                        ...defaultProductValues,
                        primaryCollectionId: selectedCollectionId,
                      });
                      setImageFiles([]);
                      await Promise.all([refreshCatalog(), refreshDashboard()]);
                    } catch (actionError) {
                      setError(
                        extractRequestError(
                          actionError,
                          "Product creation failed. Check the form values and owner access."
                        )
                      );
                    } finally {
                      setBusyAction("");
                    }
                  })}
                >
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Name"
                    {...productForm.register("name")}
                  />
                  <textarea
                    className="w-full rounded-[1.5rem] border border-ink/10 bg-white px-5 py-3"
                    rows="4"
                    placeholder="Description"
                    {...productForm.register("description")}
                  />
                  <select
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    {...productForm.register("metal")}
                  >
                    {["SILVER", "GOLD", "GOLD_PLATED", "LAB_DIAMOND"].map(
                      (metal) => (
                        <option key={metal} value={metal}>
                          {metal}
                        </option>
                      )
                    )}
                  </select>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="rounded-full border border-ink/10 bg-white px-5 py-3"
                      placeholder="Base price (paise)"
                      {...productForm.register("basePrice")}
                    />
                    <input
                      className="rounded-full border border-ink/10 bg-white px-5 py-3"
                      placeholder="MRP (paise)"
                      {...productForm.register("mrp")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="rounded-full border border-ink/10 bg-white px-5 py-3"
                      placeholder="Stock qty"
                      {...productForm.register("stockQty")}
                    />
                    <input
                      className="rounded-full border border-ink/10 bg-white px-5 py-3"
                      placeholder="Weight grams"
                      {...productForm.register("weightGrams")}
                    />
                  </div>
                  <select
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    {...productForm.register("primaryCollectionId")}
                    disabled={!collections.length}
                  >
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
                    onChange={(event) =>
                      setImageFiles(Array.from(event.target.files || []))
                    }
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
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={busyAction === "create-product" || !collections.length}
                  >
                    {busyAction === "create-product"
                      ? "Creating..."
                      : "Create Product"}
                  </Button>
                </form>
              </div>
            </div>
          </PanelSection>

          <PanelSection
            id="admin-section-collections"
            eyebrow="Merchandising"
            title="Collections"
            description="Control the browsing structure that customers see first on the storefront."
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
              <div className="space-y-4">
                {collections.length ? (
                  collections.map((collection) => (
                    <div
                      key={collection.id}
                      className="rounded-[2rem] border border-ink/8 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-ink">{collection.name}</p>
                          <p className="mt-1 text-sm text-copy/58">
                            /{collection.handle}
                          </p>
                        </div>
                        <StatusPill tone={collection.active ? "success" : "caution"}>
                          {collection.active ? "Active" : "Inactive"}
                        </StatusPill>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-copy/68">
                        {collection.description}
                      </p>
                      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-copy/45">
                        {collection.productCount} products
                      </p>
                    </div>
                  ))
                ) : (
                  <EmptyState message="Collections have not been created yet." />
                )}
              </div>

              <div className="rounded-[2rem] bg-cream/60 p-5">
                <h3 className="font-display text-3xl text-ink">
                  Create Collection
                </h3>
                <p className="mt-2 text-sm leading-6 text-copy/68">
                  Use collections to shape home page curation, seasonal edits,
                  and gifting stories.
                </p>

                <form
                  className="mt-6 space-y-3"
                  onSubmit={collectionForm.handleSubmit(async (values) => {
                    setBusyAction("create-collection");
                    setError("");
                    try {
                      const createdCollection = await createCollection({
                        ...values,
                        active: true,
                        sortOrder: collections.length + 1,
                      });
                      collectionForm.reset(defaultCollectionValues);
                      await refreshCatalog();
                      productForm.setValue(
                        "primaryCollectionId",
                        createdCollection.id
                      );
                    } catch (actionError) {
                      setError(
                        "Collection creation failed. Check the handle and try again."
                      );
                    } finally {
                      setBusyAction("");
                    }
                  })}
                >
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Name"
                    {...collectionForm.register("name")}
                  />
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Handle"
                    {...collectionForm.register("handle")}
                  />
                  <textarea
                    className="w-full rounded-[1.5rem] border border-ink/10 bg-white px-5 py-3"
                    rows="4"
                    placeholder="Description"
                    {...collectionForm.register("description")}
                  />
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Banner image URL"
                    {...collectionForm.register("bannerImageUrl")}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={busyAction === "create-collection"}
                  >
                    {busyAction === "create-collection"
                      ? "Saving..."
                      : "Save Collection"}
                  </Button>
                </form>
              </div>
            </div>
          </PanelSection>

          <PanelSection
            id="admin-section-orders"
            eyebrow="Fulfillment"
            title="Recent Orders"
            description="A quick operational view of checkout flow, payment method mix, and order status."
          >
            <div className="space-y-4">
              {orders.length ? (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[2rem] border border-ink/8 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">
                          #{order.id.slice(0, 8)}
                        </p>
                        <p className="mt-1 text-sm text-copy/58">
                          {formatDisplayDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusPill tone="accent">{order.paymentMethod}</StatusPill>
                        <StatusPill
                          tone={order.status === "DELIVERED" ? "success" : "caution"}
                        >
                          {order.status}
                        </StatusPill>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 text-sm text-copy/70 md:grid-cols-3">
                      <div>
                        <p className="text-copy/50">Subtotal</p>
                        <p className="mt-1 font-semibold text-ink">
                          {formatPrice(order.subtotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-copy/50">Discount</p>
                        <p className="mt-1 font-semibold text-ink">
                          {formatPrice(order.discount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-copy/50">Total</p>
                        <p className="mt-1 font-semibold text-ink">
                          {formatPrice(order.total)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="Recent orders will appear here once customers start checking out." />
              )}
            </div>
          </PanelSection>

          <PanelSection
            id="admin-section-users"
            eyebrow="Customers"
            title="Users"
            description="Review the customer base, spot the owner account, and quickly disable abusive or test users."
          >
            <div className="space-y-4">
              {users.length ? (
                users.map((siteUser) => (
                  <div
                    key={siteUser.id}
                    className="rounded-[2rem] border border-ink/8 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">{siteUser.name}</p>
                        <p className="mt-1 text-sm text-copy/58">{siteUser.email}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <StatusPill
                            tone={siteUser.role === "OWNER" ? "accent" : "neutral"}
                          >
                            {siteUser.role}
                          </StatusPill>
                          <StatusPill
                            tone={siteUser.enabled ? "success" : "danger"}
                          >
                            {siteUser.enabled ? "Enabled" : "Blocked"}
                          </StatusPill>
                        </div>
                        <p className="mt-4 text-xs uppercase tracking-[0.18em] text-copy/45">
                          Joined {formatDisplayDate(siteUser.createdAt)}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant={siteUser.enabled ? "secondary" : "accent"}
                        disabled={busyAction === `toggle-user-${siteUser.id}`}
                        onClick={async () => {
                          setBusyAction(`toggle-user-${siteUser.id}`);
                          setError("");
                          try {
                            await setAdminUserStatus(
                              siteUser.id,
                              !siteUser.enabled
                            );
                            await Promise.all([refreshUsers(), refreshDashboard()]);
                          } catch (actionError) {
                            setError(
                              "User status update failed. The backend rejected the change."
                            );
                          } finally {
                            setBusyAction("");
                          }
                        }}
                      >
                        {busyAction === `toggle-user-${siteUser.id}`
                          ? "Saving..."
                          : siteUser.enabled
                            ? "Ban User"
                            : "Unban User"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="User accounts will appear here after sign-up." />
              )}
            </div>
          </PanelSection>

          <PanelSection
            id="admin-section-reviews"
            eyebrow="Moderation"
            title="Reviews"
            description="Approve reviews that strengthen trust and reject low-quality or abusive submissions before they go public."
          >
            <div className="space-y-4">
              {reviews.length ? (
                reviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[2rem] border border-ink/8 p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">{review.userName}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.18em] text-copy/45">
                          {review.rating} stars • {formatDisplayDate(review.createdAt)}
                        </p>
                      </div>
                      <StatusPill tone={review.approved ? "success" : "caution"}>
                        {review.approved ? "Approved" : "Pending"}
                      </StatusPill>
                    </div>
                    {review.title ? (
                      <p className="mt-4 font-medium text-ink">{review.title}</p>
                    ) : null}
                    <p className="mt-2 text-sm leading-6 text-copy/72">
                      {review.body}
                    </p>
                    <div className="mt-5 flex flex-wrap gap-3">
                      <Button
                        type="button"
                        disabled={busyAction === `review-approve-${review.id}`}
                        onClick={async () => {
                          setBusyAction(`review-approve-${review.id}`);
                          setError("");
                          try {
                            await moderateReview(review.id, { approved: true });
                            await refreshReviews();
                          } catch (actionError) {
                            setError("Review approval failed. Try again.");
                          } finally {
                            setBusyAction("");
                          }
                        }}
                      >
                        {busyAction === `review-approve-${review.id}`
                          ? "Approving..."
                          : "Approve"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={busyAction === `review-reject-${review.id}`}
                        onClick={async () => {
                          setBusyAction(`review-reject-${review.id}`);
                          setError("");
                          try {
                            await moderateReview(review.id, { approved: false });
                            await refreshReviews();
                          } catch (actionError) {
                            setError("Review rejection failed. Try again.");
                          } finally {
                            setBusyAction("");
                          }
                        }}
                      >
                        {busyAction === `review-reject-${review.id}`
                          ? "Rejecting..."
                          : "Reject"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState message="There are no pending reviews right now." />
              )}
            </div>
          </PanelSection>

          <PanelSection
            id="admin-section-coupons"
            eyebrow="Promotions"
            title="Coupons"
            description="Create offer codes without leaving the admin flow and keep current campaign performance visible."
          >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
              <div className="space-y-4">
                {coupons.length ? (
                  coupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="rounded-[2rem] border border-ink/8 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-ink">{coupon.code}</p>
                          <p className="mt-1 text-sm text-copy/58">
                            {coupon.discountType} • {coupon.discountValue}
                          </p>
                        </div>
                        <StatusPill tone={coupon.active ? "success" : "caution"}>
                          {coupon.active ? "Active" : "Inactive"}
                        </StatusPill>
                      </div>
                      <div className="mt-4 grid gap-3 text-sm text-copy/70 md:grid-cols-3">
                        <div>
                          <p className="text-copy/50">Minimum order</p>
                          <p className="mt-1 font-semibold text-ink">
                            {formatPrice(coupon.minOrderValue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-copy/50">Uses</p>
                          <p className="mt-1 font-semibold text-ink">
                            {coupon.usedCount}
                            {coupon.maxUses ? ` / ${coupon.maxUses}` : ""}
                          </p>
                        </div>
                        <div>
                          <p className="text-copy/50">Valid until</p>
                          <p className="mt-1 font-semibold text-ink">
                            {formatDisplayDate(coupon.validUntil)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState message="No coupons exist yet." />
                )}
              </div>

              <div className="rounded-[2rem] bg-cream/60 p-5">
                <h3 className="font-display text-3xl text-ink">Create Coupon</h3>
                <p className="mt-2 text-sm leading-6 text-copy/68">
                  Launch a discount code quickly for a sale, a collection drop,
                  or a retention campaign.
                </p>

                <form
                  className="mt-6 space-y-3"
                  onSubmit={couponForm.handleSubmit(async (values) => {
                    setBusyAction("create-coupon");
                    setError("");
                    try {
                      await createCoupon({
                        ...values,
                        validFrom: new Date(values.validFrom).toISOString(),
                        validUntil: new Date(values.validUntil).toISOString(),
                        active: true,
                      });
                      couponForm.reset(buildDefaultCouponValues());
                      await refreshCoupons();
                    } catch (actionError) {
                      setError("Coupon creation failed. Check the dates and code.");
                    } finally {
                      setBusyAction("");
                    }
                  })}
                >
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Code"
                    {...couponForm.register("code")}
                  />
                  <select
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    {...couponForm.register("discountType")}
                  >
                    <option value="PERCENT">Percent</option>
                    <option value="FLAT">Flat</option>
                  </select>
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Discount value"
                    {...couponForm.register("discountValue")}
                  />
                  <input
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    placeholder="Minimum order value (paise)"
                    {...couponForm.register("minOrderValue")}
                  />
                  <input
                    type="datetime-local"
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    {...couponForm.register("validFrom")}
                  />
                  <input
                    type="datetime-local"
                    className="w-full rounded-full border border-ink/10 bg-white px-5 py-3"
                    {...couponForm.register("validUntil")}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={busyAction === "create-coupon"}
                  >
                    {busyAction === "create-coupon"
                      ? "Saving..."
                      : "Save Coupon"}
                  </Button>
                </form>
              </div>
            </div>
          </PanelSection>
        </div>
      </div>
    </section>
  );
}
