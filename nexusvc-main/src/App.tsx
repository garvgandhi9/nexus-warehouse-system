import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/index";
import Listings from "./pages/Listings";
import WarehouseDetail from "./pages/WarehouseDetail";
import NexusPrime from "./pages/NexusPrime";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import SubmitWarehouse from "./pages/SubmitWarehouse";
import GlobeDemo from "./pages/GlobeDemo";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  useEffect(() => {
    // Session Cleanup Logic
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode middle part of JWT (payload) using base64 decoding (atob)
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/"); // Convert base64url to base64
        const jsonPayload = decodeURIComponent(atob(base64).split("").map(c => 
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join(''));
        
        const payload = JSON.parse(jsonPayload);
        const now = Date.now() / 1000;
        
        if (payload.exp && now >= payload.exp) {
          console.warn("[APP] Token expired. Clearing auth data.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      } catch (err) {
        console.error("[APP] Failed to parse or check token expiry:", err);
      }
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/listings/:id" element={<WarehouseDetail />} />
          <Route path="/nexus-prime" element={<NexusPrime />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/submit" element={<SubmitWarehouse />} />
          <Route path="/globe" element={<GlobeDemo />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
