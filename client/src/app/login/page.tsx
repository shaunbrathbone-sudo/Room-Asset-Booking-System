"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Globe, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const loginSchema = z.object({
    email: z.string().email("Valid email required"),
    password: z.string().min(1, "Password required"),
});

const registerSchema = z.object({
    firstName: z.string().min(1, "First name required"),
    lastName: z.string().min(1, "Last name required"),
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

const LoginPage = () => {
    const router = useRouter();
    const { login, register: registerUser } = useAuth();
    const [isRegister, setIsRegister] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");

    const loginForm = useForm<LoginForm>({
        resolver: zodResolver(loginSchema),
    });

    const registerForm = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onLogin = async (data: LoginForm) => {
        setError("");
        try {
            await login(data);
            router.push("/");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Login failed";
            setError(msg.includes("401") ? "Invalid email or password" : msg);
        }
    };

    const onRegister = async (data: RegisterForm) => {
        setError("");
        try {
            await registerUser(data);
            router.push("/");
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Registration failed";
            setError(msg.includes("409") ? "An account with this email already exists" : msg);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/25">
                        <Globe className="w-9 h-9 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold mt-4 text-slate-900 dark:text-white">
                        {isRegister ? "Create Account" : "Welcome Back"}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {isRegister ? "Set up your SpaceBook account" : "Sign in to your workspace"}
                    </p>
                </div>

                {/* Form card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-lg">
                    {error && (
                        <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm" role="alert">
                            {error}
                        </div>
                    )}

                    {isRegister ? (
                        <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">First Name</label>
                                    <input
                                        id="firstName"
                                        {...registerForm.register("firstName")}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {registerForm.formState.errors.firstName && (
                                        <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.firstName.message}</p>
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Last Name</label>
                                    <input
                                        id="lastName"
                                        {...registerForm.register("lastName")}
                                        className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    {registerForm.formState.errors.lastName && (
                                        <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.lastName.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="regEmail" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    id="regEmail"
                                    type="email"
                                    {...registerForm.register("email")}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {registerForm.formState.errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="regPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        id="regPassword"
                                        type={showPassword ? "text" : "password"}
                                        {...registerForm.register("password")}
                                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Toggle password visibility">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {registerForm.formState.errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{registerForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <button type="submit" disabled={registerForm.formState.isSubmitting} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                {registerForm.formState.isSubmitting ? "Creating..." : "Create Account"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
                                <input
                                    id="email"
                                    type="email"
                                    {...loginForm.register("email")}
                                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {loginForm.formState.errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.email.message}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        {...loginForm.register("password")}
                                        className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" aria-label="Toggle password visibility">
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {loginForm.formState.errors.password && (
                                    <p className="text-red-500 text-xs mt-1">{loginForm.formState.errors.password.message}</p>
                                )}
                            </div>

                            <button type="submit" disabled={loginForm.formState.isSubmitting} className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                                {loginForm.formState.isSubmitting ? "Signing in..." : "Sign In"} <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    )}

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => { setIsRegister(!isRegister); setError(""); }}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            {isRegister ? "Already have an account? Sign in" : "Don't have an account? Register"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;