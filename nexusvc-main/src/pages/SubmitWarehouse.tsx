import React, { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api-config";
import { CheckCircle2, Search, Loader2, Warehouse, Map as MapIcon, ArrowLeft, Camera, ArrowRight } from "lucide-react";
import { z } from "zod";
import maplibregl from 'maplibre-gl';
import Map, { Marker } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

// ─── Constants ───────────────────────────────────────────────────────────────
const CATEGORIES = ["General Grade A", "General Grade B", "Bonded", "Cold Storage", "Dark Store", "Shared Warehouse", "FTWZ (Free Trade Warehousing Zone)"];
const INDUSTRIES = [
    "FMCG (Fast moving consumer goods)", "Pharma and medical supplies", "Food and beverage",
    "Chemicals/hazardous goods", "Automotive/spare parts", "Agricultural produce",
    "Electronics and appliances", "Cosmetics", "Apparel and textiles", "Cold storage",
    "Packaging material", "E-commerce/Retail goods", "Other",
];
const FACILITIES = [
    "Truck parking", "Palletised storage", "Fire Hydrants / Sprinklers", "CCTV cameras",
    "Office space", "Water supply (Direct or Tanker)", "Handling equipment",
    "Power backup / Generator", "Washrooms", "Security cabin",
];
const CITIES = ["Mumbai", "Nashik", "Pune", "Delhi NCR", "Bangalore", "Chennai", "Hyderabad", "Ahmedabad", "Kolkata", "Other"];
const CLUSTERS = ["Bhiwandi", "Panvel", "Chakan", "Hosur", "Talegaon", "Dombivli", "Navi Mumbai", "Pimpri-Chinchwad", "Mahape", "Kundli"];
const listerTypeOptions = ["Owner", "3pl op", "Broker", "Business"] as const;
const landStatusOptions = ["Sanctioned", "Under Development"] as const;
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => (currentYear + i).toString());

// ─── Schemas ─────────────────────────────────────────────────────────────────
const warehouseSchema = z.object({
    type: z.literal("warehouse"),
    org_name: z.string().min(1, "Organisation name is required"),
    lease_type: z.enum(["Full Space", "Partial Space"]),
    lister_type: z.enum(["Owner", "3pl op", "Broker", "Business"]),
    is_prime: z.boolean().default(false),
    category: z.string().min(1, "Category is required"),
    description: z.string(),
    measure_by: z.enum(["area", "pallets"]),
    capacity_value: z.string().min(1, "Value is required"),
    ceiling_height: z.string(),
    docks: z.string(),
    floor_strength: z.string(),
    rate: z.string(),
    industries: z.array(z.string()),
    facilities: z.array(z.string()),
    contact_person: z.string(),
    contact_email: z.string().email("Enter a valid email").or(z.literal("")),
    contact_phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number").or(z.literal("")),
    website: z.string(),
    city: z.string().min(1, "City is required"),
    address: z.string(),
    full_address: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    temperature_range: z.string().optional(),
    product_suitability: z.array(z.string()).optional(),
    term_type: z.enum(["long_term", "short_term"]).default("long_term"),
    term_duration: z.string().optional(),
    start_month: z.string().optional(),
    start_year: z.string().optional(),
    end_month: z.string().optional(),
    end_year: z.string().optional(),
    cluster: z.string().optional(),
    image_url: z.string().optional(),
});

const landSchema = z.object({
    type: z.literal("land"),
    org_name: z.string().min(1, "Name is required"),
    lister_type: z.enum(["Owner", "Broker", "Business"]),
    land_size: z.string().min(1, "Land size is required"),
    rate_sqft: z.string().optional(),
    land_status: z.enum(["Sanctioned", "Under Development"]),
    construction_assistance: z.boolean().default(false),
    contact_person: z.string().min(1, "Contact person is required"),
    contact_phone: z.string().regex(/^\d{10}$/, "Enter a valid 10-digit phone number"),
    contact_email: z.string().email("Enter a valid email").or(z.literal("")),
    city: z.string().min(1, "City is required"),
    address: z.string(),
    full_address: z.string(),
    latitude: z.string(),
    longitude: z.string(),
    description: z.string(),
    cluster: z.string().optional(),
    image_url: z.string().optional(),
});

