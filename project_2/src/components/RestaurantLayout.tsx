import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { useCart } from "../hooks/cart";
const phone = import.meta.env.VITE_RESTAURANT_PHONE as string | undefined;
const email = import.meta.env.VITE_RESTAURANT_EMAIL as string | undefined;
const Logo = () => <Link to="/project_2/" className="sv-logo">PLUM &amp; PLATE<small>— NEIGHBOURHOOD KITCHEN —</small></Link>;
export default function RestaurantLayout() {
  const { count } = useCart();
  const loc = useLocation();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [bump, setBump] = useState(false);
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  useEffect(() => { if (!count) return; setBump(true); const t = window.setTimeout(() => setBump(false), 400); return () => window.clearTimeout(t); }, [count]);
  return (
    <div className="sv-page">
      <div className="sv-topbar">
        <span>{phone ? `Call Us: ${phone}` : "Cooked fresh, served to your table"}{email && <> &nbsp;|&nbsp; Email: {email}</>}</span>
        <span>Order from your table — no waiting around</span>
      </div>
      <header className="sv-header">
        <Logo />
        <nav className={open ? "open" : ""}>
          <NavLink end to="/project_2/">Home</NavLink>
          <NavLink to="/project_2/menu">Menu</NavLink>
          <NavLink to="/project_2/about">About</NavLink>
          <NavLink to="/project_2/contact">Contact</NavLink>
        </nav>
        <div className="sv-actions">
          <form onSubmit={(e) => { e.preventDefault(); nav(`/project_2/menu?q=${encodeURIComponent(q)}`); }}>
            <input aria-label="Search dishes" placeholder="Search dishes" value={q} onChange={(e) => setQ(e.target.value)} />
            <button aria-label="Search"><Search size={17} /></button>
          </form>
          <Link to="/project_2/cart" className={`sv-cart ${bump ? "bump" : ""}`} aria-label="Cart"><ShoppingCart size={18} />{count > 0 && <i>{count}</i>}</Link>
          <button className="sv-burger" aria-label="Menu" onClick={() => setOpen(!open)}><span /><span /><span /></button>
        </div>
      </header>
      <main key={loc.pathname} className="sv-fade"><Outlet /></main>
      <section className="sv-cta"><h2>Taste the Best, Order Now</h2><Link to="/project_2/menu" className="sv-btn light">Order Online</Link></section>
      <footer className="sv-footer">
        <Logo />
        <div><Link to="/project_2/menu">Menu</Link><Link to="/project_2/about">About</Link><Link to="/project_2/contact">Contact</Link><Link to="/project_2/terms">Terms &amp; Conditions</Link><Link to="/project_2/privacy">Privacy Policy</Link></div>
        <small>© {new Date().getFullYear()} Plum &amp; Plate. All rights reserved.</small>
      </footer>
    </div>
  );
}
