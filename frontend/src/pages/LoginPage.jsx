import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "../components/ui/Button";
import { useAuth } from "../hooks/useAuth";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "aarohi@example.com", password: "Password@123" },
  });

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-ink/50">
          Account Login
        </p>
        <h1 className="mt-3 font-display text-5xl text-ink">Welcome back.</h1>
        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            await login(values);
            navigate("/account/dashboard");
          })}
        >
          <input
            className="w-full rounded-full border border-ink/10 px-5 py-4"
            placeholder="Email"
            {...form.register("email")}
          />
          <input
            type="password"
            className="w-full rounded-full border border-ink/10 px-5 py-4"
            placeholder="Password"
            {...form.register("password")}
          />
          {Object.values(form.formState.errors).map((error) => (
            <p key={error.message} className="text-sm text-sale">
              {error.message}
            </p>
          ))}
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="mt-6 space-y-2 text-sm">
          <Link className="text-accent" to="/account/forgot-password">
            Forgot password?
          </Link>
          <p>
            New here?{" "}
            <Link className="text-accent" to="/account/register">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
