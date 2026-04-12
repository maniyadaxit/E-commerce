import { announcementText } from "../../data/marketing";

export function AnnouncementBar() {
  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-ink px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.25em] text-white">
      {announcementText}
    </div>
  );
}
