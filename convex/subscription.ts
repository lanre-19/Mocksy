import { v } from "convex/values";
import { query } from "./_generated/server";

export const hasEntitlement = query({
    args: { userId: v.id("users") },
    handler: async (ctx, { userId }) => {
        const now = Date.now();

        for await (const subscription of ctx.db
            .query("subscriptions")
            .withIndex("by_userId", (q) => q.eq("userId", userId))) {
                // Subscription status
                const status = String(subscription.status || "").toLowerCase();

                // Active subscription statuses
                const periodOk = subscription.currentPeriodEnd == null || subscription.currentPeriodEnd > now;

                // Check for active subscriptions
                if (status === "active" && periodOk) return true;
            }
            
        return false;
    }
});