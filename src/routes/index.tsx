import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Brain,
  Sparkles,
  Calendar,
  BookOpen,
  Users,
  Bell,
  GraduationCap,
  BarChart3,
  MessageSquare,
  Send,
  ArrowRight,
  Check,
  Star,
  Mail,
  MapPin,
  Phone,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CampusAI — Your intelligent college companion" },
      {
        name: "description",
        content:
          "CampusAI is an AI-powered student assistant for attendance, timetables, syllabus, faculty, notices, events, and exams — all in one intelligent dashboard.",
      },
      { property: "og:title", content: "CampusAI — Your intelligent college companion" },
      {
        property: "og:description",
        content:
          "CampusAI is an AI-powered student assistant for attendance, timetables, syllabus, faculty, notices, events, and exams — all in one intelligent dashboard.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function AnimatedBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute -top-40 -left-20 h-[500px] w-[500px] rounded-full bg-primary/25 blur-3xl animate-pulse" />
      <div
        className="absolute top-1/3 -right-32 h-[600px] w-[600px] rounded-full blur-3xl animate-pulse"
        style={{ background: "oklch(0.72 0.18 195 / 0.25)", animationDelay: "1.5s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full blur-3xl animate-pulse"
        style={{ background: "oklch(0.66 0.2 340 / 0.2)", animationDelay: "3s" }}
      />
      <svg
        className="absolute inset-0 h-full w-full opacity-[0.04]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="grid"
            width="48"
            height="48"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>
    </div>
  );
}

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/40 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <a href="#top" className="flex items-center gap-2">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md"
            style={{ background: "var(--gradient-brand)" }}
          >
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">CampusAI</span>
        </a>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</a>
          <a href="#stats" className="text-sm text-muted-foreground hover:text-foreground">Stats</a>
          <a href="#testimonials" className="text-sm text-muted-foreground hover:text-foreground">Testimonials</a>
          <a href="#faq" className="text-sm text-muted-foreground hover:text-foreground">FAQ</a>
          <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <a href="/auth">Login</a>
          </Button>
          <Button
            size="sm"
            className="text-white shadow-md"
            style={{ background: "var(--gradient-brand)" }}
            asChild
          >
            <a href="/auth?tab=register">Register</a>
          </Button>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section id="top" className="relative overflow-hidden px-6 pt-20 pb-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
        <div className="animate-fade-in">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Powered by Generative AI
          </Badge>
          <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Your intelligent{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "var(--gradient-brand)" }}
            >
              college companion
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            CampusAI answers your questions, tracks attendance, surfaces the right lecture at the right
            time, and keeps every notice, syllabus, and exam one message away.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button
              size="lg"
              className="gap-2 text-white shadow-lg"
              style={{ background: "var(--gradient-brand)" }}
              asChild
            >
              <a href="/auth?tab=register">
                Get Started <ArrowRight className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="/auth">Login</a>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <a href="/auth?tab=register">Register</a>
            </Button>
          </div>
          <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background"
                  style={{
                    background: `oklch(0.7 0.15 ${180 + i * 40})`,
                  }}
                />
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              Loved by 12,000+ students
            </div>
          </div>
        </div>
        <ChatbotPreview />
      </div>
    </section>
  );
}

