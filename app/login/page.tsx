"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const params = useSearchParams();
  const checkEmail = params.get("check") === "1";

  async function handleEmailSignIn(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    await signIn("email", { email, callbackUrl: "/dashboard" });
    setSent(true);
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="card" style={{ maxWidth: 420, width: "100%", padding: "38px 34px", textAlign: "center" }}>
        <div
          style={{
            width: 60, height: 60, borderRadius: 16, background: "var(--indigo)", color: "#fff",
            fontFamily: "Changa", fontSize: 28, fontWeight: 800, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 18px auto", transform: "rotate(-5deg)",
          }}
        >
          م
        </div>
        <h2 style={{ fontFamily: "Changa", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>
          أهلاً بيك في مذاكرتي 👋
        </h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 13.5, marginBottom: 22 }}>
          سجّل دخولك عشان تحفظ خطة مذاكرتك على حسابك
        </p>

        {checkEmail || sent ? (
          <div className="empty-note">تفقّد إيميلك، بعتنالك رابط تسجيل دخول ✉️</div>
        ) : (
          <>
            <button
              className="btn btn-primary"
              style={{ width: "100%", padding: 13, fontSize: 15, marginBottom: 14 }}
              onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            >
              الدخول بحساب Google
            </button>

            <div style={{ color: "var(--ink-soft)", fontSize: 12, margin: "14px 0" }}>أو بالإيميل</div>

            <form onSubmit={handleEmailSignIn}>
              <input
                type="email"
                required
                placeholder="بريدك الإلكتروني"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10, border: "1.5px solid var(--paper-line)",
                  fontSize: 14, background: "var(--paper)", color: "var(--ink)", outline: "none",
                  marginBottom: 12, textAlign: "center",
                }}
              />
              <button type="submit" className="btn btn-secondary" style={{ width: "100%", padding: 12 }}>
                ابعتلي رابط الدخول
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
