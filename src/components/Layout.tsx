import { Link, NavLink, Outlet } from "react-router-dom";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import ScrollToTop from "./ScrollToTop";
const nav = [
  ["Services", "/project_1/services"],
  ["Selected work", "/project_1/work"],
  ["About", "/project_1/about"],
  ["Contact", "/project_1/contact"],
];
export function Layout() {
  const [open, setOpen] = useState(false);
  const whatsapp = `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210"}?text=${encodeURIComponent("Hi surya Studio, I would like to discuss a website project.")}`;
  return (
    <>
      <ScrollToTop />
      <header className="site-header">
        <Link to="/project_1" className="wordmark" onClick={() => setOpen(false)}>
          <span className="mark">N</span> SURYA
          <span className="wordmark-light">/STUDIO</span>
        </Link>
        <button
          className="mobile-menu"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? "nav nav-open" : "nav"}>
          {nav.map(([label, path]) => (
            <NavLink key={path} to={path} onClick={() => setOpen(false)}>
              {label}
            </NavLink>
          ))}
          <a
            className="nav-cta"
            href={whatsapp}
            target="_blank"
            rel="noreferrer"
          >
            Let’s talk <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="footer">
        <div>
          <Link to="/project_1" className="wordmark">
            <span className="mark">N</span> SURYA/STUDIO
          </Link>
          <p>Good businesses deserve a better digital presence.</p>
        </div>
        <div className="footer-links">
          <Link to="/project_1/privacy">Privacy</Link>
          <Link to="/project_1/terms">Terms</Link>
          <a href="https://github.com/" target="_blank" rel="noreferrer">
            Open source tools ↗
          </a>
        </div>
        <small>
          © {new Date().getFullYear()} surya Studio. Replace this demo brand
          and copy before launch.
        </small>
      </footer>
    </>
  );
}
