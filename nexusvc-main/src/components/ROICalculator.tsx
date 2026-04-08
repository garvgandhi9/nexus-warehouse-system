import React, { useState } from "react";
import { ArrowRight, Calculator, CheckCircle2, Package, Ruler, TrendingDown, TrendingUp } from "lucide-react";

interface ROICalculatorProps {
    onComplete: (calculatedSqFt: number) => void;
}

const ROICalculator: React.FC<ROICalculatorProps> = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [unit, setUnit] = useState<"Pallets" | "Sq Ft">("Pallets");
    const [capacity, setCapacity] = useState<string>("");
    const [duration, setDuration] = useState<number>(12); // months

    const handleNext = () => {
        if (step === 1 && capacity) setStep(2);
        else if (step === 2) setStep(3);
    };

    // 1 Pallet roughly needs 15 sq ft of generic space.
    const baseSqFt = unit === "Pallets" ? Number(capacity) * 15 : Number(capacity);
    // Grade A height (12m+) allows for 30% density optimization.
    const optimizedSqFt = Math.round(baseSqFt * 0.7);

    // Cost savings logic: Savings per sq ft per month over duration
    // E.g., Save ₹5/sq ft/month due to better density and shared operational costs.
    const monthlySavingsPerSqFt = 5;
    const totalSavings = (baseSqFt - optimizedSqFt) * monthlySavingsPerSqFt * duration;

    return (
        <section className="py-24 border-b border-white/10">
            <div className="mx-auto max-w-4xl px-6 lg:px-8">
                <div className="rounded-tl-2xl rounded-br-2xl rounded-tr-[5rem] rounded-bl-[5rem] sm:rounded-tr-[10rem] sm:rounded-bl-[10rem] border border-white/10 bg-[#112431] p-6 sm:p-12 shadow-2xl relative overflow-hidden">
                    {/* Subtle background glow */}
                    <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-cyan-400/5 blur-[100px]" />

                    <div className="relative z-10 px-4">
                        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between border-b border-white/5 pb-8 text-center sm:text-left gap-6">
                            <div>
                                <h2 className="text-3xl font-semibold tracking-wide text-white">
                                    Nexus ROI & Space Calculator
                                </h2>
                                <p className="mt-3 text-[13px] leading-relaxed text-gray-300 max-w-xl mx-auto sm:mx-0">See how Grade-A optimisation translates into real savings.<br />Run the numbers and measure the impact.</p>
                            </div>

                            <div className="flex gap-2">
                                {[1, 2, 3].map((s) => (
                                    <div
                                        key={s}
                                        className={`h-2 w-8 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-muted'}`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="min-h-[250px] flex flex-col justify-center px-4">
                            {/* Step 1: Capacity */}
                            {step === 1 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-[1.1rem] font-medium tracking-wide text-white mb-6 uppercase">Step 1: Define Capacity Requirement</h3>

                                    <div className="mb-8 flex gap-2 w-fit">
                                        <button
                                            onClick={() => setUnit("Pallets")}
                                            className={`rounded-full px-6 py-2 text-[10px] uppercase font-bold tracking-widest transition-all ${unit === "Pallets" ? "bg-gradient-to-r from-[#7bc0cd] to-[#4c8491] text-white shadow-lg" : "border border-white/20 text-gray-400 hover:border-white/40"}`}
                                        >
                                            Pallet Positions
                                        </button>
                                        <button
                                            onClick={() => setUnit("Sq Ft")}
                                            className={`rounded-full px-6 py-2 text-[10px] uppercase font-bold tracking-widest transition-all ${unit === "Sq Ft" ? "bg-gradient-to-r from-[#7bc0cd] to-[#4c8491] text-white shadow-lg" : "border border-white/20 text-gray-400 hover:border-white/40"}`}
                                        >
                                            Square Feet
                                        </button>
                                    </div>

                                    <div className="mb-8">
                                        <input
                                            type="number"
                                            placeholder={`Enter Total ${unit}...`}
                                            value={capacity}
                                            onChange={(e) => setCapacity(e.target.value)}
                                            className="w-full max-w-md rounded-sm border border-white/20 bg-transparent p-3 text-[15px] text-white placeholder:text-gray-400 focus:border-[#7bc0cd] focus:outline-none"
                                        />
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        disabled={!capacity || Number(capacity) <= 0}
                                        className="rounded-full bg-gradient-to-r from-[#80c8d4] to-[#458092] px-8 py-3 text-sm font-medium tracking-wider text-white transition-all hover:brightness-110 disabled:opacity-50"
                                    >
                                        CONTINUE &gt;
                                    </button>
                                </div>
                            )}

                            {/* Step 2: Duration */}
                            {step === 2 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-lg font-semibold uppercase tracking-wider mb-8">Step 2: Lease Duration</h3>

                                    <div className="mb-12 max-w-xl">
                                        <div className="mb-4 flex justify-between font-display text-2xl font-bold text-foreground">
                                            <span>{duration} Months</span>
                                            <span className="text-sm font-normal text-muted-foreground self-end mb-1">{duration >= 12 ? `${(duration / 12).toFixed(1)} Years` : ''}</span>
                                        </div>

                                        <input
                                            type="range"
                                            min="1"
                                            max="60"
                                            value={duration}
                                            onChange={(e) => setDuration(Number(e.target.value))}
                                            className="w-full accent-primary h-2 bg-border rounded-lg appearance-none cursor-pointer"
                                        />
                                        <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                                            <span>1 Month</span>
                                            <span>5 Years</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => setStep(1)}
                                            className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-3 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handleNext}
                                            className="flex items-center gap-2 rounded-full bg-cyan-400 px-8 py-3 text-sm font-bold uppercase tracking-wider text-[#0b1f2a] transition-all hover:bg-cyan-300"
                                        >
                                            Calculate ROI <TrendingUp size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Results */}
                            {step === 3 && (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="grid gap-8 md:grid-cols-2">
                                        {/* Space Optimization */}
                                        <div className="rounded-sm border border-primary/20 bg-primary/5 p-6">
                                            <div className="mb-4 flex items-center gap-3 text-primary">
                                                <TrendingDown size={24} />
                                                <h4 className="font-display text-lg font-bold uppercase tracking-tight">Space Optimization</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                                Nexus Grade-A facilities feature 12m+ clear heights. This enables vertical racking that increases pallet density by up to 30% compared to traditional Grade-B warehouses.
                                            </p>
                                            <div className="flex flex-col gap-2">
                                                <div className="flex justify-between items-end border-b border-border/50 pb-2">
                                                    <span className="text-xs uppercase tracking-wider text-muted-foreground">Standard Area Req:</span>
                                                    <span className="line-through text-muted-foreground">{baseSqFt.toLocaleString()} sq ft</span>
                                                </div>
                                                <div className="flex justify-between items-end pt-2">
                                                    <span className="text-xs font-bold uppercase tracking-wider text-foreground">Nexus Grade-A Req:</span>
                                                    <span className="font-display text-2xl font-bold text-primary">{optimizedSqFt.toLocaleString()} sq ft</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Cost Savings */}
                                        <div className="rounded-sm border border-emerald-500/20 bg-emerald-500/5 p-6">
                                            <div className="mb-4 flex items-center gap-3 text-emerald-500">
                                                <CheckCircle2 size={24} />
                                                <h4 className="font-display text-lg font-bold uppercase tracking-tight">Projected Savings</h4>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                                                By reducing physical footprint and leveraging shared enterprise operational costs over a {duration}-month term.
                                            </p>
                                            <div className="pt-4 border-t border-emerald-500/20">
                                                <span className="text-xs uppercase tracking-wider text-muted-foreground block mb-1">Estimated Total Savings</span>
                                                <span className="font-display text-4xl font-bold text-emerald-500 flex items-center gap-1">
                                                    ₹{totalSavings.toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 flex flex-wrap gap-4 items-center border-t border-border/50 pt-8">
                                        <button
                                            onClick={() => onComplete(optimizedSqFt)}
                                            className="flex items-center gap-2 rounded-full bg-cyan-400 px-8 py-4 font-display text-sm font-bold uppercase tracking-wider text-[#0b1f2a] transition-all hover:shadow-lg hover:shadow-cyan-400/25"
                                        >
                                            View Recommended Warehouses <ArrowRight size={16} />
                                        </button>
                                        <button
                                            onClick={() => { setStep(1); setCapacity(""); }}
                                            className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-8 py-4 text-sm font-bold uppercase tracking-wider text-white transition-all hover:bg-white/10"
                                        >
                                            Recalculate
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ROICalculator;
