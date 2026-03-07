import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { API_ENDPOINTS } from "@/lib/api-config";
import { Mail, Phone, MapPin, Send, Loader2 } from "lucide-react";
import { useFormValidation } from "@/hooks/useFormValidation";

const requirementTypes = ["Flexible Warehousing", "Build-to-Suit", "Managed Network", "Other"];

const Contact = () => {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const location = useLocation();
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
    if (isFormValid()) {
      try {
        const isPrime = localStorage.getItem("nexus_prime") === "1";

        // Extract routing state variables, fallback to defaults
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          setSubmitted(true);
          localStorage.removeItem("nexus_prime"); // Clear after submission
        } else {
          console.error("Failed to send message");
        }
      } catch (err) {
        console.error("Error sending message:", err);
      }
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
              <p className="font-display text-xs font-semibold uppercase tracking-[0.3em] text-primary">Get in Touch</p>
              <h1 className="mt-4 font-display text-4xl font-bold uppercase leading-tight tracking-tight text-foreground sm:text-6xl">
                Let's Talk
                <br />
                <span className="text-gradient">Infrastructure</span>
              </h1>
              <p className="mt-6 max-w-md text-lg text-muted-foreground">
                Whether you're looking for ready facilities or a custom-built solution, our team is ready to help.
              </p>

              <div className="mt-12 flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <MapPin size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Mumbai, Maharashtra</p>
                    <p className="text-xs text-muted-foreground">BKC, Bandra East</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <Phone size={18} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">+91 22 4000 5000</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-primary/10">
                    <Mail size={18} className="text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground">info@wareflux.in</p>
                </div>
              </div>
            </div>

            {/* Right — Form */}
            <div className="rounded-sm border border-border/50 bg-card p-8 lg:p-10">
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
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} required className={getInputStyles("name")} placeholder="Your name" />
                    {errors.name && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</label>
                      <input name="email" value={formData.email} onChange={handleChange} required type="email" className={getInputStyles("email")} placeholder="you@company.com" />
                      {errors.email && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Phone (10 Digits)</label>
                      <input name="phone" value={formData.phone} onChange={handleChange} required className={getInputStyles("phone")} placeholder="9876543210" />
                      {errors.phone && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Requirement Category</label>
                    <select name="category" value={formData.category} onChange={handleChange} required className={getInputStyles("category")}>
                      <option value="">Select type</option>
                      {requirementTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.category}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-medium uppercase tracking-widest text-muted-foreground">Message</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} required rows={4} className={getInputStyles("message") + " resize-none"} placeholder="Tell us about your requirements..." />
                    {errors.message && <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-red-500">{errors.message}</p>}
                  </div>
                  <button
                    disabled={!isFormValid()}
                    type="submit"
                    className="mt-2 flex items-center justify-center gap-2 rounded-sm bg-primary px-6 py-4 font-display text-sm font-semibold uppercase tracking-wider text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isFormValid() ? "Send Message" : "Complete Form"} <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default Contact;
