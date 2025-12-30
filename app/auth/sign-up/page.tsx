"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Google from "@/components/buttons/oauth/google";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    // Use the custom auth hook
    const { signUpForm, isLoading, handleSignUp } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = signUpForm;

    return (
        <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent">
            <form
                onSubmit={handleSubmit(handleSignUp)}
                className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]">
                <div className="p-8 pb-6">
                    <div>
                        <h1 className="mb-1 mt-4 text-xl font-semibold">Join Mocksy</h1>
                        <p className="text-xs text-muted-foreground">Your true design journey begins here</p>
                    </div>

                    <div className="mt-6">
                        <Google />
                    </div>

                    <hr className="my-4 border-dashed" />

                    <div className="space-y-5">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="firstname"
                                    className="block text-sm">
                                    Firstname
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    {...register("firstname")}
                                    name="firstname"
                                    id="firstname"
                                    disabled={isLoading}
                                    className={errors.firstname && "border-destructive"}
                                />
                                {errors.firstname && (
                                    <p className="text-xs text-destructive">
                                        {errors.firstname.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label
                                    htmlFor="lastname"
                                    className="block text-sm">
                                    Lastname
                                </Label>
                                <Input
                                    type="text"
                                    required
                                    {...register("lastname")}
                                    name="lastname"
                                    id="lastname"
                                    disabled={isLoading}
                                    className={errors.lastname && "border-destructive"}
                                />
                                {errors.lastname && (
                                    <p className="text-xs text-destructive">
                                        {errors.lastname.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="block text-sm">
                                Email
                            </Label>
                            <Input
                                type="email"
                                required
                                {...register("email")}
                                name="email"
                                id="email"
                                disabled={isLoading}
                                className={errors.email && "border-destructive"}
                            />
                            {errors.email && (
                                <p className="text-xs text-destructive">
                                    {errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="pwd"
                                className="text-sm">
                                Password
                            </Label>
                            <Input
                                type="password"
                                required
                                {...register("password")}
                                name="pwd"
                                id="pwd"
                                disabled={isLoading}
                                className={cn(
                                    "input sz-md variant-mixed",
                                    errors.password && "border-destructive"
                                )}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        {errors.root && (
                            <p className="text-xs text-destructive text-center">
                                {errors.root.message}
                            </p>
                        )}

                        <Button
                            className="w-full cursor-pointer"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : "Sign Up"}
                        </Button>
                    </div>
                </div>

                <div className="bg-muted rounded-(--radius) border p-3">
                    <p className="text-accent-foreground text-center text-sm">
                        Have an account?
                        <Button
                            asChild
                            variant="link"
                            className="px-2">
                            <Link href="/auth/sign-in">Sign In</Link>
                        </Button>
                    </p>
                </div>
            </form>
        </section>
    )
}