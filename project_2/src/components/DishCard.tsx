import { useState } from "react";
import { Check, Plus, UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "../types";
import { money } from "../hooks/cart";
export default function DishCard({ dish, onAdd }: { dish: MenuItem; onAdd: (d: MenuItem) => void }) {
  const [added, setAdded] = useState(false);
  const [broken, setBroken] = useState(false);
  return (
    <article className="sv-dish">
      <div className="sv-dish-img">
        {dish.is_featured && <span className="sv-badge">Best Seller</span>}
        {broken || !dish.image_url ? <div className="sv-noimg"><UtensilsCrossed /></div> : <img src={dish.image_url} alt={dish.name} loading="lazy" onError={() => setBroken(true)} />}
      </div>
      <h3>{dish.name}</h3>
      <p>{dish.description}</p>
      <div className="sv-dish-foot">
        <b>{money(dish.price)}</b>
        <span className={`sv-veg ${dish.is_vegetarian ? "" : "non"}`} title={dish.is_vegetarian ? "Vegetarian" : "Non-vegetarian"} />
        <button className={added ? "added" : ""} aria-label={`Add ${dish.name}`} onClick={() => { onAdd(dish); setAdded(true); window.setTimeout(() => setAdded(false), 1200); }}>
          {added ? <Check size={16} /> : <Plus size={16} />}
        </button>
      </div>
    </article>
  );
}
