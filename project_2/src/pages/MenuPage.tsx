import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
} from "lucide-react";
import { demoMenu } from "../data/menu";
import { supabase } from "../lib/supabase";
import type { CartItem, MenuItem } from "../types";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export default function MenuPage() {
    const [searchParams] = useSearchParams();
  const table = searchParams.get("table");
  const [menu, setMenu] = useState<MenuItem[]>(demoMenu),
    [category, setCategory] = useState("All"),
    [search, setSearch] = useState(""),
    [veg, setVeg] = useState(false),
    [cart, setCart] = useState<CartItem[]>(() => {
      try {
        return JSON.parse(sessionStorage.getItem("pp-cart") || "[]");
      } catch {
        return [];
      }
    });
  useEffect(() => {
    (async () => {
      if (!supabase) return;
      const { data } = await supabase
        .from("menu_items")
        .select("*")
        .eq("is_available", true)
        .order("created_at");
      if (data?.length) setMenu(data as MenuItem[]);
    })();
  }, []);
  const categories = [
    "All",
    ...Array.from(new Set(menu.map((d) => d.category))),
  ];
  const visible = useMemo(
    () =>
      menu.filter(
        (d) =>
          (category === "All" || d.category === category) &&
          (!veg || d.is_vegetarian) &&
          `${d.name} ${d.description}`
            .toLowerCase()
            .includes(search.toLowerCase()) &&
          d.is_available,
      ),
    [menu, category, veg, search],
  );
  const add = (dish: MenuItem) => {
    const next = cart.some((x) => x.id === dish.id)
      ? cart.map((x) =>
          x.id === dish.id ? { ...x, quantity: x.quantity + 1 } : x,
        )
      : [...cart, { ...dish, quantity: 1 }];
    setCart(next);
    sessionStorage.setItem("pp-cart", JSON.stringify(next));
  };
  const count = cart.reduce((s, x) => s + x.quantity, 0);
  return (
    <div className="r-menu-page">
      <div className="r-menu-intro">
        <Link to="/project_2/" className="r-back-link">
          <ArrowLeft size={15} /> Back to home
        </Link>
        <div className="r-kicker">MADE WITH A LITTLE EXTRA LOVE</div>
        <h1>
          Our menu,
          <br />
          <em>your moment.</em>
        </h1>
        <p>Comfort food with a twist. Find your new favourite below.</p>
        <div className="r-menu-art">
          <span className="menu-scribble">YUM!</span>
          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85"
            alt="Freshly prepared colourful meal"
          />
        </div>
      </div>
      <div className="r-menu-content">
        <div className="r-menu-toolbar">
          <div className="r-category-tabs">
            {categories.map((c) => (
              <button
                key={c}
                className={category === c ? "selected" : ""}
                onClick={() => setCategory(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="r-menu-filters">
            <label className="r-search">
              <Search size={17} />
              <input
                placeholder="Find a dish..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button
              className={`r-veg-filter ${veg ? "on" : ""}`}
              onClick={() => setVeg(!veg)}
            >
              <SlidersHorizontal size={15} />
              {veg ? "Veg only ✓" : "Veg only"}
            </button>
          </div>
        </div>
        <div className="r-menu-grid">
          {visible.map((dish, i) => (
            <article
              className="r-menu-card"
              key={dish.id}
              style={{ animationDelay: `${i * 45}ms` }}
            >
              <div className="r-menu-card-image">
                <img src={dish.image_url} alt={dish.name} />
                <span
                  className={`r-veg-dot ${dish.is_vegetarian ? "" : "nonveg"}`}
                  title={dish.is_vegetarian ? "Vegetarian" : "Non-vegetarian"}
                />
                {dish.is_featured && (
                  <span className="r-popular-tag">POPULAR</span>
                )}
              </div>
              <div className="r-menu-card-copy">
                <div className="r-menu-title-row">
                  <h3>{dish.name}</h3>
                  <b>{money(dish.price)}</b>
                </div>
                <p>{dish.description}</p>
                <div className="r-menu-card-bottom">
                  <span>{dish.category}</span>
                  <button
                    aria-label={`Add ${dish.name} to cart`}
                    onClick={() => add(dish)}
                  >
                    <Plus size={16} /> Add
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
        {visible.length === 0 && (
          <div className="r-empty-menu">
            <Search size={28} />
            <h3>No dishes found</h3>
            <p>Try another search or clear your filters.</p>
            <button
              onClick={() => {
                setSearch("");
                setVeg(false);
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="r-menu-note">
          <Check size={17} /> Freshly prepared after you order. Please let our
          team know about any allergies.
        </div>
      </div>
      {count > 0 && (
        <Link
          className="r-cart-float"
          to={
            table
              ? `/project_2/cart?table=${encodeURIComponent(table)}`
              : "/project_2/cart"
          }
        >
          <ShoppingBag size={18} />
          <span>
            {count} item{count !== 1 ? "s" : ""} in your bag
          </span>
          <b>{money(cart.reduce((s, x) => s + x.price * x.quantity, 0))}</b>
          <ArrowUpRight size={17} />
        </Link>
      )}
    </div>
  );
}
