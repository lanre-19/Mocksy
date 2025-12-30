import { redirect } from "next/navigation";
import { SubscriptionEntitlementQuery } from "@/app/convex/query.config";

import Navbar from "@/components/navbar";

import { combinedSlug } from "@/lib/utils";

const SessionLayout = async ({ children }: { children: React.ReactNode }) => {
    const { profileName, entitlement } = await SubscriptionEntitlementQuery();

    // if (!entitlement._valueJSON) {
    //     // TODO: Remove hard-coded billing path
    //     redirect(`/dashboard/${combinedSlug(profileName!)}`);
    // }

    return (
        <div className="grid grid-cols-1">
            <Navbar />
            {children}
        </div>
    );
}
 
export default SessionLayout;