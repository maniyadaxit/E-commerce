export function Toast({ message, tone = "dark" }) {
  const tones = {
    dark: "bg-ink text-white",
    accent: "bg-accent text-ink",
    sale: "bg-sale text-white",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-[60] rounded-full px-5 py-3 text-sm font-medium shadow-soft ${tones[tone]}`}
    >
      {message}
    </div>
  );
}
