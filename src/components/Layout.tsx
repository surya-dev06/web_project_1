import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import ScrollToTop from "./ScrollToTop";
export const Mark = () => <svg width="34" height="30" viewBox="0 0 34 30" aria-hidden><path d="M17 1 33 29H1z" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinejoin="round" /><path d="M17 9 27 27H7z" fill="#5b9bc4" /></svg>;
export const Brand = () => <Link to="/project_1/" className="ax-brand"><Mark /><span>SURYA<small>STUDIO</small></span></Link>;
export function Layout() {
  const [open, setOpen] = useState(false);
  const [solid, setSolid] = useState(false);
  const { pathname } = useLocation();
  const home = /^\/project_1\/?$/.test(pathname);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => { const f = () => setSolid(window.scrollY > 40); f(); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <div className="ax">
      <ScrollToTop />
      <header className={`ax-header ${home ? "over" : ""} ${solid ? "solid" : ""}`}>
        <Brand />
        <button className="ax-burger" aria-label="Toggle menu" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
        <nav className={open ? "open" : ""}>
          <NavLink end to="/project_1/">Home</NavLink>
          <NavLink to="/project_1/services">Services</NavLink>
          <NavLink to="/project_1/work">Projects</NavLink>
          <NavLink to="/project_1/about">About</NavLink>
          <Link className="ax-cta" to="/project_1/contact">Contact Us</Link>
        </nav>
      </header>
      <main><Outlet /></main>
      <footer className="ax-footer">
        <div><Brand /><p>Websites, web apps and payment-ready stores for growing businesses.</p></div>
        <div className="ax-footer-links"><Link to="/project_1/services">Services</Link><Link to="/project_1/work">Projects</Link><Link to="/project_1/contact">Contact</Link><Link to="/project_1/privacy">Privacy Policy</Link><Link to="/project_1/terms">Terms &amp; Conditions</Link></div>
        <small>© {new Date().getFullYear()} Surya Studio. All rights reserved.</small>
      </footer>
    </div>
  );
}