function ChatbotPreview() {
  const messages = [
    { role: "user", text: "What's my attendance in DBMS?" },
    {
      role: "ai",
      text: "Your **DBMS** attendance is **87%** — safely above the 75% threshold. You've missed 3 of 24 lectures this semester.",
    },
    { role: "user", text: "Any classes tomorrow morning?" },
    {
      role: "ai",
      text: "Yes — you have **Operating Systems** at 9:00 AM in Lab-2 with Prof. Sharma, followed by **Compiler Design** at 10:30 AM.",
    },
  ];
  const [visible, setVisible] = useState(0);
  const [typing, setTyping] = useState(false);
  useEffect(() => {
    if (visible >= messages.length) return;
    setTyping(true);
    const t = setTimeout(() => {
      setTyping(false);
      setVisible((v) => v + 1);
    }, visible === 0 ? 600 : 1400);
    return () => clearTimeout(t);
  }, [visible]);

  return (
    <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
      <div
        className="absolute -inset-4 rounded-3xl opacity-40 blur-2xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <Card
        className="relative overflow-hidden rounded-3xl border-border/60 bg-card/90 p-0 backdrop-blur-xl"
        style={{ boxShadow: "var(--shadow-glow)" }}
      >
        <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">CampusAI Assistant</p>
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Online now
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">Gemini</Badge>
        </div>
        <div className="flex h-420px flex-col gap-3 overflow-y-auto p-5">
          {messages.slice(0, visible).map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user"
                    ? "text-white"
                    : "bg-muted text-foreground"
                }`}
                style={
                  m.role === "user"
                    ? { background: "var(--gradient-brand)" }
                    : undefined
                }
                dangerouslySetInnerHTML={{
                  __html: m.text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>"),
                }}
              />
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="flex gap-1 rounded-2xl bg-muted px-4 py-3">
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0.15s" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0.3s" }} />
              </div>
            </div>
          )}
        </div>
        <div className="border-t border-border/50 p-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
            <input
              placeholder="Ask CampusAI anything…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              readOnly
            />
            <button
              className="flex h-8 w-8 items-center justify-center rounded-full text-white"
              style={{ background: "var(--gradient-brand)" }}
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

const FEATURES = [
  {
    icon: MessageSquare,
    title: "AI Assistant",
    desc: "Ask about attendance, timetables, syllabus or exams in natural language — get instant, contextual answers.",
  },
  {
    icon: BarChart3,
    title: "Attendance Analytics",
    desc: "Subject-wise progress bars, pie charts, monthly history and warnings before you fall below 75%.",
  },
  {
    icon: Calendar,
    title: "Smart Timetable",
    desc: "Daily and weekly views with a live 'current lecture' highlight and printable schedule.",
  },
  {
    icon: BookOpen,
    title: "Syllabus & PDFs",
    desc: "Every subject at a glance — faculty, credits, semester, view or download the PDF in one tap.",
  },
  {
    icon: Users,
    title: "Faculty Directory",
    desc: "Photos, departments, office hours, subjects and contact details — searchable and filterable.",
  },
  {
    icon: Bell,
    title: "Notices & Events",
    desc: "Categorised feeds for Academic, Placement, Examination and campus events with a calendar view.",
  },
];

function Features() {
  return (
    <section id="features" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Features</Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything a student needs, in one place
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built ground-up for campus life — powered by AI, designed for clarity.
          </p>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <Card
              key={f.title}
              className="group relative overflow-hidden border-border/60 bg-card/60 p-6 backdrop-blur transition-all hover:-translate-y-1 hover:shadow-xl"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-110"
                style={{ background: "var(--gradient-brand)" }}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const STATS = [
  { value: "12K+", label: "Active Students" },
  { value: "250+", label: "Faculty Onboarded" },
  { value: "1.4M", label: "AI Conversations" },
  { value: "99.9%", label: "Uptime" },
];

function Stats() {
  return (
    <section id="stats" className="px-6 py-20">
      <div className="mx-auto max-w-7xl">
        <Card
          className="relative overflow-hidden rounded-3xl border-0 p-10 text-white"
          style={{ background: "var(--gradient-brand)" }}
        >
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
          </div>
          <div className="relative grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-5xl font-bold tracking-tight">{s.value}</div>
                <div className="mt-2 text-sm text-white/80">{s.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  {
    name: "Ruchi Bhaisare",
    role: "CSE, 5th Sem",
    text: "CampusAI replaced three apps for me. Attendance, timetable and notices in one chat — brilliant.",
  },
  {
    name: "Akansha Ambadkar",
    role: "IT, 3rd Sem",
    text: "The AI answers before I even finish typing. Feels like having a senior on call 24/7.",
  },
  {
    name: "Yogesh Hande",
    role: "AI, 7th Sem",
    text: "The attendance warnings saved me twice this semester. Genuinely useful.",
  },
  {
    name: "Bhoomi Ingale",
    role: "CSE, 7th Sem",
    text: "The attendance alerts are a lifesaver. CampusAI makes it much easier to stay updated and avoid missing important information.",
  },
  {
    name: "Shrawani Ahirkar",
    role: "CSE, 3rd Sem",
    text: "CampusAI helped me keep track of important notices and upcoming exams. Simple, fast and actually useful.",
  },
];

function Testimonials() {
  return (
    <section id="testimonials" className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="secondary" className="mb-4">Testimonials</Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Students love CampusAI
          </h2>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <Card key={t.name} className="border-border/60 bg-card/60 p-6 backdrop-blur">
              <div className="mb-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm leading-relaxed text-foreground">"{t.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white"
                  style={{ background: "var(--gradient-brand)" }}
                >
                  {t.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

const FAQ = [
  {
    q: "Is CampusAI free for students?",
    a: "Yes. Every enrolled student gets full access to the AI assistant, dashboard and analytics at no cost.",
  },
  {
    q: "How does the AI know my attendance and timetable?",
    a: "Your college syncs its records securely with CampusAI. Your data is scoped to your account and never shared.",
  },
  {
    q: "Which AI model powers the assistant?",
    a: "The chat is powered by Google Gemini with an OpenAI fallback for uninterrupted answers.",
  },
  {
    q: "Can I use CampusAI on my phone?",
    a: "Absolutely — the entire experience is responsive and a PWA install is coming soon for offline access.",
  },
  {
    q: "How do I sign up?",
    a: "Hit Register above with your college email and roll number. You'll be verified and onboarded in under a minute.",
  },
];

function FAQSection() {
  return (
    <section id="faq" className="px-6 py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4">FAQ</Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Frequently asked</h2>
        </div>
        <Accordion type="single" collapsible className="mt-10">
          {FAQ.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/60">
              <AccordionTrigger className="text-left text-base">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}

function Contact() {
  const [sending, setSending] = useState(false);
  return (
    <section id="contact" className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2">
        <div>
          <Badge variant="secondary" className="mb-4">Contact</Badge>
          <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">Let's talk</h2>
          <p className="mt-4 text-muted-foreground">
            Questions, partnerships or feedback — we read every message.
          </p>
          <div className="mt-8 space-y-4 text-sm">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Mail className="h-4 w-4" />
              </div>
              samyakdongare244@gmail.com
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <Phone className="h-4 w-4" />
              </div>
              +91 96991 38153
            </div>
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--gradient-brand)" }}
              >
                <MapPin className="h-4 w-4" />
              </div>
              Nagpur, India
            </div>
          </div>
        </div>
        <Card className="border-border/60 bg-card/60 p-6 backdrop-blur">
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setSending(true);
              setTimeout(() => {
                setSending(false);
                toast.success("Message sent! We'll be in touch.");
                (e.target as HTMLFormElement).reset();
              }, 700);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-medium">Name</label>
                <Input required placeholder="Your name" className="mt-1" />
              </div>
              <div>
                <label className="text-xs font-medium">Email</label>
                <Input required type="email" placeholder="you@college.edu" className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Message</label>
              <Textarea required rows={5} placeholder="How can we help?" className="mt-1" />
            </div>
            <Button
              type="submit"
              className="w-full text-white"
              style={{ background: "var(--gradient-brand)" }}
              disabled={sending}
            >
              {sending ? "Sending…" : "Send message"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border/60 px-6 py-12">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-brand)" }}
            >
              <Brain className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold">CampusAI</span>
          </div>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            The AI-powered student companion that keeps your college life organised.
          </p>
          <div className="mt-6 flex gap-3">
            {[Twitter, Github, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:text-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>
        {[
          { title: "Product", links: ["Features", "AI Assistant", "Dashboard", "Pricing"] },
          { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
          { title: "Legal", links: ["Privacy", "Terms", "Security", "Cookies"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold">{col.title}</h4>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  <a href="#" className="hover:text-foreground">{l}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-7xl items-center justify-between border-t border-border/60 pt-6 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} CampusAI. All rights reserved.</span>
        <span className="flex items-center gap-1">
          <Check className="h-3 w-3 text-emerald-500" /> All systems operational
        </span>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <Stats />
        <Testimonials />
        <FAQSection />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
