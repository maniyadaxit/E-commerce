import { bondGrid } from "../../data/marketing";

export function BondGrid() {
  return (
    <section className="section-shell mt-16">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
          Shop by Bond
        </p>
        <h2 className="font-display text-4xl text-ink md:text-5xl">Pick the relationship, then the piece.</h2>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {bondGrid.map((bond, index) => (
          <div
            key={bond}
            className="rounded-[1.75rem] bg-white p-6 shadow-soft"
            style={{
              background:
                index % 2 === 0
                  ? "linear-gradient(135deg, rgba(200,169,110,0.18), white)"
                  : "linear-gradient(135deg, rgba(27,27,27,0.05), white)",
            }}
          >
            <p className="font-display text-3xl text-ink">{bond}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
