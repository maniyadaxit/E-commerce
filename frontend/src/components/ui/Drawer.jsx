export function Drawer({
  open,
  onClose,
  children,
  title,
  position = "right",
}) {
  if (!open) return null;

  const positionClasses =
    position === "bottom"
      ? "inset-x-0 bottom-0 rounded-t-[2rem]"
      : "right-0 top-0 h-full w-full max-w-md";

  return (
    <div className="fixed inset-0 z-50 bg-ink/45" onClick={onClose}>
      <aside
        className={`absolute bg-white p-6 shadow-soft ${positionClasses}`}
        onClick={(event) => event.stopPropagation()}
      >
        {title ? (
          <div className="mb-4">
            <h3 className="font-display text-3xl text-ink">{title}</h3>
          </div>
        ) : null}
        {children}
      </aside>
    </div>
  );
}
