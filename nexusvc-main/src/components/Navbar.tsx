import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard, PlusCircle, Shield, Settings } from "lucide-react";

const navLinks = [
  { label: "Listings", to: "/listings" },
  { label: "Globe", to: "/globe" },
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
    const userStr = localStorage.getItem("user");
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
    <nav className="fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-primary/40 bg-background/60 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-all duration-500 max-w-[95vw]">
      <div className="flex h-14 items-center px-4 sm:px-6 gap-2 sm:gap-6">
        {/* Brand */}
        <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="font-display text-base font-black tracking-tighter text-foreground shrink-0 pr-4 border-r border-primary/10 hover:text-primary transition-colors">
          NEXUS
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <div className="flex items-center gap-5">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === link.to ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="h-6 w-px bg-primary/10 mx-1" />

          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === (isAdmin ? "/admin" : "/dashboard") ? "text-primary" : "text-muted-foreground"}`}
                >
                  {isAdmin ? <Shield size={14} className="opacity-70 text-primary" /> : <LayoutDashboard size={14} className="opacity-70" />}
                  <span>{isAdmin ? "Admin Console" : "Dashboard"}</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  to="/login"
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${location.pathname === "/login" ? "text-primary" : "text-muted-foreground"}`}
                >
                  <span>Log In</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="text-foreground md:hidden ml-auto p-2"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="absolute top-16 left-0 right-0 rounded-2xl border border-primary/40 bg-background/98 backdrop-blur-2xl md:hidden overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col p-4 gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-primary/10 ${location.pathname === link.to ? "text-primary bg-primary/5" : "text-muted-foreground"
                  }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="h-px bg-primary/10 my-2" />

            {isLoggedIn ? (
              <>
                <Link
                  to={isAdmin ? "/admin" : "/dashboard"}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-primary/10 ${location.pathname === (isAdmin ? "/admin" : "/dashboard") ? "text-primary bg-primary/5" : "text-muted-foreground"
                    }`}
                >
                  {isAdmin ? <Shield size={16} /> : <LayoutDashboard size={16} />}
                  {isAdmin ? "Admin Command Center" : "Dashboard"}
                </Link>
                <button
                  onClick={() => { handleLogout(); setOpen(false); }}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-red-500/10 hover:text-red-500 text-left transition-colors"
                >
                  <LogOut size={16} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors hover:bg-primary/10 ${location.pathname === "/login" ? "text-primary bg-primary/5" : "text-muted-foreground"}`}
                >
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
