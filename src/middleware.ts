import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/", "/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  console.log("Middleware: checking route:", req.nextUrl.pathname);

  if (isPublicRoute(req)) {
    console.log("Middleware: public route, allowing access");
    return;
  }

  // Protect routes - redirect unauthenticated users to sign in
  const authResult = await auth();
  console.log("Middleware: auth result:", authResult?.userId ? "authenticated" : "not authenticated");

  if (!authResult.userId) {
    console.log("Middleware: redirecting to sign-in");
    return Response.redirect(new URL("/sign-in", req.url));
  }

  console.log("Middleware: user authenticated, allowing access to:", req.nextUrl.pathname);
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
