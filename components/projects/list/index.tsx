"use client";

import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { useProjectCreation } from "@/hooks/use-project";
import { useAppSelector } from "@/app/redux/store";

const ProjectsList = () => {
    const { canCreate, projects, createProject, isCreating } = useProjectCreation();
    const user = useAppSelector((state) => state.profile);

    // Redirect to sign-in if the user cannot create projects
    if (!canCreate) {
        redirect("/sign-in");
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-semibold text-foreground">
                        Projects
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Create, edit, and organize all your
                        design projects in one place
                    </p>
                </div>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20">
                    <div
                      onClick={() => createProject()}
                      className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
                    >
                        {isCreating ? (
                            <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                        ) : (
                            <Plus className="w-8 h-8 text-muted-foreground" />
                        )}
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">
                        This place looks empty
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        Create your first project to begin your design journey.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {projects.map((project: any) => (
                        <Link
                          key={project._id}
                          href={`/dashboard/${user?.name}/canvas?project=${project._id}`}
                          className="group cursor-pointer"
                        >
                            <div className="space-y-3">
                                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-muted">
                                    {project.thumbnail ? (
                                        <Image
                                          src={project.thumbnail}
                                          alt={project.name}
                                          width={300}
                                          height={200}
                                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <Plus className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-foreground truncate group-hover:text-primary transition-colors">
                                        {project.name || "Untitled Project"}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {formatDistanceToNow(new Date(project.lastModified), { addSuffix: true })}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ProjectsList;