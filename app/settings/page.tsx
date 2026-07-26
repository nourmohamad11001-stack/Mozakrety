"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, Subject } from "@/lib/api-client";

const AVATARS = ["🙂", "😎", "🦁", "🐼", "🚀", "📚", "🌟", "🔥", "🧠", "🦅"];

export default function SettingsPage() {
  const [me, setMe] = useState<any>(null);
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeSubjectId, setActiveSubjectId] = useState("");
  const [newTeacher, setNewTeacher] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    api.getMe().then((r) => { setMe(r.user); setName(r.user?.name || ""); });
    api.getSubjects().then((r) => { setSubjects(r.subjects); if (r.subjects[0]) setActiveSubjectId(r.subjects[0].id); });
  }, []);

  async function saveName() {
    if (!name.trim()) return;
    const res = await api.updateMe({ name });
    setMe(res.user);
    flash("تم تحديث الاسم ✓");
  }
  async function pickAvatar(a: string) {
    const res = await api.updateMe({ avatar: a });
    setMe(res.user);
  }
  async function addTeacher() {
    if (!newTeacher.trim() || !activeSubjectId) return;
    try {
      await api.addTeacher(activeSubjectId, newTeacher.trim());
      const r = await api.getSubjects();
      setSubjects(r.subjects);
      setNewTeacher("");
      flash("تمت الإضافة ✓");
    } catch (e: any) {
      flash(e.message || "حدث خطأ");
    }
  }
  async function removeTeacher(teacherId: string) {
    try {
      await api.removeTeacher(teacherId);
      const r = await api.getSubjects();
      setSubjects(r.subjects);
    } catch (e: any) {
      flash(e.message || "حدث خطأ");
    }
  }
  function flash(t: string) { setMsg(t); setTimeout(() => setMsg(""), 2000); }

  const activeSubject = subjects.find((s) => s.id === activeSubjectId);

  return (
    <AppShell>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: "1.5px solid var(--paper-line)" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--coral)", background: "var(--coral-soft)", padding: "3px 11px", borderRadius: 20, marginBottom: 9 }}>تخصيص</span>
        <h2 style={{ fontFamily: "Changa", fontSize: 29, fontWeight: 800 }}>الإعدادات</h2>
        <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>عدّل بياناتك وأضف مدرسين جدد</div>
      </div>

      {msg && <div className="card" style={{ padding: "10px 16px", marginBottom: 16, color: "var(--sage)", fontSize: 13 }}>{msg}</div>}

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <div style={{ fontFamily: "Changa", fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--indigo)" }}>الملف الشخصي</div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="اسمك"
            style={{ flex: 1, minWidth: 160, border: "1.5px solid var(--paper-line)", borderRadius: 9, padding: "10px 12px", fontSize: 13.5, background: "var(--paper)", color: "var(--ink)", outline: "none" }} />
          <button className="btn btn-primary" onClick={saveName}>حفظ</button>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {AVATARS.map((a) => (
            <div key={a} onClick={() => pickAvatar(a)} style={{
              width: 40, height: 40, borderRadius: 10, border: `1.5px solid ${me?.avatar === a ? "var(--coral)" : "var(--paper-line)"}`,
              background: me?.avatar === a ? "var(--coral-soft)" : "var(--paper)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, cursor: "pointer",
            }}>{a}</div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: 22, marginBottom: 22 }}>
        <div style={{ fontFamily: "Changa", fontWeight: 700, fontSize: 15, marginBottom: 14, color: "var(--indigo)" }}>إدارة المدرسين</div>
        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
          {subjects.map((s) => (
            <div key={s.id} className={`chip ${activeSubjectId === s.id ? "selected" : ""}`} onClick={() => setActiveSubjectId(s.id)}>{s.name}</div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <input type="text" value={newTeacher} onChange={(e) => setNewTeacher(e.target.value)} placeholder="اسم المدرس الجديد..."
            style={{ flex: 1, border: "1.5px solid var(--paper-line)", borderRadius: 9, padding: "10px 12px", fontSize: 13.5, background: "var(--paper)", color: "var(--ink)", outline: "none" }} />
          <button className="btn btn-primary" onClick={addTeacher}>إضافة</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {activeSubject?.teachers.map((t) => (
            <div key={t.id} style={{ display: "flex", justifyContent: "space-between", background: "var(--paper)", border: "1px solid var(--paper-line)", borderRadius: 9, padding: "9px 13px", fontSize: 13 }}>
              <span>{t.name}</span>
              <button onClick={() => removeTeacher(t.id)} style={{ background: "none", border: "none", color: "var(--ink-soft)", cursor: "pointer", fontSize: 14 }}>✕ حذف</button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
