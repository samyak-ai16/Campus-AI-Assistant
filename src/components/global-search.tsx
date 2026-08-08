import { useEffect, useRef, useState } from "react";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, MessageSquare, ClipboardCheck, Calendar, BookOpen, Users, Bell, PartyPopper, GraduationCap, User, Settings, Mic, MicOff } from "lucide-react";
import { NOTICES, EVENTS, SUBJECTS, FACULTY } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const PAGES = [
  { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { label: "AI Chat", to: "/chat", icon: MessageSquare },
  { label: "Attendance", to: "/attendance", icon: ClipboardCheck },
  { label: "Timetable", to: "/timetable", icon: Calendar },
  { label: "Syllabus", to: "/syllabus", icon: BookOpen },
  { label: "Faculty", to: "/faculty", icon: Users },
  { label: "Notices", to: "/notices", icon: Bell },
  { label: "Events", to: "/events", icon: PartyPopper },
  { label: "Exams", to: "/exams", icon: GraduationCap },
  { label: "Profile", to: "/profile", icon: User },
  { label: "Settings", to: "/settings", icon: Settings },
];

export function GlobalSearch({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  function go(to: string) {
    onOpenChange(false);
    setQuery("");
    navigate({ to });
  }

  function toggleVoice() {
    const Rec = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!Rec) {
      toast.error("Voice search isn't supported on this browser");
      return;
    }
    if (listening) {
      recRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new Rec();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.onresult = (e: any) => {
      const text = e.results?.[0]?.[0]?.transcript ?? "";
      setQuery(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.start();
    recRef.current = rec;
    setListening(true);
  }

  const q = query.toLowerCase();
  const noticeMatches = NOTICES.filter(n => n.title.toLowerCase().includes(q) || n.description.toLowerCase().includes(q)).slice(0, 5);
  const eventMatches = EVENTS.filter(e => e.title.toLowerCase().includes(q)).slice(0, 5);
  const subjectMatches = SUBJECTS.filter(s => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)).slice(0, 5);
  const facultyMatches = FACULTY.filter(f => f.name.toLowerCase().includes(q) || f.subjects.some(x => x.toLowerCase().includes(q))).slice(0, 5);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <div className="flex items-center border-b">
        <CommandInput placeholder="Search pages, subjects, faculty, notices…" value={query} onValueChange={setQuery} />
        <Button size="icon" variant="ghost" onClick={toggleVoice} className="mr-2" aria-label="Voice search">
          {listening ? <MicOff className="h-4 w-4 text-destructive" /> : <Mic className="h-4 w-4" />}
        </Button>
      </div>
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Pages">
          {PAGES.map((p) => (
            <CommandItem key={p.to} onSelect={() => go(p.to)}>
              <p.icon className="mr-2 h-4 w-4" /> {p.label}
            </CommandItem>
          ))}
        </CommandGroup>
        {q && (
          <>
            {subjectMatches.length > 0 && (
              <><CommandSeparator />
              <CommandGroup heading="Subjects">
                {subjectMatches.map(s => (
                  <CommandItem key={s.code} onSelect={() => go("/syllabus")}>
                    <BookOpen className="mr-2 h-4 w-4" /> {s.name} <span className="ml-auto text-xs text-muted-foreground">{s.code}</span>
                  </CommandItem>
                ))}
              </CommandGroup></>
            )}
            {facultyMatches.length > 0 && (
              <><CommandSeparator />
              <CommandGroup heading="Faculty">
                {facultyMatches.map(f => (
                  <CommandItem key={f.email} onSelect={() => go("/faculty")}>
                    <Users className="mr-2 h-4 w-4" /> {f.name} <span className="ml-auto text-xs text-muted-foreground">{f.department}</span>
                  </CommandItem>
                ))}
              </CommandGroup></>
            )}
            {noticeMatches.length > 0 && (
              <><CommandSeparator />
              <CommandGroup heading="Notices">
                {noticeMatches.map(n => (
                  <CommandItem key={n.id} onSelect={() => go("/notices")}>
                    <Bell className="mr-2 h-4 w-4" /> {n.title}
                  </CommandItem>
                ))}
              </CommandGroup></>
            )}
            {eventMatches.length > 0 && (
              <><CommandSeparator />
              <CommandGroup heading="Events">
                {eventMatches.map(e => (
                  <CommandItem key={e.id} onSelect={() => go("/events")}>
                    <PartyPopper className="mr-2 h-4 w-4" /> {e.title}
                  </CommandItem>
                ))}
              </CommandGroup></>
            )}
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
