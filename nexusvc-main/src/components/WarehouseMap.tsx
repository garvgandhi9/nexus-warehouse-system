import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

interface Warehouse {
  id: number | string;
  city: string;
  area: string;
  size: string;
  unit: string;
  rate?: number;
  type: string;
  status: string;
  image: string;
  latitude?: number;
  longitude?: number;
  is_prime?: boolean;
}

interface Props {
  listings: Warehouse[];
  centerOn?: [number, number];
  zoom?: number;
}

export default function WarehouseMap({ listings, centerOn, zoom }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const mappable = listings.filter((l) => l.latitude && l.longitude);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

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
      center: centerOn ? [centerOn[1], centerOn[0]] : [78.9629, 20.5937],
      zoom: zoom || 5,
    });

    mapRef.current = map;

    map.on("load", () => {
      mappable.forEach((w) => {
        const popupEl = document.createElement("div");
        popupEl.className = "bg-white text-slate-900 overflow-hidden rounded-sm border border-black/5 shadow-2xl";
        popupEl.style.width = "280px";
        popupEl.innerHTML = `
          <div style="aspect-ratio:16/9;overflow:hidden">
            <img src="${w.image}" alt="${w.city}" style="width:100%;height:100%;object-fit:cover" />
          </div>
          <div style="padding:16px">
            <div style="display:flex;justify-content:space-between;margin-bottom:8px">
              <span style="font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.1em">${w.city}</span>
              ${w.rate ? `<span style="font-size:10px;font-weight:700;color:#f97316">₹${w.rate}/SQFT</span>` : ""}
            </div>
            <p style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:12px">${w.area} · ${w.type}</p>
            <a href="/listings/${w.id}" style="display:flex;align-items:center;justify-content:center;width:100%;padding:10px;background:#0f172a;color:white;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:0.2em;text-decoration:none;border-radius:2px">
              Check Listing
            </a>
          </div>
        `;

        const popup = new maplibregl.Popup({ offset: 25 }).setDOMContent(popupEl);
        new maplibregl.Marker()
          .setLngLat([w.longitude!, w.latitude!])
          .setPopup(popup)
          .addTo(map);
      });

      if (!centerOn && mappable.length > 0) {
        const bounds = new maplibregl.LngLatBounds();
        mappable.forEach((w) => bounds.extend([w.longitude!, w.latitude!]));
        map.fitBounds(bounds, { padding: 80, maxZoom: 12 });
      }
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full rounded-sm border border-black/5 overflow-hidden shadow-2xl" style={{ height: "620px" }}>
      {mappable.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black pointer-events-none backdrop-blur-sm">
          No facility deployment data found
        </div>
      )}
      <div ref={mapContainerRef} className="h-full w-full" />
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md border border-black/5 rounded-sm px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-xl">
          <span className="text-primary">{mappable.length}</span> ACTIVE NODES IN NETWORK
        </div>
      </div>
    </div>
  );
}