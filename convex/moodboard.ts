import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

import { mutation, query } from "./_generated/server";

export const getMoodboardImages = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, { projectId }) => {
        const userId = await getAuthUserId(ctx);

        // Ensure the user is authenticated
        if (!userId) {
            return [];
        }

        // Fetch project from the DB
        const project = await ctx.db.get(projectId);

        // Ensure the project exists and belongs to the authenticated user
        if (!project || project.userId !== userId) {
            return [];
        }

        // Retrieve moodboard image storage IDs
        const storageIds = project.moodBoardImages || [];

        // Fetch URLs for each moodboard image
        const images = await Promise.all(
            storageIds.map(async (storageId, i) => {
                try {
                    // Get the URL from storage
                    const url = await ctx.storage.getUrl(storageId);

                    return {
                        id: `convex-${storageId}`,
                        storageId,
                        url,
                        uploaded: true,
                        uploading: false,
                        i
                    }
                } catch (error) {
                    return null;
                }
            })
        );
        
        return images.filter((img) => img !== null).sort((a, b) => a!.i - b!.i);
    }   
});

export const generateUploadUrl = mutation({
    handler: async (ctx) => {
        const userId = await getAuthUserId(ctx);

        // Ensure the user is authenticated
        if (!userId) {
            throw new Error("Unauthorized");
        }
        
        return await ctx.storage.generateUploadUrl();
    }
});

export const removeMoodboardImage = mutation({
    args: { projectId: v.id("projects"), storageId: v.id("_storage") },
    handler: async (ctx, { projectId, storageId }) => {
        const userId = await getAuthUserId(ctx);

        // Ensure the user is authenticated
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Fetch project from the DB
        const project = await ctx.db.get(projectId);

        // Ensure the project exists and belongs to the authenticated user
        if (!project || project.userId !== userId) {
            throw new Error("Project not found or access denied");
        }

        // Get the current moodboard images
        const currentImages = project.moodBoardImages || [];

        // Update the project's moodboard images by removing the specified image
        const updatedImages = currentImages.filter((id) => id !== storageId);

        // Patch the project with the updated images
        await ctx.db.patch(projectId, {
            moodBoardImages: updatedImages,
            lastModified: Date.now(),
        });

        try {
            // Delete the image from storage
            await ctx.storage.delete(storageId);
        } catch (error) {
            console.error(`Error deleting moodboard image from storage: ${storageId}`, error);
        }

        return {
            success: true,
            imageCount: updatedImages.length // Return the updated count of images
        }
    }
});

export const addMoodboardImage = mutation({
    args: {
        projectId: v.id("projects"),
        storageId: v.id("_storage")
    },
    handler: async (ctx, { projectId, storageId }) => {
        const userId = await getAuthUserId(ctx);

        // Ensure the user is authenticated
        if (!userId) {
            throw new Error("Unauthorized");
        }

        // Fetch project from the DB
        const project = await ctx.db.get(projectId);

        // Ensure the project exists and belongs to the authenticated user
        if (!project || project.userId !== userId) {
            throw new Error("Project not found or access denied");
        }

        // Get the current moodboard images
        const currentImages = project.moodBoardImages || [];

        if (currentImages.length >= 5) {
            throw new Error("Maximum number of moodboard images reached");
        }

        // Update the project's moodboard images by adding the new image
        const updatedImages = [...currentImages, storageId];

        // Patch the project with the updated images
        await ctx.db.patch(projectId, {
            moodBoardImages: updatedImages,
            lastModified: Date.now(),
        });

        return { success: true, imageCount: updatedImages.length };
    }
});