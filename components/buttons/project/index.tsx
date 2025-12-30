"use client";

import { Loader2, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useProjectCreation } from "@/hooks/use-project";

const CreateProject = () => {
    const {
        isCreating, 
        canCreate,
        createProject
    } = useProjectCreation();

    return (
        <Button
          onClick={() => createProject()}
          variant="default"
          disabled={!canCreate || isCreating}
          className="flex items-center font-medium gap-2 cursor-pointer rounded-full"
        >
            {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ): <PlusIcon className="w-7 h-7" />}
            {isCreating ? "Creating" : "New Project"}
        </Button>
    );
}
 
export default CreateProject;