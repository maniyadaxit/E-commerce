import { formatPrice } from "../../utils/formatPrice";
import { Button } from "../ui/Button";

export function CartSummary({
  subtotal = 0,
  discount = 0,
  shipping = 0,
  total = subtotal - discount + shipping,
  couponCode,
  onCheckout,
  checkoutLabel = "Proceed to Checkout",
  disabled = false,
}) {
  return (
    <aside className="rounded-[2.2rem] border border-[#e2d8ca] bg-white p-6 shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
        Order Summary
      </p>
      <h3 className="mt-3 font-display text-4xl text-ink">Your total at a glance.</h3>

      <div className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-copy/72">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-copy/72">Discount</span>
          <span>- {formatPrice(discount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-copy/72">Shipping</span>
          <span>{shipping ? formatPrice(shipping) : "Free"}</span>
        </div>
        {couponCode ? (
          <div className="rounded-[1.4rem] bg-emerald-50 px-4 py-3 text-[12px] font-medium text-emerald-700">
            Applied coupon: {couponCode}
          </div>
        ) : null}
      </div>

      <div className="mt-6 border-t border-[#eadfce] pt-4">
        <div className="flex items-center justify-between font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Button className="mt-6 w-full" onClick={onCheckout} disabled={disabled}>
        {checkoutLabel}
      </Button>
    </aside>
  );
}
