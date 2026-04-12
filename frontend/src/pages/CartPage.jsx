import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { validateCoupon } from "../api/ordersApi";
import { CartItem } from "../components/cart/CartItem";
import { CartSummary } from "../components/cart/CartSummary";
import { useCart } from "../hooks/useCart";

export function CartPage() {
  const navigate = useNavigate();
  const { cart, updateItem, removeItem } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");

  return (
    <section className="section-shell py-10">
      <div className="mb-8">
        <h1 className="font-display text-5xl text-ink">Cart</h1>
        <p className="mt-3 text-sm text-copy/70">
          Estimated Price. Gold pricing may adjust slightly after weight verification.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-4">
          {cart.items?.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdate={(quantity) => updateItem(item.id, quantity)}
              onRemove={() => removeItem(item.id)}
            />
          ))}
          <div className="rounded-[1.75rem] bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-3 md:flex-row">
              <input
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                className="flex-1 rounded-full border border-ink/10 px-5 py-3"
                placeholder="Coupon code"
              />
              <button
                type="button"
                className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white"
                onClick={async () => {
                  const response = await validateCoupon({
                    code: couponCode,
                    cartTotal: cart.subtotal,
                  });
                  sessionStorage.setItem("aurora_gems_coupon", couponCode);
                  setDiscount(response.discountAmount);
                  setCouponMessage(response.message);
                }}
              >
                Apply
              </button>
            </div>
            {couponMessage ? <p className="mt-3 text-sm text-copy/80">{couponMessage}</p> : null}
          </div>
        </div>
        <CartSummary
          subtotal={cart.subtotal}
          discount={discount}
          onCheckout={() => navigate("/checkout")}
        />
      </div>
    </section>
  );
}
