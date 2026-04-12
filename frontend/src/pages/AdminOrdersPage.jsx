import { useEffect, useState } from "react";
import { getAdminOrders } from "../api/adminApi";
import { formatDisplayDate } from "../utils/dateHelpers";
import { formatPrice } from "../utils/formatPrice";

export function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getAdminOrders({ page: 0, size: 20 })
      .then((data) => setOrders(data.items || []))
      .catch(() => setOrders([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <h1 className="font-display text-5xl text-ink">Admin Orders</h1>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">#{order.id.slice(0, 8)}</p>
                <p className="text-sm text-copy/60">{formatDisplayDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-accent">{order.status}</p>
                <p className="text-sm text-copy/70">{formatPrice(order.total)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
