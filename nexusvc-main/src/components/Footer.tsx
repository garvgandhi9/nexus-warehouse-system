import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-white/5 bg-[#0a0c10] text-white">
    <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
      <div className="grid gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Link to="/" className="font-display text-2xl font-bold tracking-tight text-foreground">
            NEXUS
          </Link>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
            India's intelligent flexible warehousing and Build-to-Suit infrastructure network. Engineering the backbone of modern logistics.
          </p>
        </div>
        <div>
          <h4 className="mb-4 font-display text-xs font-semibold uppercase tracking-widest text-foreground">Navigate</h4>
          <div className="flex flex-col gap-3">
            {[
              { label: "Listings", to: "/listings" },
              { label: "Nexus Prime", to: "/nexus-prime" },
              { label: "Contact", to: "/contact" },
            ].map((l) => (
              <Link key={l.to} to={l.to} className="text-sm text-muted-foreground transition-colors hover:text-primary">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="mb-4 font-display text-xs font-semibold uppercase tracking-widest text-foreground">Connect</h4>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <span>info@nexus.in</span>
            <span>+91 22 4000 5000</span>
            <span>Mumbai, India</span>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t border-border/50 pt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nexus. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
