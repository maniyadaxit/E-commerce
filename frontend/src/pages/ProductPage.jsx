import { Heart, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { checkDelivery, getProduct, getProducts } from "../api/catalogApi";
import { ImageGallery } from "../components/product/ImageGallery";
import { ReviewCard } from "../components/product/ReviewCard";
import { SizeGuide } from "../components/product/SizeGuide";
import { VariantSelector } from "../components/product/VariantSelector";
import { Breadcrumb } from "../components/ui/Breadcrumb";
import { Button } from "../components/ui/Button";
import { RatingStars } from "../components/ui/RatingStars";
import { Skeleton } from "../components/ui/Skeleton";
import { useCart } from "../hooks/useCart";
import { useWishlist } from "../hooks/useWishlist";
import { formatPrice } from "../utils/formatPrice";

export function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isSaved, toggle } = useWishlist();
  const [product, setProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedColour, setSelectedColour] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [productData, recommendationData] = await Promise.all([
          getProduct(slug),
          getProducts({ size: 4, sort: "bestseller" }),
        ]);
        setProduct(productData);
        setSelectedColour(productData.variants?.[0]?.colour || "");
        setSelectedSize(productData.variants?.[0]?.size || "");
        setRecommendations(recommendationData.items || []);
        setNotFound(false);
      } catch {
        setProduct(null);
        setRecommendations([]);
        setSelectedColour("");
        setSelectedSize("");
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  const availableColours = useMemo(
    () => [...new Set(product?.variants?.map((variant) => variant.colour) || [])],
    [product]
  );

  const availableSizes = useMemo(
    () =>
      product?.variants
        ?.filter((variant) => !selectedColour || variant.colour === selectedColour)
        .map((variant) => variant.size)
        .filter(Boolean) || [],
    [product, selectedColour]
  );

  const selectedVariant = useMemo(
    () =>
      product?.variants?.find(
        (variant) =>
          (!selectedColour || variant.colour === selectedColour) &&
          (!selectedSize || variant.size === selectedSize)
      ) || product?.variants?.[0],
    [product, selectedColour, selectedSize]
  );

  if (loading) {
    return (
      <div className="section-shell py-10">
        <Skeleton className="h-[640px]" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <section className="section-shell py-10">
        <div className="rounded-[2.5rem] border border-dashed border-ink/12 bg-white px-8 py-12 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/45">
            Product Unavailable
          </p>
          <h1 className="mt-4 font-display text-5xl text-ink">This product is not live right now.</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-copy/72">
            It may have been removed from the catalog or has not been added yet from the owner panel.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button as={Link} to="/search">
              Browse Catalog
            </Button>
            <Button as={Link} to="/" variant="secondary">
              Back Home
            </Button>
          </div>
        </div>
      </section>
    );
  }

  const productImages = product.images?.filter(
    (image) => !selectedColour || !image.colour || image.colour === selectedColour
  );

  return (
    <section className="section-shell py-10">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: product.collections?.[0] || "Product", href: "/search" },
          { label: product.name },
        ]}
      />

      <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
        <ImageGallery images={productImages?.length ? productImages : product.images} />

        <div className="space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
              SKU {selectedVariant?.sku || "AG-001"}
            </p>
            <h1 className="mt-3 font-display text-5xl text-ink">{product.name}</h1>
            <div className="mt-4">
              <RatingStars value={product.rating || 4.8} reviews={product.reviewCount || 0} />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-semibold text-ink">
                {formatPrice(selectedVariant?.price || product.price)}
              </span>
              <span className="text-copy/40 line-through">{formatPrice(product.mrp)}</span>
            </div>
            {product.metal === "GOLD" ? (
              <p className="text-xs text-copy/70">
                Estimated Price. Actual weight may vary; excess/refund adjusted within 48hrs post delivery.
              </p>
            ) : null}
          </div>

          <VariantSelector
            title="Metal"
            options={[{ label: product.metal?.replaceAll("_", " "), value: product.metal }]}
            value={product.metal}
            onChange={() => {}}
          />

          <VariantSelector
            title="Colour"
            options={availableColours.map((colour) => ({
              label: colour.replaceAll("_", " "),
              value: colour,
            }))}
            value={selectedColour}
            onChange={setSelectedColour}
          />

          {availableSizes.length ? (
            <div className="space-y-3">
              <VariantSelector
                title="Size"
                options={availableSizes}
                value={selectedSize}
                onChange={setSelectedSize}
              />
              <button
                type="button"
                className="text-sm font-semibold text-accent"
                onClick={() => setSizeGuideOpen(true)}
              >
                Open Size Guide
              </button>
            </div>
          ) : null}

          <div className="rounded-[2rem] border border-ink/10 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
              Check Delivery
            </p>
            <div className="mt-3 flex gap-3">
              <input
                value={deliveryPincode}
                onChange={(event) => setDeliveryPincode(event.target.value)}
                className="flex-1 rounded-full border border-ink/10 px-4 py-3"
                placeholder="Enter pincode"
              />
              <Button
                onClick={async () => {
                  const response = await checkDelivery(deliveryPincode);
                  setDeliveryInfo(response);
                }}
              >
                Check
              </Button>
            </div>
            {deliveryInfo ? (
              <p className="mt-3 text-sm text-copy/80">
                {deliveryInfo.message} by {deliveryInfo.estimatedDeliveryDate}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="flex-1"
              onClick={() =>
                addItem({
                  productId: product.id,
                  variantId: selectedVariant?.id,
                  quantity: 1,
                  price: selectedVariant?.price || product.price,
                  variant: selectedVariant,
                  product: {
                    name: product.name,
                    slug: product.slug,
                    primaryImageUrl:
                      productImages?.[0]?.url || product.images?.[0]?.url,
                  },
                })
              }
            >
              Add to Cart
            </Button>
            <Button
              variant="accent"
              className="flex-1"
              onClick={async () => {
                await addItem({
                  productId: product.id,
                  variantId: selectedVariant?.id,
                  quantity: 1,
                  price: selectedVariant?.price || product.price,
                  variant: selectedVariant,
                  product: {
                    name: product.name,
                    slug: product.slug,
                    primaryImageUrl:
                      productImages?.[0]?.url || product.images?.[0]?.url,
                  },
                });
                navigate("/checkout");
              }}
            >
              Buy Now
            </Button>
            <Button variant="secondary" className="px-4" onClick={() => toggle(product)}>
              <Heart className={isSaved(product.id) ? "fill-sale text-sale" : ""} size={16} />
            </Button>
          </div>

          <div className="grid gap-3 rounded-[2rem] bg-white p-5 shadow-soft">
            {["BIS Hallmarked", "Certificate of Authenticity", "Lifetime Exchange"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-copy/80">
                  <Truck size={14} className="text-accent" />
                  <span>{item}</span>
                </div>
              )
            )}
          </div>

          <div className="rounded-[2rem] bg-white p-5 shadow-soft">
            <div className="flex flex-wrap gap-2">
              {["description", "metal info", "care instructions", "exchange policy"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm ${
                    activeTab === tab ? "bg-accent/15 text-ink" : "bg-cream text-copy"
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm leading-7 text-copy/80">
              {activeTab === "description" ? product.description : null}
              {activeTab === "metal info" ? `Crafted in ${product.metal}. Weight ${product.weightGrams}g.` : null}
              {activeTab === "care instructions" ? "Store dry, wipe gently, avoid sprays and harsh chemicals." : null}
              {activeTab === "exchange policy" ? "Eligible for lifetime exchange. Customized products are excluded." : null}
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            You May Also Like
          </p>
          <h2 className="font-display text-4xl text-ink">Pair it with another favorite.</h2>
        </div>
        {recommendations.length ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {recommendations.map((item) => (
              <Link
                key={item.id}
                to={`/products/${item.slug}`}
                className="rounded-[1.5rem] bg-white p-4 shadow-soft"
              >
                <img
                  src={item.primaryImageUrl}
                  alt={item.name}
                  className="aspect-[4/5] rounded-[1.2rem] object-cover"
                  loading="lazy"
                />
                <p className="mt-3 text-sm font-medium text-ink">{item.name}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/12 bg-white px-6 py-10 shadow-soft">
            <p className="text-sm leading-7 text-copy/72">
              Recommendation slots will fill in automatically once more catalog items are added.
            </p>
          </div>
        )}
      </section>

      <section className="mt-16">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
            Customer Reviews
          </p>
          <h2 className="font-display text-4xl text-ink">What buyers are saying.</h2>
        </div>
        {product.reviews?.length ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {product.reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-ink/12 bg-white px-6 py-10 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
              No reviews yet
            </p>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-copy/72">
              Once customers submit reviews and they are approved from the owner panel, they will appear here automatically.
            </p>
          </div>
        )}
      </section>

      <SizeGuide open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </section>
  );
}
