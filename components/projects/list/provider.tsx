"use client";

import { useEffect } from "react";
import { fetchProjectsSuccess } from "@/app/redux/slice/projects";
import { useAppDispatch } from "@/app/redux/store";

interface ProjectsProviderProps {
    children: React.ReactNode;
    initialProjects: any;
}

const ProjectsProvider = ({ children, initialProjects }: ProjectsProviderProps) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (initialProjects?._valueJSON) {
            // Initial projects data
            const projectsData = initialProjects._valueJSON;

            // Dispatch the project success state
            dispatch(
                fetchProjectsSuccess({
                    projects: projectsData,
                    total: projectsData.length
                })
            );
        }
    }, [dispatch, initialProjects]);

    return (
        <>
          {children}
        </>
    );
}
 
export default ProjectsProvider;