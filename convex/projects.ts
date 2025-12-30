import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation, query } from "./_generated/server";

export const getProject = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        const userId = await getAuthUserId(ctx);

        // Ensure the user is authenticated
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Fetch the project from the database
        const project = await ctx.db.get(projectId);

        // Ensure the project exists, belongs to the authenticated user, or is public
        if (!project || project.userId !== userId && !project.isPublic) {
            throw new Error("Project not found or access denied");
        }

        return project;
    }
});

export const createProject = mutation({
    args: {
        userId: v.id("users"),
        name: v.optional(v.string()),
        sketchesData: v.any(),
        thumbnail: v.optional(v.string())
    },
    handler: async (ctx, { userId, name, sketchesData, thumbnail }) => {
        console.log("[Convex] Creating project for user: ", userId);

        // project number
        const projectNumber = await getNextProjectNumber(ctx, userId);
        // project name
        const projectName = name || `Project ${projectNumber}`;

        // Create project in the DB
        const projectId = await ctx.db.insert("projects", {
            userId,
            name: projectName,
            sketchesData,
            thumbnailUrl: thumbnail,
            projectNumber,
            lastModified: Date.now(),
            createdAt: Date.now(),
            isPublic: false
        });

        console.log(`Project was created successfully.`);

        return {
            projectId,
            name: projectName,
            projectNumber
        }
    }
});

async function getNextProjectNumber (ctx: any, userId: string) {
    // Get or create project counter for user
    const counter = await ctx.db
      .query("project_counters")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId))
      .first();

    if (!counter) {
        // Create new project counter starting at 1
        await ctx.db.insert("project_counters", {
            userId,
            nextProjectNumber: 2 // Next will be 2
        });

        return 1;
    }

    const projectNumber = counter.nextProjectNumber;

    // Increment counter for next time
    await ctx.db.patch(counter._id, {
        nextProjectNumber: projectNumber + 1
    });

    return projectNumber;
};