"use client";
import { useEffect, useRef, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, Subject, StudySession, fmtHM, isToday, isThisWeek, isThisMonth } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subjectId, setSubjectId] = useState<string>("");
  const [teacher, setTeacher] = useState<string>("");
  const [durationMin, setDurationMin] = useState(25);
  const [remaining, setRemaining] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    api.getSubjects().then((r) => {
      setSubjects(r.subjects);
      if (r.subjects[0]) {
        setSubjectId(r.subjects[0].id);
        setTeacher(r.subjects[0].teachers[0]?.name || "");
      }
    });
    api.getSessions().then((r) => setSessions(r.sessions));
  }, []);

  useEffect(() => {
    setRemaining(durationMin * 60);
  }, [durationMin]);

  function start() {
    if (running) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current!);
          complete();
          return durationMin * 60;
        }
        return r - 1;
      });
    }, 1000);
  }
  function pause() {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }
  function reset() {
    pause();
    setRemaining(durationMin * 60);
  }
  async function complete() {
    setRunning(false);
    const minutes = durationMin;
    const res = await api.addSession(subjectId, teacher, minutes);
    setSessions((prev) => [res.session, ...prev]);
  }

  const subject = subjects.find((s) => s.id === subjectId);
  const todayTotal = sessions.filter((s) => isToday(s.createdAt)).reduce((a, b) => a + b.minutes, 0);
  const weekTotal = sessions.filter((s) => isThisWeek(s.createdAt)).reduce((a, b) => a + b.minutes, 0);
  const monthTotal = sessions.filter((s) => isThisMonth(s.createdAt)).reduce((a, b) => a + b.minutes, 0);

  const neglected = subjects
    .map((s) => {
      const subjSessions = sessions.filter((x) => x.subjectId === s.id);
      const total = subjSessions.reduce((a, b) => a + b.minutes, 0);
      const daysSince = subjSessions.length === 0 ? Infinity : Math.floor((Date.now() - Math.max(...subjSessions.map((x) => new Date(x.createdAt).getTime()))) / (1000 * 60 * 60 * 24));
      return { id: s.id, name: s.name, total, daysSince };
    })
    .sort((a, b) => {
      const bd = b.daysSince === Infinity ? 1e9 : b.daysSince, ad = a.daysSince === Infinity ? 1e9 : a.daysSince;
      if (ad !== bd) return bd - ad;
      return a.total - b.total;
    });

  const todaySessions = sessions.filter((s) => isToday(s.createdAt));

  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");
  const pct = remaining / (durationMin * 60);
  const circumference = 2 * Math.PI * 80;
  const offset = circumference * (1 - pct);

  return (
    <AppShell>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, paddingBottom: 18, borderBottom: "1.5px solid var(--paper-line)", flexWrap: "wrap", gap: 14 }}>
        <div>
          <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--coral)", background: "var(--coral-soft)", padding: "3px 11px", borderRadius: 20, marginBottom: 9 }}>
            اليوم {new Date().toLocaleDateString("ar-EG", { weekday: "long", day: "numeric", month: "long" })}
          </span>
          <h2 style={{ fontFamily: "Changa", fontSize: 29, fontWeight: 800 }}>لوحة المذاكرة</h2>
          <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>اختار المادة، شغّل التايمر، وسجّل تقدمك أول بأول</div>
        </div>
      </div>

      <div className="section-title">إحصائيات المذاكرة</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard val={fmtHM(todayTotal)} lbl="اليوم" />
        <StatCard val={fmtHM(weekTotal)} lbl="آخر 7 أيام" />
        <StatCard val={fmtHM(monthTotal)} lbl="الشهر الحالي" />
      </div>

      <div className="section-title">مواد محتاجة اهتمام</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 32 }}>
        {neglected.map((s) => {
          let badge;
          if (s.daysSince === Infinity) badge = <Badge color="var(--gold)">لسه ماذاكرتهاش</Badge>;
          else if (s.daysSince >= 2) badge = <Badge color="var(--coral)">من {s.daysSince} أيام</Badge>;
          else if (s.daysSince === 1) badge = <Badge color="var(--coral)">من يوم</Badge>;
          else badge = <Badge color="var(--sage)">ذاكرتها النهاردة</Badge>;
          return (
            <div key={s.id} className="log-item" style={{ cursor: "pointer" }} onClick={() => router.push(`/subject/${s.id}`)}>
              <div><div className="lname">{s.name}</div><div className="lteacher">{s.total} دقيقة إجمالي</div></div>
              {badge}
            </div>
          );
        })}
      </div>

      <div className="card" style={{ padding: 32, display: "flex", gap: 36, alignItems: "center", marginBottom: 32, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 190, height: 190, flexShrink: 0 }}>
          <svg width="190" height="190" viewBox="0 0 190 190" style={{ transform: "rotate(-90deg)" }}>
            <circle cx="95" cy="95" r="80" fill="none" stroke="var(--paper-line)" strokeWidth="10" />
            <circle cx="95" cy="95" r="80" fill="none" stroke="var(--coral)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s linear" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "Changa", fontSize: 33, fontWeight: 800 }}>{mm}:{ss}</div>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 3 }}>{running ? "جاري المذاكرة..." : "جاهز للبدء"}</div>
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 230 }}>
          <div className="section-title" style={{ marginBottom: 10 }}>اختار المادة</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {subjects.map((s) => (
              <div key={s.id} className={`chip ${subjectId === s.id ? "selected" : ""}`}
                onClick={() => { setSubjectId(s.id); setTeacher(s.teachers[0]?.name || ""); }}>{s.name}</div>
            ))}
          </div>
          <div className="section-title" style={{ marginBottom: 10, marginTop: 16 }}>اختار المدرس</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            {subject?.teachers.map((t) => (
              <div key={t.id} className={`chip ${teacher === t.name ? "selected" : ""}`} onClick={() => setTeacher(t.name)}>{t.name}</div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 9, marginBottom: 20, alignItems: "center" }}>
            <button className="btn-ghost" style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid var(--paper-line)", background: "var(--paper)", fontSize: 16, cursor: "pointer" }}
              onClick={() => !running && setDurationMin((d) => Math.max(5, d - 5))}>−</button>
            <div style={{ fontFamily: "Changa", fontSize: 16, minWidth: 70, textAlign: "center" }}>{durationMin} دقيقة</div>
            <button className="btn-ghost" style={{ width: 34, height: 34, borderRadius: 9, border: "1.5px solid var(--paper-line)", background: "var(--paper)", fontSize: 16, cursor: "pointer" }}
              onClick={() => !running && setDurationMin((d) => Math.min(120, d + 5))}>+</button>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button className="btn btn-primary" disabled={running || !subjectId} onClick={start}>ابدأ</button>
            <button className="btn btn-secondary" disabled={!running} onClick={pause}>إيقاف مؤقت</button>
            <button className="btn btn-ghost" onClick={reset}>إعادة ضبط</button>
          </div>
        </div>
      </div>

      <div className="section-title">سجل اليوم</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {todaySessions.length === 0 && <div className="empty-note">لسه معملتش أي جلسة مذاكرة النهاردة. شغّل التايمر وابدأ!</div>}
        {todaySessions.map((s) => {
          const subj = subjects.find((x) => x.id === s.subjectId);
          const time = new Date(s.createdAt).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" });
          return (
            <div key={s.id} className="log-item">
              <div><div className="lname">{subj?.name || "مادة"} <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>— {s.teacher}</span></div><div className="lteacher">{time}</div></div>
              <div className="lmin">{s.minutes} د</div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}

function StatCard({ val, lbl }: { val: string; lbl: string }) {
  return (
    <div className="card" style={{ padding: "18px 20px", position: "relative" }}>
      <div style={{ fontFamily: "Changa", fontSize: 24, fontWeight: 800, color: "var(--indigo)" }}>{val}</div>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3 }}>{lbl}</div>
    </div>
  );
}
function Badge({ children, color }: { children: React.ReactNode; color: string }) {
  return <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 11px", borderRadius: 20, background: "var(--coral-soft)", color }}>{children}</span>;
}
