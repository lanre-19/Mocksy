import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const Loading = () => {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4 text-center">
                <Loader2
                  className={cn(
                    "w-6 h-6 animate-spin",
                    "transition-colors duration-200"
                  )}
                />

                <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                        Loading Dashboard
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Please wait while we set things up for you.
                    </p>
                </div>
            </div>
        </div>
    );
}
 
export default Loading;