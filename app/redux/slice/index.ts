import { Reducer } from "@reduxjs/toolkit";

import profile from  "./profile";
import projects from "./projects";
import shapes from "./shapes";

export const slice: Record<string, Reducer> = {
    profile,
    projects,
    shapes
};