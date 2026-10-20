import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, NavLink, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { ArrowRight, Bell, Gem, Grid2x2, Heart, Home, LifeBuoy, LogOut, Menu, Minus, Package, Plus, Search, Settings, ShieldCheck, ShoppingBag, ShoppingCart, Sparkles, Tag, Trash2, Truck, Undo2, UserRound, X } from "lucide-react";
import type { CartItem, Product } from "./types";
import { ThemeToggle, type Theme } from "./theme";
import "./nova.css";

const money = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
const off = (p: Product) => (p.compare_at_price && p.compare_at_price > p.price ? Math.round((1 - p.price / p.compare_at_price) * 100) : 0);
const KEY = "nova-wish";
const readW = (): string[] => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
export function useWishlist() {
  const [ids, setIds] = useState<string[]>(readW);
  useEffect(() => { const f = () => setIds(readW()); window.addEventListener("nova-wish", f); return () => window.removeEventListener("nova-wish", f); }, []);
  const toggle = useCallback((id: string) => { const cur = readW(); const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]; try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ } window.dispatchEvent(new Event("nova-wish")); }, []);
  return { ids, toggle };
}
function Img({ p }: { p: Product }) {
  const [bad, setBad] = useState(false);
  const src = p.image_jpg || p.image_avif || p.image_svg;
  return bad || !src ? <div className="nv-noimg"><ShoppingBag /></div> : <img src={src} alt={p.name} loading="lazy" onError={() => setBad(true)} />;
}
export function NovaCard({ p, onAdd }: { p: Product; onAdd: (p: Product) => void }) {
  const { ids, toggle } = useWishlist();
  const d = off(p);
  return (
    <article className="nv-card">
      <Link to={`/e_comm/product/${p.slug}`} className="nv-card-img"><Img p={p} />{d > 0 && <span className="nv-off">-{d}%</span>}</Link>
      <button className={`nv-heart ${ids.includes(p.id) ? "on" : ""}`} aria-label="Wishlist" onClick={() => toggle(p.id)}><Heart size={15} /></button>
      <Link to={`/e_comm/product/${p.slug}`} className="nv-card-name">{p.name}<small>{p.category}</small></Link>
      <div className="nv-card-foot"><span><b>{money(p.price)}</b>{d > 0 && <s>{money(p.compare_at_price!)}</s>}</span>
        <button disabled={p.stock < 1} aria-label={`Add ${p.name} to cart`} onClick={() => onAdd(p)}>{p.stock < 1 ? "Sold out" : <ShoppingCart size={15} />}</button></div>
    </article>
  );
}
const catIcon = (c: string) => { const k = c.toLowerCase(); return k.includes("tech") || k.includes("elec") ? Gem : k.includes("home") ? Home : k.includes("beauty") ? Sparkles : k.includes("style") || k.includes("fashion") || k.includes("life") ? Tag : Grid2x2; };

