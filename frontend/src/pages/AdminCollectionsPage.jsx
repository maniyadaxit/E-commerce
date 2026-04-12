import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { createCollection } from "../api/adminApi";
import { getCollections } from "../api/catalogApi";
import { Button } from "../components/ui/Button";

const schema = z.object({
  name: z.string().min(2),
  handle: z.string().min(2),
  description: z.string().min(5),
  bannerImageUrl: z.string().url(),
});

export function AdminCollectionsPage() {
  const [collections, setCollections] = useState([]);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      handle: "",
      description: "",
      bannerImageUrl: "https://placehold.co/1600x720/png?text=Collection",
    },
  });

  const refresh = async () => setCollections(await getCollections());

  useEffect(() => {
    refresh().catch(() => setCollections([]));
  }, []);

  return (
    <section className="section-shell py-10">
      <div className="grid gap-6 lg:grid-cols-[1fr,420px]">
        <div className="space-y-4">
          <h1 className="font-display text-5xl text-ink">Collections</h1>
          {collections.map((collection) => (
            <div key={collection.id} className="rounded-[2rem] bg-white p-5 shadow-soft">
              <p className="font-semibold text-ink">{collection.name}</p>
              <p className="text-sm text-copy/60">{collection.handle}</p>
            </div>
          ))}
        </div>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft">
          <h2 className="font-display text-4xl text-ink">Create Collection</h2>
          <form
            className="mt-6 space-y-3"
            onSubmit={form.handleSubmit(async (values) => {
              await createCollection({
                ...values,
                active: true,
                sortOrder: collections.length + 1,
              });
              form.reset();
              refresh();
            })}
          >
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Name" {...form.register("name")} />
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Handle" {...form.register("handle")} />
            <textarea className="w-full rounded-[1.5rem] border border-ink/10 px-5 py-3" rows="4" placeholder="Description" {...form.register("description")} />
            <input className="w-full rounded-full border border-ink/10 px-5 py-3" placeholder="Banner image URL" {...form.register("bannerImageUrl")} />
            <Button type="submit" className="w-full">
              Save Collection
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
