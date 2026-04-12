import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { createPaymentOrder, placeOrder } from "../api/ordersApi";
import { createAddress, getAddresses } from "../api/userApi";
import { Button } from "../components/ui/Button";
import { useCart } from "../hooks/useCart";

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
  const { cart, clear } = useCart();
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

  const submitOrder = async () => {
    setLoading(true);
    try {
      let addressId = selectedAddressId;
      if (!addressId) {
        const address = await createAddress({
          ...form.getValues(),
          defaultAddress: addresses.length === 0,
        });
        addressId = address.id;
      }

      let paymentPayload = {};
      if (paymentMethod === "RAZORPAY") {
        const order = await createPaymentOrder({
          amount: cart.subtotal,
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
        couponCode: sessionStorage.getItem("aurora_gems_coupon") || null,
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
      <h1 className="font-display text-5xl text-ink">Checkout</h1>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr,360px]">
        <div className="space-y-6">
          <div className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    step >= item ? "bg-accent text-ink" : "bg-cream text-copy"
                  }`}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          {step === 1 ? (
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <h2 className="font-display text-4xl text-ink">Address</h2>
              {addresses.length ? (
                <div className="mt-6 space-y-3">
                  {addresses.map((address) => (
                    <label key={address.id} className="block rounded-[1.5rem] border border-ink/10 p-4">
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
                      className="w-full rounded-full border border-ink/10 px-5 py-3"
                      placeholder={field}
                      {...form.register(field)}
                    />
                  ))}
                </form>
              )}
              <Button className="mt-6" onClick={() => setStep(2)}>
                Continue to Payment
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="rounded-[2rem] bg-white p-6 shadow-soft">
              <h2 className="font-display text-4xl text-ink">Payment</h2>
              <div className="mt-6 space-y-3">
                {["COD", "RAZORPAY"].map((method) => (
                  <label key={method} className="block rounded-[1.5rem] border border-ink/10 p-4">
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
                <Button onClick={submitOrder} disabled={loading}>
                  {loading ? "Placing Order..." : "Place Order"}
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <h2 className="font-display text-3xl text-ink">Summary</h2>
          <p className="mt-4 text-sm text-copy/70">Items: {cart.totalItems}</p>
          <p className="mt-2 text-sm text-copy/70">Subtotal: ₹{(cart.subtotal / 100).toLocaleString("en-IN")}</p>
        </div>
      </div>
    </section>
  );
}
