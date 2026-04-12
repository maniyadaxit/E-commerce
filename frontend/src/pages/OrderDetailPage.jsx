import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getOrder } from "../api/ordersApi";
import { formatDisplayDate } from "../utils/dateHelpers";
import { formatPrice } from "../utils/formatPrice";

export function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(id).then(setOrder).catch(() => setOrder(null));
  }, [id]);

  if (!order) return null;

  return (
    <section className="section-shell py-10">
      <div className="rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="font-display text-5xl text-ink">Order #{order.id.slice(0, 8)}</h1>
        <p className="mt-3 text-sm text-copy/70">
          {order.status} • {formatDisplayDate(order.createdAt)}
        </p>
        <div className="mt-8 space-y-4">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 rounded-[1.5rem] border border-ink/10 p-4">
              <img src={item.imageUrl} alt={item.productName} className="h-20 w-20 rounded-2xl object-cover" loading="lazy" />
              <div className="flex-1">
                <p className="font-semibold text-ink">{item.productName}</p>
                <p className="text-sm text-copy/60">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold text-ink">{formatPrice(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
