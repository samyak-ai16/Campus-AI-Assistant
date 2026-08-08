import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Calendar, GraduationCap, Info } from "lucide-react";
import { NOTICES, EXAMS, EVENTS } from "@/lib/mock-data";

type Item = { id: string; icon: any; title: string; sub: string; date: string; tone: "notice" | "exam" | "event" };

function buildItems(): Item[] {
  const items: Item[] = [];
  NOTICES.slice(0, 3).forEach(n => items.push({ id: `n${n.id}`, icon: Info, title: n.title, sub: n.category, date: n.date, tone: "notice" }));
  EXAMS.slice(0, 3).forEach(e => items.push({ id: `x${e.id}`, icon: GraduationCap, title: `Exam: ${e.subject}`, sub: `${e.room} · ${e.time}`, date: e.date, tone: "exam" }));
  EVENTS.slice(0, 2).forEach(e => items.push({ id: `e${e.id}`, icon: Calendar, title: e.title, sub: e.venue, date: e.date, tone: "event" }));
  return items.sort((a, b) => b.date.localeCompare(a.date));
}

export function NotificationCenter() {
  const [items, setItems] = useState(buildItems());
  const [read, setRead] = useState<Set<string>>(new Set());
  const unread = items.length - read.size;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <div className="font-semibold">Notifications</div>
          <Button
            variant="ghost" size="sm"
            onClick={() => setRead(new Set(items.map(i => i.id)))}
            disabled={unread === 0}
          >Mark all read</Button>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {items.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">You're all caught up ✨</div>
          )}
          {items.map((i) => {
            const isRead = read.has(i.id);
            return (
              <button
                key={i.id}
                onClick={() => setRead(prev => new Set(prev).add(i.id))}
                className={`flex w-full items-start gap-3 border-b p-3 text-left transition hover:bg-muted/50 ${isRead ? "opacity-60" : ""}`}
              >
                <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white ${
                  i.tone === "notice" ? "bg-primary" : i.tone === "exam" ? "bg-destructive" : "bg-emerald-500"
                }`}>
                  <i.icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{i.title}</div>
                  <div className="text-xs text-muted-foreground">{i.sub}</div>
                </div>
                <Badge variant="outline" className="text-[10px]">{i.date}</Badge>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
