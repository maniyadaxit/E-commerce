export function Button({
  as: Component = "button",
  variant = "primary",
  className = "",
  children,
  ...props
}) {
  const variants = {
    primary: "bg-ink text-white hover:bg-ink/90",
    secondary:
      "border border-ink/15 bg-white text-ink hover:border-accent hover:text-accent",
    ghost: "bg-transparent text-ink hover:bg-ink/5",
    accent: "bg-accent text-ink hover:bg-accent/85",
  };

  return (
    <Component
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
