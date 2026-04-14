import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { createPaymentOrder, placeOrder } from "../api/ordersApi";
import { createAddress, getAddresses } from "../api/userApi";
import { Button } from "../components/ui/Button";
import { useCart } from "../hooks/useCart";
import { formatPrice } from "../utils/formatPrice";

const addressSchema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
});

export function CheckoutPage() {
  const navigate = useNavigate();
  const {
    cart,
    clear,
    appliedCoupon,
    couponStatus,
    couponMessage,
    discountTotal,
    payableTotal,
  } = useCart();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const form = useForm({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: "",
      phone: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
    },
  });

  useEffect(() => {
    getAddresses()
      .then((data) => {
        setAddresses(data);
        if (data[0]) {
          setSelectedAddressId(data[0].id);
        }
      })
      .catch(() => setAddresses([]));
  }, []);

  const proceedToPayment = async () => {
    if (selectedAddressId) {
      setStep(2);
      return;
    }

    const valid = await form.trigger();
    if (valid) {
      setStep(2);
    }
  };

  const submitOrder = async () => {
    setLoading(true);
    try {
      let addressId = selectedAddressId;

      if (!addressId) {
        const valid = await form.trigger();
        if (!valid) {
          setStep(1);
          return;
        }

        const address = await createAddress({
          ...form.getValues(),
          defaultAddress: addresses.length === 0,
        });
        addressId = address.id;
      }

      let paymentPayload = {};
      if (paymentMethod === "RAZORPAY") {
        const order = await createPaymentOrder({
          amount: payableTotal,
          receipt: `receipt_${Date.now()}`,
        });
        paymentPayload = {
          razorpayOrderId: order.orderId,
          paymentId: `pay_${Date.now()}`,
        };
      }

      const placed = await placeOrder({
        addressId,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        ...paymentPayload,
      });
      await clear();
      navigate(`/checkout/confirmation/${placed.id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-shell py-10">
      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-accent">Checkout</p>
      <h1 className="mt-3 font-display text-5xl text-ink">Complete your order.</h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,380px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] border border-[#e2d8ca] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= item ? "bg-accent text-white" : "bg-cream text-copy"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {step === 1 ? (
            <div className="rounded-[2rem] border border-[#e2d8ca] bg-white p-6 shadow-soft">
              <h2 className="font-display text-4xl text-ink">Address</h2>
              {addresses.length ? (
                <div className="mt-6 space-y-3">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className="block rounded-[1.5rem] border border-[#e2d8ca] p-4"
                    >
                      <input
                        type="radio"
                        className="mr-3"
                        checked={selectedAddressId === address.id}
                        onChange={() => setSelectedAddressId(address.id)}
                      />
                      {address.line1}, {address.city}, {address.state} - {address.pincode}
                    </label>
                  ))}
                </div>
              ) : (
                <form className="mt-6 space-y-3">
                  {["name", "phone", "line1", "line2", "city", "state", "pincode"].map((field) => (
                    <input
                      key={field}
                      className="w-full rounded-full border border-[#e2d8ca] px-5 py-3"
                      placeholder={field}
                      {...form.register(field)}
                    />
                  ))}
                </form>
              )}
              <Button className="mt-6" onClick={proceedToPayment}>
                Continue to Payment
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-[2rem] border border-[#e2d8ca] bg-white p-6 shadow-soft">
              <h2 className="font-display text-4xl text-ink">Payment</h2>
              <div className="mt-6 space-y-3">
                {["COD", "RAZORPAY"].map((method) => (
                  <label
                    key={method}
                    className="block rounded-[1.5rem] border border-[#e2d8ca] p-4"
                  >
                    <input
                      type="radio"
                      className="mr-3"
                      checked={paymentMethod === method}
                      onChange={() => setPaymentMethod(method)}
                    />
                    {method === "COD" ? "Cash on Delivery" : "Razorpay"}
                  </label>
                ))}
              </div>
              <div className="mt-6 flex gap-3">
                <Button variant="secondary" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={submitOrder} disabled={loading || !cart.items?.length}>
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] border border-[#e2d8ca] bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl text-ink">Summary</h2>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-copy/70">Items</span>
              <span>{cart.totalItems}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-copy/70">Subtotal</span>
              <span>{formatPrice(cart.subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-copy/70">Discount</span>
              <span>- {formatPrice(discountTotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-copy/70">Shipping</span>
              <span>Free</span>
            </div>
          </div>

          {appliedCoupon ? (
            <div className="mt-5 rounded-[1.5rem] bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              Coupon {appliedCoupon.code} applied successfully.
            </div>
          ) : null}

          {!appliedCoupon && couponStatus === "error" && couponMessage ? (
            <div className="mt-5 rounded-[1.5rem] bg-red-50 px-4 py-3 text-sm text-red-700">
              {couponMessage}
            </div>
          ) : null}

          <div className="mt-6 border-t border-[#eadfce] pt-4">
            <div className="flex items-center justify-between font-semibold text-ink">
              <span>Total Payable</span>
              <span>{formatPrice(payableTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
