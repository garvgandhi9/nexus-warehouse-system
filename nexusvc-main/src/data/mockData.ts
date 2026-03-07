export const cities = [
  { name: "Mumbai", position: 15 },
  { name: "Bangalore", position: 40 },
  { name: "Chennai", position: 65 },
  { name: "Delhi NCR", position: 90 },
];

export const listings = [
  { id: "1", city: "Mumbai", area: "Bhiwandi", size: "125,000", unit: "sq ft", type: "Grade A", status: "Available", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80" },
  { id: "2", city: "Delhi NCR", area: "Manesar", size: "250,000", unit: "sq ft", type: "Built-to-Suit", status: "Available", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80" },
  { id: "3", city: "Bangalore", area: "Hosur Road", size: "80,000", unit: "sq ft", type: "Grade A", status: "Leased", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=600&q=80" },
  { id: "4", city: "Chennai", area: "Oragadam", size: "175,000", unit: "sq ft", type: "Grade A", status: "Available", term_type: "short_term", term_duration: "July to December", image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&q=80" },
  { id: "5", city: "Pune", area: "Chakan", size: "100,000", unit: "sq ft", type: "Flex", status: "Available", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=600&q=80" },
  { id: "6", city: "Hyderabad", area: "Shamshabad", size: "200,000", unit: "sq ft", type: "Grade A", status: "Pre-Lease", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1590247813693-5541d1c573a2?w=600&q=80" },
  { id: "7", city: "Mumbai", area: "Panvel", size: "150,000", unit: "sq ft", type: "Built-to-Suit", status: "Available", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&q=80" },
  { id: "8", city: "Delhi NCR", area: "Palwal", size: "300,000", unit: "sq ft", type: "Grade A", status: "Available", term_type: "short_term", term_duration: "October to January", image: "https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&q=80" },
  { id: "9", city: "Bangalore", area: "Nelamangala", size: "60,000", unit: "sq ft", type: "Flex", status: "Leased", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1565610222536-ef125c59da2e?w=600&q=80" },
  { id: "10", city: "Ahmedabad", area: "Sanand", size: "120,000", unit: "sq ft", type: "Grade A", status: "Available", term_type: "long_term", term_duration: "", image: "https://images.unsplash.com/photo-1590247813693-5541d1c573a2?w=600&q=80" },
];

export const warehouseDetail = {
  id: "1",
  city: "Mumbai",
  area: "Bhiwandi",
  size: "125,000",
  unit: "sq ft",
  type: "Grade A",
  status: "Available",
  term_type: "long_term",
  term_duration: "",
  image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80",
  ceilingHeight: "12m clear",
  loadingDocks: 12,
  floorStrength: "7 MT/sqm",
  compliance: "Grade A — IGBC Pre-certified",
  powerBackup: "100% DG Backup",
  fireSystem: "Fully Sprinklered",
  description: "Premium Grade A warehousing facility located in the heart of Bhiwandi logistics corridor. Strategically positioned with excellent connectivity to JNPT port and Mumbai-Nashik expressway.",
  amenities: ["24/7 Security", "CCTV Surveillance", "Truck Parking", "Office Space", "Cafeteria", "EV Charging", "Rainwater Harvesting", "Solar Panels"],
};

export const industries = [
  { name: "E-Commerce", description: "Fulfillment-ready infrastructure for rapid last-mile delivery" },
  { name: "FMCG", description: "Temperature-controlled and ambient storage solutions" },
  { name: "3PL", description: "Multi-client enabled flexible warehousing" },
  { name: "Pharma", description: "GDP-compliant cold chain and ambient facilities" },
  { name: "Automotive", description: "Just-in-time ready facilities near manufacturing hubs" },
];

export const metrics = [
  { value: 2.5, suffix: "M+", label: "Sq Ft Networked", unit: "sq ft" },
  { value: 18, suffix: "", label: "Enterprise Clients", unit: "clients" },
  { value: 12, suffix: "", label: "Cities", unit: "cities" },
  { value: 100, suffix: "%", label: "Grade A Compliant", unit: "" },
];

export const btsProcess = [
  { step: "01", title: "Identify", description: "Strategic site selection based on your supply chain needs, proximity to demand centers, and infrastructure connectivity." },
  { step: "02", title: "Design", description: "Custom facility design optimized for your operational workflows, compliance requirements, and future scalability." },
  { step: "03", title: "Build", description: "End-to-end construction management with Grade A specifications, sustainable materials, and on-time delivery guarantees." },
  { step: "04", title: "Operate", description: "Seamless handover with optional facility management, maintenance support, and technology integration." },
];
