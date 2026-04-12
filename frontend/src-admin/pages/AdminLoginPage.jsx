import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../../src/components/ui/Button";
import { useAuth } from "../../src/hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid owner email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const storefrontUrl =
  import.meta.env.VITE_STOREFRONT_URL || "http://localhost:5173";

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, ownerLogin, logout } = useAuth();
  const [error, setError] = useState("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "maniyadaxit1234@gmail.com", password: "" },
  });

  useEffect(() => {
    if (user && user.role !== "OWNER") {
      setError("This portal is restricted to the Aurora Gems owner account.");
    }
  }, [user]);

  if (user?.role === "OWNER") {
    return <Navigate to="/owner" replace />;
  }

  return (
    <section className="section-shell flex min-h-screen items-center py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="rounded-[2.75rem] bg-ink p-8 text-white shadow-soft md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/55">
            Owner Operations
          </p>
          <h1 className="mt-4 font-display text-5xl leading-none md:text-6xl">
            Separate owner panel. Same live Aurora Gems data.
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-7 text-white/72">
            This owner portal runs independently from the customer storefront.
            It connects to the same backend and database, so product, stock,
            price, and promotion changes appear on the user site immediately.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.75rem] bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                Access
              </p>
              <p className="mt-3 font-semibold">Owner only</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                Database
              </p>
              <p className="mt-3 font-semibold">Shared with storefront</p>
            </div>
            <div className="rounded-[1.75rem] bg-white/8 p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-white/50">
                Impact
              </p>
              <p className="mt-3 font-semibold">Live inventory sync</p>
            </div>
          </div>
        </div>

        <div className="rounded-[2.5rem] bg-white p-8 shadow-soft md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
            Owner Sign In
          </p>
          <h2 className="mt-3 font-display text-5xl text-ink">Authorized access only.</h2>

          <form
            className="mt-8 space-y-4"
            onSubmit={form.handleSubmit(async (values) => {
              setError("");
              try {
                const response = await ownerLogin(values);
                if (response.user.role !== "OWNER") {
                  await logout();
                  setError("This portal is restricted to the Aurora Gems owner account.");
                  return;
                }
                navigate("/owner");
              } catch (requestError) {
                setError("Login failed. Check your owner credentials.");
              }
            })}
          >
            <input
              className="w-full rounded-full border border-ink/10 px-5 py-4"
              placeholder="Owner email"
              {...form.register("email")}
            />
            <input
              type="password"
              className="w-full rounded-full border border-ink/10 px-5 py-4"
              placeholder="Password"
              {...form.register("password")}
            />
            {Object.values(form.formState.errors).map((fieldError) => (
              <p key={fieldError.message} className="text-sm text-sale">
                {fieldError.message}
              </p>
            ))}
            {error ? <p className="text-sm text-sale">{error}</p> : null}
            <Button type="submit" className="w-full">
              Enter Owner Panel
            </Button>
          </form>

          <div className="mt-6 text-sm text-copy/70">
            <a className="text-accent" href={storefrontUrl}>
              Open customer storefront
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
