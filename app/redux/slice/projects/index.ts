import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ProjectsSummary {
    _id: string;
    name: string;
    projectNumber: number;
    thumbnail?: string;
    lastModified: number;
    createdAt: number;
    isPublic?: boolean;
}

interface ProjectsState {
    projects: ProjectsSummary[];
    total: number;
    isLoading: boolean;
    error: string | null;
    lastFetched: null | number;
    isCreating: boolean;
    createError: string | null;
}

const initialState: ProjectsState = {
    projects: [],
    total: 0,
    isLoading: false,
    error: null,
    lastFetched: null,
    isCreating: false,
    createError: null
};

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        // Projects fetching begin state
        fetchProjectsStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        // Project fetching success state
        fetchProjectsSuccess: (
            state,
            action: PayloadAction<{ projects: ProjectsSummary[], total: number }>
        ) => {
            state.isLoading = false;
            state.projects = action.payload.projects;
            state.total = action.payload.total;
            state.error = null;
            state.lastFetched = Date.now();
        },
        // Project fetching failure state
        fetchProjectsFailure: (
            state,
            action: PayloadAction<string>
        ) => {
            state.isLoading = false;
            state.error = action.payload;
        },
        // Project create start state
        createProjectStart: (state) => {
            state.isCreating = true;
            state.createError = null;
        },
        // Project create success state
        createProjectSuccess: (state) => {
            state.isCreating = false;
            state.error = null;
        },
        // Project create failure state
        createProjectFailure: (
            state,
            action: PayloadAction<string>
        ) => {
            state.isCreating = false;
            state.createError = action.payload;
        },
        // Project add state
        addProject: (
            state,
            action: PayloadAction<ProjectsSummary>
        ) => {
            state.projects.unshift(action.payload);
            state.total = +1;
        },
        // Project update state
        updateProject: (
            state,
            action: PayloadAction<ProjectsSummary>
        ) => {
            const index = state.projects.findIndex((project) => project._id == action.payload._id);

            if (index !== -1) {
                state.projects[index] = { ...state.projects[index], ...action.payload };
            }
        },
        // Project remove state
        removeProject: (
            state,
            action: PayloadAction<string>
        ) => {
            state.projects = state.projects.filter((project) => project._id !== action.payload);
            state.total = Math.max(0, state.total - 1);
        },
        // Project clear state
        clearProjects: (state) => {
            state.projects = [];
            state.total = 0;
            state.lastFetched = null;
            state.error = null;
            state.createError = null;
        },
        // Error clear state
        clearErrors: (state) => {
            state.error = null;
            state.createError = null;
        }
    }
});

export const {
    fetchProjectsStart,
    fetchProjectsSuccess,
    fetchProjectsFailure,
    createProjectStart,
    createProjectSuccess,
    createProjectFailure,
    addProject,
    updateProject,
    removeProject,
    clearProjects,
    clearErrors,
} = projectSlice.actions;

export default projectSlice.reducer;