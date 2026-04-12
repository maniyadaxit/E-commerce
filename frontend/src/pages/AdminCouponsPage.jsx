import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCoupon, getAdminCoupons } from "../api/adminApi";
import { Button } from "../components/ui/Button";

const schema = z.object({
  code: z.string().min(3),
  discountType: z.enum(["PERCENT", "FLAT"]),
  discountValue: z.coerce.number().min(1),
  minOrderValue: z.coerce.number().min(0),
  validFrom: z.string().min(1),
  validUntil: z.string().min(1),
});

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: "",
      discountType: "PERCENT",
      discountValue: 10,
      minOrderValue: 199900,
      validFrom: new Date().toISOString().slice(0, 16),
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 16),
    },
  });

  const refresh = async () => setCoupons(await getAdminCoupons());

  useEffect(() => {
    refresh().catch(() => setCoupons([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-ink">Coupons</h1>
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-[2rem] bg-white p-5 shadow-soft">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{coupon.code}</p>
                  <p className="text-sm text-copy/60">
                    {coupon.discountType} • {coupon.discountValue}
                  </p>
                </div>
                <span className="rounded-full bg-accent/12 px-3 py-2 text-xs font-semibold text-accent">
                  {coupon.active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <h2 className="font-display text-4xl text-ink">Create Coupon</h2>
          <form
            className="mt-6 space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await createCoupon({
                ...values,
                validFrom: new Date(values.validFrom).toISOString(),
                validUntil: new Date(values.validUntil).toISOString(),
                active: true,
              });
              form.reset();
              refresh();
            })}
          >
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Code" {...form.register("code")} />
            <select className="w-full rounded-full border border-ink/10 px-5 py-3" {...form.register("discountType")}>
              <option value="PERCENT">Percent</option>
              <option value="FLAT">Flat</option>
            </select>
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Discount value" {...form.register("discountValue")} />
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Minimum order value (paise)" {...form.register("minOrderValue")} />
            <input type="datetime-local" className="w-full rounded-full border border-ink/10 px-5 py-3" {...form.register("validFrom")} />
            <input type="datetime-local" className="w-full rounded-full border border-ink/10 px-5 py-3" {...form.register("validUntil")} />
            <Button type="submit" className="w-full">
              Save Coupon
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
