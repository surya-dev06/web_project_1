import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, ShoppingCart } from "lucide-react";
import { demoMenu } from "../data/menu";
import { supabase } from "../lib/supabase";
import type { MenuItem } from "../types";
import DishCard from "../components/DishCard";
import { money, useCart } from "../hooks/cart";
export default function MenuPage() {
  const [sp] = useSearchParams();
  const [menu, setMenu] = useState<MenuItem[]>(demoMenu);
  const [cat, setCat] = useState(sp.get("category") || "All");
  const [q, setQ] = useState(sp.get("q") || "");
  const [veg, setVeg] = useState(false);
  const { add, count, total } = useCart();
  useEffect(() => { void (async () => { if (!supabase) return; const { data } = await supabase.from("menu_items").select("*").eq("is_available", true).order("created_at"); if (data?.length) setMenu(data as MenuItem[]); })(); }, []);
  const cats = ["All", ...Array.from(new Set(menu.map((d) => d.category)))];
  const shown = useMemo(() => menu.filter((d) => (cat === "All" || d.category === cat) && (!veg || d.is_vegetarian) && `${d.name} ${d.description}`.toLowerCase().includes(q.toLowerCase())), [menu, cat, veg, q]);
  return (
    <section className="sv-section">
      <h2>Our Menu</h2>
      <div className="sv-toolbar">
        <div className="sv-tabs">{cats.map((c) => <button key={c} className={c === cat ? "on" : ""} onClick={() => setCat(c)}>{c}</button>)}</div>
        <label className="sv-search"><Search size={16} /><input placeholder="Find a dish…" value={q} onChange={(e) => setQ(e.target.value)} /></label>
        <button className={`sv-vegbtn ${veg ? "on" : ""}`} onClick={() => setVeg(!veg)}><span className="sv-veg" /> Veg only</button>
      </div>
      <div className="sv-grid">{shown.map((d) => <DishCard key={d.id} dish={d} onAdd={add} />)}</div>
      {!shown.length && <p className="sv-empty">No dishes match your search.</p>}
      {count > 0 && <Link to="/project_2/cart" className="sv-cartbar"><ShoppingCart size={18} /> {count} item{count > 1 ? "s" : ""} · {money(total)} <b>View cart →</b></Link>}
    </section>
  );
}
