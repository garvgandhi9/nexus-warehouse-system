import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Shield, Settings } from "lucide-react";

const navLinks = [
  { label: "Listings", to: "/listings" },
  { label: "Nexus Prime", to: "/nexus-prime" },
  { label: "Contact Us", to: "/contact" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminToken = sessionStorage.getItem("admin_token");
    const userStr = localStorage.getItem("user");

    if (adminToken) {
      setIsLoggedIn(true);
      setIsAdmin(true);
      return;
    }

    setIsLoggedIn(!!token);

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsAdmin(!!user.isAdmin);
      } catch (e) {
        setIsAdmin(false);
      }
    } else {
      setIsAdmin(false);
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("admin_token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/");
  };

  return (
    <div className="fixed top-6 sm:top-8 left-0 right-0 z-50 flex items-center justify-between px-6 sm:px-12 md:px-16 pointer-events-none">
      {/* Brand / Logo - Now inside a matching pill */}
      <div className="pointer-events-auto rounded-full border border-white/10 bg-[#0A0B10]/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_25px_rgba(34,211,238,0.15)] transition-all duration-500 px-6 py-2 flex items-center justify-center h-12">
        <Link 
          to="/" 
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} 
          className="flex items-center group transition-all duration-300"
        >
          <img 
            src="/logo.png" 
            alt="NEXUS" 
            className="h-7 w-auto opacity-100 transition-opacity"
            onError={(e) => {
              // Fallback to text if logo.png isn't found yet
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.insertAdjacentHTML('beforeend', '<span class="font-display text-lg font-black tracking-tighter text-foreground group-hover:text-primary transition-colors">NEXUS</span>');
            }}
          />
        </Link>
      </div>

      {/* Navigation Pill */}
      <nav className="pointer-events-auto rounded-full border border-white/10 bg-[#0A0B10]/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.3),0_0_20px_rgba(34,211,238,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_25px_rgba(34,211,238,0.15)] transition-all duration-500">
        <div className="flex h-12 items-center px-6 gap-6">
          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === link.to ? "text-primary" : "text-muted-foreground/80"
                  }`}
              >
                {link.label}
              </Link>
            ))}
            
            <Link
              to={isLoggedIn ? (isAdmin ? "/admin" : "/submit") : "/login"}
              className="text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary text-muted-foreground/80"
            >
              Add Listing
            </Link>

            <div className="h-4 w-px bg-white/10 mx-1" />

            {isLoggedIn ? (
              <div className="flex items-center gap-5">
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === (isAdmin ? "/admin" : "/dashboard") ? "text-primary" : "text-muted-foreground/80"}`}
                >
                  {isAdmin ? <Shield size={14} className="text-primary" /> : <LayoutDashboard size={14} />}
                  <span>Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-muted-foreground/60 hover:text-red-500 transition-colors"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === "/login" ? "text-primary" : "text-muted-foreground/80"}`}
              >
                Log In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="text-foreground md:hidden p-2"
            aria-label="Toggle menu"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu - anchored to the pill */}
        {open && (
          <div className="absolute top-[calc(100%+12px)] right-0 min-w-[240px] rounded-[24px] border border-white/10 bg-[#0A0B10]/95 backdrop-blur-3xl md:hidden overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-300 origin-top-right">
            <div className="flex flex-col p-4 gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] transition-all hover:bg-white/5 ${location.pathname === link.to ? "text-primary bg-white/5" : "text-muted-foreground"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-white/5 my-2" />
              <Link
                to={isLoggedIn ? (isAdmin ? "/admin" : "/submit") : "/login"}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:bg-white/5"
              >
                + Add Listing
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground hover:bg-white/5"
              >
                Log In
              </Link>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};

export default Navbar;
