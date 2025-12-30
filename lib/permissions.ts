// Routes that require authentication
export const isProtectedRoutes = [
    "/dashboard(.*)",
];

// Public routes that do not require authentication
export const isPublicRoutes = [
    "/auth(.*)",
    "/"
]

// Bypass authentication for specific routes
export const isByPassableRoutes = [
    "/api/polar/webhook",
    "/api/inngest(.*)",
    "/api/auth(.*)",
    "/convex(.*)",
];