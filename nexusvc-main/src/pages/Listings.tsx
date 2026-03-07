import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Search } from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";

const ITEMS_PER_PAGE = 15;

const Listings = () => {
  const [apiListings, setApiListings] = useState<any[]>([]);
  const { ref, isVisible } = useScrollAnimation(0.05);

  // Filter States
  const [selectedCity, setSelectedCity] = useState("All");
  const [minArea, setMinArea] = useState(0);
  const [priceCategory, setPriceCategory] = useState("All"); // "All", "Under20", "20to40", "Over40"

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetch(API_ENDPOINTS.WAREHOUSES)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.map((w: any) => ({
          id: w.id,
          city: w.city || "Location",
          area: w.warehouse_code || "-",
          size: w.capacity_type === "pallets" ? Number(w.capacity_value).toLocaleString() : (w.capacity_value || w.area_available ? Number(w.capacity_value || w.area_available).toLocaleString() : "0"),
          unit: w.capacity_type === "pallets" ? "Pallets" : "sq ft",
          rate: w.rate,
          type: w.category || "General Grade A",
          status: w.status || "Available",
          term_type: w.term_type || "long_term",
          term_duration: w.term_duration,
          image: w.image_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
          temperature_range: w.temperature_range,
          product_suitability: w.product_suitability,
          is_prime: w.is_prime
        }));
        setApiListings(formatted);
      })
      .catch((err) => console.error("Failed to fetch warehouses:", err));
  }, []);

  // Compute filtering
  const citiesList = ["All", ...Array.from(new Set(apiListings.map(w => w.city)))];

  const filteredListings = apiListings.filter(w => {
    // City
    if (selectedCity !== "All" && w.city !== selectedCity) return false;

    // Area
    const numericSize = parseInt(w.size.replace(/,/g, ''));
    if (numericSize < minArea) return false;

    // Price
    if (priceCategory !== "All" && w.rate) {
      if (priceCategory === "Under20" && w.rate >= 20) return false;
      if (priceCategory === "20to40" && (w.rate < 20 || w.rate > 40)) return false;
      if (priceCategory === "Over40" && w.rate <= 40) return false;
    }

    return true;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const paginatedListings = filteredListings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCity, minArea, priceCategory]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">Portfolio</p>
          <h1 className="mt-3 font-display text-4xl font-bold uppercase tracking-tight text-foreground sm:text-6xl">
            Warehouse Listings
          </h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Explore our curated network of Grade A logistics facilities across India.
          </p>

          {/* --- Premium Filter Bar --- */}
          <div className="mt-10 rounded-sm border border-border/50 bg-card p-6 shadow-sm">
            <div className="grid gap-6 md:grid-cols-3">
              {/* City */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</label>
                <div className="relative">
                  <input
                    list="city-options-list"
                    placeholder="Search city..."
                    value={selectedCity === "All" ? "" : selectedCity}
                    onChange={e => setSelectedCity(e.target.value || "All")}
                    className="w-full rounded-sm border border-border bg-background p-3 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                  <datalist id="city-options-list">
                    <option value="All" />
                    {citiesList.filter(c => c !== "All").map(c => <option key={c} value={c} />)}
                  </datalist>
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                </div>
              </div>

              {/* Minimum Area */}
              <div>
                <div className="mb-2 flex justify-between text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <label>Min Area</label>
                  <span className="text-primary">{minArea > 0 ? `${minArea.toLocaleString()} sqft` : 'Any'}</span>
                </div>
                <input
                  type="range"
                  min="0" max="500000" step="10000"
                  value={minArea}
                  onChange={e => setMinArea(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>0</span>
                  <span>500k+ sqft</span>
                </div>
              </div>

              {/* Budget */}
              <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Budget Profile</label>
                <div className="flex w-full rounded-sm border border-border bg-background p-1">
                  {[
                    { id: "All", label: "Any" },
                    { id: "Under20", label: "< ₹20" },
                    { id: "20to40", label: "₹20-40" },
                    { id: "Over40", label: "> ₹40" }
                  ].map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => setPriceCategory(opt.id)}
                      className={`flex-1 rounded-sm py-2 text-xs font-medium transition-colors ${priceCategory === opt.id
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                        }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* --- End Filter Bar --- */}

          {/* Grid */}
          <div ref={ref} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedListings.map((l, i) => (
              <Link
                to={`/listings/${l.id}`}
                key={l.id}
                className={`group overflow-hidden rounded-sm border border-border/50 bg-card transition-all duration-700 hover:border-primary/30 hover:glow-blue-sm ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                  }`}
                style={{ transitionDelay: `${(i % ITEMS_PER_PAGE) * 80}ms` }}
              >
                {/* Image & Top Badges */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                  <img src={l.image} alt={l.area} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />

                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={`inline-flex items-center rounded-sm bg-background/90 px-2 py-1 text-[10px] font-bold uppercase tracking-wider shadow-sm backdrop-blur-md ${l.status === "Available" ? "text-emerald-600" : "text-amber-600"}`}>
                      {l.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">{l.city}</h3>
                    <div className="flex items-center gap-2">
                      {l.rate && (
                        <span className="text-xs font-bold text-emerald-400">₹{l.rate}/sqft</span>
                      )}
                    </div>
                  </div>
                  <div className="mt-1">
                    <p className="text-sm text-muted-foreground">{l.area} · {l.type}</p>
                  </div>

                  {/* Cold Storage Tags */}
                  {(l.temperature_range || (l.product_suitability && l.product_suitability.length > 0)) && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {l.temperature_range && (
                        <span className="rounded-sm bg-blue-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-500 border border-blue-500/20">
                          {l.temperature_range}
                        </span>
                      )}
                      {l.product_suitability?.slice(0, 1).map((s: string) => (
                        <span key={s} className="rounded-sm bg-indigo-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500 border border-indigo-500/20">
                          {s}
                        </span>
                      ))}
                      {l.product_suitability?.length > 1 && (
                        <span className="rounded-sm bg-border/50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          +{l.product_suitability.length - 1} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-end justify-between">
                    <p className="font-display text-2xl font-bold text-foreground">
                      {l.size} <span className="text-sm font-normal text-muted-foreground">{l.unit}</span>
                    </p>
                    {l.is_prime && (
                      <span className="inline-flex items-center rounded-sm border border-purple-500/50 bg-purple-500/15 px-3 py-1 text-[11px] font-black uppercase tracking-widest text-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]">
                        Nexus Prime
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="rounded-sm border border-border bg-card px-6 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Page <span className="text-foreground">{currentPage}</span> of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="rounded-sm border border-border bg-card px-6 py-2 text-xs font-semibold uppercase tracking-widest text-foreground transition-all hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}

          {filteredListings.length === 0 && (
            <div className="mt-12 py-12 text-center text-muted-foreground border border-border/50 rounded-sm bg-card/50">
              No infrastructure assets match your criteria.
            </div>
          )}
        </section>
      </main >
      <Footer />
    </>
  );
};

export default Listings;
