export { default } from "next-auth/middleware";

// Every route below requires a logged-in session.
// /login and /api/auth/* (NextAuth's own routes) stay public.
export const config = {
  matcher: ["/dashboard/:path*", "/todos/:path*", "/account/:path*", "/settings/:path*", "/subject/:path*"],
};
