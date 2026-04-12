import { useParams } from "react-router-dom";

export function OrderConfirmationPage() {
  const { orderId } = useParams();

  return (
    <section className="section-shell py-16">
      <div className="mx-auto max-w-2xl rounded-[2.5rem] bg-white p-10 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Order Confirmed
        </p>
        <h1 className="mt-4 font-display text-5xl text-ink">Thank you for your purchase.</h1>
        <p className="mt-4 text-sm text-copy/70">
          Your order ID is #{orderId?.slice(0, 8)}. Estimated delivery in 3-5 business days.
        </p>
      </div>
    </section>
  );
}
