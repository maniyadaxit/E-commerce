import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowUpRight,
  Bell,
  Layers3,
  LayoutDashboard,
  LogOut,
  Package2,
  RefreshCcw,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  TicketPercent,
  Users2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { z } from "zod";
import {
  createCollection,
  createCoupon,
  createProduct,
  deleteCollection,
  deleteAdminReview,
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
    icon: LayoutDashboard,
    group: "Main",
    eyebrow: "Pulse",
    description: "Revenue, customers, and inventory health.",
  },
  {
    key: "products",
    label: "Products",
    href: "/owner/products",
    icon: Package2,
    group: "Catalog",
    eyebrow: "Catalog",
    description: "Add new pieces and remove stale stock.",
  },
  {
    key: "collections",
    label: "Collections",
    href: "/owner/collections",
    icon: Layers3,
    group: "Catalog",
    eyebrow: "Merchandising",
    description: "Shape storefront discovery and curation.",
  },
  {
    key: "orders",
    label: "Orders",
    href: "/owner/orders",
    icon: ShoppingBag,
    group: "Main",
    eyebrow: "Fulfillment",
    description: "Track order flow and payment mix.",
  },
  {
    key: "users",
    label: "Users",
    href: "/owner/users",
    icon: Users2,
    group: "Customers",
    eyebrow: "Customers",
    description: "Review accounts and access status.",
  },
  {
    key: "reviews",
    label: "Reviews",
    href: "/owner/reviews",
    icon: Star,
    group: "Customers",
    eyebrow: "Moderation",
    description: "Approve or reject customer feedback.",
  },
  {
    key: "coupons",
    label: "Coupons",
    href: "/owner/coupons",
    icon: TicketPercent,
    group: "Marketing",
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

const searchPlaceholders = {
  overview: "Search products, orders, customers...",
  products: "Search products or SKU...",
  collections: "Search collection names...",
  orders: "Search order ids or payment method...",
  users: "Search name or email...",
  reviews: "Search reviewer or product...",
  coupons: "Search coupon codes...",
};

const sectionTitles = {
  overview: "Dashboard",
  products: "Products",
  collections: "Collections",
  orders: "Orders",
  users: "Customers",
  reviews: "Reviews",
  coupons: "Coupons",
};

const sectionSubtitles = {
  overview: "Daily trading pulse, moderation, and storefront readiness.",
  products: "Manage catalog launches, pricing, and inventory visibility.",
  collections: "Shape discovery and curate the way the storefront merchandises.",
  orders: "Track recent order flow, payments, and fulfillment momentum.",
  users: "Monitor customer accounts and manage access when needed.",
  reviews: "Approve, remove, and monitor the review stream with confidence.",
  coupons: "Launch and monitor promotional codes for campaigns and drops.",
};

function PanelSection({ id, eyebrow, title, description, children }) {
  return (
    <section
      id={id}
      className="overflow-hidden rounded-[1.35rem] border border-[#ede9e3] bg-white p-5 shadow-[0_16px_45px_rgba(15,23,42,0.06)] md:p-7"
    >
      <div className="border-b border-[#ede9e3] pb-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink/40">
          {eyebrow}
        </p>
        <h2 className="mt-3 font-display text-[2.1rem] leading-none text-ink md:text-[2.45rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-copy/72">{description}</p>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function MetricCard({ label, value, caption, tone = "gold" }) {
  const tones = {
    gold:
      "before:bg-[#c9956c] text-[#1a1714] bg-white border-[#ede9e3]",
    green:
      "before:bg-emerald-600 text-[#1a1714] bg-white border-[#ede9e3]",
    blue:
      "before:bg-sky-700 text-[#1a1714] bg-white border-[#ede9e3]",
    red:
      "before:bg-rose-600 text-[#1a1714] bg-white border-[#ede9e3]",
  };

  return (
    <div
      className={`relative overflow-hidden rounded-[1.1rem] border p-5 shadow-[0_12px_30px_rgba(15,23,42,0.04)] before:absolute before:right-0 before:top-0 before:h-16 before:w-16 before:rounded-bl-[2rem] before:opacity-15 ${tones[tone]}`}
    >
      <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-copy/48">
        {label}
      </p>
      <p className="mt-3 font-display text-[2.15rem] leading-none text-ink">{value}</p>
      {caption ? (
        <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.18em] text-copy/46">
          {caption}
        </p>
      ) : null}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="rounded-[1.1rem] border border-dashed border-[#d8d2c8] bg-[#faf8f5] px-5 py-8 text-sm text-copy/65">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/40">
        No records yet
      </p>
      <p className="mt-3 leading-7">{message}</p>
    </div>
  );
}

function StatusPill({ tone = "neutral", children }) {
  const tones = {
    neutral: "bg-slate-100 text-slate-700",
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    caution: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    accent: "bg-[#f5e4d0] text-[#8a5e3d] ring-1 ring-[#ecd2b5]",
    danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] ${tones[tone]}`}
    >
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
  const [workspaceSearch, setWorkspaceSearch] = useState("");

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
    const nextProducts = productData.items || [];
    const nextCollections = collectionData || [];
    const selectedCollectionId = productForm.getValues("primaryCollectionId");
    const hasSelectedCollection = nextCollections.some(
      (collection) => collection.id === selectedCollectionId
    );

    setProducts(nextProducts);
    setCollections(nextCollections);

    if (!nextCollections.length) {
      productForm.setValue("primaryCollectionId", "");
      return;
    }

    if (!hasSelectedCollection) {
      productForm.setValue("primaryCollectionId", nextCollections[0].id);
    }
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

  const pendingReviewCount = reviews.filter((review) => !review.approved).length;
  const approvedReviewCount = reviews.filter((review) => review.approved).length;
  const catalogReady = products.length > 0 && collections.length > 0;
  const activeLink =
    adminLinks.find((link) => link.key === activeSection) || adminLinks[0];
  const searchTerm = workspaceSearch.trim().toLowerCase();
  const filteredProducts = products.filter((product) =>
    searchTerm
      ? [
          product.name,
          product.slug,
          product.metal,
          product.primaryCollectionName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      : true
  );
  const filteredCollections = collections.filter((collection) =>
    searchTerm
      ? [collection.name, collection.handle, collection.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      : true
  );
  const filteredOrders = orders.filter((order) =>
    searchTerm
      ? [
          order.id,
          order.status,
          order.paymentMethod,
          order.userName,
          order.shippingName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      : true
  );
  const filteredUsers = users.filter((siteUser) =>
    searchTerm
      ? [siteUser.name, siteUser.email, siteUser.role]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      : true
  );
  const filteredReviews = reviews.filter((review) =>
    searchTerm
      ? [review.userName, review.productName, review.title, review.body]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      : true
  );
  const filteredCoupons = coupons.filter((coupon) =>
    searchTerm
      ? [coupon.code, coupon.discountType]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(searchTerm)
      : true
  );
  const lowStockProducts = products
    .filter((product) => Number(product.stockQty || 0) <= 5)
    .slice(0, 4);
  const recentPendingReviews = reviews.filter((review) => !review.approved).slice(0, 3);
  const groupedAdminLinks = ["Main", "Catalog", "Marketing", "Customers"].map(
    (group) => ({
      group,
      links: adminLinks.filter((link) => link.group === group),
    })
  );
  const navBadges = {
    orders: orders.length || null,
    reviews: pendingReviewCount || null,
    products: stats?.lowStockProducts || null,
  };
  const ActiveIcon = activeLink.icon;

  return (
    <section className="min-h-screen bg-[#f8f6f2] p-4 sm:p-5 lg:p-6">
      <div className="mx-auto flex max-w-[1700px] gap-5">
        <aside className="hidden min-h-[calc(100vh-3rem)] w-[270px] shrink-0 flex-col overflow-hidden rounded-[1.55rem] bg-[linear-gradient(180deg,#0f0f13_0%,#16161d_100%)] text-white shadow-[0_24px_70px_rgba(15,15,19,0.28)] lg:flex">
          <div className="border-b border-white/10 px-6 pb-5 pt-7">
            <p className="font-display text-[2rem] leading-none text-[#c9956c]">
              Aurora Gems
            </p>
            <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.36em] text-white/35">
              Admin Panel
            </p>
          </div>

          <div className="px-3 py-4">
            {groupedAdminLinks.map((section) =>
              section.links.length ? (
                <div key={section.group} className="mb-5 last:mb-0">
                  <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
                    {section.group}
                  </p>
                  <div className="space-y-1.5">
                    {section.links.map((link) => {
                      const isActive = activeSection === link.key;
                      const LinkIcon = link.icon;
                      const badge = navBadges[link.key];
                      return (
                        <Link
                          key={link.key}
                          to={link.href}
                          className={`flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition ${
                            isActive
                              ? "border-[#c9956c]/25 bg-[linear-gradient(135deg,rgba(201,149,108,0.22),rgba(201,149,108,0.08))] text-[#e8b48a]"
                              : "border-transparent bg-white/0 text-white/55 hover:bg-white/6 hover:text-white/88"
                          }`}
                        >
                          <LinkIcon size={17} className={isActive ? "opacity-100" : "opacity-70"} />
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{link.label}</p>
                            <p className="mt-0.5 truncate text-[11px] opacity-60">
                              {link.eyebrow}
                            </p>
                          </div>
                          {badge ? (
                            <span className="rounded-full bg-[#c9956c] px-2 py-0.5 text-[10px] font-bold text-[#0f0f13]">
                              {badge}
                            </span>
                          ) : null}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ) : null
            )}
          </div>

          <div className="mt-auto border-t border-white/10 p-4">
            <div className="rounded-[1.15rem] border border-white/10 bg-white/6 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[linear-gradient(135deg,#c9956c,#a0704a)] font-semibold text-white">
                  {user?.name?.[0] || "O"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white/90">
                    {user?.name || "Owner"}
                  </p>
                  <p className="truncate text-xs text-white/45">{user?.email}</p>
                </div>
              </div>
              <div className="mt-4 grid gap-3 rounded-xl border border-white/8 bg-black/10 p-3">
                <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em] text-white/42">
                  <span>Last sync</span>
                  <Sparkles size={14} />
                </div>
                <p className="text-sm text-white/82">
                  {lastSyncedAt
                    ? lastSyncedAt.toLocaleTimeString("en-IN")
                    : "Waiting for first fetch"}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/12"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div id="admin-top" className="sticky top-4 z-20 space-y-4">
            <header className="rounded-[1.3rem] border border-[#ede9e3] bg-white/95 px-4 py-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] backdrop-blur sm:px-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f5e4d0] text-[#8a5e3d]">
                    <ActiveIcon size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-ink/38">
                      Owner Panel / {sectionTitles[activeSection]}
                    </p>
                    <h1 className="mt-2 font-display text-[2rem] leading-none text-ink sm:text-[2.2rem]">
                      {sectionTitles[activeSection]}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-copy/68">
                      {sectionSubtitles[activeSection]}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center xl:justify-end">
                  <label className="flex w-full items-center gap-3 rounded-xl border border-[#ede9e3] bg-[#faf8f5] px-3.5 py-3 sm:max-w-[280px]">
                    <Search size={16} className="text-copy/45" />
                    <input
                      value={workspaceSearch}
                      onChange={(event) => setWorkspaceSearch(event.target.value)}
                      placeholder={searchPlaceholders[activeSection]}
                      className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-copy/40"
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-[#ede9e3] bg-white text-copy/72 transition hover:border-[#c9956c] hover:text-[#8a5e3d]"
                    aria-label="Notifications"
                  >
                    <Bell size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={refreshAll}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d8d2c8] bg-white px-4 py-3 text-sm font-semibold text-ink transition hover:border-[#c9956c] hover:text-[#8a5e3d] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#c9956c,#b07850)] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(201,149,108,0.24)] transition hover:-translate-y-0.5"
                  >
                    View Store
                    <ArrowUpRight size={16} />
                  </a>
                </div>
              </div>
            </header>

            <div className="overflow-x-auto lg:hidden">
              <div className="flex min-w-max gap-2 pb-1">
                {adminLinks.map((link) => {
                  const isActive = activeSection === link.key;
                  const LinkIcon = link.icon;
                  return (
                    <Link
                      key={link.key}
                      to={link.href}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-[#c9956c]/30 bg-[#f5e4d0] text-[#8a5e3d]"
                          : "border-[#ede9e3] bg-white text-copy/70"
                      }`}
                    >
                      <LinkIcon size={15} />
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {error ? (
              <div className="rounded-[1.15rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {activeSection === "overview" ? (
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.7fr),340px]">
                <div className="overflow-hidden rounded-[1.4rem] border border-[#1b1b22] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_32%),linear-gradient(135deg,#0f0f13,#191922_60%,#1c2432)] p-6 text-white shadow-[0_24px_60px_rgba(15,15,19,0.22)] sm:p-7">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-white/45">
                    Owner Workspace
                  </p>
                  <h2 className="mt-4 font-display text-[2.5rem] leading-none sm:text-[3.2rem]">
                    Welcome back, {user?.name || "Owner"}.
                  </h2>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
                    Your operations view now mirrors the luxury control-room feel
                    from the reference design while keeping the real product,
                    review, coupon, and user actions live.
                  </p>

                  <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[1rem] border border-white/10 bg-white/8 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                        Catalog
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">
                        {catalogReady ? "Ready for merchandising" : "Needs first products"}
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/8 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                        Review Queue
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">
                        {pendingReviewCount} pending, {approvedReviewCount} approved
                      </p>
                    </div>
                    <div className="rounded-[1rem] border border-white/10 bg-white/8 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/42">
                        Session
                      </p>
                      <p className="mt-3 text-sm font-semibold text-white">
                        {lastSyncedAt
                          ? lastSyncedAt.toLocaleTimeString("en-IN")
                          : "Waiting for first fetch"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
                  <MetricCard
                    label="Products Live"
                    value={products.length}
                    caption="catalog count"
                    tone="gold"
                  />
                  <MetricCard
                    label="Pending Reviews"
                    value={pendingReviewCount}
                    caption="awaiting moderation"
                    tone="blue"
                  />
                  <MetricCard
                    label="Low Stock Watch"
                    value={stats?.lowStockProducts ?? lowStockProducts.length}
                    caption="needs action"
                    tone="red"
                  />
                </div>
              </div>
            ) : null}

            {activeSection === "overview" ? (
              <PanelSection
                id="admin-section-overview"
                eyebrow="Snapshot"
                title="One place to run the customer site."
                description="This panel keeps the current operational picture visible while letting you change the live shopping experience without leaving the page."
              >
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {pulseCards.map((card, index) => (
                    <MetricCard
                      key={card.label}
                      label={card.label}
                      value={card.value}
                      caption={card.caption}
                      tone={["gold", "green", "blue", "red"][index]}
                    />
                  ))}
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copy/48">
                      Products Live
                    </p>
                    <p className="mt-3 font-display text-4xl text-ink">{products.length}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copy/48">
                      Collections
                    </p>
                    <p className="mt-3 font-display text-4xl text-ink">
                      {collections.length}
                    </p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copy/48">
                      Recent Orders
                    </p>
                    <p className="mt-3 font-display text-4xl text-ink">{orders.length}</p>
                  </div>
                  <div className="rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copy/48">
                      Pending Reviews
                    </p>
                    <p className="mt-3 font-display text-4xl text-ink">
                      {pendingReviewCount}
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 xl:grid-cols-2">
                  <div className="rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copy/48">
                          Recent Orders
                        </p>
                        <h3 className="mt-2 font-display text-3xl text-ink">
                          Checkout flow
                        </h3>
                      </div>
                      <StatusPill tone="accent">{filteredOrders.length} loaded</StatusPill>
                    </div>
                    <div className="mt-5 space-y-3">
                      {filteredOrders.slice(0, 4).length ? (
                        filteredOrders.slice(0, 4).map((order) => (
                          <div
                            key={order.id}
                            className="flex items-center gap-3 rounded-[1rem] border border-white bg-white px-4 py-3"
                          >
                            <div className="min-w-[86px] font-mono text-xs font-semibold text-[#8a5e3d]">
                              #{order.id.slice(0, 8)}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-semibold text-ink">
                                {order.userName || "Aurora customer"}
                              </p>
                              <p className="text-xs text-copy/52">
                                {formatDisplayDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-ink">
                                {formatPrice(order.total)}
                              </p>
                              <p className="text-xs text-copy/52">{order.status}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState message="Recent orders will appear here once customers start checking out." />
                      )}
                    </div>
                  </div>

                  <div className="rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copy/48">
                          Moderation Queue
                        </p>
                        <h3 className="mt-2 font-display text-3xl text-ink">
                          Reviews and stock
                        </h3>
                      </div>
                      <StatusPill tone="caution">{pendingReviewCount} pending</StatusPill>
                    </div>
                    <div className="mt-5 space-y-3">
                      {recentPendingReviews.length ? (
                        recentPendingReviews.map((review) => (
                          <div
                            key={review.id}
                            className="rounded-[1rem] border border-white bg-white px-4 py-3"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-ink">
                                  {review.userName}
                                </p>
                                <p className="truncate text-xs text-copy/52">
                                  {review.productName || "Product review"}
                                </p>
                              </div>
                              <StatusPill tone="caution">{review.rating} stars</StatusPill>
                            </div>
                            <p className="mt-2 max-h-12 overflow-hidden text-sm leading-6 text-copy/68">
                              {review.body}
                            </p>
                          </div>
                        ))
                      ) : lowStockProducts.length ? (
                        lowStockProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between gap-3 rounded-[1rem] border border-white bg-white px-4 py-3"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-ink">
                                {product.name}
                              </p>
                              <p className="text-xs text-copy/52">{product.metal}</p>
                            </div>
                            <StatusPill tone="danger">
                              {product.stockQty || 0} left
                            </StatusPill>
                          </div>
                        ))
                      ) : (
                        <EmptyState message="Pending reviews and low-stock items will surface here as activity picks up." />
                      )}
                    </div>
                  </div>
                </div>
              </PanelSection>
            ) : null}

            {activeSection === "products" ? (
              <PanelSection
                id="admin-section-products"
                eyebrow="Catalog"
                title="Products"
                description="Keep the assortment fresh, control product pricing, and remove stale items from the live storefront."
              >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),380px]">
              <div className="space-y-4">
                {filteredProducts.length ? (
                  filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-[1.15rem] border border-[#ede9e3] bg-[#fcfbf8] p-5 shadow-[0_6px_22px_rgba(15,23,42,0.03)]"
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
                        <div className="mt-5 rounded-[1.1rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
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
                  <EmptyState
                    message={
                      searchTerm
                        ? "No products match the current search."
                        : "No products are loaded yet."
                    }
                  />
                )}
              </div>

              <div className="rounded-[1.15rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
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
            ) : null}

            {activeSection === "collections" ? (
              <PanelSection
                id="admin-section-collections"
                eyebrow="Merchandising"
                title="Collections"
                description="Control the browsing structure that customers see first on the storefront."
              >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
              <div className="space-y-4">
                {filteredCollections.length ? (
                  filteredCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className="rounded-[1.15rem] border border-[#ede9e3] bg-[#fcfbf8] p-5 shadow-[0_6px_22px_rgba(15,23,42,0.03)]"
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
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-copy/45">
                          {collection.productCount} products
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          className="border-rose-200 text-rose-700 hover:border-rose-300 hover:text-rose-800"
                          disabled={busyAction === `delete-collection-${collection.id}`}
                          onClick={async () => {
                            setBusyAction(`delete-collection-${collection.id}`);
                            setError("");
                            try {
                              await deleteCollection(collection.id);
                              await Promise.all([refreshCatalog(), refreshDashboard()]);
                            } catch (actionError) {
                              setError(
                                extractRequestError(
                                  actionError,
                                  "Collection deletion failed. Try again."
                                )
                              );
                            } finally {
                              setBusyAction("");
                            }
                          }}
                        >
                          {busyAction === `delete-collection-${collection.id}`
                            ? "Deleting..."
                            : "Delete"}
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <EmptyState
                    message={
                      searchTerm
                        ? "No collections match the current search."
                        : "Collections have not been created yet."
                    }
                  />
                )}
              </div>

              <div className="rounded-[1.15rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
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
            ) : null}

            {activeSection === "orders" ? (
              <PanelSection
                id="admin-section-orders"
                eyebrow="Fulfillment"
                title="Recent Orders"
                description="A quick operational view of checkout flow, payment method mix, and order status."
              >
            <div className="space-y-4">
              {filteredOrders.length ? (
                filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="rounded-[1.15rem] border border-[#ede9e3] bg-[#fcfbf8] p-5 shadow-[0_6px_22px_rgba(15,23,42,0.03)]"
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
                <EmptyState
                  message={
                    searchTerm
                      ? "No orders match the current search."
                      : "Recent orders will appear here once customers start checking out."
                  }
                />
              )}
            </div>
              </PanelSection>
            ) : null}

            {activeSection === "users" ? (
              <PanelSection
                id="admin-section-users"
                eyebrow="Customers"
                title="Users"
                description="Review the customer base, spot the owner account, and quickly disable abusive or test users."
              >
            <div className="space-y-4">
              {filteredUsers.length ? (
                filteredUsers.map((siteUser) => (
                  <div
                    key={siteUser.id}
                    className="rounded-[1.15rem] border border-[#ede9e3] bg-[#fcfbf8] p-5 shadow-[0_6px_22px_rgba(15,23,42,0.03)]"
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
                <EmptyState
                  message={
                    searchTerm
                      ? "No users match the current search."
                      : "User accounts will appear here after sign-up."
                  }
                />
              )}
            </div>
              </PanelSection>
            ) : null}

            {activeSection === "reviews" ? (
              <PanelSection
                id="admin-section-reviews"
                eyebrow="Moderation"
                title="Reviews"
                description="Review the full moderation stream, publish strong customer feedback, and remove low-quality reviews cleanly so the storefront stays trustworthy."
              >
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard
                label="Total Reviews Loaded"
                value={reviews.length}
                caption="all statuses"
              />
              <MetricCard
                label="Approved Reviews"
                value={approvedReviewCount}
                caption="visible on storefront"
              />
              <MetricCard
                label="Pending Reviews"
                value={pendingReviewCount}
                caption="awaiting decision"
              />
            </div>

            <div className="mt-6 space-y-4">
              {filteredReviews.length ? (
                filteredReviews.map((review) => (
                  <div
                    key={review.id}
                    className="rounded-[1.15rem] border border-[#ede9e3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(250,248,245,0.92))] p-5 shadow-[0_6px_22px_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-ink">{review.userName}</p>
                        <p className="mt-2 text-sm text-copy/65">
                          {review.productName || "Product review"}
                        </p>
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
                    {review.imageUrl ? (
                      <div className="mt-4 overflow-hidden rounded-[1.5rem]">
                        <img
                          src={review.imageUrl}
                          alt={review.title || "Review upload"}
                          className="h-40 w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="mt-5 flex flex-wrap gap-3">
                      {!review.approved ? (
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
                            : "Approve & Publish"}
                        </Button>
                      ) : (
                        <Button type="button" variant="secondary" disabled>
                          Live on Storefront
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="secondary"
                        className="border-rose-200 text-rose-700 hover:border-rose-300 hover:text-rose-800"
                        disabled={busyAction === `review-remove-${review.id}`}
                        onClick={async () => {
                          setBusyAction(`review-remove-${review.id}`);
                          setError("");
                          try {
                            await deleteAdminReview(review.id);
                            await refreshReviews();
                          } catch (actionError) {
                            setError("Review removal failed. Try again.");
                          } finally {
                            setBusyAction("");
                          }
                        }}
                      >
                        {busyAction === `review-remove-${review.id}`
                          ? "Removing..."
                          : review.approved
                            ? "Remove from Store"
                            : "Reject & Remove"}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState
                  message={
                    searchTerm
                      ? "No reviews match the current search."
                      : "There are no customer reviews yet. New reviews will appear here for moderation as they are submitted."
                  }
                />
              )}
            </div>
              </PanelSection>
            ) : null}

            {activeSection === "coupons" ? (
              <PanelSection
                id="admin-section-coupons"
                eyebrow="Promotions"
                title="Coupons"
                description="Create offer codes without leaving the admin flow and keep current campaign performance visible."
              >
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr),360px]">
              <div className="space-y-4">
                {filteredCoupons.length ? (
                  filteredCoupons.map((coupon) => (
                    <div
                      key={coupon.id}
                      className="rounded-[1.15rem] border border-[#ede9e3] bg-[#fcfbf8] p-5 shadow-[0_6px_22px_rgba(15,23,42,0.03)]"
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
                  <EmptyState
                    message={
                      searchTerm
                        ? "No coupons match the current search."
                        : "No coupons exist yet."
                    }
                  />
                )}
              </div>

              <div className="rounded-[1.15rem] border border-[#ede9e3] bg-[#faf8f5] p-5">
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
            ) : null}
        </div>
      </div>
      </div>
    </section>
  );
}
