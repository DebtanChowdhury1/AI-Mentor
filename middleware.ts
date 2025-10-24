import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/public(.*)",
]);

export default clerkMiddleware((authObj, request) => {
  // ✅ Clerk v6 returns an object, not a function
  const userId = (authObj as unknown as { userId?: string | null }).userId;

  if (!isPublicRoute(request) && !userId) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("redirect_url", request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|static|.*\\..*|favicon.ico).*)"],
};
