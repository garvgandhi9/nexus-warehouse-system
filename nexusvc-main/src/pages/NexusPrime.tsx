import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_ENDPOINTS } from "@/lib/api-config";
import { btsProcess } from "@/data/mockData";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { ArrowRight, Box, ShieldCheck, Zap, Globe, HardHat, Target, Pencil, Settings, Send, BarChart3, Truck } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";
import { useState } from "react";

const stepIcons = [Target, Pencil, HardHat, Settings];

const primeBenefits = [
    {
        title: "Unified 3PL Network",
        desc: "Managing logistics across India doesn't need to mean juggling multiple vendors. With Nexus Prime, you work through a single API, a single contract, and a single relationship, giving you a streamlined way to run pan-India operations.",
        icon: Truck
    },
    {
        title: "Grade A Exclusivity",
        desc: "Every warehouse in the Nexus Prime network is pre-vetted and built to Grade A standards. Your goods move through facilities designed for efficiency, safety, and compliance; no compromises, no surprises.",
        icon: ShieldCheck
    },
    {
        title: "Tech-Enabled Visibility",
        desc: "Supply chains thrive on clarity. Nexus Prime gives you real-time inventory tracking and performance analytics across all managed facilities so you can make faster decisions with confidence.",
        icon: BarChart3
    },
    {
        title: "Rapid Deployment",
        desc: "Expanding into new markets shouldn't take months. With our ready-to-move assets, you can go live in days, reducing time-to-market and keeping your business ahead of demand.",
        icon: Zap
    }
];

