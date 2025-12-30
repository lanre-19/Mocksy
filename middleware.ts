import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect
} from "@convex-dev/auth/nextjs/server";

import { isByPassableRoutes, isPublicRoutes, isProtectedRoutes } from "./lib/permissions";

// Create a matcher for public routes
const PublicMatcher = createRouteMatcher(isPublicRoutes);

// Create a matcher for bypassable routes
const BypassMatcher = createRouteMatcher(isByPassableRoutes);

// Create a matcher for protected routes
const ProtectedMatcher = createRouteMatcher(isProtectedRoutes);
 
export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  // Bypass authentication for specific routes
  if (BypassMatcher(request)) return;

  // Enforce authentication for all other routes
  const authenticated = await convexAuth.isAuthenticated();

  // If the user is not authenticated, redirect to the login page. Else, redirect to dashboard
  if (PublicMatcher(request) && authenticated) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }

  // If the user is not authenticated, redirect to the login page
  if (ProtectedMatcher(request) && !authenticated) {
    return nextjsMiddlewareRedirect(request, "/auth/sign-in");
  }

  return;
}, {
  cookieConfig: { maxAge: 60 * 60 * 24 * 30 }, // 30 days
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};