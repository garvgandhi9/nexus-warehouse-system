import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { API_ENDPOINTS } from "@/lib/api-config";
import Footer from "@/components/Footer";
import { useFormValidation } from "@/hooks/useFormValidation";

const Signup = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const {
        values: formData,
        handleChange,
        getInputStyles,
        isValid,
    } = useFormValidation({
        name: "",
        email: "",
        password: ""
    }, {
        name: { required: true },
        email: { required: true, isEmail: true },
        password: { required: true, minLength: 6 }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_ENDPOINTS.SIGNUP, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));
                navigate("/dashboard");
            } else {
                setError(data.error || "Signup failed");
            }
        } catch (err) {
            setError("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />

            <Navbar />

            <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full"
                >
                    <div className="glass-morphism border border-white/10 p-8 sm:p-10 rounded-sm shadow-2xl backdrop-blur-xl bg-white/5">
                        <div className="text-center mb-8">
                            <h1 className="font-display text-3xl font-black uppercase tracking-tight">Create <span className="text-gradient">Account</span></h1>
                            <p className="mt-2 text-sm text-muted-foreground uppercase tracking-widest font-bold">Join the Nexus network</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <User size={12} /> Full Name
                                </label>
                                <input
                                    name="name"
                                    type="text"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={getInputStyles("name") + " bg-white/5 border-white/10 rounded-sm px-4 py-3 text-sm focus:bg-white/10 focus:border-primary transition-colors focus:outline-none w-full"}
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                    <Mail size={12} /> Email Address
                                </label>
                                <input
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={getInputStyles("email") + " bg-white/5 border-white/10 rounded-sm px-4 py-3 text-sm focus:bg-white/10 focus:border-primary transition-colors focus:outline-none w-full"}
                                    placeholder="email@nexus.com"
                                />
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
                                    className={getInputStyles("password") + " bg-white/5 border-white/10 rounded-sm px-4 py-3 text-sm focus:bg-white/10 focus:border-primary transition-colors focus:outline-none w-full"}
                                    placeholder="Min. 6 characters"
                                />
                            </div>

                            <button
                                disabled={loading || !isValid}
                                type="submit"
                                className="w-full bg-primary text-primary-foreground py-4 font-display text-sm font-bold uppercase tracking-widest transition-all hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {loading ? "Creating Account..." : "Sign Up"}
                                {!loading && <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm text-muted-foreground animate-in fade-in slide-in-from-bottom-3 duration-500 delay-[500ms]">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline underline-offset-4">Log In</Link>
                        </div>
                    </div>
                </motion.div>
            </main>

            <Footer />
        </div>
    );
};

export default Signup;
