import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (localStorage.getItem("campusai_install_dismissed") === "1") { setDismissed(true); return; }
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferred || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-xl border bg-card p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white shadow" style={{ background: "var(--gradient-brand)" }}>
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-semibold">Install CampusAI</h4>
          <p className="mt-0.5 text-xs text-muted-foreground">Get the app on your device for faster access and a native feel.</p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" className="text-white" style={{ background: "var(--gradient-brand)" }} onClick={async () => {
              await deferred.prompt();
              await deferred.userChoice;
              setDeferred(null);
            }}>Install</Button>
            <Button size="sm" variant="ghost" onClick={() => {
              localStorage.setItem("campusai_install_dismissed", "1");
              setDismissed(true);
            }}>Not now</Button>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground" aria-label="Dismiss" onClick={() => setDismissed(true)}>
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
