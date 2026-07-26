# مذاكرتي — Next.js + Supabase + NextAuth

نسخة كاملة الـ backend من تطبيق "مذاكرتي"، جاهزة للنشر على Vercel، بتسجيل دخول حقيقي (Google + رابط سحري بالإيميل) وقاعدة بيانات Postgres على Supabase.

## 1) إنشاء مشروع Supabase
1. روح على https://supabase.com وسجّل دخول واعمل New Project.
2. من **Project Settings → Database → Connection string**، انسخ:
   - رابط الـ **Transaction pooler** (بورت 6543) → حطه في `DATABASE_URL`.
   - رابط الـ **Direct connection** (بورت 5432) → حطه في `DIRECT_URL`.

## 2) إعداد Google OAuth
1. روح https://console.cloud.google.com → APIs & Services → Credentials.
2. اعمل OAuth Client ID (نوعه Web application).
3. تحت **Authorized redirect URIs** ضيف:
   - `http://localhost:3000/api/auth/callback/google` (للتجربة المحلية)
   - `https://your-app.vercel.app/api/auth/callback/google` (بعد النشر)
4. انسخ الـ Client ID والـ Client Secret في `.env`.

## 3) إعداد إرسال الإيميل (لرابط الدخول السحري)
أسهل حل مع Vercel هو **Resend** (فيه باقة مجانية):
1. اعمل حساب على https://resend.com واعمل API Key.
2. استخدم القيم دي في `.env`:
   ```
   EMAIL_SERVER_HOST=smtp.resend.com
   EMAIL_SERVER_PORT=587
   EMAIL_SERVER_USER=resend
   EMAIL_SERVER_PASSWORD=<الـ API Key بتاعك>
   EMAIL_FROM="مذاكرتي <onboarding@yourdomain.com>"
   ```
   (تقدر تستخدم أي SMTP تاني بنفس الطريقة لو عندك واحد جاهز.)

## 4) متغيرات البيئة
انسخ `.env.example` إلى `.env` واملأ كل القيم. لتوليد `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

## 5) التشغيل محليًا
```bash
npm install
npx prisma db push     # ينشئ كل الجداول في قاعدة بيانات Supabase
npm run dev
```
افتح http://localhost:3000

## 6) النشر على Vercel
1. ارفع الكود على GitHub.
2. من Vercel: New Project → استورد الريبو.
3. تحت Environment Variables، ضيف نفس المتغيرات اللي في `.env` (لل Production).
4. غيّر `NEXTAUTH_URL` لرابط الدومين بتاع Vercel.
5. Deploy. أول ما ينجح الـ build، شغّل مرة واحدة (من جهازك أو من Vercel CLI):
   ```bash
   npx prisma db push
   ```
   للتأكد إن الجداول موجودة في قاعدة بيانات الإنتاج.

## هيكل المشروع
- `prisma/schema.prisma` — كل الجداول (المستخدمين، المواد، المدرسين، جلسات المذاكرة، المهام، الملاحظات).
- `lib/auth.ts` — إعدادات NextAuth (Google + Email) + بذر مواد افتراضية لأي حساب جديد.
- `app/api/*` — كل الـ API routes (subjects, teachers, sessions, todos, notes, me).
- `app/dashboard`, `app/todos`, `app/subject/[id]`, `app/account`, `app/settings` — صفحات التطبيق.
- `components/AppShell.tsx` — السايدبار + الشريط العلوي المشترك (فيه زرار الوضع الليلي).

## نظام النقاط والمستويات
كل دقيقة مذاكرة = نقطة وحدة، بتتحسب في `app/api/sessions/route.ts` عند تسجيل أي جلسة. المستوى بيتحسب بمعادلة تصاعدية في `lib/level.ts` (كل مستوى محتاج نقط أكتر من اللي قبله بـ 50 نقطة).

## نقاط لسه محتاجة شغل لو عايز تكمل
- صفحة "نسيت كلمة السر" مش لازمة أصلاً لأن الدخول بالكامل عن طريق Google أو رابط سحري (مفيش باسورد يتخزن أو يتنسى).
- ممكن تضيف زرار "مسح كل البيانات" في صفحة الإعدادات لو حبيت (مش موجود في النسخة دي عشان الحذف من قاعدة بيانات حقيقية بيحتاج تأكيد إضافي).
- التطبيق حاليًا كل مستخدم بيشوف بياناته بس (مفيش صفحة أدمن لإدارة كل المستخدمين).
