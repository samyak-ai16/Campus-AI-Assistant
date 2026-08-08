import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SUBJECTS, MONTHLY_ATTENDANCE, getAttendanceSummary } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/attendance")({
  head: () => ({
    meta: [
      { title: "Attendance — CampusAI" },
      { name: "description", content: "Track your attendance across every subject." },
    ],
  }),
  component: Attendance,
});

function Attendance() {
  const summary = getAttendanceSummary();
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Keep your attendance above 75% to be exam-eligible.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Overall</div>
          <div className="mt-2 text-4xl font-bold">{summary.percent}%</div>
          <Progress value={summary.percent} className="mt-3 h-2" />
          <div className="mt-2 text-xs text-muted-foreground">{summary.attended} of {summary.total} classes attended</div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Subjects on track</div>
          <div className="mt-2 text-4xl font-bold text-green-600">
            {SUBJECTS.filter(s => s.attended / s.total >= 0.75).length}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            Above 75% threshold
          </div>
        </Card>
        <Card className="p-6">
          <div className="text-sm text-muted-foreground">Subjects at risk</div>
          <div className="mt-2 text-4xl font-bold text-destructive">
            {SUBJECTS.filter(s => s.attended / s.total < 0.75).length}
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Below 75%
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Monthly trend</h2>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_ATTENDANCE}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="month" tickLine={false} className="text-xs" />
              <YAxis domain={[60, 100]} tickLine={false} className="text-xs" />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Line type="monotone" dataKey="percent" stroke="oklch(0.58 0.22 285)" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-lg font-semibold">Subject-wise attendance</h2>
        <div className="mt-4 space-y-4">
          {SUBJECTS.map((s) => {
            const pct = Math.round((s.attended / s.total) * 100);
            const atRisk = pct < 75;
            return (
              <div key={s.code} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.code} · {s.faculty}</div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${atRisk ? "text-destructive" : ""}`}>{pct}%</div>
                    <div className="text-xs text-muted-foreground">{s.attended}/{s.total}</div>
                  </div>
                </div>
                <Progress value={pct} className="mt-3 h-2" />
                {atRisk && (
                  <Badge variant="destructive" className="mt-3">
                    <AlertTriangle className="mr-1 h-3 w-3" /> Attend {Math.ceil((0.75 * s.total - s.attended) / 0.25)} more to recover
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
