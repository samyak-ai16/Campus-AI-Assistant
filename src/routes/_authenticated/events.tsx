import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EVENTS } from "@/lib/mock-data";
import { Calendar, MapPin, Clock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/events")({
  head: () => ({
    meta: [
      { title: "Events — CampusAI" },
      { name: "description", content: "Upcoming college events and activities." },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const sorted = [...EVENTS].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Events</h1>
        <p className="text-muted-foreground">Don't miss what's happening on campus.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sorted.map((e) => (
          <Card key={e.id} className="overflow-hidden">
            <div className="h-32" style={{ background: e.banner }} />
            <div className="p-5">
              <Badge variant="secondary" className="gap-1">
                <Calendar className="h-3 w-3" /> {new Date(e.date).toLocaleDateString(undefined, { day: "numeric", month: "short" })}
              </Badge>
              <h3 className="mt-2 text-lg font-semibold">{e.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.description}</p>
              <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {e.time}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.venue}</div>
              </div>
              <Button
                className="mt-4 w-full text-white"
                style={{ background: "var(--gradient-brand)" }}
                onClick={() => toast.success(`Registered for ${e.title}`)}
              >
                Register
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
