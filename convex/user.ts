import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

export const getCurrentUser = query({
    args: {},
    handler: async (ctx) => {
        // Get the authenticated user's ID
        const userId = await getAuthUserId(ctx);
        // If there's no authenticated user, return null
        if (!userId ) return null;


        // Fetch and return the user data from the database
        return await ctx.db.get(userId);
    }
})