export function NovaHome({ products, onAdd, loading }: { products: Product[]; onAdd: (p: Product) => void; loading: boolean }) {
  const [sp, setSp] = useSearchParams();
  const q = (sp.get("q") || "").toLowerCase();
  const cat = sp.get("cat") || "";
  const wish = sp.get("wish") === "1";
  const { ids } = useWishlist();
  const cats = useMemo(() => Array.from(new Set(products.map((p) => p.category))).slice(0, 6), [products]);
  const filtered = products.filter((p) => (!cat || p.category === cat) && (!wish || ids.includes(p.id)) && `${p.name} ${p.category} ${p.description}`.toLowerCase().includes(q));
  const filtering = Boolean(q || cat || wish);
  const deals = filtered.filter((p) => off(p) > 0);
  const rest = filtered.filter((p) => !deals.includes(p));
  const maxOff = Math.max(0, ...products.map(off));
  const newest = [...products].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];
  return (
    <div className="nv-home">
      {!filtering && <section className="nv-hero">
        <div className="nv-hero-copy"><span className="nv-pill">New Collection</span><h1>Find Your Style,<br />Love Your Look ✨</h1><p>Discover the latest trends in fashion, beauty, and lifestyle.</p><a className="nv-btn" href="#deals">Shop Now <ArrowRight size={15} /></a></div>
        <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      </section>}
      <section id="categories" className="nv-cats">{cats.map((c) => { const I = catIcon(c); return <button key={c} className={cat === c ? "on" : ""} onClick={() => setSp(cat === c ? {} : { cat: c })}><span><I size={22} /></span>{c}</button>; })}{cat && <button onClick={() => setSp({})}><span><X size={22} /></span>Clear</button>}</section>
      {!filtering && <section className="nv-promos">
        <div className="nv-promo p1"><h3>Flash Sale</h3><p>Limited time deals</p><b>{maxOff ? `Up to ${maxOff}% off` : "Fresh deals daily"}</b></div>
        <div className="nv-promo p2"><h3>Free Shipping</h3><p>On orders over ₹2,999</p><Truck size={34} /></div>
        <Link to={newest ? `/e_comm/product/${newest.slug}` : "/e_comm/"} id="new" className="nv-promo p3"><h3>New Arrivals</h3><p>{newest ? newest.name : "Check out the latest"}</p><span>Shop now →</span></Link>
      </section>}
      {loading && <p className="nv-note">Loading products…</p>}
      {!loading && !filtered.length && <p className="nv-note">{wish ? "Your wishlist is empty. Tap the heart on any product." : "No products match your search."}</p>}
      {deals.length > 0 && <section id="deals"><div className="nv-sec-head"><h2>Best Deals for You</h2></div><div className="nv-grid">{deals.map((p) => <NovaCard key={p.id} p={p} onAdd={onAdd} />)}</div></section>}
      {rest.length > 0 && <section id="recommended"><div className="nv-sec-head"><h2>{deals.length ? "Recommended for You" : filtering ? "Results" : "All Products"}</h2></div><div className="nv-grid">{rest.map((p) => <NovaCard key={p.id} p={p} onAdd={onAdd} />)}</div></section>}
      <section className="nv-trust">
        <div><ShieldCheck /><b>Secure Payment</b><small>Powered by Razorpay</small></div>
        <div><Undo2 /><b>Easy Returns</b><small>7-day return policy</small></div>
        <div><LifeBuoy /><b>Customer Support</b><small>We're here to help</small></div>
        <div><Truck /><b>Free Shipping</b><small>On orders over ₹2,999</small></div>
      </section>
    </div>
  );
}

