import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().regex(/^\d{10}$/, "Enter a 10-digit phone number"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", phone: "", password: "" },
  });

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Create Account
        </p>
        <h1 className="mt-3 font-display text-5xl text-ink">Join the Aurora Gems circle.</h1>
        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await register(values);
            navigate("/account/dashboard");
          })}
        >
          <input className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Full name" {...form.register("name")} />
          <input className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Email" {...form.register("email")} />
          <input className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Phone" {...form.register("phone")} />
          <input type="password" className="w-full rounded-full border border-ink/10 px-5 py-4" placeholder="Password" {...form.register("password")} />
          {Object.values(form.formState.errors).map((error) => (
            <p key={error.message} className="text-sm text-sale">
              {error.message}
            </p>
          ))}
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        <p className="mt-6 text-sm">
          Already have an account?{" "}
          <Link className="text-accent" to="/login">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
}
