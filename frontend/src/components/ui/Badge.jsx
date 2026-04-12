export function Badge({ children, tone = "dark" }) {
  const tones = {
    dark: "bg-ink text-white",
    accent: "bg-accent/20 text-accent",
    sale: "bg-sale text-white",
    muted: "bg-ink/5 text-copy",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
