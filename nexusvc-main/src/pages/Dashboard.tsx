import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    LayoutDashboard, Warehouse, Plus, Clock, CheckCircle2,
    MapPin, Calendar, ChevronRight, Search, Edit2, XCircle,
    Map as MapIcon
} from "lucide-react";

import Navbar from "@/components/Navbar";
import { API_ENDPOINTS } from "@/lib/api-config";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import { MonthYearRangePicker } from "@/components/MonthYearRangePicker";
import { useFormValidation } from "@/hooks/useFormValidation";

interface UserWarehouse {
    id: number;
    warehouse_code: string;
    city: string;
    state?: string;
    pincode?: string;
    area_available: number;
    status: string;
    description?: string;
    term_type?: string;
    term_duration?: string;
    created_at: string;
}

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [warehouses, setWarehouses] = useState<UserWarehouse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saveError, setSaveError] = useState("");
    const [search, setSearch] = useState("");
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<UserWarehouse | null>(null);

    const {
        values: formData,
        setValues: setFormData,
        handleChange: handleInputChange,
        getInputStyles,
        getFieldError,
        isValid: isFormValid,
        errors,
        setErrors,
        setTouched,
        setServerErrors,
    } = useFormValidation<Partial<UserWarehouse>>({}, {
        city: { required: true },
        area_available: { required: true },
    });

    useEffect(() => {
        const token = localStorage.getItem("token");
        const userData = localStorage.getItem("user");
        if (!token || !userData) {
            navigate("/login");
            return;
        }
        setUser(JSON.parse(userData));

        const controller = new AbortController();
        const fetchWarehouses = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.USER_WAREHOUSES, {
                    headers: { "Authorization": token },
                    signal: controller.signal
                });
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate("/login");
                    return;
                }
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const data = await res.json();
                setWarehouses(data.data || data);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Failed to fetch warehouses:", err);
                setError("Failed to load your listings. Please refresh the page.");
            } finally {
                setLoading(false);
            }
        };
        fetchWarehouses();
        return () => controller.abort();
    }, [navigate]);

    const handleOpenEditModal = (warehouse: UserWarehouse) => {
        setEditingWarehouse(warehouse);
        setFormData(warehouse);
        setErrors({});
        setTouched({});
        setSaveError("");
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWarehouse) return;
        setSaveError("");

        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login");
            return;
        }

        try {
            const response = await fetch(API_ENDPOINTS.USER_WAREHOUSE_UPDATE(editingWarehouse.id), {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.field) {
                    setServerErrors({ [data.field]: data.error });
                } else {
                    setSaveError(data.error || "Update failed. Please try again.");
                }
                return;
            }

            const res = await fetch(API_ENDPOINTS.USER_WAREHOUSES, {
                headers: { "Authorization": token }
            });
            const refreshed = await res.json();
            setWarehouses(refreshed.data || refreshed);
            setIsEditModalOpen(false);
        } catch (err) {
            console.error("Save failed:", err);
            setSaveError("Connection failed. Please try again.");
        }
    };

    const filteredWarehouses = warehouses.filter(w =>
        w.city?.toLowerCase().includes(search.toLowerCase()) ||
        w.warehouse_code?.toLowerCase().includes(search.toLowerCase())
    );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                        <div>
                            <div className="inline-flex items-center gap-2 text-primary mb-3">
                                <LayoutDashboard size={18} />
                                <span className="font-display text-xs font-bold uppercase tracking-[0.3em]">User Portal</span>
                            </div>
                            <h1 className="font-display text-4xl sm:text-5xl font-black uppercase tracking-tight">
                                Welcome, <span className="text-gradient">{user.name.split(' ')[0]}</span>
                            </h1>
                            <p className="mt-2 text-muted-foreground text-lg uppercase tracking-widest font-bold">
                                Manage your infrastructure portfolio
                            </p>
                        </div>
                        <Link 
                            to="/submit" 
                            className="bg-primary text-primary-foreground px-8 py-4 rounded-sm font-display text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] shadow-lg"
                        >
                            <Plus size={18} /> New listing
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                        <div className="bg-card border border-border/50 p-6 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Listings</p>
                            <p className="text-3xl font-display font-black text-foreground">{warehouses.length}</p>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Live Assets</p>
                            <p className="text-3xl font-display font-black text-emerald-500">
                                {warehouses.filter(w => w.status === 'Available').length}
                            </p>
                        </div>
                        <div className="bg-card border border-border/50 p-6 rounded-sm">
                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">Pending Approval</p>
                            <p className="text-3xl font-display font-black text-amber-500">
                                {warehouses.filter(w => w.status === 'pending').length}
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                            {error}
                        </div>
                    )}

                    <div className="bg-card border border-border/50 rounded-sm overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-border/50 bg-white/5 flex items-center justify-between">
                            <h2 className="font-display text-sm font-bold uppercase tracking-widest">Your Submissions</h2>
                            <div className="relative group">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                <input
                                    type="text"
                                    placeholder="SEARCH LISTINGS..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="bg-background/50 border border-border/50 rounded-sm pl-10 pr-4 py-2 text-[10px] uppercase font-bold tracking-widest focus:outline-none focus:border-primary/50 transition-all w-48 sm:w-64"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="p-20 text-center text-muted-foreground animate-pulse uppercase tracking-[0.5em] text-xs font-bold">
                                Loading Protocol...
                            </div>
                        ) : filteredWarehouses.length === 0 ? (
                            <div className="p-20 text-center">
                                <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/5 mb-6">
                                    <Warehouse size={32} className="text-primary/40" />
                                </div>
                                <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">
                                    {search ? "No listings match your search" : "No assets registered yet"}
                                </p>
                                {!search && (
                                    <Link to="/submit" className="mt-4 inline-block text-primary text-xs font-bold uppercase tracking-widest hover:underline">
                                        Start First Submission
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/5 uppercase text-[10px] font-black tracking-widest text-muted-foreground">
                                            <th className="px-6 py-4">Warehouse Code</th>
                                            <th className="px-6 py-4">Location</th>
                                            <th className="px-6 py-4">Area (SQ FT)</th>
                                            <th className="px-6 py-4">Submitted</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {filteredWarehouses.map((w) => (
                                            <tr key={w.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-sm bg-primary/10 flex items-center justify-center text-primary">
                                                            <Warehouse size={16} />
                                                        </div>
                                                        <span className="text-xs font-bold uppercase tracking-tight text-foreground">
                                                            {w.warehouse_code}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                        <MapPin size={12} className="text-primary/60" />
                                                        {w.city}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6 font-display text-sm font-bold text-foreground">
                                                    {Number(w.area_available).toLocaleString()}
                                                </td>
                                                <td className="px-6 py-6">
                                                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                                        <Calendar size={12} className="text-primary/60" />
                                                        {new Date(w.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-6">
                                                    {(w.status === "Available" || w.status === "Land Parcel") ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-500 border border-emerald-500/20">
                                                            <CheckCircle2 size={10} /> {w.status === "Land Parcel" ? "LAND PARCEL" : "LIVE"}
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-amber-500 border border-amber-500/20">
                                                            <Clock size={10} /> Pending Approval
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-6 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleOpenEditModal(w)}
                                                            className="p-2 text-muted-foreground hover:text-primary transition-colors bg-white/5 rounded-sm"
                                                            title="Edit Submission"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => navigate(`/listings/${w.id}`)}
                                                            className="p-2 text-muted-foreground hover:text-foreground"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm border border-border/50 bg-card p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                            <h2 className="font-display text-xl font-bold uppercase tracking-widest text-white">
                                Edit Infrastructure Submission
                            </h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-muted-foreground hover:text-white transition-colors">
                                <XCircle size={24} />
                            </button>
                        </div>

                        {saveError && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                                {saveError}
                            </div>
                        )}

                        <form onSubmit={handleSaveEdit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="space-y-4 lg:col-span-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Identity & Location</h3>
                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Warehouse Code</label>
                                            <input name="warehouse_code" value={formData.warehouse_code || ""} onChange={handleInputChange} className="w-full rounded-sm border border-border/50 bg-background/50 p-2 text-xs text-foreground focus:border-primary focus:outline-none" />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">City*</label>
                                            <input name="city" value={formData.city || ""} onChange={handleInputChange} className={getInputStyles("city")} />
                                            {getFieldError("city") && <p className="mt-1 text-[9px] font-bold uppercase text-red-500">{getFieldError("city")}</p>}
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Area (Sq Ft)*</label>
                                            <input type="number" name="area_available" value={formData.area_available || ""} onChange={handleInputChange} className={getInputStyles("area_available")} />
                                            {getFieldError("area_available") && <p className="mt-1 text-[9px] font-bold uppercase text-red-500">{getFieldError("area_available")}</p>}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 lg:col-span-3">
                                    <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Leasing Terms</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Listing Type</label>
                                            <select name="term_type" value={formData.term_type || "long_term"} onChange={handleInputChange} className="w-full rounded-sm border border-border/50 bg-background/50 p-2 text-xs text-foreground focus:border-primary focus:outline-none">
                                                <option value="long_term">Long Term</option>
                                                <option value="short_term">Short Term</option>
                                            </select>
                                        </div>
                                        {formData.term_type === "short_term" && (
                                            <MonthYearRangePicker
                                                value={formData.term_duration || ""}
                                                onChange={(v) => setFormData(prev => ({ ...prev, term_duration: v }))}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className="lg:col-span-3">
                                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Brief Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description || ""}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full rounded-sm border border-border/50 bg-background/50 p-3 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
                                        placeholder="Outline key features of your asset..."
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="rounded-sm border border-border px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-white">
                                    Cancel
                                </button>
                                <button
                                    disabled={!isFormValid()}
                                    type="submit"
                                    className="rounded-sm bg-primary px-8 py-2 text-xs font-bold uppercase tracking-widest text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    Update Submission
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default Dashboard;