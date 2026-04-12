import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

export function Breadcrumb({ items }) {
  return (
    <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-copy/70">
      {items.map((item, index) => (
        <div key={item.label} className="flex items-center gap-2">
          {item.href ? <Link to={item.href}>{item.label}</Link> : <span>{item.label}</span>}
          {index < items.length - 1 ? <ChevronRight size={14} /> : null}
        </div>
      ))}
    </nav>
  );
}
