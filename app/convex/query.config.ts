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

    if (!profile?.id) {
        return {
            entitlement: null,
            profileName: null
        }
    }

    // Preload the subscription entitlement query to check if the current user has active subscription access
    // This query verifies the user's subscription status and entitlement to premium features
    const entitlement = await preloadQuery(
        api.subscription.hasEntitlement,
        { userId: profile.id as Id<"users"> },
        { token: await convexAuthNextjsToken() }
    );

    return {
        entitlement,
        profileName: profile.name,
    }
};

export const ProjectQuery = async () => {
    const rawProfile = await ProfileQuery();
    const profile = normalizeProfile(
        rawProfile._valueJSON as unknown as ConvexUserRaw | null
    );
    
    // If there's no user profile, return null
    if (!profile?.id) {
        return {
            projects: null,
            profile: null
        }
    }

    // Preload the user's existing projects
    const projects = await preloadQuery(
        api.projects.getUserProjects,
        { userId: profile.id as Id<"users"> },
        { token: await convexAuthNextjsToken() }
    );

    return { projects, profile };
};

export const StyleGuideQuery = async (projectId: string) => {
    // Preload the style guide data for the specified project
    const styleGuide = await preloadQuery(
        api.projects.getProjectStyleGuide,
        { projectId: projectId as Id<"projects"> },
        { token: await convexAuthNextjsToken() }
    );

    return { styleGuide };
};

export const MoodboardImagesQuery = async (projectId: string) => {
    // Preload the moodboard images for the specified project
    const images = await preloadQuery(
        api.moodboard.getMoodboardImages,
        { projectId: projectId as Id<"projects"> },
        { token: await convexAuthNextjsToken() }
    );

    return { images };
};