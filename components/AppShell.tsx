"use client";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { api, Subject, levelInfo } from "@/lib/api-client";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [me, setMe] = useState<any>(null);
  const [openTodoCount, setOpenTodoCount] = useState(0);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.body.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    api.getSubjects().then((r) => setSubjects(r.subjects)).catch(() => {});
    api.getMe().then((r) => setMe(r.user)).catch(() => {});
    api.getTodos().then((r) => setOpenTodoCount(r.todos.filter((t) => !t.done).length)).catch(() => {});
  }, [pathname]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.body.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  const lv = me ? levelInfo(me.points) : null;

  return (
    <div style={{ display: "flex", minHeight: "100vh", maxWidth: 1220, margin: "0 auto" }}>
      <aside
        style={{
          width: 270, flexShrink: 0, background: "var(--card-bg)", borderLeft: "1px solid var(--paper-line)",
          padding: "28px 18px", display: "flex", flexDirection: "column", gap: 20, minHeight: "100vh",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 16, borderBottom: "2px solid var(--ink)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9, background: "var(--indigo)", color: "#fff", fontFamily: "Changa",
              fontWeight: 700, fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-4deg)",
            }}>م</div>
            <div>
              <h1 style={{ fontFamily: "Changa", fontWeight: 700, fontSize: 20 }}>مذاكرتي</h1>
              <span style={{ display: "block", fontSize: 10.5, color: "var(--ink-soft)" }}>خطتك للثانوية العامة</span>
            </div>
          </div>
          <div
            onClick={toggleTheme}
            style={{
              width: 36, height: 36, borderRadius: 10, border: "1.5px solid var(--paper-line)", background: "var(--paper)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16,
            }}
          >
            {dark ? "☀️" : "🌙"}
          </div>
        </div>

        <NavSection>
          <NavItem active={pathname === "/dashboard"} onClick={() => router.push("/dashboard")}>لوحة المذاكرة</NavItem>
          <NavItem active={pathname === "/todos"} onClick={() => router.push("/todos")}>
            قائمة المهام
            {openTodoCount > 0 && <Badge>{openTodoCount}</Badge>}
          </NavItem>
        </NavSection>

        <NavSection label="المواد">
          {subjects.map((s) => (
            <NavItem key={s.id} active={pathname === `/subject/${s.id}`} onClick={() => router.push(`/subject/${s.id}`)}>
              {s.name}
              <span style={{ marginRight: "auto", fontSize: 10.5, opacity: 0.7 }}>{s.teachers.length} مدرسين</span>
            </NavItem>
          ))}
        </NavSection>

        <NavSection label="حسابي">
          <NavItem active={pathname === "/account"} onClick={() => router.push("/account")}>الحساب</NavItem>
          <NavItem active={pathname === "/settings"} onClick={() => router.push("/settings")}>الإعدادات</NavItem>
          <NavItem active={false} onClick={() => signOut({ callbackUrl: "/login" })}>تسجيل الخروج</NavItem>
        </NavSection>

        <div style={{ marginTop: "auto" }} />
      </aside>

      <main style={{ flex: 1, padding: "26px 42px 60px 42px", minWidth: 0 }}>
        {me && (
          <div className="card" style={{
            display: "flex", alignItems: "center", gap: 10, marginBottom: 18, padding: "10px 16px",
          }}>
            <span style={{ fontSize: 20 }}>{me.avatar}</span>
            <span style={{ fontWeight: 700, fontSize: 14 }}>مرحبًا، {me.name || session?.user?.email}</span>
            <span style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{me.points} نقطة</span>
            {lv && (
              <span style={{ marginRight: "auto", fontSize: 11, fontWeight: 700, color: "#fff", background: "var(--gold)", padding: "3px 10px", borderRadius: 12 }}>
                المستوى {lv.level}
              </span>
            )}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

function NavSection({ label, children }: { label?: string; children: React.ReactNode }) {
  return (
    <div>
      {label && <div style={{ fontSize: 11, color: "var(--ink-soft)", fontWeight: 700, letterSpacing: 0.5, padding: "0 8px", textTransform: "uppercase" }}>{label}</div>}
      {children}
    </div>
  );
}
function NavItem({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 11px", borderRadius: 9, cursor: "pointer",
        fontSize: 14.5, fontWeight: 500, background: active ? "var(--indigo)" : "transparent", color: active ? "#fff" : "var(--ink)",
      }}
    >
      <span style={{ width: 9, height: 9, borderRadius: "50%", background: active ? "var(--coral)" : "var(--ink-soft)", flexShrink: 0 }} />
      {children}
    </div>
  );
}
function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{ marginRight: "auto", background: "var(--coral)", color: "#fff", fontSize: 10, fontWeight: 700, padding: "1px 7px", borderRadius: 10 }}>
      {children}
    </span>
  );
}
