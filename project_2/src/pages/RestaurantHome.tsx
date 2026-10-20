import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CakeSlice, CupSoda, Pizza, Salad, Sandwich, Soup, Utensils } from "lucide-react";
import { demoMenu } from "../data/menu";
import { supabase } from "../lib/supabase";
import type { MenuItem } from "../types";
import DishCard from "../components/DishCard";
import { useCart } from "../hooks/cart";
const icon = (c: string) => { const k = c.toLowerCase(); return k.includes("pizza") ? Pizza : k.includes("burger") ? Sandwich : k.includes("pasta") ? Soup : k.includes("dessert") ? CakeSlice : k.includes("drink") ? CupSoda : k.includes("start") ? Salad : Utensils; };
export default function RestaurantHome() {
  const [menu, setMenu] = useState<MenuItem[]>(demoMenu);
  const [tab, setTab] = useState("");
  const { add } = useCart();
  useEffect(() => { void (async () => { if (!supabase) return; const { data } = await supabase.from("menu_items").select("*").eq("is_available", true).order("created_at"); if (data?.length) setMenu(data as MenuItem[]); })(); }, []);
  const cats = useMemo(() => Array.from(new Set(menu.map((d) => d.category))), [menu]);
  const active = tab || cats[0] || "";
  const shown = menu.filter((d) => d.category === active).slice(0, 8);
  return (
    <>
      <section className="sv-hero">
        <div className="sv-hero-copy">
          <h1>Delicious Moments<br />for Every Taste</h1>
          <p>Experience culinary excellence crafted with passion and fresh, locally-sourced ingredients.</p>
          <div><Link to="/project_2/menu" className="sv-btn">Order Now</Link><Link to="/project_2/menu" className="sv-btn ghost">View Menu</Link></div>
        </div>
        <img src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=1100&q=85" alt="Chef plating a dish" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </section>
      <section className="sv-section"><h2>Browse By Category</h2>
        <div className="sv-cats">{cats.map((c) => { const I = icon(c); return <Link key={c} to={`/project_2/menu?category=${encodeURIComponent(c)}`}><span><I size={34} strokeWidth={1.5} /></span>{c}</Link>; })}</div>
      </section>
      <section className="sv-section"><h2>Popular Dishes</h2>
        <div className="sv-tabs">{cats.map((c) => <button key={c} className={c === active ? "on" : ""} onClick={() => setTab(c)}>{c}</button>)}</div>
        <div className="sv-grid">{shown.map((d) => <DishCard key={d.id} dish={d} onAdd={add} />)}</div>
      </section>
    </>
  );
}
