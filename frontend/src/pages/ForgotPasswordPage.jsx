import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { forgotPassword } from "../api/authApi";
import { Button } from "../components/ui/Button";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
});

export function ForgotPasswordPage() {
  const [message, setMessage] = useState("");
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  return (
    <section className="section-shell py-10">
      <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-8 shadow-soft">
        <h1 className="font-display text-5xl text-ink">Reset password</h1>
        <form
          className="mt-8 space-y-4"
          onSubmit={form.handleSubmit(async (values) => {
            const response = await forgotPassword(values);
            setMessage(response.message);
          })}
        >
          <input
            className="w-full rounded-full border border-ink/10 px-5 py-4"
            placeholder="Email"
            {...form.register("email")}
          />
          {form.formState.errors.email ? (
            <p className="text-sm text-sale">{form.formState.errors.email.message}</p>
          ) : null}
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm text-copy/80">{message}</p> : null}
      </div>
    </section>
  );
}
