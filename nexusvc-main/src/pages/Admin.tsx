import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Plus, Edit2, Trash2, Search, Building2, User, Phone, CheckCircle, XCircle, ArrowDownToLine, ArrowUpDown, Shield, Clock, Map as MapIcon, LayoutGrid, Globe, Info, Settings } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { MonthYearRangePicker } from "@/components/MonthYearRangePicker";


interface Warehouse {
    id: number;
    warehouse_code: string;
    city: string;
    area_available: number;
    rate: number;
    min_lease: string;
    deposit: string;
    docks: number;
    ceiling_height: number;
    nearest_port: string;
    nearest_airport: string;
    listing_mode: string;
    status: string;
    lease_type?: string;
    source_name: string;
    source_contact: string;
    source_email?: string;
    source_designation: string;
    latitude?: number;
    longitude?: number;
    term_type?: string;
    term_duration?: string;
    floor_strength?: string;
    amenities?: string[];
    created_at?: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    created_at: string;
}

interface Message {
    id: number;
    name: string;
    email: string;
    phone: string;
    source: string;
    context: string;
    category: string;
    tier: string;
    message: string;
    created_at: string;
}

const Admin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string[]>([]);
    const [sortByDate, setSortByDate] = useState<"none" | "asc" | "desc">("none");
    const [saveError, setSaveError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
    const [activeTab, setActiveTab] = useState<"warehouses" | "users" | "pending" | "messages">("warehouses");

    const {
        values: formData,
        setValues: setFormData,
        handleChange: handleInputChange,
        getInputStyles,
        getFieldError,
        isValid: isFormValid,
        setTouched,
        setErrors
    } = useFormValidation<Partial<Warehouse>>({}, {
        city: { required: true },
        area_available: { required: true },
        rate: { required: true },
        source_contact: { required: true, isPhone: true },
        source_email: { isEmail: true }
    });

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) {
            navigate("/admin/login");
            return;
        }
        const controller = new AbortController();
        fetchWarehouses(token, controller.signal);
        fetchUsers(token, controller.signal);
        fetchMessages(token, controller.signal);
        return () => controller.abort();
    }, [navigate]);

    const fetchWarehouses = async (token: string, signal?: AbortSignal) => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_WAREHOUSES, {
                headers: { Authorization: token },
                signal
            });
            if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem("admin_token");
                navigate("/admin/login");
                return;
            }
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setWarehouses(data.data || data);
        } catch (err: any) {
            if (err.name === "AbortError") return;
            console.error("Failed to fetch warehouses:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async (token: string, signal?: AbortSignal) => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_USERS, {
                headers: { Authorization: token },
                signal
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setUsers(data.data || data);
        } catch (err: any) {
            if (err.name === "AbortError") return;
            console.error("Failed to fetch users:", err);
        }
    };

    const fetchMessages = async (token: string, signal?: AbortSignal) => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_MESSAGES, {
                headers: { Authorization: token },
                signal
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setMessages(data.data || data);
        } catch (err: any) {
            if (err.name === "AbortError") return;
            console.error("Failed to fetch messages:", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this warehouse?")) return;
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_DELETE(id), {
                method: "DELETE",
                headers: { Authorization: token },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setWarehouses(prev => prev.filter(w => w.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete warehouse. Please try again.");
        }
    };

    const handleApprove = async (id: number) => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_APPROVE(id), {
                method: "PUT",
                headers: { Authorization: token },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setWarehouses(prev => prev.map(w => w.id === id ? { ...w, status: "Available" } : w));
        } catch (err) {
            console.error("Approval failed", err);
            alert("Failed to approve warehouse. Please try again.");
        }
    };

    const handleDeleteMessage = async (id: number) => {
        if (!confirm("Delete this inquiry?")) return;
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_DELETE_MESSAGE(id), {
                method: "DELETE",
                headers: { Authorization: token },
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            setMessages(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            console.error("Delete failed", err);
            alert("Failed to delete message. Please try again.");
        }
    };

    const handleOpenModal = (warehouse?: Warehouse) => {
        setErrors({});
        setTouched({});
        setSaveError("");
        if (warehouse) {
            setEditingWarehouse(warehouse);
            setFormData({ ...warehouse, amenities: warehouse.amenities || [] });
        } else {
            setEditingWarehouse(null);
            setFormData({ status: "Available", term_type: "long_term", amenities: [] });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaveError("");
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;

        const url = editingWarehouse
            ? `${API_ENDPOINTS.ADMIN_WAREHOUSES}/${editingWarehouse.id}`
            : API_ENDPOINTS.ADMIN_WAREHOUSES;
        const method = editingWarehouse ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json", "Authorization": token },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (!res.ok) {
                setSaveError(data.error || "Failed to save warehouse. Please try again.");
                return;
            }
            await fetchWarehouses(token);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Save error", err);
            setSaveError("Connection failed. Please try again.");
        }
    };

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(prev =>
            prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
        );
    };

    const exportToCSV = () => {
        if (filteredWarehouses.length === 0) return;
        const headers = ["ID", "Code", "City", "Area (SqFt)", "Rate (Rs)", "Docks", "Ceiling Height", "Status", "Source Name", "Source Contact", "Date Added"];
        const rows = filteredWarehouses.map(w => [
            w.id, w.warehouse_code || '', w.city || '', w.area_available || '',
            w.rate || '', w.docks || '', w.ceiling_height || '', w.status || '',
            `"${w.source_name || ''}"`, w.source_contact || '', w.created_at || ''
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", `nexus_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    let filteredWarehouses = warehouses.filter(w => {
        const searchMatch =
            w.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.source_contact?.toLowerCase().includes(searchTerm.toLowerCase());
        const statusMatch = statusFilter.length === 0 || (w.lease_type && statusFilter.includes(w.lease_type));
        if (activeTab === "pending") return w.status === "pending" && statusMatch && searchMatch;
        if (activeTab === "warehouses") return w.status !== "pending" && statusMatch && searchMatch;
        return false;
    });

    if (sortByDate !== "none") {
        filteredWarehouses.sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id;
            return sortByDate === "desc" ? dateB - dateA : dateA - dateB;
        });
    }

    if (loading) return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0B] text-foreground">
            <Navbar />
            <main className="pt-24 pb-12">
                <div className="mx-auto max-w-[1600px] px-6">

                    {/* Header */}
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80">System Control</p>
                            <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
                                Command <span className="text-primary">Center</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 rounded-sm border border-border/50 bg-card/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted/20 hover:text-white"
                            >
                                <ArrowDownToLine size={14} /> Export Assets
                            </button>
                            <Link
                                to="/submit"
                                className="flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:bg-primary/90"
                            >
                                <Plus size={16} strokeWidth={3} /> New Listing
                            </Link>
                        </div>
                    </div>

                    {/* Tabs + Search */}
                    <div className="mb-8 space-y-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex gap-8 border-b border-border/10">
                                {(["warehouses", "users", "pending", "messages"] as const).map(tab => {
                                    const labels: Record<string, string> = {
                                        warehouses: "Infrastructure",
                                        users: "Registered Users",
                                        pending: "Verification Queue",
                                        messages: "Inquiries"
                                    };
                                    const counts: Record<string, number> = {
                                        warehouses: warehouses.filter(w => w.status !== "pending").length,
                                        users: users.length,
                                        pending: warehouses.filter(w => w.status === "pending").length,
                                        messages: messages.length
                                    };
                                    return (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`relative pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                        >
                                            {labels[tab]}
                                            <span className="ml-2 text-[10px] opacity-60">({counts[tab]})</span>
                                            {activeTab === tab && (
                                                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Filter assets..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-sm border border-border/30 bg-card/20 py-2 pl-9 pr-4 text-xs focus:border-primary/50 focus:outline-none sm:w-64 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setSortByDate(prev => prev === "none" ? "desc" : prev === "desc" ? "asc" : "none")}
                                    className={`flex items-center gap-2 rounded-sm border border-border/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${sortByDate !== "none" ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground hover:bg-muted/10"}`}
                                >
                                    <ArrowUpDown size={14} /> {sortByDate === "desc" ? "Newest First" : sortByDate === "asc" ? "Oldest First" : "Default Sort"}
                                </button>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {["Full Space", "Partial Space"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => toggleStatusFilter(status)}
                                    className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter.includes(status) ? "border-primary/50 bg-primary/10 text-primary" : "border-border/30 bg-card/30 text-muted-foreground hover:border-border/60 hover:text-foreground"}`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tables */}
                    <div className="rounded-sm border border-border/30 bg-card/30 backdrop-blur-xl">
                        <div className="overflow-x-auto">

                            {/* Users Tab */}
                            {activeTab === "users" && (
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">User Identity</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Security Level</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">System Entry</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Reference ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {users.filter(u =>
                                            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            u.email.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((user) => (
                                            <tr key={user.id} className="transition-colors hover:bg-muted/10">
                                                <td className="whitespace-nowrap px-6 py-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-white">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-6">
                                                    {user.is_admin ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary border border-primary/20">
                                                            <Shield size={12} /> System Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted-foreground border border-border/20">
                                                            <User size={12} /> User Node
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-6">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Clock size={14} className="opacity-50" />
                                                        {new Date(user.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-6 text-right font-mono text-[10px] text-muted-foreground">
                                                    #{user.id.toString().padStart(4, '0')}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* Messages Tab */}
                            {activeTab === "messages" && (
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Name & Message</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Source & Listing</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Contact</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Tier</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Timestamp</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {messages.filter(m =>
                                            m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            m.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (m.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            (m.context || "").toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((msg) => (
                                            <tr key={msg.id} className={`transition-colors hover:bg-muted/10 ${msg.tier === 'Prime' ? 'border-l-2 border-purple-500 bg-purple-500/5' : ''}`}>
                                                <td className="px-6 py-5 max-w-[220px]">
                                                    <div className="font-semibold text-white">{msg.name}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{msg.message}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                                                            {msg.source}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{msg.context}</span>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    <div className="text-[10px] text-primary/80 font-medium">{msg.phone}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{msg.email}</div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    {msg.tier === 'Prime' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-purple-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/40">
                                                            ★ PRIME
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center rounded-sm bg-muted/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border/20">
                                                            STANDARD
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-5 text-right">
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(msg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        <div className="text-[10px] opacity-50">{new Date(msg.created_at).toLocaleTimeString()}</div>
                                                    </div>
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-5 text-right">
                                                    <button
                                                        onClick={() => handleDeleteMessage(msg.id)}
                                                        className="rounded bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}

                            {/* Warehouses + Pending Tab */}
                            {(activeTab === "warehouses" || activeTab === "pending") && (
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Code</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Location</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Specs</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Operations</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Commercials</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Source Intelligence</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Actions</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold text-right">Term</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/30">
                                        {filteredWarehouses.map((w) => (
                      <tr key={w.id} className="transition-colors hover:bg-muted/10">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-mono text-xs font-medium text-primary">{w.warehouse_code}</div>
                          <div className="mt-2 flex items-center">
                            {w.lease_type === "Full Space" ? (
                              <span className="inline-flex rounded-sm bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">FULL SPACE</span>
                            ) : w.lease_type === "Partial Space" ? (
                              <span className="inline-flex rounded-sm border border-blue-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10">PARTIAL SPACE</span>
                            ) : (
                              <span className="inline-flex rounded-sm border border-border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">{w.status}</span>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="font-semibold text-white">{w.city}</div>
                          {w.latitude && w.longitude ? (
                            <a
                              href={`https://www.google.com/maps/dir/?api=1&destination=${w.latitude},${w.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-primary hover:underline font-mono"
                            >
                              {w.latitude.toString().slice(0, 7)}, {w.longitude.toString().slice(0, 7)}
                            </a>
                          ) : (
                            <div className="text-[10px] text-muted-foreground/50 font-mono italic">No coordinates</div>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-muted-foreground">
                          <div className="flex items-center gap-2"><Building2 size={12} /> {w.area_available?.toLocaleString() || 0} sq ft</div>
                          <div className="text-[11px] mt-1">HT: {w.ceiling_height}m</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs text-muted-foreground">
                          <div>Docks: <span className="text-white">{w.docks}</span></div>
                          <div className="mt-1">Mode: {w.listing_mode || 'N/A'}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-xs">
                          <div className="text-emerald-400 font-medium">₹{w.rate}/sqft</div>
                          <div className="mt-1 text-muted-foreground">{w.min_lease} (Dep: {w.deposit})</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-white"><User size={12} className="text-primary" /> {w.source_name || 'System'}</div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground"><Phone size={10} /> {w.source_contact || 'N/A'}</div>
                          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-primary/70">{w.source_designation}</div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {activeTab === "pending" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(w.id)}
                                  className="flex items-center gap-1 rounded bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-500 transition-colors hover:bg-emerald-500/20"
                                >
                                  <CheckCircle size={12} /> Approve
                                </button>
                                <button
                                  onClick={() => handleDelete(w.id)}
                                  className="flex items-center gap-1 rounded bg-destructive/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/20"
                                >
                                  <Trash2 size={12} /> Reject
                                </button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleOpenModal(w)} className="rounded bg-primary/10 p-2 text-primary transition-colors hover:bg-primary/20">
                                  <Edit2 size={14} />
                                </button>
                                <button onClick={() => handleDelete(w.id)} className="rounded bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20">
                                  <Trash2 size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <div className="text-[10px] font-bold uppercase tracking-wider">
                            {w.term_type === "short_term" ? (
                              <span className="text-amber-500">Short: {w.term_duration}</span>
                            ) : (
                              <span className="text-emerald-500">Long Term</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                                </tbody>
                </table>
              )}

                        {/* Empty States */}
                        {(activeTab === "warehouses" || activeTab === "pending") && filteredWarehouses.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">No infrastructure assets found in network.</div>
                        )}
                        {activeTab === "users" && users.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">No registered users discovered.</div>
                        )}
                        {activeTab === "messages" && messages.length === 0 && (
                            <div className="py-12 text-center text-muted-foreground">No inquiries received.</div>
                        )}

                    </div>
                </div>
        </div>
      </main >

    {/* CRUD Modal */}
    {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 px-4 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-sm border border-primary/20 bg-[#0F1115] p-0 shadow-[0_0_100px_rgba(0,0,0,1)] no-scrollbar"
            >
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#0F1115]/80 px-8 py-6 backdrop-blur-xl">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/60">Asset Configuration</p>
                        <h2 className="mt-1 font-display text-2xl font-bold uppercase tracking-tighter text-white">
                            Command <span className="text-primary">Panel</span>
                        </h2>
                    </div>
                    <button onClick={() => setIsModalOpen(false)} className="group flex h-10 w-10 items-center justify-center rounded-full border border-white/10 transition-all hover:bg-white/5">
                        <XCircle size={20} className="text-muted-foreground transition-colors group-hover:text-white" />
                    </button>
                </div>

                <div className="p-8">
                    {saveError && (
                        <div className="mb-8 flex items-center gap-3 border border-red-500/20 bg-red-500/5 p-4 rounded-sm text-red-500 text-[10px] font-bold uppercase tracking-widest shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                            <XCircle size={16} />
                            {saveError}
                        </div>
                    )}

                    <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {/* 0. Admin Controls */}
                        <div className="space-y-6 lg:col-span-3">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                    <Shield size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">System Overrides</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Designation Code</label>
                                    <input 
                                        name="warehouse_code" 
                                        value={formData.warehouse_code || ""} 
                                        onChange={handleInputChange} 
                                        placeholder="NXS-XXXX"
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white placeholder:text-white/10 focus:border-primary/50 focus:outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Deployment Scale</label>
                                    <select 
                                        name="lease_type" 
                                        value={formData.lease_type || ""} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-[#161a20] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#1a1f26]">Select Type...</option>
                                        <option value="Full Space" className="bg-[#1a1f26]">Full Scale (1:1)</option>
                                        <option value="Partial Space" className="bg-[#1a1f26]">Partial Grid</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Contract Horizon</label>
                                    <select 
                                        name="term_type" 
                                        value={formData.term_type || "long_term"} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-[#161a20] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="long_term" className="bg-[#1a1f26]">Strategic Long-Term</option>
                                        <option value="short_term" className="bg-[#1a1f26]">Tactical Short-Term</option>
                                    </select>
                                </div>
                                {formData.term_type === "short_term" && (
                                    <div className="md:col-span-3 pt-2">
                                        <MonthYearRangePicker
                                            value={formData.term_duration || ""}
                                            onChange={(v) => setFormData(prev => ({ ...prev, term_duration: v }))}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 1. Core Intelligence */}
                        <div className="space-y-6 lg:col-span-3 mt-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                    <Info size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">01. Core Intelligence</h3>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Facility Identity (Org Name)</label>
                                    <input 
                                        name="org_name" 
                                        value={(formData as any).org_name || ""} 
                                        onChange={handleInputChange} 
                                        placeholder="Entity Name"
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white placeholder:text-white/20 focus:border-primary/50 focus:outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Asset Category</label>
                                    <select 
                                        name="category" 
                                        value={(formData as any).category || ""} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-[#161a20] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" className="bg-[#1a1f26]">Classify Infrastructure…</option>
                                        {["Bonded", "Cold Storage", "Dark Store", "FTWZ (Free Trade Warehousing Zone)", "General Grade A", "General Grade B"].map(c => (
                                            <option key={c} value={c} className="bg-[#1a1f26]">{c}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">System Analytics & Highlights</label>
                                <textarea 
                                    name="description" 
                                    rows={4} 
                                    value={(formData as any).description || ""} 
                                    onChange={handleInputChange as any} 
                                    placeholder="Describe facility vectors, connectivity logs, and strategic advantages…" 
                                    className="w-full resize-none rounded-sm border border-white/10 bg-white/[0.03] p-4 text-sm text-white placeholder:text-white/10 focus:border-primary/50 focus:outline-none transition-all" 
                                />
                            </div>
                        </div>

                        {/* 2. Physical Specs */}
                        <div className="space-y-6 lg:col-span-3 mt-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                    <LayoutGrid size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">02. Physical Specifications</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Mass (Sq Ft)*</label>
                                    <input 
                                        type="number" 
                                        name="area_available" 
                                        value={formData.area_available || ""} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" 
                                    />
                                    {getFieldError("area_available") && <p className="mt-1 text-[9px] font-bold uppercase text-red-500 tracking-tighter">{getFieldError("area_available")}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Altitude (ft)</label>
                                    <input 
                                        type="number" 
                                        step="0.5" 
                                        name="ceiling_height" 
                                        value={formData.ceiling_height || ""} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Ingress Nodes</label>
                                    <input 
                                        type="number" 
                                        name="docks" 
                                        value={formData.docks || ""} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Load Bearing</label>
                                    <input 
                                        name="floor_strength" 
                                        value={formData.floor_strength || ""} 
                                        onChange={handleInputChange} 
                                        placeholder="7 MT/sqm" 
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Economic Index*</label>
                                    <input 
                                        type="number" 
                                        step="0.5" 
                                        name="rate" 
                                        value={formData.rate || ""} 
                                        onChange={handleInputChange} 
                                        className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-emerald-500/50 focus:outline-none transition-all" 
                                    />
                                    {getFieldError("rate") && <p className="mt-1 text-[9px] font-bold uppercase text-red-500 tracking-tighter">{getFieldError("rate")}</p>}
                                </div>
                            </div>
                        </div>

                        {/* 3. Industries */}
                        <div className="space-y-3 lg:col-span-3 mt-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                    <Building2 size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">03. Network Capability (Industries)</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 pt-4">
                                {["FMCG (Fast moving consumer goods)", "Pharma and medical supplies", "Food and beverage", "Chemicals/hazardous goods", "Automotive/spare parts", "Agricultural produce", "Electronics and appliances", "Cosmetics", "Apparel and textiles", "Cold storage", "Packaging material", "E-commerce/Retail goods", "Other"].map(opt => {
                                    const industries: string[] = (formData as any).industries || [];
                                    const checked = industries.includes(opt);
                                    return (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                onClick={() => {
                                                    const updated = checked ? industries.filter((x: string) => x !== opt) : [...industries, opt];
                                                    setFormData(prev => ({ ...prev, industries: updated } as any));
                                                }}
                                                className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center cursor-pointer transition-all ${checked ? "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "border-white/10 bg-white/5 group-hover:border-white/30"}`}
                                            >
                                                {checked && <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l3 3 5-6" /></svg>}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider transition-colors ${checked ? "text-white font-bold" : "text-muted-foreground group-hover:text-white/60"}`}>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 4. Facilities */}
                        <div className="space-y-3 lg:col-span-3 mt-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                    <Settings size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">04. Support Protocols (Facilities)</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 pt-4">
                                {["Truck parking", "Palletised storage", "Fire Hydrants / Sprinklers", "CCTV cameras", "Office space", "Water supply (Direct or Tanker)", "Handling equipment", "Power backup / Generator", "Washrooms", "Security cabin", "Dock levellers"].map(opt => {
                                    const facilities: string[] = (formData as any).facilities || [];
                                    const checked = facilities.includes(opt);
                                    return (
                                        <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                                            <div
                                                onClick={() => {
                                                    const updated = checked ? facilities.filter((x: string) => x !== opt) : [...facilities, opt];
                                                    setFormData(prev => ({ ...prev, facilities: updated } as any));
                                                }}
                                                className={`w-4 h-4 rounded-sm border shrink-0 flex items-center justify-center cursor-pointer transition-all ${checked ? "bg-primary border-primary shadow-[0_0_10px_rgba(59,130,246,0.3)]" : "border-white/10 bg-white/5 group-hover:border-white/30"}`}
                                            >
                                                {checked && <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l3 3 5-6" /></svg>}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider transition-colors ${checked ? "text-white font-bold" : "text-muted-foreground group-hover:text-white/60"}`}>{opt}</span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>

                        {/* 5. Contact */}
                        <div className="space-y-6 lg:col-span-3 mt-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10 text-primary">
                                    <User size={16} />
                                </div>
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white">05. Contact & Deployment Location</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Concerned Person</label>
                                    <input name="source_name" value={formData.source_name || ""} onChange={handleInputChange} className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="Full name" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Contact Vector (Phone)*</label>
                                    <input name="source_contact" value={formData.source_contact || ""} onChange={handleInputChange} className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="10 digits" maxLength={10} />
                                    {getFieldError("source_contact") && <p className="mt-1 text-[9px] font-bold uppercase text-red-500 tracking-tighter">{getFieldError("source_contact")}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Communication Node (Email)</label>
                                    <input name="source_email" value={formData.source_email || ""} onChange={handleInputChange} className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="email@company.com" />
                                    {getFieldError("source_email") && <p className="mt-1 text-[9px] font-bold uppercase text-red-500 tracking-tighter">{getFieldError("source_email")}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Digital Link (Port/Web)</label>
                                    <input name="source_designation" value={formData.source_designation || ""} onChange={handleInputChange} className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" placeholder="https://…" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Physical Coordinates (Address)</label>
                                    <input name="address" value={(formData as any).address || ""} onChange={handleInputChange} placeholder="Full Deployment Address" className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Latitude</label>
                                        <input type="number" step="any" name="latitude" value={formData.latitude || ""} onChange={handleInputChange} placeholder="0.0000" className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground/80">Longitude</label>
                                        <input type="number" step="any" name="longitude" value={formData.longitude || ""} onChange={handleInputChange} placeholder="0.0000" className="w-full rounded-sm border border-white/10 bg-white/[0.03] p-3 text-sm text-white focus:border-primary/50 focus:outline-none transition-all" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Submit */}
                        <div className="mt-12 flex justify-end gap-4 lg:col-span-3 border-t border-white/5 pt-8">
                            <button 
                                type="button" 
                                onClick={() => setIsModalOpen(false)} 
                                className="rounded-sm border border-white/10 px-8 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-white/5 hover:text-white"
                            >
                                Abort Mission
                            </button>
                            <button
                                disabled={!isFormValid()}
                                type="submit"
                                className="rounded-sm bg-primary px-10 py-3 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.2)] transition-all hover:bg-primary/90 disabled:opacity-20 disabled:cursor-not-allowed"
                            >
                                {editingWarehouse ? "Update Asset" : "Deploy Network Node"}
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </div>
    )}
    </div>
  );
};

export default Admin;