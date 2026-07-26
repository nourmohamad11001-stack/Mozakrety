"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api, Subject, Todo, dateKey } from "@/lib/api-client";

export default function TodosPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterSubject, setFilterSubject] = useState("all");
  const [filterDay, setFilterDay] = useState<"all" | "today" | "tomorrow">("all");
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [dayChoice, setDayChoice] = useState<Record<string, "today" | "tomorrow">>({});

  useEffect(() => {
    api.getSubjects().then((r) => setSubjects(r.subjects));
    api.getTodos().then((r) => setTodos(r.todos));
  }, []);

  const todayKey = dateKey(new Date());
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowKeyStr = dateKey(tomorrow);

  async function handleAdd(subjectId: string, teacher: string) {
    const key = `${subjectId}-${teacher}`;
    const text = (inputs[key] || "").trim();
    if (!text) return;
    const day = dayChoice[key] || "today";
    const dueDate = day === "tomorrow" ? tomorrowKeyStr : todayKey;
    const res = await api.addTodo(subjectId, teacher, text, dueDate);
    setTodos((prev) => [res.todo, ...prev]);
    setInputs((prev) => ({ ...prev, [key]: "" }));
  }
  async function handleToggle(t: Todo) {
    const res = await api.toggleTodo(t.id, !t.done);
    setTodos((prev) => prev.map((x) => (x.id === t.id ? res.todo : x)));
  }
  async function handleDelete(id: string) {
    await api.deleteTodo(id);
    setTodos((prev) => prev.filter((x) => x.id !== id));
  }

  const subjectsToShow = filterSubject === "all" ? subjects : subjects.filter((s) => s.id === filterSubject);

  return (
    <AppShell>
      <div style={{ marginBottom: 28, paddingBottom: 18, borderBottom: "1.5px solid var(--paper-line)" }}>
        <span style={{ display: "inline-block", fontSize: 11, fontWeight: 700, color: "var(--coral)", background: "var(--coral-soft)", padding: "3px 11px", borderRadius: 20, marginBottom: 9 }}>مهامك كلها في مكان واحد</span>
        <h2 style={{ fontFamily: "Changa", fontSize: 29, fontWeight: 800 }}>قائمة المهام</h2>
        <div style={{ color: "var(--ink-soft)", fontSize: 13.5, marginTop: 4 }}>فلتر حسب المادة أو اليوم، وضيف مهام جديدة لأي مدرس</div>
      </div>

      <div className="card" style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 26, padding: "16px 20px" }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700, marginBottom: 8 }}>المادة</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <div className={`chip ${filterSubject === "all" ? "selected" : ""}`} onClick={() => setFilterSubject("all")}>الكل</div>
            {subjects.map((s) => (
              <div key={s.id} className={`chip ${filterSubject === s.id ? "selected" : ""}`} onClick={() => setFilterSubject(s.id)}>{s.name}</div>
            ))}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700, marginBottom: 8 }}>اليوم</div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <div className={`chip ${filterDay === "all" ? "selected" : ""}`} onClick={() => setFilterDay("all")}>الكل</div>
            <div className={`chip ${filterDay === "today" ? "selected" : ""}`} onClick={() => setFilterDay("today")}>النهاردة</div>
            <div className={`chip ${filterDay === "tomorrow" ? "selected" : ""}`} onClick={() => setFilterDay("tomorrow")}>بكرة</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 18 }}>
        {subjectsToShow.flatMap((s) =>
          s.teachers.map((t) => {
            const key = `${s.id}-${t.name}`;
            const items = todos.filter((x) => x.subjectId === s.id && x.teacher === t.name);
            const todayItems = items.filter((x) => x.dueDate <= todayKey);
            const tomorrowItems = items.filter((x) => x.dueDate === tomorrowKeyStr);
            const remaining = items.filter((x) => !x.done).length;
            return (
              <div key={key} className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 13, paddingBottom: 11, borderBottom: "1.5px dashed var(--paper-line)" }}>
                  <div>
                    <div style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>{s.name}</div>
                    <div style={{ fontFamily: "Changa", fontWeight: 700, fontSize: 14.5, color: "var(--indigo)" }}>{t.name}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#fff", background: "var(--sage)", padding: "2px 9px", borderRadius: 12, fontWeight: 700, height: "fit-content" }}>{remaining}</span>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 9 }}>
                  <input
                    type="text" placeholder="اكتب مهمة جديدة..."
                    value={inputs[key] || ""}
                    onChange={(e) => setInputs((p) => ({ ...p, [key]: e.target.value }))}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd(s.id, t.name)}
                    style={{ flex: 1, border: "1.5px solid var(--paper-line)", borderRadius: 9, padding: "9px 11px", fontSize: 13, outline: "none", background: "var(--paper)", color: "var(--ink)" }}
                  />
                  <button onClick={() => handleAdd(s.id, t.name)} style={{ width: 38, borderRadius: 9, border: "none", background: "var(--indigo)", color: "#fff", fontSize: 18, cursor: "pointer" }}>+</button>
                </div>
                <div style={{ display: "flex", gap: 6, marginBottom: 13 }}>
                  <div className={`chip ${(dayChoice[key] || "today") === "today" ? "selected" : ""}`} style={{ borderRadius: 14, padding: "4px 13px", fontSize: 11.5 }}
                    onClick={() => setDayChoice((p) => ({ ...p, [key]: "today" }))}>النهاردة</div>
                  <div className={`chip ${dayChoice[key] === "tomorrow" ? "selected" : ""}`} style={{ borderRadius: 14, padding: "4px 13px", fontSize: 11.5 }}
                    onClick={() => setDayChoice((p) => ({ ...p, [key]: "tomorrow" }))}>بكرة</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7, maxHeight: 300, overflowY: "auto" }}>
                  {items.length === 0 && <div className="empty-note" style={{ fontSize: 12, padding: 16 }}>مفيش مهام لسه، ضيف واحدة فوق 👆</div>}
                  {(filterDay === "all" || filterDay === "today") && (
                    <>
                      {filterDay === "all" && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginTop: 9 }}>📌 النهاردة</div>}
                      {todayItems.map((x) => <TodoRow key={x.id} todo={x} onToggle={handleToggle} onDelete={handleDelete} />)}
                    </>
                  )}
                  {(filterDay === "all" || filterDay === "tomorrow") && (
                    <>
                      {filterDay === "all" && <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-soft)", marginTop: 9 }}>🌙 بكرة</div>}
                      {tomorrowItems.map((x) => <TodoRow key={x.id} todo={x} onToggle={handleToggle} onDelete={handleDelete} />)}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppShell>
  );
}

function TodoRow({ todo, onToggle, onDelete }: { todo: Todo; onToggle: (t: Todo) => void; onDelete: (id: string) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "9px 11px", borderRadius: 9, background: "var(--paper)", border: "1px solid var(--paper-line)", fontSize: 13, opacity: todo.done ? 0.55 : 1 }}>
      <div onClick={() => onToggle(todo)} style={{
        width: 19, height: 19, borderRadius: 6, border: "2px solid var(--sage)", flexShrink: 0, cursor: "pointer",
        display: "flex", alignItems: "center", justifyContent: "center", background: todo.done ? "var(--sage)" : "var(--card-bg)", color: "#fff", fontSize: 12,
      }}>{todo.done ? "✓" : ""}</div>
      <div style={{ flex: 1, wordBreak: "break-word", textDecoration: todo.done ? "line-through" : "none", color: todo.done ? "var(--ink-soft)" : "inherit" }}>{todo.text}</div>
      <button onClick={() => onDelete(todo.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", fontSize: 15 }}>✕</button>
    </div>
  );
}
