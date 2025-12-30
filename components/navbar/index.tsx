"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useSearchParams } from "next/navigation";
import { Hash, LayoutTemplate, Zap } from "lucide-react";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Id } from "@/convex/_generated/dataModel";
import { useAppSelector } from "@/app/redux/store";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import CreateProject from "../buttons/project";

import { cn } from "@/lib/utils";

type TabProps = {
    label: string;
    href: string;
    icon: React.ReactNode;
};

const Navbar = () => {
    const params = useSearchParams();
    const pathname = usePathname();

    const projectId = params.get("project");

    // TODO: Add credits logic
    const me = useAppSelector((state) => state.profile);

    const tabs: TabProps[] = [
        {
            label: "Canvas",
            href: `/dashboard/canvas?project=${projectId}`,
            icon: <Hash className="w-4 h-4" />
        },
        {
            label: "Style Guide",
            href: `/dashboard/style-guide?project=${projectId}`,
            icon: <LayoutTemplate className="w-4 h-4" />
        },
    ];

    // Fetch project data using a Convex query
    const project = useQuery(
        api.projects.getProject,
        projectId ? { projectId: projectId as Id<"projects"> } : "skip"
    );

    const hasCanvas = pathname.includes("canvas");
    const hasStyleGuide = pathname.includes("style-guide");
    
    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 p-6 fixed top-0 left-0 right-0 z-50">
            <div className="flex items-center gap-4">
                <Link
                  href={`/dashboard/${me.name}`}
                  className="w-8 h-8 rounded-lg border-2 border-white bg-black flex items-center justify-center"
                >
                    <div className="w-4 h-4 rounded-lg bg-white" />
                </Link>

                {!hasCanvas || (
                    !hasStyleGuide && (
                        <div className="lg:inline-block hidden rounded-full text-primary/60 border border-white/[0.08] px-4 py-2 text-sm saturate-150">
                            Project / {project?.name}
                        </div>
                    )
                )}
            </div>

            <div className="lg:flex hidden items-center justify-center gap-2">
                <div className="flex items-center gap-2 backdrop-blur-xl bg-white/[0.08] rounded-full p-2 saturate-150">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.href}
                      href={tab.href}
                      className={[
                        "group inline-flex items-center gap-2 rounded-full font-medium px-4 py-2 transition",
                        `${pathname}?project=${projectId}` == tab.href ? "bg-white/[0.12] text-white border border-white/[0.16] backdrop-blur-sm" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.06] border border-transparent"
                      ].join(" ")}
                    >
                        <span className={cn(
                            `${pathname}?project=${projectId}` == tab.href ? "opacity-100" : "opacity-70 group-hover:opacity-90"
                        )}>
                            {tab.icon}
                        </span>
                        <span>{tab.label}</span>
                    </Link>
                  ))}
                </div>
            </div>

            <div className="flex items-center justify-end gap-6">
                <Button
                  variant="secondary"
                  className="rounded-full flex items-center justify-center gap-2 backdrop-blur-xl bg-white/[0.05] saturate-150 hover:bg-white/[0.12]"
                >
                    {/* TODO: Implement credits */}
                    <Zap className="w-3 h-3 text-white/60" />
                    <span className="text-sm text-white/60">Credits 7/10</span>
                </Button>

                {/* Create project if there is no canvas or style guide */}
                {!hasCanvas && !hasStyleGuide && <CreateProject />}

                {/* User Avatar */}
                <Avatar className="size-9.5 ml-2">
                    <AvatarImage src={me.image || ""} />
                    <AvatarFallback>
                        <Image
                          src="/placeholder_img.png"
                          alt="Placeholder image"
                          width={33}
                          height={33}
                          className="object-contain rounded-full opacity-65"
                        />
                    </AvatarFallback>
                </Avatar>

                {/* Autosave project if there is a canvas */}
                {/* {hasCanvas && <AutoSave />} */}

            </div>
        </div>
    );
}
 
export default Navbar;