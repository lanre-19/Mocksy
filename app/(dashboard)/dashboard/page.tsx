import { redirect } from "next/navigation";
import { SubscriptionEntitlementQuery } from "@/app/convex/query.config";

import { combinedSlug } from "@/lib/utils";

// TODO: Remove hard-coded billing path
const Page = async () => {
    const { entitlement, profileName } = await SubscriptionEntitlementQuery();

    // // Redirect to billing page if there's no active subscription entitlement
    // if (!entitlement._valueJSON) {
    //     redirect(`/billing/${combinedSlug(profileName!)}`);
    // }

    // Redirect to dashboard if the user has an active subscription
    redirect(`/dashboard/${combinedSlug(profileName!)}`);
}
 
export default Page;