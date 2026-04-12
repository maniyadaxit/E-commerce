import { formatPrice } from "../../utils/formatPrice";
import { Button } from "../ui/Button";

export function CartSummary({
  subtotal = 0,
  discount = 0,
  shipping = 0,
  total = subtotal - discount + shipping,
  onCheckout,
}) {
  return (
    <aside className="card-surface space-y-5 rounded-[2rem] p-6">
      <h3 className="font-display text-3xl text-ink">Order Summary</h3>
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Discount</span>
          <span>- {formatPrice(discount)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Shipping</span>
          <span>{shipping ? formatPrice(shipping) : "Free"}</span>
        </div>
      </div>
      <div className="border-t border-ink/10 pt-4">
        <div className="flex items-center justify-between font-semibold text-ink">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
      <Button className="w-full" onClick={onCheckout}>
        Proceed to Checkout
      </Button>
    </aside>
  );
}
