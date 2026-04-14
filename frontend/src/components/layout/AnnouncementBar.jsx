import { announcementText } from "../../data/marketing";

const announcementItems = [
  announcementText,
  "Gift-ready packaging on every order",
  "925 sterling silver styles crafted for everyday wear",
  "Fresh launches updated automatically from the owner panel",
];

export function AnnouncementBar() {
  const loop = [...announcementItems, ...announcementItems];

  return (
    <div className="sticky top-0 z-40 overflow-hidden border-b border-white/10 bg-ink py-3 text-[10px] font-semibold uppercase tracking-[0.32em] text-white/70">
      <div className="marquee-track flex min-w-max items-center gap-6 whitespace-nowrap">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-6 px-2">
            <span>{item}</span>
            <span className="text-accent/50">◆</span>
          </span>
        ))}
      </div>
    </div>
  );
}
