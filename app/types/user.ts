import { combinedSlug } from "@/lib/utils";

export type ConvexUserRaw = {
    _creationTime: number;
    _id: string;
    email: string;
    emailVerificationTime?: number;
    image?: string;
    name?: string;
};

export type Profile = {
    id: string;
    createdAtMs: number;
    email: string;
    emailVerifiedAtMs?: number;
    image?: string;
    name?: string;
};

export const normalizeProfile = (
    raw: ConvexUserRaw | null
): Profile | null => {
    // Return null if there's no profile
    if (!raw) return null;

    // Extract a display name from email if name is not provided
    const extractNameFromEmail = (email: string): string => {
        const username = email.split("@")[0];
        return username
          .split(/[._-]/)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(" ");
    }

    const name = combinedSlug(raw.name!) || extractNameFromEmail(raw.email);

    return {
        id: raw._id,
        createdAtMs: raw._creationTime,
        email: raw.email,
        emailVerifiedAtMs: raw.emailVerificationTime,
        image: raw.image,
        name
    }
};