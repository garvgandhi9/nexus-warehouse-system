import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WarehouseMap from "@/components/WarehouseMap";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Search, LayoutGrid, Map as MapIcon, ArrowRight } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ITEMS_PER_PAGE = 15;

const Listings = () => {
  const [apiListings, setApiListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(0);
  const [citiesList, setCitiesList] = useState<string[]>([]);
  const isVisible = true;

  const [selectedCity, setSelectedCity] = useState("All");
  const [minArea, setMinArea] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [propertyType, setPropertyType] = useState("ANY");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Fetch Cities for Filter
  useEffect(() => {
    const loadCities = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.CITIES);
        if (res.ok) {
          const json = await res.json();
          setCitiesList(["All", ...(json.data || [])]);
        }
      } catch (err) {
        console.error("Failed to load cities:", err);
      }
    };
    loadCities();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadWarehouses = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedCity !== "All") params.append("city", selectedCity);
        if (minArea > 0) params.append("min_area", minArea.toString());
        if (searchQuery) params.append("search", searchQuery);

        if (maxPrice > 0) params.append("max_rate", maxPrice.toString());

        if (propertyType === "Warehouse") params.append("type", "warehouse");
        if (propertyType === "Land Parcel") params.append("type", "land");

        params.append("page", currentPage.toString());
        params.append("limit", ITEMS_PER_PAGE.toString());

        const res = await fetch(`${API_ENDPOINTS.WAREHOUSES}?${params.toString()}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        setTotalPages(json.pages || 0);

        const data = json.data || [];
        const formatted = data.map((w: any) => ({
          id: w.id,
          city: w.city || "Location",
          cluster: w.cluster || "",
          area: w.warehouse_code || "-",
          size: w.capacity_type === "pallets"
            ? Number(w.capacity_value).toLocaleString()
            : (w.capacity_value || w.area_available
              ? Number(w.capacity_value || w.area_available).toLocaleString()
              : "0"),
          unit: w.capacity_type === "pallets" ? "Pallets" : "sq ft",
          rate: w.rate,
          type: w.category || "General Grade A",
          status: w.status || "Available",
          term_type: w.term_type || "long_term",
          term_duration: w.term_duration,
          image: w.image_url || "/stockphoto.jpg",
          temperature_range: w.temperature_range,
          product_suitability: w.product_suitability,
          is_prime: w.is_prime,
          latitude: w.latitude ? Number(w.latitude) : undefined,
          longitude: w.longitude ? Number(w.longitude) : undefined,
        }));

        const fallbackListings = [
          { id: "1", city: "MUMBAI", cluster: "WP-1004 - GENERAL GRADE B", size: "250,000", rate: "28", unit: "sq ft", type: "General Grade B", status: "Available", image: "/stockphoto.jpg" },
          { id: "2", city: "NASHIK", cluster: "WP-1005 - GENERAL GRADE B", size: "3,000", rate: "25", unit: "sq ft", type: "General Grade B", status: "Available", image: "/stockphoto.jpg" },
          { id: "3", city: "MUMBAI", cluster: "WP-1001 - GENERAL GRADE A", size: "15,000", rate: "32", unit: "sq ft", type: "General Grade A", status: "Available", image: "/stockphoto.jpg" },
          { id: "4", city: "PUNE", cluster: "WP-1011 - COLD STORAGE", size: "85,000", rate: "45", unit: "sq ft", type: "Cold Storage", status: "Available", image: "/stockphoto.jpg" },
          { id: "5", city: "DELHI", cluster: "WP-2041 - E-COMMERCE HUB", size: "120,000", rate: "30", unit: "sq ft", type: "General Grade A", status: "Available", is_prime: true, image: "/stockphoto.jpg" }
        ];

        setApiListings(formatted.length > 0 ? formatted : fallbackListings);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch warehouses:", err);
        // Fallback to dummy data
        const fallbackListings = [
          { id: "1", city: "MUMBAI", cluster: "WP-1004 - GENERAL GRADE B", size: "250,000", rate: "28", unit: "sq ft", type: "General Grade B", status: "Available", image: "/stockphoto.jpg" },
          { id: "2", city: "NASHIK", cluster: "WP-1005 - GENERAL GRADE B", size: "3,000", rate: "25", unit: "sq ft", type: "General Grade B", status: "Available", image: "/stockphoto.jpg" },
          { id: "3", city: "MUMBAI", cluster: "WP-1001 - GENERAL GRADE A", size: "15,000", rate: "32", unit: "sq ft", type: "General Grade A", status: "Available", image: "/stockphoto.jpg" },
          { id: "4", city: "PUNE", cluster: "WP-1011 - COLD STORAGE", size: "85,000", rate: "45", unit: "sq ft", type: "Cold Storage", status: "Available", image: "/stockphoto.jpg" },
          { id: "5", city: "DELHI", cluster: "WP-2041 - E-COMMERCE HUB", size: "120,000", rate: "30", unit: "sq ft", type: "General Grade A", status: "Available", is_prime: true, image: "/stockphoto.jpg" }
        ];
        setApiListings(fallbackListings);
      } finally {
        setLoading(false);
      }
    };
    loadWarehouses();
    return () => controller.abort();
  }, [selectedCity, minArea, maxPrice, searchQuery, currentPage, propertyType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, minArea, maxPrice, searchQuery, propertyType]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#0a0c10] text-white">
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className="flex items-end justify-between gap-4 flex-wrap mb-12 border-b border-border/10 pb-12">
            <div className="z-10">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">Portfolio</p>
              <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-white sm:text-6xl lg:text-7xl">
                Asset <span className="text-gradient">Listings</span>
              </h1>
              <p className="mt-6 max-w-full text-lg text-justify text-muted-foreground/80 leading-relaxed">
                Explore our curated network of Grade A logistics facilities and strategic industrial infrastructure across India, designed to give enterprises dependable access to modern, compliant spaces. Each asset is strategically located to enhance connectivity, reduce transit times, and support the evolving demands of supply chains.
              </p>
            </div>


          </div>

          {/* Filter Bar */}
          <div className="mt-10 rounded-sm border border-border/30 bg-card/50 backdrop-blur-md p-8 shadow-sm">
            <div className="grid gap-8 md:grid-cols-3">
              <div>
                <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Location</label>
                <div className="relative">
                  <input
                    placeholder="Ref, Code, or Info..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full rounded-sm border border-border/50 bg-background/50 p-3.5 text-sm text-foreground focus:border-primary/50 focus:outline-none transition-all pl-10"
                  />
                  <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                </div>
              </div>

              <div>
                <div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <label>Capacity</label>
                  <span className="text-white">{minArea > 0 ? `${minArea.toLocaleString()} sqft` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0" max="200000" step="10000"
                  value={minArea}
                  onChange={e => setMinArea(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 rounded-full bg-border/30"
                />
              </div>

              <div>
                <div className="mb-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  <label>Max Price</label>
                  <span className="text-white">{maxPrice > 0 ? `₹${maxPrice}/sqft` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0" max="100" step="5"
                  value={maxPrice}
                  onChange={e => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-primary h-1.5 rounded-full bg-border/30"
                />
              </div>

              <div className="md:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div>
                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Property Type</label>
                    <div className="flex w-full rounded-sm border border-border/50 bg-background/50 p-1">
                      {[
                        { id: "ANY", label: "Any" },
                        { id: "Warehouse", label: "Warehouse" },
                        { id: "Land Parcel", label: "Land Parcel" }
                      ].map(opt => (
                        <button
                          key={opt.id}
                          onClick={() => setPropertyType(opt.id)}
                          className={`flex-1 rounded-sm py-2.5 text-[9px] font-bold uppercase tracking-widest transition-all ${propertyType === opt.id
                            ? 'bg-primary text-white shadow-md'
                            : 'text-muted-foreground hover:text-white hover:bg-white/5'
                            }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-primary">View Mode</label>
                    <div className="flex w-full items-center rounded-sm border border-border/50 bg-background/50 p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`flex-1 flex justify-center items-center gap-2 rounded-sm py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${viewMode === "grid"
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <LayoutGrid size={14} />
                        Grid
                      </button>
                      <button
                        onClick={() => setViewMode("map")}
                        className={`flex-1 flex justify-center items-center gap-2 rounded-sm py-2.5 text-[9px] font-bold uppercase tracking-[0.2em] transition-all ${viewMode === "map"
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "text-muted-foreground hover:text-white hover:bg-white/5"
                          }`}
                      >
                        <MapIcon size={14} />
                        Map
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mt-24 py-32 text-center text-muted-foreground">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mb-6"></div>
              <p className="animate-pulse uppercase tracking-[0.6em] text-[10px] font-black text-primary">Synchronizing Network Data...</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="mt-12 p-8 text-center bg-destructive/10 border border-destructive/20 rounded-sm text-destructive text-[10px] font-black uppercase tracking-[0.3em]">
              {error}
            </div>
          )}

          {/* Map View */}
          {!loading && !error && viewMode === "map" && (
            <div className="mt-12 rounded-sm overflow-hidden border border-border/50 shadow-2xl h-[700px]">
              <WarehouseMap listings={apiListings} />
            </div>
          )}

          {/* Grid View */}
          {!loading && !error && viewMode === "grid" && (
            <>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {apiListings.map((l, i) => (
                  <Link
                    to={`/listings/${l.id}`}
                    key={l.id}
                    className={`group relative overflow-hidden rounded-sm border border-border/50 bg-card/30 backdrop-blur-sm transition-all duration-500 hover:border-primary/40 hover:glow-blue-sm hover:-translate-y-1 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                      }`}
                    style={{ transitionDelay: `${(i % ITEMS_PER_PAGE) * 100}ms` }}
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                      <img
                        src={l.image}
                        alt={l.city}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                      />
                      <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        <span className={`inline-flex items-center rounded-sm px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.2em] shadow-2xl backdrop-blur-xl border ${l.status === "Available"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          }`}>
                          {l.status}
                        </span>
                      </div>
                      {l.is_prime && (
                        <div className="absolute top-4 right-4 z-10">
                          <span className="rounded-sm bg-primary px-2 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg">PRIME</span>
                        </div>
                      )}
                    </div>

                    <div className="p-7">
                      <div className="flex items-center justify-between">
                        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-white group-hover:text-primary transition-colors">
                          {l.cluster ? `${l.cluster}, ${l.city}` : l.city}
                        </h3>
                        {l.rate && l.status !== "Land Parcel" && (
                          <div className="text-right">
                            <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Rate</span>
                            <span className="text-sm font-bold text-emerald-400 tracking-tight">₹{l.rate}/sqft</span>
                          </div>
                        )}
                      </div>

                      <div className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/80 flex items-center gap-2">
                        <span>{l.type}</span>
                      </div>

                      <div className="mt-8 flex items-end justify-between border-t border-border/20 pt-6">
                        <div>
                          <span className="block text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 mb-1">Capacity</span>
                          <p className="font-display text-3xl font-bold text-white tracking-tighter">
                            {l.size} <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">{l.unit}</span>
                          </p>
                        </div>
                        <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all duration-500">
                          <ArrowRight size={18} className="text-muted-foreground group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-20 flex items-center justify-center gap-6">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="group h-12 w-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground transition-all hover:border-primary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={20} className="rotate-180" />
                  </button>
                  <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
                    <span className="text-white">{currentPage}</span> <span className="mx-2 opacity-30">/</span> {totalPages}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="group h-12 w-12 rounded-full border border-border/50 flex items-center justify-center text-muted-foreground transition-all hover:border-primary hover:text-primary disabled:opacity-20 disabled:cursor-not-allowed"
                  >
                    <ArrowRight size={20} />
                  </button>
                </div>
              )}

              {/* Empty State */}
              {apiListings.length === 0 && (
                <div className="mt-16 py-20 text-center border border-dashed border-border/50 rounded-sm bg-card/20 backdrop-blur-sm">
                  <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-muted-foreground/60">No infrastructure assets matching criteria found</p>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Listings;