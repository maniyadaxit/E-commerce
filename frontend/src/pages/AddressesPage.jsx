import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createAddress, deleteAddress, getAddresses } from "../api/userApi";
import { Button } from "../components/ui/Button";

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().regex(/^\d{10}$/),
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().regex(/^\d{6}$/),
});

export function AddressesPage() {
  const [addresses, setAddresses] = useState([]);
  const form = useForm({
    resolver: zodResolver(schema),
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

  const refresh = async () => setAddresses(await getAddresses());

  useEffect(() => {
    refresh().catch(() => setAddresses([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-ink">Saved Addresses</h1>
          {addresses.map((address) => (
            <article key={address.id} className="rounded-[1.75rem] bg-white p-5 shadow-soft">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-ink">{address.name}</p>
                  <p className="mt-2 text-sm leading-6 text-copy/70">
                    {address.line1}, {address.line2 ? `${address.line2}, ` : ""}
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
                <Button variant="secondary" onClick={() => deleteAddress(address.id).then(refresh)}>
                  Delete
                </Button>
              </div>
            </article>
          ))}
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <h2 className="font-display text-4xl text-ink">Add New</h2>
          <form
            className="mt-6 space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await createAddress({ ...values, defaultAddress: addresses.length === 0 });
              form.reset();
              refresh();
            })}
          >
            {["name", "phone", "line1", "line2", "city", "state", "pincode"].map((field) => (
              <input
                key={field}
                className="w-full rounded-full border border-ink/10 px-5 py-3"
                placeholder={field}
                {...form.register(field)}
              />
            ))}
            <Button type="submit" className="w-full">
              Save Address
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
