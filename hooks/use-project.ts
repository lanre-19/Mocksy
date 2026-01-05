"use client";

import {
    addProject,
    createProjectFailure,
    createProjectStart,
    createProjectSuccess
} from "@/app/redux/slice/projects";
import { useAppDispatch, useAppSelector } from "@/app/redux/store";
import { toast } from "sonner";
import { fetchMutation } from "convex/nextjs";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

import { generateGradientThumbnail } from "@/lib/utils";

export const useProjectCreation = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.profile);
    const projectsState = useAppSelector((state) => state.projects);
    const shapesState = useAppSelector((state) => state.shapes);

    // Create a new project
    const createProject = async (name?: string) => {
        // Throw an error if user is not authenticated
        if (!user?.id) {
            toast.error("Kindly log in to create projects");
            return;
        }

        // Dispatch the create project state
        dispatch(createProjectStart());

        try {
            // Generate a random thumbnail gradient
            const thumbnail = generateGradientThumbnail();

            const result = await fetchMutation(api.projects.createProject, {
                userId: user.id as Id<"users">,
                name: name || undefined,
                sketchesData: {
                    shapes: shapesState.shapes,
                    tool: shapesState.tool,
                    selected: shapesState.selected,
                    frameCounter: shapesState.frameCounter
                },
                thumbnail
            });

            // Dispatch the add project state
            dispatch(addProject({
                _id: result.projectId,
                name: result.name,
                projectNumber: result.projectNumber,
                thumbnail,
                lastModified: Date.now(),
                createdAt: Date.now(),
                isPublic: false
            }));

            // Dispatch the create project success state
            dispatch(createProjectSuccess());

            toast.success("Your project has been created successfully!");

            console.log({
                _id: result.projectId,
                name: result.name,
                projectNumber: result.projectNumber,
                thumbnail,
                lastModified: Date.now(),
                createdAt: Date.now(),
                isPublic: false
            });

        } catch (error) {
            // Dispatch the create project failure state
            dispatch(createProjectFailure("Failed to create project."));

            toast.error("Failed to create project.");

            console.log("Failed to create project.", error);
        }
    };

    return {
        createProject,
        isCreating: projectsState.isCreating,
        projects: projectsState.projects,
        projectsTotal: projectsState.total,
        canCreate: !!user?.id,
    }
};