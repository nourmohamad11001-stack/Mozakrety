"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, Subject, StudySession, levelInfo, fmtHM, calcStreak } from "@/lib/api-client";

export default function AccountPage() {
  const [me, setMe] = useState<any>(null);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);

  useEffect(() => {
    api.getMe().then((r) => setMe(r.user));
    api.getSubjects().then((r) => setSubjects(r.subjects));
    api.getSessions().then((r) => setSessions(r.sessions));
  }, []);

  if (!me) return <AppShell><div className="empty-note">جاري التحميل...</div></AppShell>;

  const lv = levelInfo(me.points);
  const joined = new Date(me.createdAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
  const totalAll = sessions.reduce((a, b) => a + b.minutes, 0);
  const breakdown = subjects
    .map((s) => ({ name: s.name, total: sessions.filter((x) => x.subjectId === s.id).reduce((a, b) => a + b.minutes, 0) }))
    .sort((a, b) => b.total - a.total);
  const maxTotal = Math.max(1, ...breakdown.map((s) => s.total));

  return (
    <AppShell>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: "1.5px solid var(--paper-line)" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--coral)", background: "var(--coral-soft)", padding: "3px 11px", borderRadius: 20, marginBottom: 9 }}>ملفك الشخصي</span>
        <h2 style={{ fontFamily: "Changa", fontSize: 29, fontWeight: 800 }}>الحساب</h2>
        <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>إحصائياتك ومستواك في المذاكرة</div>
      </div>

      <div className="card" style={{ padding: 26, marginBottom: 26, display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <div style={{ fontSize: 52 }}>{me.avatar}</div>
        <div>
          <div style={{ fontFamily: "Changa", fontSize: 20, fontWeight: 800, color: "var(--indigo)" }}>{me.name || me.email}</div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 3 }}>عضو منذ {joined}</div>
        </div>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 26 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <span style={{ fontFamily: "Changa", fontSize: 22, fontWeight: 800, color: "var(--indigo)" }}>المستوى {lv.level}</span>
          <span style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>{me.points} نقطة إجمالي</span>
        </div>
        <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.round(lv.progress * 100)}%` }} /></div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 7 }}>{lv.pointsInLevel} / {lv.neededForNext} نقطة للمستوى {lv.level + 1}</div>
      </div>

      <div className="section-title">إحصائيات عامة</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        <div className="card" style={{ padding: "18px 20px" }}><div style={{ fontFamily: "Changa", fontSize: 24, fontWeight: 800, color: "var(--indigo)" }}>{fmtHM(totalAll)}</div><div style={{ fontSize: 12, color: "var(--ink-soft)" }}>إجمالي وقت المذاكرة</div></div>
        <div className="card" style={{ padding: "18px 20px" }}><div style={{ fontFamily: "Changa", fontSize: 24, fontWeight: 800, color: "var(--indigo)" }}>{calcStreak(sessions)}</div><div style={{ fontSize: 12, color: "var(--ink-soft)" }}>يوم متتالي</div></div>
        <div className="card" style={{ padding: "18px 20px" }}><div style={{ fontFamily: "Changa", fontSize: 24, fontWeight: 800, color: "var(--indigo)" }}>{sessions.length}</div><div style={{ fontSize: 12, color: "var(--ink-soft)" }}>جلسة مذاكرة</div></div>
      </div>

      <div className="section-title">توزيع المذاكرة على المواد</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {breakdown.map((s) => (
          <div key={s.name} className="log-item">
            <div style={{ flex: 1 }}>
              <div className="lname">{s.name}</div>
              <div className="progress-track" style={{ marginTop: 6, height: 8 }}><div className="progress-fill" style={{ width: `${Math.round((s.total / maxTotal) * 100)}%` }} /></div>
            </div>
            <div className="lmin" style={{ marginRight: 14 }}>{s.total} د</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
