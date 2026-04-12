import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listOrders } from "../api/ordersApi";
import { formatDisplayDate } from "../utils/dateHelpers";
import { formatPrice } from "../utils/formatPrice";

export function OrdersPage() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    listOrders().then(setOrders).catch(() => setOrders([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <h1 className="font-display text-5xl text-ink">Your Orders</h1>
      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <Link key={order.id} to={`/account/orders/${order.id}`} className="block rounded-[2rem] bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-ink">#{order.id.slice(0, 8)}</p>
                <p className="text-sm text-copy/60">{formatDisplayDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="rounded-full bg-accent/12 px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  {order.status}
                </p>
                <p className="mt-2 font-semibold text-ink">{formatPrice(order.total)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
