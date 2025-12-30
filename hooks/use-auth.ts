import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";

const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string() //Extra password validation
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

const signUpSchema = z.object({
    firstname: z.string().min(5, "First name is required"),
    lastname: z.string().min(5, "Last name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string() //Extra password validation
        .min(8, "Password must be at least 8 characters")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

type SignInData = z.infer<typeof signInSchema>;

type SignUpData = z.infer<typeof signUpSchema>;

export const useAuth = () => {
    const { signIn, signOut } = useAuthActions();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const signInForm = useForm<SignInData>({
        resolver: zodResolver(signInSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const signUpForm = useForm<SignUpData>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            firstname: "",
            lastname: "",
            email: "",
            password: "",
        },
    });

    // Handle sign in logic
    const handleSignIn = async (data: SignInData) => {
        setIsLoading(true);

        try {
            // Perform sign in using Convex auth actions
            await signIn("password", {
                email: data.email,
                password: data.password,
                flow: "signIn",
            });

            // Redirect to dashboard or home page after successful sign in
            router.push("/dashboard");
        } catch (error) {
            console.error("Sign in failed:", error);
            // Set form error
            signInForm.setError("password", {
                message: "Invalid email or password",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sign up logic
    const handleSignUp = async (data: SignUpData) => {
        setIsLoading(true);

        try {
            // Perform sign in using Convex auth actions
            await signIn("password", {
                email: data.email,
                password: data.password,
                name: `${data.firstname} ${data.lastname}`,
                flow: "signUp",
            });

            // Redirect to dashboard or home page after successful sign in
            router.push("/dashboard");
        } catch (error) {
            console.error("Sign up failed:", error);
            // Set form error
            signInForm.setError("root", {
                message: "Invalid email or password",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Handle sign out logic
    const handleSignOut = async () => {
        setIsLoading(true);
        await signOut();
        setIsLoading(false);
    };

    return {
        signInForm,
        signUpForm,
        isLoading,
        handleSignIn,
        handleSignUp,
        handleSignOut
    };
};