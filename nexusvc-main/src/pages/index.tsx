import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ROICalculator";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { API_ENDPOINTS } from "@/lib/api-config";
import { listings, industries, metrics } from "@/data/mockData";
import { ArrowRight, Warehouse, Building2, Network, Search } from "lucide-react";

/* ── Hero ── */
const Hero = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24">
      {/* Animated background */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-grid opacity-20" />
      <div className="absolute -right-20 top-0 h-full w-1/2 bg-gradient-to-bl from-primary/8 via-transparent to-transparent" />
      <div className="absolute bottom-0 left-0 h-px w-2/3 bg-gradient-to-r from-primary/40 to-transparent" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6 py-32 lg:px-8">
        <div className="max-w-4xl">
          <p
            className={`mb-6 font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            India's Intelligent Warehousing Network
          </p>
          <h1
            className={`font-display text-5xl font-bold uppercase leading-[1.05] tracking-tight text-foreground transition-all delay-150 duration-700 sm:text-7xl lg:text-8xl ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            Industrial
            <br />
            Infrastructure.
            <br />
            <span className="text-gradient">Reimagined.</span>
          </h1>
          <p
            className={`mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground transition-all delay-300 duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            We engineer Grade A flexible warehousing and Build-to-Suit facilities across India's most strategic logistics corridors.
          </p>
          <div
            className={`mt-10 flex flex-wrap gap-4 transition-all delay-500 duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <Link
              to="/listings"
              className="group flex items-center gap-2 rounded-sm bg-primary px-8 py-4 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              Explore Listings
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/build-to-suit"
              className="rounded-sm border border-border px-8 py-4 font-display text-sm font-semibold uppercase tracking-wider text-foreground transition-all hover:border-primary/50 hover:text-primary"
            >
              Build-to-Suit
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};



/* ── Features ── */
const features = [
  { icon: Warehouse, title: "Flexible Warehousing", desc: "Ready-to-occupy Grade A facilities with flexible lease terms. Scale up or down as your business demands." },
  { icon: Building2, title: "Build-to-Suit Development", desc: "Custom-designed and constructed facilities tailored to your exact operational specifications." },
  { icon: Network, title: "Managed Enterprise Network", desc: "Multi-facility management across cities with centralized operations and unified compliance." },
];

const FeaturesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group rounded-sm border border-border/50 bg-card p-10 transition-all duration-700 hover:border-primary/30 hover:glow-blue-sm ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <f.icon size={32} className="text-primary" strokeWidth={1.5} />
              <h3 className="mt-6 font-display text-xl font-bold uppercase tracking-tight text-foreground">
                {f.title}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              <div className="mt-6 h-px w-12 bg-primary/30 transition-all group-hover:w-20 group-hover:bg-primary" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Metrics ── */
const MetricItem = ({ metric, isActive }: { metric: typeof metrics[0]; isActive: boolean }) => {
  const count = useCountUp(metric.value, 2000, 0, isActive);
  const display = metric.value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toString();
  return (
    <div className="text-center">
      <div className="font-display text-5xl font-bold text-white sm:text-6xl lg:text-7xl">
        {display}
        <span className="text-white">{metric.suffix}</span>
      </div>
      <p className="mt-3 text-sm uppercase tracking-widest text-primary">{metric.label}</p>
    </div>
  );
};

const MetricsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.3);
  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      <div className="absolute inset-0 bg-mesh" />
      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-12 lg:grid-cols-4">
          {metrics.map((m) => (
            <MetricItem key={m.label} metric={m} isActive={isVisible} />
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Listings Preview ── */
const ITEMS_PER_PAGE = 3;

const ListingsPreview = ({ calculatedArea = 0 }: { calculatedArea?: number }) => {
  const listingsRef = React.useRef<HTMLElement>(null);
  const { ref, isVisible } = useScrollAnimation();
  const [apiListings, setApiListings] = useState<any[]>([]);

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
          size: w.area_available ? Number(w.area_available).toLocaleString() : "0",
          unit: "sq ft",
          rate: w.rate,
          status: "Available",
          image: w.image_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80"
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

    // Area (remove commas from formatted size string for comparison)
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

  // Sync with calculated ROI constraints
  useEffect(() => {
    if (calculatedArea > 0) {
      setMinArea(calculatedArea);
      if (listingsRef.current) {
        listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [calculatedArea]);

  const handleCitySelect = (cityName: string) => {
    setSelectedCity(cityName);
    if (listingsRef.current) {
      listingsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section ref={listingsRef} className="py-32">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">Portfolio</p>
            <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
              Featured Listings
            </h2>
          </div>
          <Link
            to="/listings"
            className="hidden items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80 sm:flex shrink-0"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>



        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {paginatedListings.map((l, i) => (
            <Link
              to={`/listings/${l.id}`}
              key={l.id}
              className={`group overflow-hidden rounded-sm border border-border/50 bg-card transition-all duration-700 hover:border-primary/30 hover:glow-blue-sm ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                }`}
              style={{ transitionDelay: `${(i % ITEMS_PER_PAGE) * 100}ms` }}
            >
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={l.image}
                  alt={`${l.city} warehouse`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">{l.city}</h3>
                  <div className="flex items-center gap-2">
                    {l.rate && (
                      <span className="text-xs font-bold text-emerald-400">₹{l.rate}/sqft</span>
                    )}
                    <span className={`rounded-sm px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ${l.status === "Available" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                      }`}>
                      {l.status}
                    </span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{l.area}</p>
                <p className="mt-3 font-display text-2xl font-bold text-foreground">
                  {l.size} <span className="text-sm font-normal text-muted-foreground">{l.unit}</span>
                </p>
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

        <Link
          to="/listings"
          className="mt-10 flex items-center justify-center gap-2 text-sm font-medium text-primary sm:hidden"
        >
          View All Listings <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
};

/* ── Industries ── */
const IndustriesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="border-t border-border/50 py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">Sectors</p>
        <h2 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-5xl">
          Industries Served
        </h2>
        <div className="mt-12 grid gap-px bg-border/30 sm:grid-cols-2 lg:grid-cols-5">
          {industries.map((ind, i) => (
            <div
              key={ind.name}
              className={`bg-background p-8 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
                }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <h3 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">{ind.name}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{ind.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Final CTA ── */
const FinalCTA = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="relative overflow-hidden py-40">
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      <div className="absolute -left-20 top-0 h-full w-1/3 bg-gradient-to-br from-primary/6 via-transparent to-transparent" />
      <div
        className={`relative mx-auto max-w-3xl px-6 text-center transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
      >
        <h2 className="font-display text-4xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-6xl">
          Let's Build Your
          <br />
          <span className="text-gradient">Next Facility</span>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-lg text-muted-foreground">
          Whether you need ready infrastructure or a custom-built solution, we engineer it.
        </p>
        <Link
          to="/contact"
          className="mt-10 inline-flex items-center gap-2 rounded-sm bg-primary px-10 py-4 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
        >
          Start a Conversation <ArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
};

/* ── Page ── */
const Index = () => {
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <FeaturesSection />
        <MetricsSection />
        <ListingsPreview calculatedArea={calculatedArea} />
        <ROICalculator onComplete={(sqFt) => setCalculatedArea(sqFt)} />
        <IndustriesSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
};

export default Index;
