import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().regex(/^\d{10}$/),
  birthday: z.string().optional(),
});

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthday: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthday: user.birthday || "",
      });
    }
  }, [form, user]);

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-2xl rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="font-display text-5xl text-ink">Profile</h1>
        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit((values) => updateProfile(values))}
        >
          <input className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Name" {...form.register("name")} />
          <input className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Email" {...form.register("email")} />
          <input className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Phone" {...form.register("phone")} />
          <input type="date" className="w-full rounded-full border border-ink/10 px-5 py-4" {...form.register("birthday")} />
          <Button type="submit">Save Profile</Button>
        </form>
      </div>
    </section>
  );
}
