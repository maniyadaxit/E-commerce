import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CartItem } from "../components/cart/CartItem";
import { CartSummary } from "../components/cart/CartSummary";
import { useCart } from "../hooks/useCart";

export function CartPage() {
  const navigate = useNavigate();
  const {
    cart,
    updateItem,
    removeItem,
    appliedCoupon,
    couponMessage,
    couponStatus,
    couponLoading,
    discountTotal,
    payableTotal,
    applyCoupon,
    clearCoupon,
  } = useCart();
  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || "");

  useEffect(() => {
    setCouponCode(appliedCoupon?.code || "");
  }, [appliedCoupon?.code]);

  const messageClasses =
    couponStatus === "error"
      ? "bg-red-50 text-red-700"
      : "bg-emerald-50 text-emerald-700";

  return (
    <section className="section-shell py-10">
      <div className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Cart</p>
        <h1 className="mt-3 font-display text-5xl text-ink">Review your selections.</h1>
        <p className="mt-3 text-sm text-copy/70">
          Apply your coupon here and the updated total will carry straight into checkout.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,380px]">
        <div className="space-y-4">
          {cart.items?.length ? (
            cart.items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdate={(quantity) => updateItem(item.id, quantity)}
                onRemove={() => removeItem(item.id)}
              />
            ))
          ) : (
            <div className="rounded-[2rem] border border-dashed border-[#d9ccbd] bg-white px-6 py-10 shadow-soft">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/45">
                Your cart is empty
              </p>
              <p className="mt-3 text-sm leading-7 text-copy/72">
                Add products from the catalog and come back here to apply discounts before checkout.
              </p>
            </div>
          )}

          <div className="rounded-[2rem] border border-[#e2d8ca] bg-white p-5 shadow-soft">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
              Coupon Code
            </p>
            <div className="mt-4 flex flex-col gap-3 md:flex-row">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                className="flex-1 rounded-full border border-[#e2d8ca] px-5 py-3"
                placeholder="Enter coupon code"
              />
              <button
                type="button"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-ink/50"
                disabled={couponLoading || !cart.items?.length}
                onClick={() => applyCoupon(couponCode)}
              >
                {couponLoading ? "Checking..." : "Apply"}
              </button>
              {appliedCoupon ? (
                <button
                  type="button"
                  className="rounded-full border border-[#e2d8ca] px-5 py-3 text-sm font-semibold text-ink"
                  onClick={() => {
                    clearCoupon();
                    setCouponCode("");
                  }}
                >
                  Remove
                </button>
              ) : null}
            </div>
            {couponMessage ? (
              <p className={`mt-4 rounded-[1.3rem] px-4 py-3 text-sm ${messageClasses}`}>
                {couponMessage}
              </p>
            ) : null}
          </div>
        </div>

        <CartSummary
          subtotal={cart.subtotal}
          discount={discountTotal}
          total={payableTotal}
          couponCode={appliedCoupon?.code}
          onCheckout={() => navigate("/checkout")}
          disabled={!cart.items?.length}
        />
      </div>
    </section>
  );
}
