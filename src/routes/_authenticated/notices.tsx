import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NOTICES } from "@/lib/mock-data";
import { Paperclip, Search, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/notices")({
  head: () => ({
    meta: [
      { title: "Notices — CampusAI" },
      { name: "description", content: "Latest college notices and announcements." },
    ],
  }),
  component: NoticesPage,
});

const CATS = ["All", "Academic", "Events", "Placement", "Examination"];
const PAGE_SIZE = 6;

// Generate more notices for infinite scroll demonstration
const EXTRA_NOTICES = Array.from({ length: 40 }, (_, i) => {
  const base = NOTICES[i % NOTICES.length];
  const d = new Date(base.date);
  d.setDate(d.getDate() - (i + 1) * 3);
  return {
    ...base,
    id: 1000 + i,
    date: d.toISOString().slice(0, 10),
    title: `${base.title} (archive #${i + 1})`,
  };
});
const ALL_NOTICES = [...NOTICES, ...EXTRA_NOTICES];

function NoticesPage() {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    return ALL_NOTICES.filter((n) => {
      if (cat !== "All" && n.category !== cat) return false;
      if (query && !`${n.title} ${n.description}`.toLowerCase().includes(query.toLowerCase())) return false;
      return true;
    });
  }, [cat, query]);

  useEffect(() => { setVisible(PAGE_SIZE); }, [cat, query]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible((v) => Math.min(v + PAGE_SIZE, filtered.length));
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [filtered.length]);

  const shown = filtered.slice(0, visible);
  const hasMore = visible < filtered.length;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
        <p className="text-muted-foreground">Stay updated with the latest college announcements.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <Button key={c} size="sm" variant={cat === c ? "default" : "outline"} onClick={() => setCat(c)}>
              {c}
            </Button>
          ))}
        </div>
        <div className="relative md:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search notices…" className="pl-9" />
        </div>
      </div>

      <div className="space-y-3">
        {shown.map((n) => (
          <Card key={n.id} className="p-5 transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{n.category}</Badge>
              <span className="text-xs text-muted-foreground">{n.date}</span>
            </div>
            <h3 className="mt-2 text-lg font-semibold">{n.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{n.description}</p>
            {n.attachments > 0 && (
              <div className="mt-3 flex items-center gap-1 text-xs text-primary">
                <Paperclip className="h-3.5 w-3.5" /> {n.attachments} attachment{n.attachments > 1 ? "s" : ""}
              </div>
            )}
          </Card>
        ))}
        {shown.length === 0 && (
          <Card className="p-10 text-center text-muted-foreground">No notices match your search.</Card>
        )}

        {hasMore && (
          <div ref={sentinelRef} className="flex items-center justify-center py-6 text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading more…
          </div>
        )}
        {!hasMore && shown.length > 0 && (
          <p className="py-4 text-center text-xs text-muted-foreground">You've reached the end · {filtered.length} notices</p>
        )}
      </div>
    </div>
  );
}
