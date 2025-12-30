import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define request and response types for autosaveProject endpoint
interface AutosaveProjectRequest {
    projectId: string;
    userId: string;
    // Shapes data to be saved
    shapesData: {
        shapes: Record<string, unknown>;
        tool: string;
        selected: Record<string, unknown>;
        frameCounter: number;
    },
    // Optional viewport data
    viewPortData?: {
        scale: number;
        translate: { x: number; y: number; };
    }
}

// Define response types for autosaveProject endpoint
interface AutosaveProjectResponse {
    success: boolean;
    eventId: string;
    message: string;
}

export const ProjectApi = createApi({
    // Unique key for the API
    reducerPath: "projectApi",
    // Base URL for API requests "/api/project"
    baseQuery: fetchBaseQuery({ baseUrl: "/api/project" }),
    // Tag types for cache invalidation
    tagTypes: ["Project"],
    // Define endpoints
    endpoints: (builder) => ({
        autosaveProject: builder.mutation<AutosaveProjectResponse, AutosaveProjectRequest>({
            // Define the request details
            query: (data) => ({
                url: "",
                method: "PATCH",
                body: data
            })
        })
    })
});