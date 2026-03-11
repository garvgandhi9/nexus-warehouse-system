import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icon paths in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// ─── Map Controller ──────────────────────────────────────────────────────────
function MapController({ listings, centerOn, zoom }: Props) {
  const map = useMap();

  useEffect(() => {
    if (centerOn) {
      map.setView(centerOn, zoom || 14, { animate: true, duration: 1.5 });
      return;
    }

    const mappable = listings.filter((l) => l.latitude && l.longitude);
    if (mappable.length === 0) return;

    const bounds = L.latLngBounds(mappable.map((l) => [l.latitude!, l.longitude!]));
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 12 });
  }, [listings, map, centerOn, zoom]);

  return null;
}

export default function WarehouseMap({ listings, centerOn, zoom }: Props) {
  const mappable = listings.filter((l) => l.latitude && l.longitude);

  return (
    <div className="relative w-full rounded-sm border border-black/5 overflow-hidden shadow-2xl bg-white" style={{ height: "620px" }}>
      {mappable.length === 0 && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/80 text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black pointer-events-none backdrop-blur-sm">
          No facility deployment data found
        </div>
      )}

      <MapContainer
        center={centerOn || [20.5937, 78.9629]}
        zoom={zoom || 5}
        style={{ height: "100%", width: "100%" }}
        className="z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        <MapController listings={listings} centerOn={centerOn} zoom={zoom} />

        {mappable.map((w) => (
          <Marker
            key={w.id}
            position={[w.latitude!, w.longitude!]}
          >
            <Popup className="nexus-popup-custom" minWidth={280}>
              <div className="bg-white text-slate-900 overflow-hidden rounded-sm -m-3 border border-black/5 shadow-2xl">
                <div className="aspect-[16/9] overflow-hidden">
                  <img src={w.image} alt={w.city} className="w-full h-full object-cover" />
                </div>

                <div className="p-4 bg-white">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 leading-tight">
                      {w.city}
                    </h4>
                    {w.rate && (
                      <span className="text-[10px] font-bold text-primary">₹{w.rate}/SQFT</span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
                    {w.area} · {w.type}
                  </p>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-1.5 py-0.5 rounded-[1px] text-[8px] font-black uppercase tracking-tighter ${w.status === 'Available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                      {w.status}
                    </span>
                    {w.is_prime && (
                      <span className="px-1.5 py-0.5 rounded-[1px] text-[8px] font-black uppercase tracking-tighter bg-primary/10 text-primary border border-primary/20">
                        Nexus Prime
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/listings/${w.id}`}
                    className="flex items-center justify-center w-full py-2.5 bg-slate-950 text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-[1px] hover:bg-slate-800 transition-all no-underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Access Terminal
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend / Status Overlay */}
      <div className="absolute bottom-4 left-4 z-[500] flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur-md border border-black/5 rounded-sm px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 shadow-xl">
          <span className="text-primary">{mappable.length}</span> ACTIVE NODES IN NETWORK
        </div>
      </div>
    </div>
  );
}
