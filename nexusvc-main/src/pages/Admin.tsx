import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { API_ENDPOINTS, API_BASE_URL } from "@/lib/api-config";
import Footer from "@/components/Footer";
import { Plus, Edit2, Trash2, Search, Building2, User, Phone, CheckCircle, XCircle, ArrowDownToLine, ArrowUpDown, Shield, Clock } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { MonthYearRangePicker } from "@/components/MonthYearRangePicker";
import Select from "react-select";

// All available amenities from mock data
const AMENITY_OPTIONS = [
    "24/7 Security", "CCTV Surveillance", "Truck Parking", "Office Space",
    "Cafeteria", "EV Charging", "Rainwater Harvesting", "Solar Panels"
].map(a => ({ value: a, label: a }));

// Types
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
    power_backup?: string;
    compliance?: string;
    fire_system?: string;
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

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

    const {
        values: formData,
        setValues: setFormData,
        handleChange: handleInputChange,
        getInputStyles,
        isValid: isFormValid,
        errors,
        setTouched,
        setErrors
    } = useFormValidation<Partial<Warehouse>>({}, {
        city: { required: true },
        area_available: { required: true },
        rate: { required: true },
        source_contact: { required: true, isPhone: true },
        source_email: { isEmail: true }
    });

    const [activeTab, setActiveTab] = useState<"warehouses" | "users" | "pending" | "messages">("warehouses");

    useEffect(() => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) {
            navigate("/admin/login");
            return;
        }

        fetchWarehouses(token);
        fetchUsers(token);
        fetchMessages(token);
    }, [navigate]);

    const fetchUsers = async (token: string) => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_USERS, {
                headers: { Authorization: token },
            });
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            }
        } catch (err) {
            console.error("Failed to fetch users", err);
        }
    };
    const fetchMessages = async (token: string) => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_MESSAGES, {
                headers: { Authorization: token },
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    const fetchWarehouses = async (token: string) => {
        try {
            const res = await fetch(API_ENDPOINTS.ADMIN_WAREHOUSES, {
                headers: { Authorization: token },
            });
            if (res.status === 401 || res.status === 403) {
                sessionStorage.removeItem("admin_token");
                navigate("/admin/login");
                return;
            }
            const data = await res.json();
            setWarehouses(data);
        } catch (err) {
            console.error("Failed to fetch warehouses", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this warehouse?")) return;

        const token = sessionStorage.getItem("admin_token");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/delete/${id}`, {
                method: "DELETE",
                headers: { Authorization: token || "" },
            });
            if (res.ok) {
                setWarehouses(warehouses.filter(w => w.id !== id));
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    const handleApprove = async (id: number) => {
        const token = sessionStorage.getItem("admin_token");
        try {
            const res = await fetch(`${API_BASE_URL}/admin/approve/${id}`, {
                method: "PUT",
                headers: { Authorization: token || "" },
            });
            if (res.ok) {
                setWarehouses(warehouses.map(w => w.id === id ? { ...w, status: "live" } : w));
            }
        } catch (err) {
            console.error("Approval failed", err);
        }
    };

    const handleOpenModal = (warehouse?: Warehouse) => {
        setErrors({});
        setTouched({});
        if (warehouse) {
            setEditingWarehouse(warehouse);
            setFormData({
                ...warehouse,
                amenities: warehouse.amenities || []
            });
        } else {
            setEditingWarehouse(null);
            setFormData({
                status: "Available",
                term_type: "long_term",
                amenities: []
            });
        }
        setIsModalOpen(true);
    };

    const handleAmenitiesChange = (selectedOptions: any) => {
        const selectedValues = selectedOptions ? selectedOptions.map((opt: any) => opt.value) : [];
        setFormData(prev => ({ ...prev, amenities: selectedValues }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;

        const url = editingWarehouse
            ? `${API_BASE_URL}/admin/warehouses/${editingWarehouse.id}`
            : API_ENDPOINTS.ADMIN_WAREHOUSES;

        const method = editingWarehouse ? "PUT" : "POST";

        try {
            const res = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token
                },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchWarehouses(token);
                setIsModalOpen(false);
            } else {
                alert("Failed to save warehouse.");
            }
        } catch (err) {
            console.error("Save error", err);
        }
    };

    const toggleStatusFilter = (status: string) => {
        setStatusFilter(prev =>
            prev.includes(status)
                ? prev.filter(s => s !== status)
                : [...prev, status]
        );
    };

    const exportMessages = () => {
        const token = sessionStorage.getItem("admin_token");
        if (!token) return;
        window.open(`${API_BASE_URL}/admin/messages/export?authorization=${token}`, "_blank");
    };

    const exportToCSV = () => {
        if (filteredWarehouses.length === 0) return;

        // CSV Headers mapping to actual properties
        const headers = ["ID", "Code", "City", "Area (SqFt)", "Rate (Rs)", "Docks", "Ceiling Height", "Status", "Source Name", "Source Contact", "Date Added"];

        const rows = filteredWarehouses.map(w => [
            w.id,
            w.warehouse_code || '',
            w.city || '',
            w.area_available || '',
            w.rate || '',
            w.docks || '',
            w.ceiling_height || '',
            w.status || '',
            `"${w.source_name || ''}"`, // Quotes to handle commas in names
            w.source_contact || '',
            w.created_at || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `nexus_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    let filteredWarehouses = warehouses.filter(w => {
        // Global Search (city, code) + Source Search
        const searchMatch =
            w.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.warehouse_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.source_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            w.source_contact?.toLowerCase().includes(searchTerm.toLowerCase());

        // Lease Type Filter
        const statusMatch = statusFilter.length === 0 || (w.lease_type && statusFilter.includes(w.lease_type));

        // Tab Filter
        if (activeTab === "pending") return w.status === "pending" && statusMatch && searchMatch;
        if (activeTab === "warehouses") return w.status !== "pending" && statusMatch && searchMatch;
        return false;
    });

    // Sorting
    if (sortByDate !== "none") {
        filteredWarehouses.sort((a, b) => {
            // Fallback to ID if created_at is missing to ensure consistent sorting
            const dateA = a.created_at ? new Date(a.created_at).getTime() : a.id;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : b.id;

            return sortByDate === "desc" ? dateB - dateA : dateA - dateB;
        });
    }

    if (loading) return <div className="flex min-h-screen items-center justify-center bg-background"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent pt-24" /></div>;

    return (
        <>
            <Navbar />
            <main className="min-h-screen bg-[#0A0A0B] pt-24 pb-12 text-foreground">
                <div className="mx-auto max-w-[1600px] px-6">
                    {/* Header: Title and Primary Actions */}
                    <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                        <div>
                            <p className="font-display text-[10px] font-bold uppercase tracking-[0.4em] text-primary/80">System Control</p>
                            <h1 className="mt-1 font-display text-4xl font-black uppercase tracking-tight text-white sm:text-5xl">
                                Command <span className="text-primary">Center</span>
                            </h1>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                onClick={activeTab === "messages" ? exportMessages : exportToCSV}
                                className="flex items-center gap-2 rounded-sm border border-border/50 bg-card/30 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-all hover:bg-muted/20 hover:text-white"
                            >
                                <ArrowDownToLine size={14} /> {activeTab === "messages" ? "Export Inquiries" : "Export Assets"}
                            </button>
                            <button
                                onClick={() => navigate('/submit')}
                                className="flex items-center gap-2 rounded-sm bg-primary px-6 py-2.5 text-xs font-black uppercase tracking-[0.2em] text-primary-foreground shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus size={16} strokeWidth={3} /> List New Warehouse
                            </button>
                        </div>
                    </div>

                    {/* Controls Row: Search, Tabs, and Filters */}
                    <div className="mb-8 space-y-6">
                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                            {/* Left: Tabs */}
                            <div className="flex gap-8 border-b border-border/10">
                                <button
                                    onClick={() => setActiveTab("warehouses")}
                                    className={`relative pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === "warehouses" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Infrastructure
                                    <span className="ml-2 text-[10px] opacity-60">({warehouses.filter(w => w.status !== "pending").length})</span>
                                    {activeTab === "warehouses" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab("users")}
                                    className={`relative pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === "users" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Registered Users
                                    <span className="ml-2 text-[10px] opacity-60">({users.length})</span>
                                    {activeTab === "users" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab("pending")}
                                    className={`relative pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === "pending" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Verification Queue
                                    <span className="ml-2 text-[10px] opacity-60">({warehouses.filter(w => w.status === "pending").length})</span>
                                    {activeTab === "pending" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                </button>
                                <button
                                    onClick={() => setActiveTab("messages")}
                                    className={`relative pb-4 text-xs font-bold uppercase tracking-[0.2em] transition-all ${activeTab === "messages" ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                                >
                                    Inquiries
                                    <span className="ml-2 text-[10px] opacity-60">({messages.length})</span>
                                    {activeTab === "messages" && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
                                </button>
                            </div>

                            {/* Right: Search and Sort */}
                            <div className="flex flex-wrap items-center gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Filter assets..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full rounded-sm border border-border/30 bg-card/20 py-2 pl-9 pr-4 text-xs focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20 sm:w-64 transition-all"
                                    />
                                </div>
                                <button
                                    onClick={() => setSortByDate(prev => prev === "none" ? "desc" : prev === "desc" ? "asc" : "none")}
                                    className={`flex items-center gap-2 rounded-sm border border-border/50 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all ${sortByDate !== "none" ? "bg-primary/10 text-primary border-primary/30" : "text-muted-foreground hover:bg-muted/10"
                                        }`}
                                >
                                    <ArrowUpDown size={14} /> {sortByDate === "desc" ? "Newest First" : sortByDate === "asc" ? "Oldest First" : "Default Sort"}
                                </button>
                            </div>
                        </div>

                        {/* Sub-Filters (Lease Type) */}
                        <div className="flex flex-wrap gap-2">
                            {["Full Space", "Partial Space"].map(status => (
                                <button
                                    key={status}
                                    onClick={() => toggleStatusFilter(status)}
                                    className={`rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter.includes(status)
                                        ? "border-primary/50 bg-primary/10 text-primary"
                                        : "border-border/30 bg-card/30 text-muted-foreground hover:border-border/60 hover:text-foreground"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-sm border border-border/30 bg-card/30 backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            {activeTab === "users" ? (
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
                            ) : activeTab === "messages" ? (
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
                                            m.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                            m.context.toLowerCase().includes(searchTerm.toLowerCase())
                                        ).map((msg) => (
                                            <tr key={msg.id} className={`transition-colors hover:bg-muted/10 ${msg.tier === 'Prime' ? 'border-l-2 border-purple-500 bg-purple-500/5' : ''}`}>
                                                {/* Name + Message */}
                                                <td className="px-6 py-5 max-w-[220px]">
                                                    <div className="font-semibold text-white">{msg.name}</div>
                                                    <div className="text-xs text-muted-foreground line-clamp-2 mt-1">{msg.message}</div>
                                                </td>
                                                {/* Source + Context (which listing) */}
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    <div className="flex flex-col gap-1.5">
                                                        <span className="inline-flex w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-widest text-primary border border-primary/20">
                                                            {msg.source}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground font-mono">{msg.context}</span>
                                                    </div>
                                                </td>
                                                {/* Contact details only */}
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    <div className="text-[10px] text-primary/80 font-medium">{msg.phone}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{msg.email}</div>
                                                </td>
                                                {/* Tier badge only */}
                                                <td className="whitespace-nowrap px-6 py-5">
                                                    {msg.tier === 'Prime' ? (
                                                        <span className="inline-flex items-center gap-1.5 rounded-sm bg-purple-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-purple-400 border border-purple-500/40 shadow-[0_0_8px_rgba(168,85,247,0.3)]">
                                                            ★ PRIME
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center justify-center rounded-sm bg-muted/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-muted-foreground border border-border/20">
                                                            STANDARD
                                                        </span>
                                                    )}
                                                </td>
                                                {/* Timestamp */}
                                                <td className="whitespace-nowrap px-6 py-5 text-right">
                                                    <div className="text-xs text-muted-foreground">
                                                        {new Date(msg.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        <div className="text-[10px] opacity-50">{new Date(msg.created_at).toLocaleTimeString()}</div>
                                                    </div>
                                                </td>
                                                {/* Delete action */}
                                                <td className="whitespace-nowrap px-6 py-5 text-right">
                                                    <button
                                                        onClick={async () => {
                                                            if (!confirm("Delete this inquiry?")) return;
                                                            const token = sessionStorage.getItem("admin_token");
                                                            try {
                                                                const res = await fetch(`${API_BASE_URL}/admin/messages/${msg.id}`, {
                                                                    method: "DELETE",
                                                                    headers: { Authorization: token || "" },
                                                                });
                                                                if (res.ok) {
                                                                    setMessages(prev => prev.filter(m => m.id !== msg.id));
                                                                }
                                                            } catch (err) {
                                                                console.error("Delete failed", err);
                                                            }
                                                        }}
                                                        className="rounded bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20"
                                                        title="Delete inquiry"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <table className="w-full text-left text-sm">
                                    <thead className="border-b border-border/50 bg-muted/20 text-xs uppercase tracking-wider text-muted-foreground">
                                        <tr>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Code</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Location</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Specs</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Operations</th>
                                            <th className="whitespace-nowrap px-6 py-4 font-semibold">Commericals</th>
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
                                                            <span className="inline-flex rounded-sm bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm">FULL SPACE</span>
                                                        ) : w.lease_type === "Partial Space" ? (
                                                            <span className="inline-flex rounded-sm border border-blue-500 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 shadow-sm">PARTIAL SPACE</span>
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
                                                            title="View on Google Maps"
                                                        >
                                                            {w.latitude.toString().slice(0, 7)}, {w.longitude.toString().slice(0, 7)}
                                                        </a>
                                                    ) : (
                                                        <div className="text-[10px] text-muted-foreground/50 font-mono italic">No coordinates</div>
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap px-6 py-4 text-muted-foreground flex flex-col gap-1">
                                                    <div className="flex items-center gap-2"><Building2 size={12} /> {w.area_available?.toLocaleString() || 0} sq ft</div>
                                                    <div className="text-[11px]">HT: {w.ceiling_height}m</div>
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
                                                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
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
                            {activeTab !== "users" && filteredWarehouses.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground">No infrastructure assets found in network.</div>
                            )}
                            {activeTab === "users" && users.length === 0 && (
                                <div className="py-12 text-center text-muted-foreground">No registered users discovered.</div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* CRUD Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
                    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm border border-border/50 bg-card p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-border/50 pb-4">
                            <h2 className="font-display text-xl font-bold uppercase tracking-widest text-white">
                                Configure Infrastructure
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-white">
                                <XCircle size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Admin-only fields */}
                            <div className="space-y-4 lg:col-span-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">Admin Controls</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Code (Optional)</label>
                                        <input name="warehouse_code" value={formData.warehouse_code || ""} onChange={handleInputChange} className="w-full rounded-sm border border-border bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Lease Type</label>
                                        <select name="lease_type" value={formData.lease_type || ""} onChange={handleInputChange} className={getInputStyles("lease_type")}>
                                            <option value="">Select Lease Type...</option>
                                            <option value="Full Space">Full Space</option>
                                            <option value="Partial Space">Partial Space</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Term Type</label>
                                        <select name="term_type" value={formData.term_type || "long_term"} onChange={handleInputChange} className={getInputStyles("term_type")}>
                                            <option value="long_term">Long Term</option>
                                            <option value="short_term">Short Term</option>
                                        </select>
                                    </div>
                                    {formData.term_type === "short_term" && (
                                        <div className="md:col-span-3">
                                            <MonthYearRangePicker
                                                value={formData.term_duration || ""}
                                                onChange={(v) => {
                                                    setFormData(prev => ({ ...prev, term_duration: v }));
                                                }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Section 1: General Information */}
                            <div className="space-y-4 lg:col-span-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">1. General Information</h3>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Name of Organisation</label>
                                        <input name="org_name" value={(formData as any).org_name || ""} onChange={handleInputChange} placeholder="e.g. Shree Bhairav Logistics" className="w-full rounded-sm border border-border bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Category</label>
                                        <select name="category" value={(formData as any).category || ""} onChange={handleInputChange} className="w-full rounded-sm border border-border bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none">
                                            <option value="">Select category…</option>
                                            {["Bonded", "Cold Storage", "Dark Store", "FTWZ (Free Trade Warehousing Zone)", "General Grade A", "General Grade B"].map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Description / Facility Highlights</label>
                                    <textarea name="description" rows={4} value={(formData as any).description || ""} onChange={handleInputChange as any} placeholder="Describe key features, connectivity, certifications…" className="w-full resize-none rounded-sm border border-border bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                                </div>
                            </div>

                            {/* Section 2: Physical Specifications */}
                            <div className="space-y-4 lg:col-span-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">2. Physical Specifications</h3>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Total Area (Sq Ft)*</label>
                                        <input type="number" name="area_available" value={formData.area_available || ""} onChange={handleInputChange} className={getInputStyles("area_available")} />
                                        {errors.area_available && <p className="mt-1 text-[9px] font-bold uppercase text-red-500">{errors.area_available}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Ceiling Height (ft)</label>
                                        <input type="number" step="0.5" name="ceiling_height" value={formData.ceiling_height || ""} onChange={handleInputChange} className={getInputStyles("ceiling_height")} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Number of Docks</label>
                                        <input type="number" name="docks" value={formData.docks || ""} onChange={handleInputChange} className={getInputStyles("docks")} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Floor Strength</label>
                                        <input name="floor_strength" value={formData.floor_strength || ""} onChange={handleInputChange} placeholder="e.g. 7 MT/sqm" className={getInputStyles("floor_strength")} />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Price (₹/sqft/month)*</label>
                                        <input type="number" step="0.5" name="rate" value={formData.rate || ""} onChange={handleInputChange} className={getInputStyles("rate")} />
                                        {errors.rate && <p className="mt-1 text-[9px] font-bold uppercase text-red-500">{errors.rate}</p>}
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Industries Served */}
                            <div className="space-y-3 lg:col-span-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">3. Industries Served</h3>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                    {["FMCG (Fast moving consumer goods)", "Pharma and medical supplies", "Food and beverage", "Chemicals/hazardous goods", "Automotive/spare parts", "Agricultural produce", "Electronics and appliances", "Cosmetics", "Apparel and textiles", "Cold storage", "Packaging material", "E-commerce/Retail goods", "Other"].map(opt => {
                                        const industries: string[] = (formData as any).industries || [];
                                        const checked = industries.includes(opt);
                                        return (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                <div
                                                    onClick={() => {
                                                        const updated = checked ? industries.filter((x: string) => x !== opt) : [...industries, opt];
                                                        setFormData(prev => ({ ...prev, industries: updated } as any));
                                                    }}
                                                    className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}
                                                >
                                                    {checked && <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l3 3 5-6" /></svg>}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground leading-tight">{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 4: Facilities */}
                            <div className="space-y-3 lg:col-span-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">4. Facilities &amp; Infrastructure</h3>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                                    {["Truck parking", "Palletised storage", "Fire Hydrants / Sprinklers", "CCTV cameras", "Office space", "Water supply (Direct or Tanker)", "Handling equipment", "Power backup / Generator", "Washrooms", "Security cabin", "Dock levellers"].map(opt => {
                                        const facilities: string[] = (formData as any).facilities || [];
                                        const checked = facilities.includes(opt);
                                        return (
                                            <label key={opt} className="flex items-center gap-2 cursor-pointer group">
                                                <div
                                                    onClick={() => {
                                                        const updated = checked ? facilities.filter((x: string) => x !== opt) : [...facilities, opt];
                                                        setFormData(prev => ({ ...prev, facilities: updated } as any));
                                                    }}
                                                    className={`w-3.5 h-3.5 rounded-sm border shrink-0 flex items-center justify-center cursor-pointer transition-colors ${checked ? "bg-primary border-primary" : "border-border"}`}
                                                >
                                                    {checked && <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-none stroke-white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4l3 3 5-6" /></svg>}
                                                </div>
                                                <span className="text-[10px] text-muted-foreground leading-tight">{opt}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Section 5: Contact & Location */}
                            <div className="space-y-4 lg:col-span-3">
                                <h3 className="text-xs font-semibold uppercase tracking-widest text-primary">5. Contact &amp; Location</h3>
                                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Concerned Person</label>
                                        <input name="source_name" value={formData.source_name || ""} onChange={handleInputChange} className={getInputStyles("source_name")} placeholder="Full name" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Phone*</label>
                                        <input name="source_contact" value={formData.source_contact || ""} onChange={handleInputChange} className={getInputStyles("source_contact")} placeholder="10 digits" maxLength={10} />
                                        {errors.source_contact && <p className="mt-1 text-[9px] font-bold uppercase text-red-500">{errors.source_contact}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Email</label>
                                        <input name="source_email" value={formData.source_email || ""} onChange={handleInputChange} className={getInputStyles("source_email")} placeholder="email@company.com" />
                                        {errors.source_email && <p className="mt-1 text-[9px] font-bold uppercase text-red-500">{errors.source_email}</p>}
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Website</label>
                                        <input name="source_designation" value={formData.source_designation || ""} onChange={handleInputChange} className={getInputStyles("source_designation")} placeholder="https://…" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Full Address</label>
                                        <input name="address" value={(formData as any).address || ""} onChange={handleInputChange} placeholder="Street, Area, City, State, PIN" className="w-full rounded-sm border border-border bg-background p-2 text-sm text-foreground focus:border-primary focus:outline-none" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Latitude</label>
                                            <input type="number" step="any" name="latitude" value={formData.latitude || ""} onChange={handleInputChange} placeholder="e.g. 19.0760" className={getInputStyles("latitude")} />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Longitude</label>
                                            <input type="number" step="any" name="longitude" value={formData.longitude || ""} onChange={handleInputChange} placeholder="e.g. 72.8777" className={getInputStyles("longitude")} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 flex justify-end gap-3 lg:col-span-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-sm border border-border px-6 py-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground hover:text-white">
                                    Cancel
                                </button>
                                <button
                                    disabled={!isFormValid()}
                                    type="submit"
                                    className="rounded-sm bg-primary px-8 py-2 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                    {editingWarehouse ? "Update Asset" : "Deploy Network Node"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default Admin;
