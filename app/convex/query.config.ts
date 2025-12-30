import { preloadQuery } from "convex/nextjs";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { api } from "@/convex/_generated/api";

import { ConvexUserRaw, normalizeProfile } from "../types/user";
import { Id } from "@/convex/_generated/dataModel";

export const ProfileQuery = async () => {
    return await preloadQuery(
        api.user.getCurrentUser,
        {},
        { token: await convexAuthNextjsToken()}
    )
};

export const SubscriptionEntitlementQuery = async () => {
    const rawProfile = await ProfileQuery();
    const profile = normalizeProfile(
        rawProfile._valueJSON as unknown as ConvexUserRaw | null
    );

    // if (!profile?.id) {
    //     return {
    //         entitlement: null,
    //         profileName: null,
    //     };
    // }

    // Preload the subscription entitlement query to check if the current user has active subscription access
    // This query verifies the user's subscription status and entitlement to premium features
    const entitlement = await preloadQuery(
        api.subscription.hasEntitlement,
        { userId: profile?.id as Id<"users"> },
        { token: await convexAuthNextjsToken() }
    );

    return {
        entitlement,
        profileName: profile?.name,
    }
};