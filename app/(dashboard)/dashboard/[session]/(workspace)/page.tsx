import { redirect } from "next/navigation";
import { ProjectQuery } from "@/app/convex/query.config";

import ProjectsProvider from "@/components/projects/list/provider";
import ProjectsList from "@/components/projects/list";

const Page = async () => {
    const { profile, projects } = await ProjectQuery();

    // Redirect users to sign in page is there's no profile
    if (!profile) {
        redirect("/sign-in");
    }

    return (
        <ProjectsProvider initialProjects={projects}>
            <div className="container mx-auto px-6 py-36">
                <ProjectsList />
            </div>
        </ProjectsProvider>
    );
}
 
export default Page;