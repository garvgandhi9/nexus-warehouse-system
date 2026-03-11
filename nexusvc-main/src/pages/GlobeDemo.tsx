import { useState, useEffect, useRef } from "react";
import Globe from "react-globe.gl";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINTS } from "@/lib/api-config";

const TILE_URL = "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png";

const GlobeDemo = () => {
    const globeRef = useRef<any>();
    const navigate = useNavigate();
    const [data, setData] = useState<any[]>([]);
    const [hoveredPoint, setHoveredPoint] = useState<any>(null);
    const [windowWidth, setWindowWidth] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        const loadWarehouses = async () => {
            try {
                const res = await fetch(API_ENDPOINTS.WAREHOUSES, { signal: controller.signal });
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const json = await res.json();
                const rawData = Array.isArray(json) ? json : (json.data || []);
                if (!Array.isArray(rawData)) {
                    console.error("Unexpected API response:", rawData);
                    return;
                }
                const formatted = rawData
                    .filter((w: any) => w.latitude && w.longitude)
                    .map((w: any) => ({
                        id: w.id,
                        lat: parseFloat(w.latitude),
                        lng: parseFloat(w.longitude),
                        name: w.org_name || "Nexus Warehouse",
                        category: w.category,
                        size: w.area_available ? parseInt(w.area_available) / 10000 : 0.5,
                        color: w.is_prime ? "#a855f7" : "#0052FF",
                    }));
                console.log("Formatted globe points:", formatted);
                setData(formatted);
            } catch (err: any) {
                if (err.name === "AbortError") return;
                console.error("Failed to load warehouses for globe:", err);
            }
        };
        loadWarehouses();
        return () => controller.abort();
    }, []);

    useEffect(() => {
        if (globeRef.current) {
            // Focus the camera on India roughly, from a distance
            globeRef.current.pointOfView({ lat: 20.5937, lng: 78.9629, altitude: 2 });
        }
    }, [data]);

    return (
        <div className="min-h-screen bg-[#020817] flex flex-col font-sans">
            <Navbar />

            {/* Main Globe Section */}
            <div className="relative h-[85vh] mt-20 overflow-hidden">
                <div
                    className={`absolute inset-0 z-0 flex items-center justify-center cursor-grab active:cursor-grabbing ${hoveredPoint ? '!cursor-pointer' : ''}`}
                >
                    <Globe
                        ref={globeRef}
                        width={windowWidth}
                        height={typeof window !== "undefined" ? window.innerHeight * 0.85 : 800}
                        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
                        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                        backgroundColor="rgba(2, 8, 23, 1)"

                        // Rings configuration for pulsing effect
                        ringsData={data}
                        ringColor={(d: any) => d.color}
                        ringMaxRadius={3}
                        ringPropagationSpeed={1}
                        ringRepeatPeriod={800}

                        // Labels - Only show for hovered point to keep it clean
                        labelsData={hoveredPoint ? [hoveredPoint] : []}
                        labelLat={(d: any) => d.lat}
                        labelLng={(d: any) => d.lng}
                        labelText={(d: any) => d.name}
                        labelSize={1.2}
                        labelDotRadius={0.4}
                        labelColor={() => "rgba(255, 255, 255, 1)"}
                        labelResolution={2}
                        onLabelClick={(d: any) => navigate(`/listings/${d.id}`)}

                        // Points
                        pointsData={data}
                        pointColor={(d: any) => d.color}
                        pointAltitude={0.01}
                        pointRadius={0.25}
                        onPointHover={(point) => setHoveredPoint(point)}
                        onPointClick={(d: any) => navigate(`/listings/${d.id}`)}

                        // Interaction
                        onGlobeClick={() => { }}
                    />
                </div>

                {/* Overlay Text - Repositioned to Top-Left */}
                <div className="absolute top-0 left-0 z-10 pointer-events-none p-8 md:p-12 w-full max-w-xl">
                    <div className="bg-background/20 backdrop-blur-md p-6 rounded-2xl border border-white/10 mt-4 shadow-2xl">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-3 uppercase tracking-tight">
                            Nexus Global Network
                        </h1>
                        <p className="text-sm md:text-base text-white/80 font-medium leading-relaxed">
                            A live visualization of our active warehouse listings.
                            <span className="text-primary block mt-2 font-bold tracking-wider uppercase text-xs">● Hover on a point to identify, tap for details</span>
                        </p>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default GlobeDemo;