function CartPanel({ cart, products, setQuantity, remove, onAdd }: { cart: CartItem[]; products: Product[]; setQuantity: (id: string, q: number) => void; remove: (id: string) => void; onAdd: (p: Product) => void }) {
  const nav = useNavigate();
  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const save = cart.reduce((s, i) => s + ((i.compare_at_price || i.price) - i.price) * i.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 2999 ? 0 : 149;
  const also = products.filter((p) => !cart.some((c) => c.id === p.id)).slice(0, 2);
  return (
    <aside className="nv-right">
      <div className="nv-panel nv-cart">
        <div className="nv-panel-head"><h3>My Cart ({cart.reduce((s, i) => s + i.quantity, 0)})</h3></div>
        {!cart.length && <p className="nv-note">Your cart is empty. Add something you love.</p>}
        {cart.map((i) => <div className="nv-line" key={i.id}>
          <div className="nv-line-img"><Img p={i} /></div>
          <div><b>{i.name}</b><small>{i.category}</small><strong>{money(i.price)}</strong>
            <div className="nv-qty"><button aria-label="Less" onClick={() => setQuantity(i.id, i.quantity - 1)}><Minus size={12} /></button><span>{i.quantity}</span><button aria-label="More" onClick={() => setQuantity(i.id, i.quantity + 1)}><Plus size={12} /></button></div></div>
          <button className="nv-trash" aria-label={`Remove ${i.name}`} onClick={() => remove(i.id)}><Trash2 size={15} /></button></div>)}
        <dl className="nv-totals"><div><dt>Subtotal</dt><dd>{money(subtotal + save)}</dd></div>{save > 0 && <div><dt>Discount</dt><dd className="neg">-{money(save)}</dd></div>}<div><dt>Shipping</dt><dd className={shipping ? "" : "free"}>{shipping ? money(shipping) : "Free"}</dd></div><div className="t"><dt>Total</dt><dd>{money(subtotal + shipping)}</dd></div></dl>
        <button className="nv-btn full" disabled={!cart.length} onClick={() => nav("/e_comm/checkout")}>Checkout ({cart.reduce((s, i) => s + i.quantity, 0)}) <ArrowRight size={15} /></button>
        <div className="nv-accept">We accept <b>UPI</b><b>Cards</b><b>NetBanking</b><b>Wallets</b></div>
      </div>
      {also.length > 0 && <div className="nv-panel"><div className="nv-panel-head"><h3>You might also like</h3></div>{also.map((p) => <div className="nv-mini" key={p.id}><div className="nv-line-img"><Img p={p} /></div><div><b>{p.name}</b><small>{p.category}</small><strong>{money(p.price)}</strong></div><button aria-label={`Add ${p.name}`} onClick={() => onAdd(p)}><Plus size={15} /></button></div>)}</div>}
      <div className="nv-join"><h3>Secure checkout</h3><p>Pay safely with Razorpay. Free shipping on orders over ₹2,999.</p><Package size={40} /></div>
    </aside>
  );
}

type ShellProps = { children: ReactNode; cart: CartItem[]; products: Product[]; session: Session | null; onSignOut: () => void; onAdd: (p: Product) => void; setQuantity: (id: string, q: number) => void; remove: (id: string) => void; theme: Theme; toggleTheme: () => void };
export function NovaShell({ children, cart, products, session, onSignOut, onAdd, setQuantity, remove, theme, toggleTheme }: ShellProps) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const loc = useLocation();
  const nav = useNavigate();
  const { ids } = useWishlist();
  useEffect(() => { setOpen(false); }, [loc.pathname]);
  const showCart = /^\/e_comm\/?$/.test(loc.pathname) || loc.pathname.startsWith("/e_comm/product/");
  const name = (session?.user.user_metadata?.full_name as string | undefined) || session?.user.email?.split("@")[0];
  const links: [typeof Home, string, string][] = [[Home, "Home", "/e_comm/"], [Grid2x2, "Categories", "/e_comm/#categories"], [Tag, "Deals", "/e_comm/#deals"], [Sparkles, "New Arrivals", "/e_comm/#new"]];
  return (
    <div className="nv">
      <div className={`nv-scrim ${open ? "on" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`nv-side ${open ? "open" : ""}`}>
        <Link to="/e_comm/" className="nv-brand"><span><ShoppingBag size={18} /></span>NovaShop</Link>
        <nav>{links.map(([I, l, to]) => <NavLink key={l} end to={to} className={({ isActive }) => (isActive && l === "Home" && !loc.hash ? "active" : "")}><I size={17} />{l}</NavLink>)}</nav>
        <hr />
        <nav><NavLink to="/e_comm/orders"><Package size={17} />My Orders</NavLink><NavLink to="/e_comm/?wish=1"><Heart size={17} />Wishlist</NavLink><NavLink to="/e_comm/cart"><ShoppingCart size={17} />Cart</NavLink><NavLink to="/e_comm/account"><Settings size={17} />Account Settings</NavLink><NavLink to="/e_comm/terms"><ShieldCheck size={17} />Terms &amp; Conditions</NavLink><NavLink to="/e_comm/privacy"><ShieldCheck size={17} />Privacy Policy</NavLink></nav>
        <div className="nv-side-promo"><small>Free shipping</small><b>On orders over ₹2,999</b><Link to="/e_comm/" className="nv-btn light">Shop Now</Link></div>
        <div className="nv-side-foot"><LifeBuoy size={18} /><span><b>Need Help?</b><small>Contact support</small></span></div>
        <div className="nv-mode" onClick={toggleTheme}>{theme === "dark" ? "Dark Mode" : "Light Mode"}<ThemeToggle theme={theme} toggle={toggleTheme} /></div>
      </aside>
      <div className="nv-main">
        <header className="nv-top">
          <button className="nv-menu" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={20} /></button>
          <form onSubmit={(e) => { e.preventDefault(); nav(`/e_comm/?q=${encodeURIComponent(q)}`); }}><input aria-label="Search" placeholder="Search for products, brands and more..." value={q} onChange={(e) => setQ(e.target.value)} /><button aria-label="Search"><Search size={17} /></button></form>
          <Link to="/e_comm/?wish=1" className="nv-top-link"><Heart size={17} /><span>Wishlist</span>{ids.length > 0 && <i>{ids.length}</i>}</Link>
          <Link to="/e_comm/cart" className="nv-top-link"><Bell size={17} /><i>{cart.reduce((s, c) => s + c.quantity, 0)}</i></Link>
          {session ? <div className="nv-user"><UserRound size={18} /><span>{name}</span><button aria-label="Sign out" onClick={onSignOut}><LogOut size={15} /></button></div> : <Link to="/e_comm/account" className="nv-btn small">Sign in</Link>}
        </header>
        <div className={`nv-body ${showCart ? "with-cart" : ""}`}><div className="nv-content nv-fade" key={loc.pathname}>{children}</div>{showCart && <CartPanel cart={cart} products={products} setQuantity={setQuantity} remove={remove} onAdd={onAdd} />}</div>
      </div>
    </div>
  );
}
