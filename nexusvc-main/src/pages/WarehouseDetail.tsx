import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { API_BASE_URL } from "@/lib/api-config";
import Footer from "@/components/Footer";
import { ArrowLeft, ArrowRight, MapPin, Ruler, DoorOpen, Zap, ShieldCheck, Flame, Star, ExternalLink } from "lucide-react";
import L from 'leaflet';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const WarehouseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [isPrimeActive, setIsPrimeActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/public/warehouses/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setListing({
            id: data.id,
            city: data.city || "Location",
            warehouse_code: data.warehouse_code || `#${data.id}`,
            area: data.warehouse_code || "-",
            size: data.capacity_type === "pallets" ? Number(data.capacity_value).toLocaleString() : (data.capacity_value || data.area_available ? Number(data.capacity_value || data.area_available).toLocaleString() : "0"),
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
            latitude: data.latitude,
            longitude: data.longitude,
            full_address: data.full_address,
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setIsLoading(false));
  }, [id]);

  // Handle Map Initialization
  useEffect(() => {
    if (isLoading || !listing || !listing.latitude || !listing.longitude || !mapContainerRef.current || mapRef.current) return;

    const lat = parseFloat(listing.latitude);
    const lng = parseFloat(listing.longitude);

    if (isNaN(lat) || isNaN(lng)) return;

    const map = L.map(mapContainerRef.current, {
      dragging: false,
      scrollWheelZoom: false,
      zoomControl: false,
      doubleClickZoom: false
    }).setView([lat, lng], 14);

    mapRef.current = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    L.marker([lat, lng]).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isLoading, listing]);

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 bg-[#0A0A0B] flex items-center justify-center">
          <div className="text-white">Loading warehouse...</div>
        </main>
        <Footer />
      </>
    );
  }

  if (!listing) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 bg-[#0A0A0B] flex items-center justify-center">
          <div className="text-white">Warehouse not found.</div>
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

          {/* Hero image */}
          <div className="mt-8 aspect-[21/9] overflow-hidden rounded-sm">
            <img src={listing.image} alt={`${listing.city} warehouse`} className="h-full w-full object-cover" />
          </div>

          <div className="mt-10 grid gap-12 lg:grid-cols-3">
            {/* Main info */}
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
                <span className={`rounded-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider ${listing.status === "Available" ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                  }`}>
                  {listing.status}
                </span>
                <span className="rounded-sm border border-border px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {listing.type}
                </span>
                <span className={`rounded-sm px-3 py-1 text-xs font-semibold uppercase tracking-wider ${listing.term_type === "short_term" ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                  }`}>
                  {listing.term_type === "short_term" ? `Short Term: ${listing.term_duration || 'Flexible'}` : "Long Term Listing"}
                </span>
              </div>

              {/* Cold storage tags */}
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

              <h1 className="mt-4 font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl text-foreground">
                {listing.city}
              </h1>
              <p className="mt-1 flex items-center gap-2 text-lg text-muted-foreground">
                <MapPin size={16} className="text-primary" /> {listing.area}
              </p>
              <p className="mt-2 font-display text-3xl font-bold text-foreground">
                {listing.size} <span className="text-base font-normal text-muted-foreground">{listing.unit}</span>
              </p>

              {listing.description && (
                <p className="mt-8 text-base leading-relaxed text-muted-foreground">{listing.description}</p>
              )}

              {/* Specs */}
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

              {/* Amenities */}
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

              {/* Location Section */}
              {(listing.latitude && listing.longitude) && (
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

                  <div className="mt-6 aspect-video w-full rounded-sm border border-border/50 overflow-hidden z-0">
                    <div ref={mapContainerRef} className="h-full w-full" />
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

            {/* CTA sidebar */}
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

                {/* Upgrade to Prime CTA */}
                <div className="mt-8 pt-8 border-t border-border/50 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">WANT COMPLETE 3PL?</p>
                  <button
                    onClick={() => { setIsPrimeActive(true); localStorage.setItem("nexus_prime", "1"); }}
                    className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-sm border border-purple-500/50 bg-[#1A0B2E] p-1 shadow-[0_0_20px_rgba(168,85,247,0.15)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/20 to-purple-600/0 translate-x-[-100%] transition-transform duration-1000 group-hover:translate-x-[100%]" />
                    <div className="relative flex w-full items-center justify-center gap-2 rounded-sm bg-[#0A0514]/80 px-4 py-3 backdrop-blur-md">
                      <Star size={16} className="fill-purple-500/50 transition-colors group-hover:fill-purple-400 group-hover:drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]" />
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
      </main>

      {/* Full-Screen Prime Takeover Modal */}
      {isPrimeActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-sm border border-purple-500/30 bg-[#0A0514] shadow-[0_0_50px_rgba(168,85,247,0.15)]">

            {/* Modal Header & Effects */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-sm">
              <div className="absolute -top-[50%] left-[-10%] h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[100px]" />
              <div className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full bg-indigo-600/10 blur-[100px]" />
            </div>

            <div className="relative z-10 p-8 md:p-12">
              <div className="mb-10 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-purple-500/30 bg-purple-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                  <Star size={14} className="fill-purple-400" /> PRIME ACTIVE
                </span>
                <h2 className="mt-6 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl bg-gradient-to-r from-white via-purple-100 to-purple-300 bg-clip-text text-transparent">
                  Unlock Complete 3PL Management
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-sm text-purple-200/60 leading-relaxed">
                  Upgrade your listing to Nexus Prime and let our integrated network handle Operations, Visibility, and Lead Management from end to end.
                </p>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto rounded-sm border border-purple-500/20 bg-black/40">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-[#1A0B2E] text-xs uppercase tracking-wider text-purple-300/70 border-b border-purple-500/20">
                    <tr>
                      <th className="py-4 px-6 font-semibold w-1/3">Feature</th>
                      <th className="py-4 px-6 font-semibold text-center w-1/3 text-muted-foreground">Standard Marketplace</th>
                      <th className="py-4 px-6 font-semibold text-center w-1/3 text-purple-300 drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">Nexus Prime (Managed)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-500/10">
                    <tr className="hover:bg-purple-500/5 transition-colors group">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">Visibility</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">Standard Listing</td>
                      <td className="py-4 px-6 text-center font-bold text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all">Boosted 10x</td>
                    </tr>
                    <tr className="hover:bg-purple-500/5 transition-colors group">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">Lead Management</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">Direct to Partner</td>
                      <td className="py-4 px-6 text-center font-bold text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all">Nexus Sales Team</td>
                    </tr>
                    <tr className="hover:bg-purple-500/5 transition-colors group">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">Operations</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">Self-Managed</td>
                      <td className="py-4 px-6 text-center font-bold text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all">Full Pick-and-Pack</td>
                    </tr>
                    <tr className="hover:bg-purple-500/5 transition-colors group bg-purple-500/5">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">Last-Mile</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">Your Choice</td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">Integrated Nexus Fleet</td>
                    </tr>
                    <tr className="hover:bg-purple-500/5 transition-colors group">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">Support</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">Community / FAQ</td>
                      <td className="py-4 px-6 text-center font-bold text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all">24/7 Account Manager</td>
                    </tr>
                    <tr className="hover:bg-purple-500/5 transition-colors group bg-purple-500/5">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">Legal/Compliance</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">-</td>
                      <td className="py-4 px-6 text-center font-bold text-emerald-400 drop-shadow-[0_0_5px_rgba(52,211,153,0.4)]">Full Legal & Insurance</td>
                    </tr>
                    <tr className="hover:bg-purple-500/5 transition-colors group">
                      <td className="py-4 px-6 text-purple-50/80 font-medium">API Sync</td>
                      <td className="py-4 px-6 text-center text-muted-foreground/70">Manual</td>
                      <td className="py-4 px-6 text-center font-bold text-purple-400 group-hover:drop-shadow-[0_0_8px_rgba(168,85,247,0.6)] transition-all">Automated Shopify/Amazon</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col items-center gap-4">
                <button
                  onClick={() => {
                    setIsPrimeActive(false);
                    navigate("/contact");
                  }}
                  className="relative overflow-hidden w-full sm:w-auto rounded-sm bg-gradient-to-r from-purple-600 to-indigo-600 px-12 py-5 font-display text-sm font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700 slant" />
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
    </>
  );
};

export default WarehouseDetail;
