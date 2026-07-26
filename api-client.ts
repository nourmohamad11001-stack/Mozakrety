export type Teacher = { id: string; name: string; subjectId: string };
export type Subject = { id: string; name: string; order: number; teachers: Teacher[] };
export type StudySession = { id: string; subjectId: string; teacher: string; minutes: number; createdAt: string };
export type Todo = { id: string; subjectId: string; teacher: string; text: string; done: boolean; dueDate: string; createdAt: string };

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText);
  return res.json();
}

export const api = {
  getSubjects: () => fetch("/api/subjects").then((r) => json<{ subjects: Subject[] }>(r)),
  addTeacher: (subjectId: string, name: string) =>
    fetch("/api/teachers", { method: "POST", body: JSON.stringify({ subjectId, name }) }).then((r) => json<{ teacher: Teacher }>(r)),
  removeTeacher: (teacherId: string) =>
    fetch("/api/teachers", { method: "DELETE", body: JSON.stringify({ teacherId }) }).then((r) => json<{ ok: true }>(r)),

  getSessions: () => fetch("/api/sessions").then((r) => json<{ sessions: StudySession[] }>(r)),
  addSession: (subjectId: string, teacher: string, minutes: number) =>
    fetch("/api/sessions", { method: "POST", body: JSON.stringify({ subjectId, teacher, minutes }) }).then((r) =>
      json<{ session: StudySession; points: number }>(r)
    ),

  getTodos: () => fetch("/api/todos").then((r) => json<{ todos: Todo[] }>(r)),
  addTodo: (subjectId: string, teacher: string, text: string, dueDate: string) =>
    fetch("/api/todos", { method: "POST", body: JSON.stringify({ subjectId, teacher, text, dueDate }) }).then((r) => json<{ todo: Todo }>(r)),
  toggleTodo: (id: string, done: boolean) =>
    fetch("/api/todos", { method: "PATCH", body: JSON.stringify({ id, done }) }).then((r) => json<{ todo: Todo }>(r)),
  deleteTodo: (id: string) => fetch("/api/todos", { method: "DELETE", body: JSON.stringify({ id }) }).then((r) => json<{ ok: true }>(r)),

  getNote: (subjectId: string) => fetch(`/api/notes?subjectId=${subjectId}`).then((r) => json<{ note: { content: string } | null }>(r)),
  saveNote: (subjectId: string, content: string) =>
    fetch("/api/notes", { method: "PUT", body: JSON.stringify({ subjectId, content }) }).then((r) => json<{ note: any }>(r)),

  getMe: () => fetch("/api/me").then((r) => json<{ user: any }>(r)),
  updateMe: (data: { name?: string; avatar?: string }) =>
    fetch("/api/me", { method: "PATCH", body: JSON.stringify(data) }).then((r) => json<{ user: any }>(r)),
};

export function levelInfo(points: number) {
  let level = 1, cum = 0, gap = 100;
  while (points >= cum + gap) { cum += gap; level++; gap += 50; }
  return { level, pointsInLevel: points - cum, neededForNext: gap, progress: Math.min(1, (points - cum) / gap) };
}

export function fmtHM(totalMin: number) {
  const h = Math.floor(totalMin / 60), m = totalMin % 60;
  return h > 0 ? `${h}س ${m}د` : `${m}د`;
}
export function dateKey(d: Date | string | number) {
  const dt = d instanceof Date ? d : new Date(d);
  return dt.toISOString().slice(0, 10);
}
export function isToday(iso: string) { return new Date(iso).toDateString() === new Date().toDateString(); }
export function isThisWeek(iso: string) { const diff = Date.now() - new Date(iso).getTime(); return diff >= 0 && diff <= 7 * 24 * 60 * 60 * 1000; }
export function isThisMonth(iso: string) { const d = new Date(iso), n = new Date(); return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth(); }
export function calcStreak(sessions: StudySession[]) {
  const days = new Set(sessions.map((s) => dateKey(s.createdAt)));
  if (days.size === 0) return 0;
  let streak = 0, cursor = new Date();
  if (!days.has(dateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dateKey(cursor))) { streak++; cursor.setDate(cursor.getDate() - 1); }
  return streak;
}
