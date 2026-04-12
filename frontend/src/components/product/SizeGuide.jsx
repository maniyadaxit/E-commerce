import { Modal } from "../ui/Modal";

export function SizeGuide({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title="Ring Size Guide">
      <div className="grid gap-3 text-sm">
        {[
          ["10", "15.7 mm"],
          ["12", "16.5 mm"],
          ["14", "17.3 mm"],
          ["16", "18.1 mm"],
        ].map(([size, diameter]) => (
          <div
            key={size}
            className="grid grid-cols-2 rounded-2xl border border-ink/10 px-4 py-3"
          >
            <span>Size {size}</span>
            <span>{diameter}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
