import { X } from "lucide-react";

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/45 p-4">
      <div className="card-surface w-full max-w-2xl rounded-[2rem] bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-3xl text-ink">{title}</h3>
          <button
            type="button"
            className="rounded-full border border-ink/10 p-2 text-ink"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
