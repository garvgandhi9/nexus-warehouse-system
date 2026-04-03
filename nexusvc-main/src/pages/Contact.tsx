import { useState } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Mail, Phone, MapPin, Send } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";

const requirementTypes = ["Flexible Warehousing", "Build-to-Suit", "Managed Network", "Other"];

const Contact = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const location = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    values: formData,
    handleChange,
    getInputStyles,
    getFieldError,
    isValid: isFormValid,
    setServerErrors,
  } = useFormValidation({
    name: "",
    email: "",
    phone: "",
    category: "",
    message: ""
  }, {
    name: { required: true },
    email: { required: true, isEmail: true },
    phone: { required: true, isPhone: true },
    category: { required: true },
    message: { required: true },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setLoading(true);
    setError("");
    try {
      const isPrime = localStorage.getItem("nexus_prime") === "1";
      const locationState = location.state as { source?: string; context?: string; category?: string } | null;
      const payload = {
        ...formData,
        category: locationState?.category || formData.category,
        source: locationState?.source || "Direct Contact",
        context: locationState?.context || "General",
        tier: isPrime ? "Prime" : "Standard"
      };
      const response = await fetch(API_ENDPOINTS.CONTACT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) {
        if (data.field) {
          setServerErrors({ [data.field]: data.error });
        } else {
          setError(data.error || "Failed to send message. Please try again.");
        }
        return;
      }
      localStorage.removeItem("nexus_prime");
      setSubmitted(true);
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Connection failed. Please check your internet and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24">
        <section ref={ref} className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
          <div className={`grid gap-16 lg:grid-cols-2 transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>

            {/* Left */}
            <div className="flex flex-col justify-center">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">Tell us what you need</p>
              <h1 className="mt-4 font-display text-[3.5rem] md:text-[4.5rem] font-bold uppercase leading-[0.9] tracking-tighter text-white">
                Let's Talk
                <br />
                <span className="text-[#a4dbe4]">Infrastructure</span>
              </h1>
              <p className="mt-8 max-w-lg text-[13px] leading-relaxed text-gray-400 font-medium text-justify">
                Whether you're exploring ready-to-move facilities or planning a custom-built solution, our team is here to guide you. Nexus Prime streamlines logistics conversations; we listen, understand your requirements, and help shape the right strategy for your business.
              </p>

              <div className="mt-12 flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 shrink-0">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Our Address</p>
                    <p className="text-sm font-medium text-foreground">B 307, Everest Grande, Shanti Nagar</p>
                    <p className="text-xs text-muted-foreground">Andheri East, Mumbai – 93</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 shrink-0">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Phone</p>
                    <p className="text-sm font-medium text-foreground">+91 9967468946</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10 shrink-0">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Email</p>
                    <p className="text-sm font-medium text-foreground">nexus.vcs@bismarckgroup.in</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="rounded-tl-2xl rounded-br-2xl rounded-tr-[10rem] rounded-bl-[10rem] border border-white/10 bg-[#112431] p-12 shadow-2xl relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-cyan-400/5 blur-[100px]" />

              <div className="relative z-10 px-4">
              {submitted ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Send size={24} className="text-primary" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold uppercase text-foreground">Message Sent</h3>
                  <p className="mt-3 text-muted-foreground">We'll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="mb-2">
                    <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary mb-1">Inquiry Form</p>
                    <p className="text-sm text-muted-foreground">A strategic partnership begins with a conversation. Share your details and requirements, and we'll connect you with the right solutions.</p>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-sm text-red-500 text-xs font-bold uppercase tracking-wider text-center">
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7bc0cd]">Your Full Name</label>
                    <input 
                      name="name" 
                      value={formData.name} 
                      onChange={handleChange} 
                      className="w-full rounded-sm border border-white/20 bg-transparent p-3 text-[15px] text-white placeholder:text-gray-500 focus:border-[#7bc0cd] focus:outline-none transition-all" 
                      placeholder="Your full name" 
                    />
                    {getFieldError("name") && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{getFieldError("name")}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7bc0cd]">Business Email</label>
                      <input 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        type="email" 
                        className="w-full rounded-sm border border-white/20 bg-transparent p-3 text-[15px] text-white placeholder:text-gray-500 focus:border-[#7bc0cd] focus:outline-none transition-all" 
                        placeholder="you@company.com" 
                      />
                      {getFieldError("email") && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{getFieldError("email")}</p>}
                    </div>
                    <div>
                      <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7bc0cd]">10-Digit Contact Number</label>
                      <input 
                        name="phone" 
                        value={formData.phone} 
                        onChange={handleChange} 
                        className="w-full rounded-sm border border-white/20 bg-transparent p-3 text-[15px] text-white placeholder:text-gray-500 focus:border-[#7bc0cd] focus:outline-none transition-all" 
                        placeholder="9876543210" 
                      />
                      {getFieldError("phone") && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{getFieldError("phone")}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7bc0cd]">Requirement Category</label>
                    <select 
                      name="category" 
                      value={formData.category} 
                      onChange={handleChange} 
                      className="w-full rounded-sm border border-white/20 bg-transparent p-3 text-[15px] text-white placeholder:text-gray-500 focus:border-[#7bc0cd] focus:outline-none transition-all appearance-none"
                    >
                      <option value="" className="bg-[#112431]">Select type</option>
                      {requirementTypes.map((t) => (
                        <option key={t} value={t} className="bg-[#112431]">{t}</option>
                      ))}
                    </select>
                    {getFieldError("category") && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{getFieldError("category")}</p>}
                  </div>

                  <div>
                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.2em] text-[#7bc0cd]">Message</label>
                    <textarea 
                      name="message" 
                      value={formData.message} 
                      onChange={handleChange} 
                      rows={4} 
                      className="w-full rounded-sm border border-white/20 bg-transparent p-3 text-[15px] text-white placeholder:text-gray-500 focus:border-[#7bc0cd] focus:outline-none transition-all resize-none" 
                      placeholder="Describe your scale, geography, and specific logistics needs..." 
                    />
                    {getFieldError("message") && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{getFieldError("message")}</p>}
                  </div>

                  <button
                    disabled={!isFormValid() || loading}
                    type="submit"
                    className="mt-6 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#80c8d4] to-[#458092] px-8 py-3.5 font-display text-sm font-bold uppercase tracking-widest text-white transition-all hover:shadow-lg hover:shadow-cyan-400/20 hover:brightness-110 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {loading ? "Sending..." : isFormValid() ? "Send Message" : "Complete Form"}
                    <Send size={16} />
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

export default Contact;