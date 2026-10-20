import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { ShoppingBag, UtensilsCrossed, ArrowUpRight } from "lucide-react";
export default function RestaurantLayout() {
  const location = useLocation();
  return (
    <div className="restaurant-shell">
      <header className="r-header">
        <Link to="/project_2/" className="r-brand">
          <span className="r-brand-mark">
            <UtensilsCrossed size={18} />
          </span>
          <span>
            PLUM<span className="brand-light"> & PLATE</span>
            <small>NEIGHBOURHOOD KITCHEN</small>
          </span>
        </Link>
        <nav>
          <NavLink end to="/project_2/">
            Overview
          </NavLink>
          <NavLink to="/project_2/menu">Menu</NavLink>
          <Link to={{ pathname: "/project_2/", hash: "#how-it-works" }}>How it works</Link>
        </nav>
        <div className="r-header-actions">
          {/* <Link className="r-admin-link" to="/project_2/admin">
            Admin <ArrowUpRight size={14} />
          </Link> */}
          <Link className="r-cart-link" to="/project_2/menu">
            <ShoppingBag size={17} /> Order now
          </Link>
        </div>
      </header>
      <main key={location.pathname}>
        <Outlet />
      </main>
      <footer className="r-footer">
        <Link to="/project_2/" className="r-brand">
          <span className="r-brand-mark">
            <UtensilsCrossed size={18} />
          </span>
          <span>
            PLUM<span className="brand-light"> & PLATE</span>
            <small>NEIGHBOURHOOD KITCHEN</small>
          </span>
        </Link>
        <p>Good food. Good company. No waiting around.</p>
        <span>Demo ordering experience · Project 02</span>
      </footer>
    </div>
  );
}