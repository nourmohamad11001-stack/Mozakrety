"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, Subject, StudySession } from "@/lib/api-client";
import { useRouter } from "next/navigation";

export default function SubjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getSubjects().then((r) => setSubject(r.subjects.find((s) => s.id === params.id) || null));
    api.getSessions().then((r) => setSessions(r.sessions.filter((s) => s.subjectId === params.id)));
    api.getNote(params.id).then((r) => setNote(r.note?.content || ""));
  }, [params.id]);

  let noteTimeout: ReturnType<typeof setTimeout>;
  function handleNoteChange(v: string) {
    setNote(v);
    clearTimeout(noteTimeout);
    noteTimeout = setTimeout(async () => {
      await api.saveNote(params.id, v);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    }, 600);
  }

  if (!subject) return <AppShell><div className="empty-note">جاري التحميل...</div></AppShell>;

  const total = sessions.reduce((a, b) => a + b.minutes, 0);

  return (
    <AppShell>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: "1.5px solid var(--paper-line)" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--coral)", background: "var(--coral-soft)", padding: "3px 11px", borderRadius: 20, marginBottom: 9 }}>مادة</span>
        <h2 style={{ fontFamily: "Changa", fontSize: 29, fontWeight: 800 }}>{subject.name}</h2>
        <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>مدرسينك في {subject.name}</div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 28, flexWrap: "wrap" }}>
        {subject.teachers.map((t) => {
          const teacherTotal = sessions.filter((s) => s.teacher === t.name).reduce((a, b) => a + b.minutes, 0);
          return (
            <div key={t.id} className="card" style={{ padding: "18px 22px", minWidth: 180 }}>
              <div style={{ fontFamily: "Changa", fontSize: 16, fontWeight: 700, color: "var(--indigo)" }}>{t.name}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 4 }}>{teacherTotal} دقيقة مذاكرة</div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <div style={{ fontFamily: "Changa", fontSize: 28, fontWeight: 800, color: "var(--indigo)" }}>{total}</div>
        <div style={{ color: "var(--ink-soft)", fontSize: 13 }}>دقيقة إجمالية مذاكرتها في {subject.name}</div>
      </div>

      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", marginBottom: 28, cursor: "pointer" }} onClick={() => router.push(`/todos`)}>
        <div>
          <div style={{ fontFamily: "Changa", fontWeight: 700, fontSize: 15, color: "var(--indigo)" }}>📋 مهام {subject.name}</div>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3 }}>افتح قائمة المهام (فلترها بالمادة من فوق)</div>
        </div>
        <div style={{ fontSize: 20, color: "var(--coral)" }}>‹</div>
      </div>

      <div className="section-title">ملاحظاتي</div>
      <div className="card" style={{ padding: 22, marginBottom: 28 }}>
        <textarea
          value={note}
          onChange={(e) => handleNoteChange(e.target.value)}
          placeholder={`اكتب هنا ملخص، نقاط مهمة، أو أي حاجة عايز تفتكرها في ${subject.name}...`}
          style={{ width: "100%", minHeight: 160, border: "none", outline: "none", resize: "vertical", fontSize: 14, background: "transparent", color: "var(--ink)", lineHeight: 1.9 }}
        />
        <div style={{ fontSize: 11, color: "var(--sage)", marginTop: 6, opacity: saved ? 1 : 0, transition: "opacity .3s" }}>تم الحفظ ✓</div>
      </div>

      <div className="section-title">سجل جلسات {subject.name}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {sessions.length === 0 && <div className="empty-note">مفيش جلسات مسجلة في المادة دي لسه.</div>}
        {sessions.slice(0, 15).map((s) => {
          const d = new Date(s.createdAt);
          return (
            <div key={s.id} className="log-item">
              <div>
                <div className="lname">{d.toLocaleDateString("ar-EG", { day: "numeric", month: "short" })} <span style={{ color: "var(--ink-soft)", fontWeight: 400 }}>— {s.teacher}</span></div>
                <div className="lteacher">{d.toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
              <div className="lmin">{s.minutes} د</div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
