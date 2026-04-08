import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { API_ENDPOINTS } from "@/lib/api-config";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, MapPin, Ruler, DoorOpen, Zap, ShieldCheck, Flame, Star, ExternalLink } from "lucide-react";
import WarehouseMap from "@/components/WarehouseMap";

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isPrimeActive, setIsPrimeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const loadWarehouse = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.WAREHOUSE_BY_ID(id!), { signal: controller.signal });
        if (res.status === 404) {
          setError("Warehouse not found.");
          return;
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json.data || json;

        if (!data || data.error) {
          setError("Warehouse not found.");
          return;
        }

        const formatted = {
          id: data.id,
          city: data.city || "Location",
          cluster: data.cluster || "",
          warehouse_code: data.warehouse_code || `#${data.id}`,
          area: data.warehouse_code || "-",
          size: data.capacity_type === "pallets"
            ? Number(data.capacity_value).toLocaleString()
            : (data.capacity_value || data.area_available
              ? Number(data.capacity_value || data.area_available).toLocaleString()
              : "0"),
          unit: data.capacity_type === "pallets" ? "Pallets" : "sq ft",
          rate: data.rate,
          type: data.category || "General Grade A",
          status: data.status || "Available",
          term_type: data.term_type || "long_term",
          term_duration: data.term_duration,
          description: data.description || null,
          image: data.image_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
          temperatureRange: data.temperature_range,
          productSuitability: data.product_suitability,
          is_prime: data.is_prime,
          ceiling_height: data.ceiling_height,
          docks: data.docks,
          power_backup: data.power_backup,
          compliance: data.compliance,
          fire_system: data.fire_system,
          floor_strength: data.floor_strength,
          amenities: Array.isArray(data.amenities) ? data.amenities : [],
          latitude: data.latitude ? parseFloat(data.latitude) : undefined,
          longitude: data.longitude ? parseFloat(data.longitude) : undefined,
          full_address: data.full_address,
        };

        // If no coordinates, try geocoding
        if ((!formatted.latitude || !formatted.longitude) && (data.full_address || data.city)) {
          const q = data.full_address || `${data.city} ${data.warehouse_code || ''}`;
          try {
            const geoRes = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}&countrycodes=in`,
              { signal: controller.signal }
            );
            const geo = await geoRes.json();
            if (Array.isArray(geo) && geo.length > 0) {
              formatted.latitude = parseFloat(geo[0].lat);
              formatted.longitude = parseFloat(geo[0].lon);
              formatted.full_address = formatted.full_address || geo[0].display_name;
            }
          } catch (geoErr: any) {
            if (geoErr.name !== "AbortError") {
              console.warn("Geocode failed:", geoErr);
            }
          }
        }

        setListing(formatted);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch warehouse:", err);
        setError("Failed to load warehouse. Please check your connection and try again.");
      } finally {
        setIsLoading(false);
      }
    };
    loadWarehouse();
    return () => controller.abort();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 bg-[#0A0A0B] flex items-center justify-center">
          <div className="text-white animate-pulse uppercase tracking-[0.5em] text-xs font-bold">Loading Facility...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !listing) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 bg-[#0A0A0B] flex flex-col items-center justify-center gap-4">
          <div className="text-red-400 text-sm font-bold uppercase tracking-wider">{error || "Warehouse not found."}</div>
          <Link to="/listings" className="text-primary text-xs font-bold uppercase tracking-widest hover:underline">
            ← Back to Listings
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 bg-[#0A0A0B]">
        <section className="relative z-10 mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <Link to="/listings" className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary">
            <ArrowLeft size={14} /> Back to Listings
          </Link>

          <div 
            className="mt-8 aspect-[21/9] overflow-hidden rounded-sm cursor-zoom-in transition-transform hover:scale-[1.01] active:scale-[0.99]"
            onClick={() => setIsImageModalOpen(true)}
          >
            <img src={listing.image} alt={`${listing.city} warehouse`} className="h-full w-full object-cover" />
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="flex flex-wrap items-center gap-3">
                {listing.is_prime && (
                  <div className="relative group/prime">
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full group-hover/prime:bg-primary/40 transition-all duration-500"></div>
                    <span className="relative flex items-center gap-1.5 rounded-sm bg-primary text-primary-foreground px-3 py-1.5 text-xs font-black uppercase tracking-widest shadow-lg border border-primary/50">
                      <span className="text-sm">⭐</span> NEXUS PRIME
                    </span>
                  </div>
                )}
                <span className={`rounded-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider ${listing.status === "Available" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"}`}>
                  {listing.status}
                </span>
                <span className="rounded-sm border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {listing.type}
                </span>
                <span className={`rounded-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider ${listing.term_type === "short_term" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                  {listing.term_type === "short_term" ? `Short Term: ${listing.term_duration || 'Flexible'}` : "Long Term Listing"}
                </span>
              </div>

              {(listing.temperatureRange || (listing.productSuitability && listing.productSuitability.length > 0)) && (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {listing.temperatureRange && (
                    <span className="rounded-sm bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                      {listing.temperatureRange}
                    </span>
                  )}
                  {listing.productSuitability?.map((s: string) => (
                    <span key={s} className="rounded-sm bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-500">
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight sm:text-5xl text-foreground">
                {listing.cluster ? `${listing.cluster}, ${listing.city}` : listing.city}
              </h1>

              <p className="mt-2 font-display text-3xl font-bold text-foreground">
                {listing.size} <span className="text-base font-normal text-muted-foreground">{listing.unit}</span>
              </p>

              {listing.description && (
                <p className="mt-8 text-base leading-relaxed text-muted-foreground whitespace-pre-wrap">{listing.description}</p>
              )}

              {(() => {
                const specs = [
                  { icon: Ruler, label: "Ceiling Height", value: listing.ceiling_height ? `${listing.ceiling_height}m clear` : null },
                  { icon: DoorOpen, label: "Loading Docks", value: listing.docks != null ? `${listing.docks} Docks` : null },
                  { icon: Zap, label: "Power Backup", value: listing.power_backup || null },
                  { icon: ShieldCheck, label: "Compliance", value: listing.compliance || null },
                  { icon: Flame, label: "Fire System", value: listing.fire_system || null },
                  { icon: Ruler, label: "Floor Strength", value: listing.floor_strength || null },
                ].filter(s => s.value !== null);
                return specs.length > 0 ? (
                  <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
                    {specs.map((s) => (
                      <div key={s.label} className="rounded-sm border border-border/50 bg-card p-5">
                        <s.icon size={20} className="text-primary" strokeWidth={1.5} />
                        <p className="mt-3 text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
                        <p className="mt-1 font-display text-sm font-bold text-foreground">{s.value}</p>
                      </div>
                    ))}
                  </div>
                ) : null;
              })()}

              {listing.amenities && listing.amenities.length > 0 && (
                <>
                  <h3 className="mt-12 font-display text-lg font-bold uppercase tracking-tight text-foreground">Amenities</h3>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {listing.amenities.map((a: string) => (
                      <span key={a} className="rounded-sm border border-border px-4 py-2 text-xs font-medium text-muted-foreground">
                        {a}
                      </span>
                    ))}
                  </div>
                </>
              )}

              {listing.latitude && listing.longitude && (
                <div className="mt-16">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">Location</h3>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${listing.latitude},${listing.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                    >
                      Get Directions <ExternalLink size={12} />
                    </a>
                  </div>
                  <div className="mt-6 aspect-video w-full rounded-sm border border-border/50 overflow-hidden relative">
                    <WarehouseMap
                      listings={[listing]}
                      centerOn={[listing.latitude, listing.longitude]}
                      zoom={14}
                    />
                  </div>
                  {listing.full_address && (
                    <div className="mt-4 flex items-start gap-3 bg-card p-4 rounded-sm border border-border/50">
                      <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground leading-relaxed">{listing.full_address}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* CTA Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-sm border border-border/50 bg-card p-8">
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">
                  Interested in this facility?
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Get in touch to schedule a visit or request detailed specifications.
                </p>
                <Link
                  to="/contact"
                  state={{
                    source: "Listing",
                    context: `${listing.city} · ${listing.warehouse_code}`,
                    category: listing.category
                  }}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
                >
                  Enquire Now <ArrowRight size={16} />
                </Link>

                <div className="mt-8 pt-8 border-t border-border/50 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">WANT COMPLETE 3PL?</p>
                  <button
                    onClick={() => { setIsPrimeActive(true); localStorage.setItem("nexus_prime", "1"); }}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-sm border border-purple-500/50 bg-[#1A0B2E] p-1 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]" />
                    <div className="relative flex w-full items-center justify-center gap-2 rounded-sm bg-[#0A0514]/80 px-4 py-3 backdrop-blur-md">
                      <Star size={16} className="fill-purple-500/50 transition-colors group-hover:fill-purple-400" />
                      <span className="font-display text-xs font-bold uppercase tracking-wider text-purple-300 transition-colors group-hover:text-white">
                        Join Nexus Prime
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Footer />

        {/* Image Modal */}
        {isImageModalOpen && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm animate-in fade-in duration-300 cursor-zoom-out"
            onClick={() => setIsImageModalOpen(false)}
          >
            <div className="relative h-full w-full flex items-center justify-center">
              <img 
                src={listing.image} 
                alt="Enlarged view" 
                className="max-h-full max-w-full object-contain shadow-2xl animate-in zoom-in-95 duration-300" 
              />
              <button 
                className="absolute top-0 right-0 p-4 text-white/50 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); setIsImageModalOpen(false); }}
              >
                <div className="h-10 w-10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/10">✕</div>
              </button>
            </div>
          </div>
        )}

        {/* Prime Modal */}
        {isPrimeActive && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl animate-in fade-in duration-500">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm border border-purple-500/30 bg-[#0A0514] shadow-[0_0_50px_rgba(168,85,247,0.15)]">
              <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
                <div className="absolute -top-[50%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
                <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
              </div>
              <div className="relative z-10 p-8 md:p-12">
                <div className="mb-10 text-center">
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-400">
                    <Star size={14} className="fill-purple-400" /> PRIME ACTIVE
                  </span>
                  <h2 className="mt-6 font-display text-xl font-bold uppercase tracking-tight sm:text-4xl bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                    Unlock Complete 3PL Management
                  </h2>
                  <p className="mx-auto mt-4 max-w-2xl text-sm text-purple-200/60 leading-relaxed">
                    Upgrade your listing to Nexus Prime and let our integrated network handle Operations, Visibility, and Lead Management from end to end.
                  </p>
                </div>

                <div className="overflow-x-auto rounded-sm border border-purple-500/20 bg-black/40">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-[#1A0B2E] text-xs uppercase tracking-wider text-purple-300/70 border-b border-purple-500/20">
                      <tr>
                        <th className="py-4 px-6 font-semibold w-1/3">Feature</th>
                        <th className="py-4 px-6 font-semibold text-center w-1/3 text-muted-foreground">Standard Marketplace</th>
                        <th className="py-4 px-6 font-semibold text-center w-1/3 text-purple-300">Nexus Prime (Managed)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-500/10">
                      {[
                        { feature: "Visibility", standard: "Standard Listing", prime: "Boosted 10x", highlight: true },
                        { feature: "Lead Management", standard: "Direct to Partner", prime: "Nexus Sales Team", highlight: true },
                        { feature: "Operations", standard: "Self-Managed", prime: "Full Pick-and-Pack", highlight: true },
                        { feature: "Last-Mile", standard: "Your Choice", prime: "Integrated Nexus Fleet", highlight: false, green: true },
                        { feature: "Support", standard: "Community / FAQ", prime: "24/7 Account Manager", highlight: true },
                        { feature: "Legal/Compliance", standard: "-", prime: "Full Legal & Insurance", highlight: false, green: true },
                        { feature: "API Sync", standard: "Manual", prime: "Automated Shopify/Amazon", highlight: true },
                      ].map((row) => (
                        <tr key={row.feature} className="hover:bg-purple-500/5 transition-colors group">
                          <td className="py-4 px-6 text-purple-50/80 font-medium">{row.feature}</td>
                          <td className="py-4 px-6 text-center text-muted-foreground/70">{row.standard}</td>
                          <td className={`py-4 px-6 text-center font-bold ${row.green ? "text-emerald-400" : "text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]"} transition-all`}>
                            {row.prime}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-10 flex flex-col items-center gap-4">
                  <button
                    onClick={() => { setIsPrimeActive(false); navigate("/contact"); }}
                    className="relative overflow-hidden w-full sm:w-auto rounded-sm bg-gradient-to-r from-purple-600 to-indigo-600 px-12 py-5 font-display text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02]"
                  >
                    Contact Us to Go Prime
                  </button>
                  <button
                    onClick={() => { setIsPrimeActive(false); localStorage.removeItem("nexus_prime"); }}
                    className="mt-2 text-xs uppercase tracking-wider text-muted-foreground hover:text-white transition-colors border-b border-transparent hover:border-white/30 pb-0.5"
                  >
                    Back to Standard View
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
};

export default WarehouseDetail;