type WarehouseForm = z.infer<typeof warehouseSchema>;
type LandForm = z.infer<typeof landSchema>;

const INITIAL_WAREHOUSE: WarehouseForm = {
    type: "warehouse", org_name: "", lease_type: "Full Space", lister_type: "Owner",
    is_prime: false, category: "", description: "", measure_by: "area", capacity_value: "",
    ceiling_height: "", docks: "", floor_strength: "", rate: "", industries: [], facilities: [],
    contact_person: "", contact_email: "", contact_phone: "", website: "", city: "", address: "",
    full_address: "", latitude: "19.0760", longitude: "72.8777", temperature_range: "",
    product_suitability: [], term_type: "long_term", term_duration: "", start_month: "",
    start_year: "", end_month: "", end_year: "", cluster: "", image_url: "",
};

const INITIAL_LAND: LandForm = {
    type: "land", org_name: "", lister_type: "Owner", land_size: "", rate_sqft: "",
    land_status: "Sanctioned", construction_assistance: false, contact_person: "",
    contact_phone: "", contact_email: "", city: "", address: "", full_address: "",
    latitude: "19.0760", longitude: "72.8777", description: "", cluster: "", image_url: "",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const inputClass = "w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors";
const labelClass = "block mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const sectionClass = "rounded-sm border border-border/60 bg-card p-8 space-y-6";
const sectionTitle = "font-display text-lg font-bold uppercase tracking-tight text-foreground border-b border-border/50 pb-4";

function CheckboxGroup({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
    const toggle = (opt: string) => {
        onChange(selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt]);
    };
    const isAllSelected = options.length > 0 && selected.length === options.length;
    const toggleAll = () => {
        onChange(isAllSelected ? [] : [...options]);
    };
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {options.map(opt => (
                <div key={opt} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggle(opt)}>
                    <div
                        className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${selected.includes(opt) ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}
                    >
                        {selected.includes(opt) && (
                            <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{opt}</span>
                </div>
            ))}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={toggleAll}>
                <div
                    className={`w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${isAllSelected ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}
                >
                    {isAllSelected && (
                        <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white fill-current">
                            <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
                <span className="text-sm text-primary font-medium group-hover:text-primary/80 transition-colors italic">All of the above</span>
            </div>
        </div>
    );
}


// ─── Component ───────────────────────────────────────────────────────────────
const SubmitWarehouse = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [subType, setSubType] = useState<"warehouse" | "land" | null>(null);

    useEffect(() => {
        if (location.state && (location.state as any).type) {
            setSubType((location.state as any).type);
        }
    }, [location.state]);

    const [warehouseForm, setWarehouseForm] = useState<WarehouseForm>(INITIAL_WAREHOUSE);
    const [landForm, setLandForm] = useState<LandForm>(INITIAL_LAND);
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState("");

    const [markerPos, setMarkerPos] = useState({ longitude: 72.8777, latitude: 19.0760 });
    const setW = (key: keyof WarehouseForm, value: any) => setWarehouseForm(prev => ({ ...prev, [key]: value }));
    const setL = (key: keyof LandForm, value: any) => setLandForm(prev => ({ ...prev, [key]: value }));

    const updateLocation = (lat: number, lng: number) => {
        if (subType === "warehouse") {
            setWarehouseForm(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
        } else {
            setLandForm(prev => ({ ...prev, latitude: lat.toString(), longitude: lng.toString() }));
        }
        setMarkerPos({ latitude: lat, longitude: lng });
        reverseGeocode(lat, lng);
    };

    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<maplibregl.Map | null>(null);
    const markerRef = useRef<maplibregl.Marker | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || !subType) return;
        
        const map = new maplibregl.Map({
            container: mapContainerRef.current,
            style: {
                version: 8,
                sources: {
                    "satellite-hybrid": {
                        type: "raster",
                        tiles: ["https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"],
                        tileSize: 256,
                    },
                },
                layers: [
                    {
                        id: "satellite-hybrid",
                        type: "raster",
                        source: "satellite-hybrid",
                        minzoom: 0,
                        maxzoom: 22,
                    },
                ],
            },
            center: [markerPos.longitude, markerPos.latitude],
            zoom: 12
        });

        mapInstanceRef.current = map;

        const marker = new maplibregl.Marker({ draggable: true })
            .setLngLat([markerPos.longitude, markerPos.latitude])
            .addTo(map);
        
        markerRef.current = marker;

        marker.on('dragend', () => {
            const lngLat = marker.getLngLat();
            updateLocation(lngLat.lat, lngLat.lng);
        });

        map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            marker.setLngLat([lng, lat]);
            updateLocation(lat, lng);
        });

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, [subType]);

    useEffect(() => {
        if (mapInstanceRef.current && markerRef.current) {
            const lat = parseFloat(subType === 'warehouse' ? warehouseForm.latitude : landForm.latitude);
            const lng = parseFloat(subType === 'warehouse' ? warehouseForm.longitude : landForm.longitude);
            if (!isNaN(lat) && !isNaN(lng)) {
                markerRef.current.setLngLat([lng, lat]);
                mapInstanceRef.current.easeTo({ center: [lng, lat], duration: 500 });
            }
        }
    }, [warehouseForm.latitude, warehouseForm.longitude, landForm.latitude, landForm.longitude, subType]);

    const reverseGeocode = async (lat: number, lng: number) => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await res.json();
            if (data?.display_name) {
                if (subType === "warehouse") setW("full_address", data.display_name);
                else setL("full_address", data.display_name);
            }
        } catch (err) {
            console.warn("Reverse geocode failed:", err);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearching(true);
        try {
            // 1. Try Coordinate Parsing (Lat, Lng)
            const coordMatch = searchQuery.match(/(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)/);
            if (coordMatch) {
                const lat = parseFloat(coordMatch[1]);
                const lng = parseFloat(coordMatch[2]);
                updateLocation(lat, lng);
                setSearching(false);
                return;
            }

            // 2. Try Google Maps URL Parsing
            const googleMapsMatch = searchQuery.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (googleMapsMatch) {
                const lat = parseFloat(googleMapsMatch[1]);
                const lng = parseFloat(googleMapsMatch[2]);
                updateLocation(lat, lng);
                setSearching(false);
                return;
            }

            // 3. Fallback to Text Search (OSM)
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=in`);
            const data = await res.json();
            if (data?.length > 0) {
                const { lat, lon, display_name } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                
                updateLocation(newLat, newLng); // Efficiently updates form, marker, and geocoding
                if (subType === "warehouse") setW("full_address", display_name);
                else setL("full_address", display_name);
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setSearching(false);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError("");
        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await fetch(`${API_ENDPOINTS.UPLOAD}`, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");
            if (subType === "warehouse") setW("image_url", data.url);
            else setL("image_url", data.url);
        } catch (err: any) {
            setUploadError(err.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const validate = () => {
        if (subType === "warehouse" && warehouseForm.category === "Cold Storage") {
            if (!warehouseForm.temperature_range) {
                setErrors({ temperature_range: "Temperature Range is required for Cold Storage" });
                return false;
            }
            if (!warehouseForm.product_suitability || warehouseForm.product_suitability.length === 0) {
                setErrors({ product_suitability: "Product Suitability is required for Cold Storage" });
                return false;
            }
        }
        const schema = subType === "warehouse" ? warehouseSchema : landSchema;
        const form = subType === "warehouse" ? warehouseForm : landForm;
        const result = schema.safeParse(form);
        if (!result.success) {
            const e: Record<string, string> = {};
            result.error.errors.forEach(err => {
                const path = err.path[0]?.toString();
                if (path && !e[path]) e[path] = err.message;
            });
            setErrors(e);
            return false;
        }
        setErrors({});
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        setSubmitError("");

        try {
            let payload;
            if (subType === "warehouse") {
                const isPrimeBackend = warehouseForm.is_prime || localStorage.getItem("nexus_prime") === "1";
                payload = {
                    ...warehouseForm,
                    capacity_type: warehouseForm.measure_by === "area" ? "sq_ft" : "pallets",
                    area_available: warehouseForm.measure_by === "area" ? warehouseForm.capacity_value : null,
                    tier: isPrimeBackend ? "Prime" : "Standard",
                    is_prime: isPrimeBackend,
                    term_duration: warehouseForm.term_type === "short_term"
                        ? `${warehouseForm.start_month} ${warehouseForm.start_year} - ${warehouseForm.end_month} ${warehouseForm.end_year}`
                        : null
                };
            } else {
                payload = { ...landForm, tier: "Standard", status: "Land Parcel" };
            }

            const response = await fetch(API_ENDPOINTS.SUBMIT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!response.ok) {
                setSubmitError(data.error || "Submission failed. Please try again.");
                return;
            }

            localStorage.removeItem("nexus_prime");
            setSubmitted(true);
        } catch (err) {
            console.error("Submit failed:", err);
            setSubmitError("Connection failed. Please check your internet and try again.");
        } finally {
            setLoading(false);
        }
    };

    const renderMapSection = () => (
        <section className={sectionClass}>
            <h2 className={sectionTitle}>{subType === 'warehouse' ? '4.' : '3.'} Contact & Location</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                    <label className={labelClass}>Contact Person</label>
                    <input
                        value={subType === 'warehouse' ? warehouseForm.contact_person : landForm.contact_person}
                        onChange={e => subType === 'warehouse' ? setW("contact_person", e.target.value) : setL("contact_person", e.target.value)}
                        placeholder="Name"
                        className={`${inputClass} ${errors.contact_person ? "border-red-500" : ""}`}
                    />
                    {errors.contact_person && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.contact_person}</p>}
                </div>
                <div>
                    <label className={labelClass}>Phone *</label>
                    <input
                        value={subType === 'warehouse' ? warehouseForm.contact_phone : landForm.contact_phone}
                        onChange={e => subType === 'warehouse' ? setW("contact_phone", e.target.value) : setL("contact_phone", e.target.value)}
                        maxLength={10}
                        placeholder="10-digit number"
                        className={`${inputClass} ${errors.contact_phone ? "border-red-500" : ""}`}
                    />
                    {errors.contact_phone && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.contact_phone}</p>}
                </div>
                <div>
                    <label className={labelClass}>Email</label>
                    <input
                        value={subType === 'warehouse' ? warehouseForm.contact_email : landForm.contact_email}
                        onChange={e => subType === 'warehouse' ? setW("contact_email", e.target.value) : setL("contact_email", e.target.value)}
                        type="email"
                        placeholder="email@company.com"
                        className={`${inputClass} ${errors.contact_email ? "border-red-500" : ""}`}
                    />
                    {errors.contact_email && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.contact_email}</p>}
                </div>
                <div>
                    <label className={labelClass}>City *</label>
                    <select
                        value={subType === 'warehouse' ? warehouseForm.city : landForm.city}
                        onChange={e => subType === 'warehouse' ? setW("city", e.target.value) : setL("city", e.target.value)}
                        className={`${inputClass} ${errors.city ? "border-red-500" : ""}`}
                    >
                        <option value="">Select city…</option>
                        {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {errors.city && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.city}</p>}
                </div>
                <div>
                    <label className={labelClass}>Industrial Area / Cluster</label>
                    <input
                        list="cluster-options-list"
                        value={subType === 'warehouse' ? warehouseForm.cluster : landForm.cluster}
                        onChange={e => subType === 'warehouse' ? setW("cluster", e.target.value) : setL("cluster", e.target.value)}
                        placeholder="e.g. Bhiwandi, Panvel, Chakan"
                        className={inputClass}
                    />
                    <datalist id="cluster-options-list">
                        {CLUSTERS.map(c => <option key={c} value={c} />)}
                    </datalist>
                </div>
                <div>
                    <label className={labelClass}>Area / Landmark</label>
                    <input
                        value={subType === 'warehouse' ? warehouseForm.address : landForm.address}
                        onChange={e => subType === 'warehouse' ? setW("address", e.target.value) : setL("address", e.target.value)}
                        placeholder="e.g. MIDC Bhiwandi / Near NH48"
                        className={inputClass}
                    />
                </div>
            </div>

            <div className="mt-8 space-y-4">
                <label className={labelClass}>Pin Location (Map) *</label>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearch())}
                            placeholder="Search address..."
                            className={`${inputClass} pl-10`}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleSearch}
                        disabled={searching}
                        className="bg-primary/20 hover:bg-primary/30 px-6 rounded-sm text-sm font-semibold transition-colors disabled:opacity-50"
                    >
                        {searching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
                    </button>
                </div>

                <div className="h-[400px] w-full rounded-sm border border-border overflow-hidden z-0 bg-[#0F172A]">
                    <div ref={mapContainerRef} className="h-full w-full" />
                </div>

                <div className="p-4 bg-muted/30 border border-border/50 rounded-sm space-y-2">
                    <label className="text-[10px] font-bold uppercase text-muted-foreground block">Verified Address</label>
                    <p className="text-xs">
                        {(subType === 'warehouse' ? warehouseForm.full_address : landForm.full_address) || "Click map or search for address"}
                    </p>
                </div>
            </div>
        </section>
    );

    if (submitted) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col">
                <Navbar />
                <main className="flex-1 flex items-center justify-center pt-32 pb-20 px-6 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full bg-card border border-border p-10 rounded-sm space-y-6"
                    >
                        <div className="flex justify-center"><CheckCircle2 size={64} className="text-primary" /></div>
                        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">Requirement Submitted!</h2>
                        <p className="text-muted-foreground text-sm">Your {subType} listing is under review. We'll get back to you shortly.</p>
                        <a href="/listings" className="inline-block rounded-sm bg-primary px-8 py-3 text-sm font-semibold uppercase tracking-wider text-primary-foreground hover:shadow-lg hover:shadow-primary/20 transition-all">
                            Browse Listings
                        </a>
                    </motion.div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-20">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    {!subType ? (
                        <div className="py-12">
                            <h1 className="font-display text-4xl font-black uppercase tracking-tighter text-foreground sm:text-6xl text-center mb-16">
                                START YOUR <span className="text-gradient">LISTING</span>
                            </h1>
                            <div className="grid gap-8 sm:grid-cols-2">
                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSubType("warehouse")}
                                    className="group cursor-pointer rounded-sm border border-border bg-card p-12 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Warehouse size={120} />
                                    </div>
                                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                        <Warehouse size={40} strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">WAREHOUSE</h2>
                                    <p className="mt-4 text-sm font-medium uppercase tracking-widest text-muted-foreground leading-relaxed">
                                        List Grade A/B facilities, Cold Storage, Bonded space, or Dark Stores.
                                    </p>
                                    <div className="mt-8 flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                                        START FORM <ArrowRight size={14} />
                                    </div>
                                </motion.div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    onClick={() => setSubType("land")}
                                    className="group cursor-pointer rounded-sm border border-border bg-card p-12 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <MapIcon size={120} />
                                    </div>
                                    <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500">
                                        <MapIcon size={40} strokeWidth={1.5} />
                                    </div>
                                    <h2 className="font-display text-3xl font-black uppercase tracking-tight text-foreground">LAND PARCEL</h2>
                                    <p className="mt-4 text-sm font-medium uppercase tracking-widest text-muted-foreground leading-relaxed">
                                        List open land for industrial development, built-to-suit projects, or yards.
                                    </p>
                                    <div className="mt-8 flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]">
                                        START FORM <ArrowRight size={14} />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    ) : (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                            <button
                                onClick={() => setSubType(null)}
                                className="mb-8 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground hover:text-primary transition-colors"
                            >
                                <ArrowLeft size={14} /> Back to Selection
                            </button>

                            <h1 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
                                Submit {subType === 'warehouse' ? 'a Warehouse' : 'a Land Parcel'}
                            </h1>
                            <p className="mt-4 text-base text-muted-foreground">
                                {subType === 'warehouse'
                                    ? 'Fill in the details below to list your warehouse on the Nexus network.'
                                    : 'List your industrial land for strategic development or built-to-suit opportunities.'}
                            </p>

                            <form onSubmit={handleSubmit} className="mt-12 space-y-8">
                                {subType === 'warehouse' ? (
                                    <>
                                        <section className={sectionClass}>
                                            <h2 className={sectionTitle}>1. General Information</h2>
                                            <div>
                                                <label className={labelClass}>Name of Organisation *</label>
                                                <input
                                                    value={warehouseForm.org_name}
                                                    onChange={e => setW("org_name", e.target.value)}
                                                    placeholder="e.g. Shree Bhairav Logistics"
                                                    className={`${inputClass} ${errors.org_name ? "border-red-500" : ""}`}
                                                />
                                                {errors.org_name && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.org_name}</p>}
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Category *</label>
                                                    <select
                                                        value={warehouseForm.category}
                                                        onChange={e => setW("category", e.target.value)}
                                                        className={`${inputClass} ${errors.category ? "border-red-500" : ""}`}
                                                    >
                                                        <option value="">Select category…</option>
                                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                    {errors.category && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.category}</p>}
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Lister Type *</label>
                                                    <select value={warehouseForm.lister_type} onChange={e => setW("lister_type", e.target.value)} className={inputClass}>
                                                        {listerTypeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                                    </select>
                                                </div>
                                            </div>
                                        </section>

                                        {/* Prime Upgrade Banner */}
                                        <div className="relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 transition-all hover:border-primary/40 hover:shadow-lg">
                                            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                                                <div className="space-y-2 flex-1">
                                                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">Nexus Prime Upgrade</h3>
                                                    <p className="text-sm text-muted-foreground leading-relaxed">Let our expert 3PL team manage everything.</p>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0">
                                                    <button type="button" onClick={() => setW("is_prime", true)} className={`px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all border ${warehouseForm.is_prime ? 'bg-primary border-primary text-primary-foreground' : 'bg-background border-border'}`}>Join Now</button>
                                                    <button type="button" onClick={() => setW("is_prime", false)} className={`px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-wider transition-all border ${!warehouseForm.is_prime ? 'bg-muted border-border' : 'bg-background border-border'}`}>No Thanks</button>
                                                </div>
                                            </div>
                                        </div>

                                        <section className={sectionClass}>
                                            <h2 className={sectionTitle}>2. Lease Terms & Physical Specifications</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div>
                                                    <label className={labelClass}>Lease Term Type *</label>
                                                    <div className="flex gap-4">
                                                        {(["long_term", "short_term"] as const).map(term => (
                                                            <label key={term} className={`flex-1 flex items-center justify-center p-3 rounded-sm border cursor-pointer ${warehouseForm.term_type === term ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                                                <input type="radio" value={term} checked={warehouseForm.term_type === term} onChange={e => setW("term_type", e.target.value)} className="sr-only" />
                                                                <span className="font-semibold text-sm">{term === "long_term" ? "Long Term" : "Short Term"}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                {warehouseForm.term_type === 'short_term' && (
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Start</label>
                                                            <div className="flex gap-2">
                                                                <select value={warehouseForm.start_month} onChange={e => setW("start_month", e.target.value)} className={inputClass}>
                                                                    <option value="">Month</option>
                                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                </select>
                                                                <select value={warehouseForm.start_year} onChange={e => setW("start_year", e.target.value)} className={inputClass}>
                                                                    <option value="">Year</option>
                                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">End</label>
                                                            <div className="flex gap-2">
                                                                <select value={warehouseForm.end_month} onChange={e => setW("end_month", e.target.value)} className={inputClass}>
                                                                    <option value="">Month</option>
                                                                    {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
                                                                </select>
                                                                <select value={warehouseForm.end_year} onChange={e => setW("end_year", e.target.value)} className={inputClass}>
                                                                    <option value="">Year</option>
                                                                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                                                                </select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <div>
                                                    <label className={labelClass}>Measure By</label>
                                                    <div className="flex gap-3">
                                                        {(["area", "pallets"] as const).map(m => (
                                                            <label key={m} className={`flex-1 flex items-center justify-center p-3 rounded-sm border cursor-pointer ${warehouseForm.measure_by === m ? 'border-primary bg-primary/10' : 'border-border'}`}>
                                                                <input type="radio" value={m} checked={warehouseForm.measure_by === m} onChange={e => setW("measure_by", e.target.value)} className="sr-only" />
                                                                <span className="font-semibold text-sm">{m === "area" ? "Area (sq ft)" : "Pallets"}</span>
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className={labelClass}>{warehouseForm.measure_by === 'area' ? 'Area (Sq. Ft.) *' : 'Capacity (Pallets) *'}</label>
                                                    <input
                                                        type="number"
                                                        value={warehouseForm.capacity_value}
                                                        onChange={e => setW("capacity_value", e.target.value)}
                                                        placeholder={warehouseForm.measure_by === 'area' ? 'e.g. 100000' : 'e.g. 1200'}
                                                        className={`${inputClass} ${errors.capacity_value ? "border-red-500" : ""}`}
                                                    />
                                                    {errors.capacity_value && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.capacity_value}</p>}
                                                </div>

                                                <div>
                                                    <label className={labelClass}>Rent (₹ / sqft)</label>
                                                    <input type="number" value={warehouseForm.rate} onChange={e => setW("rate", e.target.value)} placeholder="e.g. 28" className={inputClass} />
                                                </div>
                                            </div>
                                        </section>

                                        <section className={sectionClass}>
                                            <h2 className={sectionTitle}>3. Physical Specifications & Facilities</h2>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6 border-b border-border/50">
                                                <div>
                                                    <label className={labelClass}>Ceiling height (in feet)</label>
                                                    <input 
                                                        type="number" 
                                                        value={warehouseForm.ceiling_height} 
                                                        onChange={e => setW("ceiling_height", e.target.value)} 
                                                        placeholder="e.g. 30" 
                                                        className={inputClass} 
                                                    />
                                                </div>
                                                <div>
                                                    <label className={labelClass}>Number of docks</label>
                                                    <input 
                                                        type="number" 
                                                        value={warehouseForm.docks} 
                                                        onChange={e => setW("docks", e.target.value)} 
                                                        placeholder="e.g. 10" 
                                                        className={inputClass} 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-8">
                                                <CheckboxGroup options={INDUSTRIES} selected={warehouseForm.industries} onChange={v => setW("industries", v)} />
                                                <div className="pt-6 border-t border-border/50">
                                                    <CheckboxGroup options={FACILITIES} selected={warehouseForm.facilities} onChange={v => setW("facilities", v)} />
                                                </div>
                                            </div>
                                        </section>
                                    </>
                                ) : (
                                    <section className={sectionClass}>
                                        <h2 className={sectionTitle}>1. Land Information</h2>
                                        <div>
                                            <label className={labelClass}>Name of Entity / Owner *</label>
                                            <input
                                                value={landForm.org_name}
                                                onChange={e => setL("org_name", e.target.value)}
                                                placeholder="e.g. Malik Developers"
                                                className={`${inputClass} ${errors.org_name ? "border-red-500" : ""}`}
                                            />
                                            {errors.org_name && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.org_name}</p>}
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelClass}>Land Size (Sq. Ft.) *</label>
                                                <input
                                                    type="number"
                                                    value={landForm.land_size}
                                                    onChange={e => setL("land_size", e.target.value)}
                                                    placeholder="e.g. 100000"
                                                    className={`${inputClass} ${errors.land_size ? "border-red-500" : ""}`}
                                                />
                                                {errors.land_size && <p className="mt-1 text-[10px] font-bold uppercase text-red-500">{errors.land_size}</p>}
                                            </div>
                                            <div>
                                                <label className={labelClass}>Land Status *</label>
                                                <select value={landForm.land_status} onChange={e => setL("land_status", e.target.value)} className={inputClass}>
                                                    {landStatusOptions.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                            <div className="flex items-center gap-4 pt-6">
                                                <label className="flex items-center gap-3 cursor-pointer group">
                                                    <div
                                                        onClick={() => setL("construction_assistance", !landForm.construction_assistance)}
                                                        className={`w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 transition-all ${landForm.construction_assistance ? "bg-primary border-primary" : "border-border group-hover:border-primary/50"}`}
                                                    >
                                                        {landForm.construction_assistance && <CheckCircle2 size={12} className="text-white" />}
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-widest text-foreground">Construction Assistance Required?</span>
                                                </label>
                                            </div>
                                        </div>
                                    </section>
                                )}

                                {renderMapSection()}

                                <section className={sectionClass}>
                                    <h2 className={sectionTitle}>{subType === 'warehouse' ? '5.' : '4.'} Description & Photos</h2>
                                    <div>
                                        <label className={labelClass}>Introduction / Notes</label>
                                        <textarea
                                            value={subType === 'warehouse' ? warehouseForm.description : landForm.description}
                                            onChange={e => subType === 'warehouse' ? setW("description", e.target.value) : setL("description", e.target.value)}
                                            rows={4}
                                            placeholder="Tell us more about the property..."
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <div className="space-y-4">
                                            <label className={labelClass}>Property Photo</label>
                                            <label className="cursor-pointer rounded-sm border-2 border-dashed border-border p-8 text-center transition-colors hover:border-primary/50 flex flex-col items-center gap-3 block">
                                                <Camera size={32} className="text-muted-foreground" />
                                                <p className="text-sm font-semibold text-foreground uppercase tracking-tight">
                                                    {uploading ? "Uploading..." : "Click to Upload Photo"}
                                                </p>
                                                <p className="text-xs text-muted-foreground">JPG, PNG or WEBP</p>
                                                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                                            </label>
                                            {uploadError && <p className="text-red-500 text-xs font-bold uppercase">{uploadError}</p>}
                                            {(subType === "warehouse" ? warehouseForm.image_url : landForm.image_url) && (
                                                <img
                                                    src={subType === "warehouse" ? warehouseForm.image_url : landForm.image_url}
                                                    alt="Preview"
                                                    className="w-full aspect-video object-cover rounded-sm border border-border"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </section>

                                {/* Submit Error */}
                                {submitError && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                                        {submitError}
                                    </div>
                                )}

                                {/* Validation Errors Summary */}
                                {Object.keys(errors).length > 0 && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-sm text-amber-500 text-xs font-bold uppercase tracking-wider">
                                        Please fix the errors above before submitting.
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-primary py-5 rounded-sm font-display text-base font-black uppercase tracking-[0.2em] text-primary-foreground hover:shadow-2xl hover:shadow-primary/30 transition-all disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <Loader2 size={18} className="animate-spin" /> Submitting...
                                        </div>
                                    ) : "Submit for Verification"}
                                </button>
                            </form>
                        </motion.div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default SubmitWarehouse;