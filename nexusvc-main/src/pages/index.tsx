import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ROICalculator from "@/components/ROICalculator";
import { useScrollAnimation, useCountUp } from "@/hooks/useScrollAnimation";
import { API_ENDPOINTS } from "@/lib/api-config";
import { ArrowRight, Warehouse, Building2, Network } from "lucide-react";

/* ── Hero ── */
const Hero = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-24 bg-[#0b1f2a]">
      {/* Background image & overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1600&q=80')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b1f2a]/95 via-[#0b1f2a]/80 to-[#0b1f2a]/40" />

      <div ref={ref} className="relative mx-auto max-w-7xl px-6 py-32 lg:px-8 w-full flex flex-col items-center text-center sm:items-start sm:text-left">
        <div className="max-w-4xl w-full">
          <p
            className={`mb-6 font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-300 transition-all duration-700 sm:text-xs sm:tracking-[0.3em] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            INDIA'S FLEXIBLE WAREHOUSING NETWORK
          </p>
          <h1
            className={`font-display text-[2rem] font-bold uppercase leading-[1.1] tracking-tight text-white transition-all delay-150 duration-700 sm:text-6xl lg:text-[5.5rem] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            WAREHOUSING.<br />INFRASTRUCTURE.<br />ON DEMAND.
          </h1>
          <p
            className={`mt-6 max-w-xl mx-auto sm:mx-0 text-sm sm:text-base leading-relaxed text-gray-300 transition-all delay-300 duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            We create Flexible Warehousing and Build To Suit solutions across India's key logistics corridors by unlocking underutilized industrial space.
          </p>
          <div
            className={`mt-10 flex flex-wrap justify-center sm:justify-start gap-4 transition-all delay-500 duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
          >
            <Link
              to="/listings"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#0b1f2a] transition-all hover:shadow-lg hover:shadow-cyan-400/25"
            >
              EXPLORE LISTINGS &gt;
            </Link>
            <Link
              to="/nexus-prime"
              className="rounded-full border border-gray-400 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white hover:text-[#0b1f2a]"
            >
              NEXUS PRIME
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ── Metrics ── */
const newMetrics = [
  { value: 2.5, suffix: "M+", label: "Sq Ft. Networked" },
  { value: 18, suffix: "", label: "Enterprise Clients" },
  { value: 12, suffix: "", label: "Cities" },
  { value: 100, suffix: "%", label: "Grade A Compliant" },
];

const MetricItem = ({ metric, isActive }: { metric: typeof newMetrics[0]; isActive: boolean }) => {
  const count = useCountUp(metric.value, 2000, 0, isActive);
  const display = metric.value % 1 !== 0 ? count.toFixed(1) : Math.round(count).toString();
  return (
    <div className="text-center px-2">
      <div className="font-display text-3xl font-bold text-white sm:text-5xl lg:text-5xl mb-2">
        {display}<span className="text-white">{metric.suffix}</span>
      </div>
      <p className="text-[10px] uppercase tracking-widest text-[#0b1f2a] font-bold">{metric.label}</p>
    </div>
  );
};

const MetricsSection = () => {
  const { ref, isVisible } = useScrollAnimation(0.3);
  return (
    <section ref={ref} className="bg-[#66a3b6] py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-y-10 gap-x-8 lg:grid-cols-4 divide-x-0 lg:divide-x divide-white/20">
          {newMetrics.map((m) => (
            <MetricItem key={m.label} metric={m} isActive={isVisible} />
          ))}
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
    <section ref={ref} className="bg-[#112431] py-32 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group relative pt-6 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="relative w-full h-full rounded-tl-xl rounded-br-xl rounded-tr-[4rem] rounded-bl-[4rem] bg-[#112431] border border-white/20 p-8 pt-10 pb-12 shadow-xl">

                {/* The Blue Icon Box */}
                <div className="absolute top-[-2rem] right-[1rem] w-[4.5rem] h-[4.5rem] rounded-[1.25rem] bg-gradient-to-br from-[#80c8d4] to-[#458092] flex items-center justify-center z-20 shadow-md">
                  <f.icon size={32} className="text-white drop-shadow-sm" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <div className="relative z-10 text-center flex flex-col items-center mt-4">
                  <h3 className="font-display text-[1.1rem] text-white tracking-wide mb-3">{f.title}</h3>
                  <p className="text-[12px] leading-relaxed text-gray-300 max-w-[260px]">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Listings Preview ── */
const ITEMS_PER_PAGE = 3;

const ListingsPreview = ({ calculatedArea = 0, onClearFilter }: { calculatedArea?: number; onClearFilter?: () => void }) => {
  const listingsRef = React.useRef<HTMLElement>(null);
  const { ref, isVisible } = useScrollAnimation();
  const [apiListings, setApiListings] = useState<any[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const loadFeatured = async () => {
      try {
        const res = await fetch(`${API_ENDPOINTS.WAREHOUSES}?page=1&limit=20`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json.data || [];
        const formatted = data.map((w: any) => ({
          id: w.id,
          city: w.city || "Location",
          cluster: w.cluster || "",
          area: w.warehouse_code || "-",
          size: w.area_available ? Number(w.area_available).toLocaleString() : "0",
          numericSize: Number(w.area_available || 0),
          unit: "sq ft",
          rate: w.rate,
          status: "Available",
          image: w.image_url || "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80",
        }));

        if (formatted.length === 0) throw new Error("Empty DB");
        setApiListings(formatted);
      } catch (err: any) {
        if (err.name === "AbortError") return;
        console.error("Failed to fetch featured warehouses, rendering dummy layout:", err);
        // Fallback dummy data if backend is empty
        setApiListings([
          {
            id: 1, city: "MUMBAI", cluster: "WP-1004 - GENERAL GRADE B", size: "250,000", numericSize: 250000, rate: "28",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
          },
          {
            id: 2, city: "NASHIK", cluster: "WP-1005 - GENERAL GRADE B", size: "3,000", numericSize: 3000, rate: "25",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
          },
          {
            id: 3, city: "MUMBAI", cluster: "WP-1001 - GENERAL GRADE A", size: "15,000", numericSize: 15000, rate: "32",
            image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
          }
        ]);
      }
    };
    loadFeatured();
    return () => controller.abort();
  }, []);

  // Scroll logic when calculatedArea is provided
  useEffect(() => {
    if (calculatedArea > 0 && listingsRef.current) {
      setTimeout(() => {
        listingsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [calculatedArea]);

  const filteredListings = calculatedArea > 0
    ? apiListings.filter(l => l.numericSize >= calculatedArea * 0.6 && l.numericSize <= calculatedArea * 1.8)
    : apiListings.slice(0, 3); // Default to first 3

  return (
    <section ref={listingsRef} className="bg-gradient-to-r from-[#70b1be] to-[#3a6d7f] pt-24 pb-0 scroll-mt-24">
      <div ref={ref} className="mx-auto max-w-7xl px-6 lg:px-8 mb-12">
        <div className="flex flex-col gap-6 md:flex-row md:items-end justify-between">
          <div>
            <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-white/70 mb-2">
              {calculatedArea > 0 ? `Optimization Recommendations` : `Portfolio`}
            </p>
            <h2 className="font-display text-2xl sm:text-[2.75rem] font-bold uppercase tracking-widest text-white mb-4 leading-tight">
              {calculatedArea > 0 ? `${calculatedArea.toLocaleString()} SQ FT Solutions` : `Featured Listings`}
            </h2>
            <p className="text-[13px] leading-relaxed text-white/90 max-w-3xl">
              {calculatedArea > 0
                ? "Based on your optimization requirements, here are the most efficient Grade-A spaces that match your scale."
                : "Find Grade A logistics facilities consolidated by us, strategically located, fully compliant, and ready to power your supply chain."
              }
            </p>
          </div>
          <div className="flex items-center gap-4">
            {calculatedArea > 0 && (
              <button
                onClick={onClearFilter}
                className="flex items-center gap-2 text-[13px] font-bold text-white transition-opacity hover:opacity-75 shrink-0 mb-[6px] border border-white/20 rounded-full px-4 py-1"
              >
                Clear Selection
              </button>
            )}
            <Link
              to="/listings"
              className="flex items-center gap-2 text-[13px] font-bold text-white transition-colors hover:text-white/80 shrink-0 mb-[6px]"
            >
              View All &gt;
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-16">
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {filteredListings.length > 0 ? (
            filteredListings.map((l, i) => (
              <Link
                to={`/listings/${l.id}`}
                key={l.id}
                className={`group relative overflow-hidden transition-all duration-700 border-r border-[#0b1f2a] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
                style={{ transitionDelay: `${(i % ITEMS_PER_PAGE) * 100}ms` }}
              >
                <div className="aspect-[3/4] md:aspect-[3/4] overflow-hidden bg-[#0a1a24]">
                  <img
                    src={l.image}
                    alt={`${l.city} warehouse`}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 brightness-90 group-hover:opacity-100 transition-opacity"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-all duration-500" />
                </div>

                <div className="absolute top-6 left-6 right-6">
                  <h3 className="font-display text-3xl font-bold uppercase tracking-tight text-white mb-1">
                    {l.city}
                  </h3>
                  <div className="text-[10px] uppercase text-white/80 font-medium tracking-wide leading-relaxed">
                    WH TYPE - <br />
                    {l.cluster}
                    <br />
                    <span className="text-cyan-400 font-bold block mt-1">RATE<br />₹{l.rate}/sqft</span>
                  </div>
                </div>

                <div className="absolute bottom-6 left-6 flex items-end h-32">
                  <div className="relative h-full flex items-end pb-8">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-white -rotate-90 origin-bottom-left absolute left-0 bottom-14 whitespace-nowrap">CAPACITY</span>
                    <p className="font-display text-4xl font-bold text-white ml-6 leading-none">
                      {l.size}
                    </p>
                    <span className="text-[10px] text-white -rotate-90 block absolute right-[-24px] bottom-[30px] font-bold">SQ FT</span>
                  </div>
                </div>

                <div className="absolute bottom-6 right-6 h-10 w-10 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-md">
                  <ArrowRight size={16} className="text-white" />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-20 text-center border-t border-white/10">
              <p className="text-white/60 text-lg uppercase tracking-widest">No exact matches for this specific area requirement.</p>
              <button
                onClick={onClearFilter}
                className="mt-4 text-cyan-400 font-bold uppercase text-xs tracking-widest hover:underline"
              >
                Reset Filter
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

/* ── Industries ── */
const industriesNew = [
  { name: "E-COMMERCE", description: "Fulfillment-ready hubs for rapid last-mile delivery." },
  { name: "FMCG", description: "Temperature-controlled and ambient storage to keep products moving." },
  { name: "3PL", description: "Multi-client enabled facilities that flex with diverse logistics needs." },
  { name: "PHARMA", description: "GDP-compliant cold chain and ambient solutions for sensitive cargo." },
  { name: "AUTOMOTIVE", description: "Just-in-time facilities positioned near manufacturing hubs." },
];

const IndustriesSection = () => {
  const { ref, isVisible } = useScrollAnimation();
  return (
    <section ref={ref} className="bg-gradient-to-r from-[#70b1be] to-[#3a6d7f] py-24 shadow-inner">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.4em] text-white/70 mb-2 text-center sm:text-left">Sectors</p>
        <h2 className="font-display text-xl sm:text-[2.75rem] font-bold uppercase tracking-widest text-white mb-12 sm:mb-16 text-center sm:text-left">
          INDUSTRIES WE SERVE
        </h2>
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-0">
          {industriesNew.map((ind, i) => (
            <div
              key={ind.name}
              className={`transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"} ${i > 0 ? "lg:border-l lg:border-white/20 lg:pl-8" : "lg:pr-8"}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <h3 className="font-display text-[13px] font-extrabold uppercase tracking-widest text-white mb-3">{ind.name}</h3>
              <p className="text-[13px] leading-relaxed text-white/90 max-w-[200px]">{ind.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

/* ── Page ── */
const Index = () => {
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

  return (
    <div className="bg-[#0b1f2a] min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <MetricsSection />
        <FeaturesSection />
        <ListingsPreview 
          calculatedArea={calculatedArea} 
          onClearFilter={() => setCalculatedArea(0)} 
        />
        <div className="bg-[#112431] pb-32 pt-24">
          <ROICalculator onComplete={(sqFt) => setCalculatedArea(sqFt)} />
        </div>
        <IndustriesSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
