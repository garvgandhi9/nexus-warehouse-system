import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { API_ENDPOINTS } from "@/lib/api-config";
import Footer from "@/components/Footer";
import { useFormValidation } from "@/hooks/useFormValidation";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const {
        values: formData,
        handleChange,
        getInputStyles,
        getFieldError,
        isValid,
        setServerErrors,
    } = useFormValidation({
        email: "",
        password: ""
    }, {
        email: { required: true, isEmail: true },
        password: { required: true }
    });

    const handleGoogleLogin = async () => {
        setGoogleLoading(true);
        setError("");
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const idToken = await result.user.getIdToken();

            const response = await fetch(API_ENDPOINTS.GOOGLE_AUTH, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idToken }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Google login failed. Please try again.");
                return;
            }

            const { token, user } = data.data;
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/dashboard");

        } catch (err) {
            setError("Google sign-in failed. Please try again.");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const response = await fetch(API_ENDPOINTS.LOGIN, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (!response.ok) {
                if (data.field) {
                    setServerErrors({ [data.field]: data.error });
                } else {
                    setError(data.error || "Login failed. Please try again.");
                }
                return;
            }
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data.user));
            if (data.user.isAdmin) {
                sessionStorage.setItem("admin_token", data.token);
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError("Connection failed. Please check your internet and try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2" />
            <Navbar />
            <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <div className="glass-morphism border border-white/10 p-8 sm:p-10 rounded-sm shadow-2xl backdrop-blur-xl bg-white/5">
                        <div className="text-center mb-8">
                            <h1 className="font-display text-3xl font-black uppercase tracking-tight">
                                Portal <span className="text-gradient">Login</span>
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest font-bold">
                                Access your Nexus dashboard
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                                {error}
                            </div>
                        )}

                        {/* Google Sign-In Button */}
                        <button
                            onClick={handleGoogleLogin}
                            disabled={googleLoading}
                            className="w-full flex items-center justify-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10 text-white py-3 rounded-sm font-bold text-sm uppercase tracking-widest transition-all disabled:opacity-30 disabled:cursor-not-allowed mb-6"
                        >
                            {googleLoading ? "Signing in..." : (
                                <>
                                    <svg width="18" height="18" viewBox="0 0 48 48">
                                        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.2-2.7-.4-4z" />
                                        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
                                        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.5 5C9.6 39.6 16.3 44 24 44z" />
                                        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.6 5.8l6.2 5.2C40.8 35.4 44 30.1 44 24c0-1.3-.2-2.7-.4-4z" />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-white/10" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">or</span>
                            <div className="flex-1 h-px bg-white/10" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Mail size={12} /> Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={getInputStyles("email") + " bg-white/5 border-white/10 rounded-sm px-4 py-3 text-sm"}
                                    placeholder="email@nexus.com"
                                />
                                {getFieldError("email") && (
                                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
                                        {getFieldError("email")}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Lock size={12} /> Password
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={getInputStyles("password") + " bg-white/5 border-white/10 rounded-sm px-4 py-3 text-sm"}
                                    placeholder="Enter your password"
                                />
                                {getFieldError("password") && (
                                    <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider">
                                        {getFieldError("password")}
                                    </p>
                                )}
                            </div>
                            <button
                                disabled={loading || !isValid()}
                                type="submit"
                                className="w-full bg-primary text-primary-foreground py-4 font-display text-sm font-bold uppercase tracking-widest transition-all hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? "Authenticating..." : "Log In"}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-muted-foreground">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-primary hover:underline underline-offset-4">
                                Create Account
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </main>
            <Footer />
        </div>
    );
};

export default Login;