const NexusPrime = () => {
    const { ref: heroRef, isVisible: heroVis } = useScrollAnimation(0.1);
    const { ref: whatIs3PLRef, isVisible: whatIs3PLVis } = useScrollAnimation();
    const { ref: benefitsRef, isVisible: benefitsVis } = useScrollAnimation();
    const { ref: btsRef, isVisible: btsVis } = useScrollAnimation();
    const [submitted, setSubmitted] = useState(false);

    const {
        values: formData,
        handleChange,
        getInputStyles,
        isValid: isFormValid,
        errors
    } = useFormValidation({
        name: "",
        email: "",
        phone: "",
        details: "",
        interest: "Nexus Prime"
    }, {
        name: { required: true },
        email: { required: true, isEmail: true },
        phone: { required: true, isPhone: true },
        details: { required: true },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isFormValid()) {
            try {
                const payload = {
                    name: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    message: formData.details,
                    source: "Nexus Prime Page",
                    category: formData.interest,
                    tier: "Prime"
                };
                const response = await fetch(API_ENDPOINTS.CONTACT, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (response.ok) {
                    setSubmitted(true);
                }
            } catch (err) {
                console.error("Error submitting requirement:", err);
            }
        }
    };

    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-24">

                {/* Hero Section */}
                <section ref={heroRef} className="relative overflow-hidden py-40">
                    <div className="absolute inset-0 bg-mesh opacity-40" />
                    <div className="absolute inset-0 bg-grid opacity-10" />
                    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/10 via-transparent to-transparent pointer-events-none" />
                    <div className={`relative mx-auto max-w-7xl px-6 lg:px-8 text-center transition-all duration-1000 ${heroVis ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-4 py-1.5 mb-8">
                            <ShieldCheck size={14} className="text-primary" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">The Future of Warehousing</span>
                        </div>
                        <h1 className="font-display text-6xl font-black uppercase leading-[0.95] tracking-tighter text-foreground sm:text-8xl lg:text-9xl">
                            NEXUS <span className="text-gradient">PRIME</span>
                        </h1>
                        <p className="mt-8 mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground font-medium">
                            Nexus Prime brings together space, technology, and expertise to create a logistics ecosystem built for enterprises that expect performance at scale.
                        </p>
                        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                            <button
                                onClick={() => btsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="rounded-sm bg-primary px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-primary-foreground shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all hover:scale-105 hover:bg-primary/90"
                            >
                                Join the Network
                            </button>
                            <button
                                onClick={() => whatIs3PLRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                className="rounded-sm border border-border/50 bg-background/50 backdrop-blur-sm px-8 py-4 font-display text-sm font-bold uppercase tracking-widest text-foreground transition-all hover:bg-card"
                            >
                                What is 3PL?
                            </button>
                        </div>
                    </div>
                </section>

                {/* 3PL Section */}
                <section ref={whatIs3PLRef} className="bg-gradient-to-r from-[#70b1be] to-[#3a6d7f] py-32 shadow-inner text-white">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid gap-16 lg:grid-cols-2 lg:items-center">
                            <div className={`transition-all duration-1000 ${whatIs3PLVis ? "translate-x-0 opacity-100" : "-translate-x-12 opacity-0"}`}>
                                <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-white sm:text-6xl">
                                    WHAT IS <span className="text-[#a4dbe4] italic">3PL?</span>
                                </h2>
                                <p className="mt-8 text-xl leading-relaxed text-white/90">
                                    Third-Party Logistics (3PL) is about outsourcing supply chain operations to a partner who can manage them end-to-end. With <b>Nexus Prime</b>, you gain a streamlined way to handle storage, movement, and compliance, without the burden of trucks, staff, or multiple contracts.
                                </p>
                                <div className="mt-10 grid gap-6">
                                    {[
                                        { title: "Zero Fixed Capex", desc: "Instead of locking capital into warehouses or fleets, you pay only for the capacity and performance you actually use. This keeps your balance sheet lighter and your operations more flexible." },
                                        { title: "Scalable Operations", desc: "Demand isn't static, and neither should your logistics be. Nexus Prime lets you expand storage and handling instantly during peak seasons, then scale back when volumes normalise." },
                                        { title: "End-to-End Handling", desc: "From inbound receiving to last-mile dispatch, every step is managed within one integrated framework. Fewer handoffs, reduced errors, and a smoother experience for your customers." },
                                        { title: "Compliance-as-a-Service", desc: "Every facility in the Nexus Prime network is Grade A compliant, so you don't have to worry about audits, certifications, or regulatory gaps. Compliance is built into the service." },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white shrink-0 mt-1 shadow-sm">
                                                <ArrowRight size={14} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold uppercase tracking-widest text-white">{item.title}</p>
                                                <p className="mt-2 text-sm text-white/80 leading-relaxed text-justify">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className={`relative rounded-2xl border border-white/20 bg-white/5 p-2 transition-all duration-1000 backdrop-blur-md ${whatIs3PLVis ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}>
                                <div className="aspect-video overflow-hidden rounded-xl bg-black/20 shadow-2xl">
                                    <img
                                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80"
                                        alt="Nexus Prime Operations"
                                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Prime Benefits */}
                <section ref={benefitsRef} className="py-32 overflow-hidden">
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="text-center">
                            <p className="font-display text-xs font-bold uppercase tracking-[0.4em] text-primary">Nexus Advantage</p>
                            <h2 className="mt-6 font-display text-4xl font-black uppercase tracking-tighter text-foreground sm:text-6xl">
                                THE POWER OF <span className="text-gradient">PRIME</span>
                            </h2>
                        </div>
                        <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {primeBenefits.map((benefit, i) => {
                                const Icon = benefit.icon;
                                return (
                                    <div
                                        key={benefit.title}
                                        className={`group relative rounded-sm border border-border/50 bg-card p-10 transition-all duration-700 hover:border-primary/50 ${benefitsVis ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}
                                        style={{ transitionDelay: i * 150 + "ms" }}
                                    >
                                        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-[0_0_20px_rgba(59,130,246,0.1)] group-hover:shadow-[0_0_30px_rgba(59,130,246,0.4)]">
                                            <Icon size={28} strokeWidth={1.5} />
                                        </div>
                                        <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">{benefit.title}</h3>
                                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground text-justify">{benefit.desc}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Build to Suit */}
                <section ref={btsRef} className="relative border-t border-border/50 py-32">
                    <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
                    <div className="mx-auto max-w-7xl px-6 lg:px-8">
                        <div className="grid gap-16 lg:grid-cols-2 lg:items-start">
                            <div className={`transition-all duration-1000 ${btsVis ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"}`}>
                                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 mb-6">
                                    <HardHat size={14} className="text-primary" />
                                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Custom Solutions</span>
                                </div>
                                <h2 className="font-display text-4xl font-black uppercase tracking-tighter text-foreground sm:text-6xl">
                                    BUILD-TO-<span className="text-gradient">SUIT</span>
                                </h2>
                                <p className="mt-8 text-lg leading-relaxed text-muted-foreground">
                                    For enterprises with specific requirements, Nexus Prime engineers facilities tailored to your operational DNA, from cold storage to high-density racking.
                                </p>
                                <div className="mt-12 space-y-8">
                                    {[
                                        { step: "1", title: "Identify", description: "Sites selected for connectivity and proximity to demand." },
                                        { step: "2", title: "Design", description: "Layouts optimised for workflows, compliance, and scalability." },
                                        { step: "3", title: "Build", description: "Grade A construction with sustainable materials and on-time delivery." },
                                        { step: "4", title: "Operate", description: "Seamless handover with optional management, maintenance, and tech integration." },
                                    ].map((step, i) => {
                                        const Icon = stepIcons[i];
                                        return (
                                            <div key={step.step} className="flex gap-6 group">
                                                <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-card font-display text-lg font-bold text-primary transition-all group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                                                    {step.step}
                                                </div>
                                                <div>
                                                    <h4 className="font-display text-lg font-bold uppercase tracking-tight text-foreground">{step.title}</h4>
                                                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Lead Capture Form */}
                            <div className={`rounded-sm border border-border/50 bg-card p-10 shadow-2xl lg:sticky lg:top-32 transition-all duration-1000 ${btsVis ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}>
                                {submitted ? (
                                    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
                                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                                            <Send size={32} className="text-primary animate-pulse" />
                                        </div>
                                        <h3 className="mt-8 font-display text-3xl font-black uppercase text-foreground">Welcome to Prime</h3>
                                        <p className="mt-4 text-muted-foreground font-medium uppercase tracking-widest text-xs">Our Prime Consultant will reach out within 2 hours.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                                        <div className="space-y-2">
                                            <h3 className="font-display text-2xl font-black uppercase text-foreground">Inquiry <span className="text-primary italic">Desk</span></h3>
                                            <p className="text-sm text-muted-foreground">Partnership begins here. Share your requirements, and let's design logistics that move your business forward.</p>
                                        </div>
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Full Name</label>
                                                <input name="name" value={formData.name} onChange={handleChange} required className={"w-full border rounded-sm bg-background px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary " + getInputStyles("name")} placeholder="Your Name" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Business Email</label>
                                                <input name="email" value={formData.email} onChange={handleChange} required type="email" className={"w-full border rounded-sm bg-background px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary " + getInputStyles("email")} placeholder="email@company.com" />
                                            </div>
                                        </div>
                                        <div className="grid gap-6 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Phone Number</label>
                                                <input name="phone" value={formData.phone} onChange={handleChange} required className={"w-full border rounded-sm bg-background px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary " + getInputStyles("phone")} placeholder="+91 00000 00000" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Investment Interest</label>
                                                <select name="interest" value={formData.interest} onChange={handleChange} className="w-full border border-border rounded-sm bg-background px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none uppercase font-bold tracking-widest">
                                                    <option value="Nexus Prime">Nexus Prime (3PL)</option>
                                                    <option value="Build-to-Suit">Build-to-Suit (Custom)</option>
                                                    <option value="Both">Strategic Both</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Logistics Requirement Details</label>
                                            <textarea name="details" value={formData.details} onChange={handleChange} required rows={4} className={"w-full border rounded-sm bg-background px-4 py-4 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none " + getInputStyles("details")} placeholder="Describe your scale, geography, and specific logistics needs..." />
                                        </div>
                                        <button
                                            disabled={!isFormValid()}
                                            type="submit"
                                            className="group flex items-center justify-center gap-3 rounded-sm bg-primary py-5 font-display text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-30 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
                                        >
                                            {isFormValid() ? "Request Nexus Consultation" : "Incomplete Details"}
                                            <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default NexusPrime;