import "./globals.css";
import Providers from "@/components/Providers";

export const metadata = {
  title: "مذاكرتي",
  description: "خطتك للثانوية العامة",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
