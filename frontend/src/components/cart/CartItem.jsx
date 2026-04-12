import { Minus, Plus, Trash2 } from "lucide-react";
import { formatPrice } from "../../utils/formatPrice";

export function CartItem({ item, onUpdate, onRemove }) {
  return (
    <article className="grid grid-cols-[88px,1fr] gap-4 rounded-[1.5rem] border border-ink/10 bg-white p-4">
      <img
        src={item.product?.primaryImageUrl || "https://placehold.co/400x500/png?text=Jewelry"}
        alt={item.product?.name}
        className="aspect-[4/5] rounded-2xl object-cover"
        loading="lazy"
      />
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-2xl text-ink">{item.product?.name || item.name}</h3>
            {item.variant ? (
              <p className="text-sm text-copy/60">
                {item.variant.colour} {item.variant.size ? `| Size ${item.variant.size}` : ""}
              </p>
            ) : null}
          </div>
          <button type="button" onClick={onRemove} className="text-copy/50">
            <Trash2 size={16} />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-ink/10 px-3 py-2">
            <button type="button" onClick={() => onUpdate(Math.max(item.quantity - 1, 1))}>
              <Minus size={14} />
            </button>
            <span className="text-sm font-semibold">{item.quantity}</span>
            <button type="button" onClick={() => onUpdate(item.quantity + 1)}>
              <Plus size={14} />
            </button>
          </div>
          <p className="font-semibold text-ink">{formatPrice(item.lineTotal || item.price)}</p>
        </div>
        {item.customizationText ? (
          <p className="text-xs text-sale">
            Customized products cannot be returned. Engraving: {item.customizationText}
          </p>
        ) : null}
      </div>
    </article>
  );
}
