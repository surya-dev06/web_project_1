import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Session } from "@supabase/supabase-js";
import { BarChart3, LoaderCircle, Package, Pencil, Plus, ShoppingCart, Store, Trash2, Upload, X } from "lucide-react";
import { ecommerceSupabase as db } from "../lib/supabase-ecommerce";
import type { Product } from "./types";
import { notify } from "./notify";
import { ThemeToggle, type Theme } from "./theme";

type Order = { id: string; order_number: string; customer_name: string; phone: string; shipping_address: string; total: number; status: string; payment_status: string; created_at: string };
const money = (v: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v || 0);
const STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const slugify = (s: string) => s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
type Draft = Partial<Product> & { name: string };
const blank: Draft = { name: "", description: "", category: "General", price: 0, compare_at_price: null, stock: 0, is_featured: false, is_active: true, image_jpg: null };

export default function AdminPanel({ session, theme, toggleTheme }: { session: Session | null; theme: Theme; toggleTheme: () => void }) {
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<"overview" | "products" | "orders">("overview");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    if (!db || !session) return;
    const { data: a } = await db.from("ecommerce_admins").select("user_id").eq("user_id", session.user.id).maybeSingle();
    setAllowed(Boolean(a));
    if (!a) return;
    const [p, o] = await Promise.all([
      db.from("ecommerce_products").select("*").order("created_at", { ascending: false }),
      db.from("ecommerce_orders").select("*").order("created_at", { ascending: false }).limit(200),
    ]);
    setProducts((p.data ?? []) as Product[]);
    setOrders((o.data ?? []) as Order[]);
  }, [session]);
  useEffect(() => { void load(); }, [load]);

  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.payment_status === "paid");
    return { revenue: paid.reduce((s, o) => s + Number(o.total), 0), paid: paid.length, pending: orders.filter((o) => o.status === "confirmed" || o.status === "processing").length, low: products.filter((p) => p.stock <= 5 && p.is_active).length };
  }, [orders, products]);

  async function save() {
    if (!db || !draft) return;
    if (!draft.name.trim() || Number(draft.price) < 0) { notify("Enter a product name and a valid price.", "error"); return; }
    setBusy(true);
    let image = draft.image_jpg ?? null;
    if (file) {
      const path = `${Date.now()}-${file.name.replace(/[^a-z0-9.]+/gi, "-")}`;
      const up = await db.storage.from("product-images").upload(path, file, { cacheControl: "31536000", upsert: false });
      if (up.error) { setBusy(false); notify(`Image upload failed: ${up.error.message}`, "error"); return; }
      image = db.storage.from("product-images").getPublicUrl(path).data.publicUrl;
    }
    const row = {
      name: draft.name.trim(), slug: draft.slug || slugify(draft.name), description: draft.description ?? "", category: draft.category || "General",
      price: Number(draft.price), compare_at_price: draft.compare_at_price ? Number(draft.compare_at_price) : null,
      stock: Math.max(0, Math.floor(Number(draft.stock))), is_featured: Boolean(draft.is_featured), is_active: Boolean(draft.is_active), image_jpg: image,
    };
    const res = draft.id ? await db.from("ecommerce_products").update(row).eq("id", draft.id) : await db.from("ecommerce_products").insert(row);
    setBusy(false);
    if (res.error) { notify(res.error.message, "error"); return; }
    notify(draft.id ? "Product updated" : "Product added");
    setDraft(null); setFile(null); void load();
  }
  async function remove() {
    if (!db || !toDelete) return;
    const { error } = await db.from("ecommerce_products").delete().eq("id", toDelete.id);
    if (error) { notify(error.message, "error"); return; }
    notify(`${toDelete.name} removed`); setToDelete(null); void load();
  }
  async function setStatus(o: Order, status: string) {
    if (!db) return;
    const { error } = await db.from("ecommerce_orders").update({ status }).eq("id", o.id);
    if (error) notify(error.message, "error"); else { notify(`${o.order_number} marked ${status}`); setOrders((l) => l.map((x) => (x.id === o.id ? { ...x, status } : x))); }
  }

  if (!session) return <main className="ec-shell ec-page ec-result"><h1 className="ec-page-title">Admin <em>sign in</em></h1><p>Sign in with your admin account to continue.</p><Link className="ec-button ec-button-dark" to="/e_comm/account">Go to sign in</Link></main>;
  if (allowed === null) return <main className="ec-page ec-result"><LoaderCircle className="ec-spin" /></main>;
  if (!allowed) return <main className="ec-shell ec-page ec-result"><h1 className="ec-page-title">No <em>access.</em></h1><p>This account is not listed as a store admin. Add its user ID to <code>ecommerce_admins</code> (see SETUP.md).</p></main>;

  const nav = [["overview", BarChart3, "Overview"], ["products", Package, "Products"], ["orders", ShoppingCart, "Orders"]] as const;
  const shown = products.filter((p) => (p.name + p.category).toLowerCase().includes(q.toLowerCase()));
  const f = (k: keyof Draft, v: unknown) => setDraft((d) => (d ? { ...d, [k]: v } : d));

  return (
    <div className="ec-admin ec-fade">
      <aside className="ec-admin-side">
        <Link to="/e_comm/" className="ec-admin-brand"><Store size={18} /> Store admin</Link>
        {nav.map(([id, Icon, label]) => <button key={id} className={tab === id ? "on" : ""} onClick={() => setTab(id)}><Icon size={17} />{label}</button>)}
        <div className="ec-admin-foot"><ThemeToggle theme={theme} toggle={toggleTheme} /><Link to="/e_comm/">← View store</Link></div>
      </aside>
      <section className="ec-admin-main">
        {tab === "overview" && <>
          <h1>Overview</h1>
          <div className="ec-stat-grid">
            <div className="ec-stat"><small>Paid revenue</small><strong>{money(stats.revenue)}</strong></div>
            <div className="ec-stat"><small>Paid orders</small><strong>{stats.paid}</strong></div>
            <div className="ec-stat"><small>To fulfil</small><strong>{stats.pending}</strong></div>
            <div className="ec-stat"><small>Low stock (≤5)</small><strong>{stats.low}</strong></div>
          </div>
        </>}
        {tab === "products" && <>
          <div className="ec-admin-head"><h1>Products</h1>
            <input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="ec-button ec-button-dark" onClick={() => { setDraft({ ...blank }); setFile(null); }}><Plus size={16} /> Add product</button></div>
          <div className="ec-table-wrap"><table className="ec-table"><thead><tr><th></th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>
            {shown.map((p) => <tr key={p.id}>
              <td>{p.image_jpg && <img src={p.image_jpg} alt="" className="ec-thumb" />}</td><td>{p.name}</td><td>{p.category}</td><td>{money(p.price)}</td>
              <td className={p.stock <= 5 ? "ec-low" : ""}>{p.stock}</td><td><span className={`ec-chip ${p.is_active ? "ok" : ""}`}>{p.is_active ? "Live" : "Hidden"}</span></td>
              <td className="ec-row-actions"><button aria-label="Edit" onClick={() => { setDraft(p); setFile(null); }}><Pencil size={15} /></button><button aria-label="Delete" onClick={() => setToDelete(p)}><Trash2 size={15} /></button></td></tr>)}
            {!shown.length && <tr><td colSpan={7} className="ec-muted">No products yet. Click “Add product”.</td></tr>}
          </tbody></table></div>
        </>}
        {tab === "orders" && <>
          <h1>Orders</h1>
          <div className="ec-table-wrap"><table className="ec-table"><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Placed</th></tr></thead><tbody>
            {orders.map((o) => <tr key={o.id}><td>{o.order_number}</td><td>{o.customer_name}<small className="ec-muted"><br />{o.phone}</small></td><td>{money(o.total)}</td>
              <td><span className={`ec-chip ${o.payment_status === "paid" ? "ok" : o.payment_status === "failed" ? "bad" : ""}`}>{o.payment_status}</span></td>
              <td><select value={o.status} onChange={(e) => setStatus(o, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></td>
              <td>{new Date(o.created_at).toLocaleDateString("en-IN")}</td></tr>)}
            {!orders.length && <tr><td colSpan={6} className="ec-muted">No orders yet.</td></tr>}
          </tbody></table></div>
        </>}
      </section>

      {draft && <div className="ec-modal-bg" onClick={() => setDraft(null)}><div className="ec-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ec-modal-head"><h2>{draft.id ? "Edit product" : "Add product"}</h2><button aria-label="Close" onClick={() => setDraft(null)}><X size={18} /></button></div>
        <div className="ec-form-grid">
          <label>Name<input value={draft.name} onChange={(e) => f("name", e.target.value)} /></label>
          <label>Category<input value={draft.category ?? ""} onChange={(e) => f("category", e.target.value)} /></label>
          <label>Price (₹)<input type="number" min={0} value={draft.price ?? 0} onChange={(e) => f("price", e.target.value)} /></label>
          <label>Original price (₹)<input type="number" min={0} value={draft.compare_at_price ?? ""} onChange={(e) => f("compare_at_price", e.target.value)} /></label>
          <label>Stock<input type="number" min={0} value={draft.stock ?? 0} onChange={(e) => f("stock", e.target.value)} /></label>
          <label className="ec-upload"><Upload size={16} /> {file ? file.name : draft.image_jpg ? "Replace image" : "Upload image"}<input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></label>
          <label className="ec-span2">Description<textarea rows={3} value={draft.description ?? ""} onChange={(e) => f("description", e.target.value)} /></label>
          <label className="ec-check"><input type="checkbox" checked={Boolean(draft.is_active)} onChange={(e) => f("is_active", e.target.checked)} /> Visible in store</label>
          <label className="ec-check"><input type="checkbox" checked={Boolean(draft.is_featured)} onChange={(e) => f("is_featured", e.target.checked)} /> Featured</label>
        </div>
        <div className="ec-modal-foot"><button className="ec-button" onClick={() => setDraft(null)}>Cancel</button><button className="ec-button ec-button-dark" disabled={busy} onClick={save}>{busy ? <LoaderCircle className="ec-spin" size={16} /> : "Save product"}</button></div>
      </div></div>}
      {toDelete && <div className="ec-modal-bg" onClick={() => setToDelete(null)}><div className="ec-modal ec-modal-sm" onClick={(e) => e.stopPropagation()}>
        <h2>Remove “{toDelete.name}”?</h2><p className="ec-muted">Past orders keep their record. This cannot be undone.</p>
        <div className="ec-modal-foot"><button className="ec-button" onClick={() => setToDelete(null)}>Cancel</button><button className="ec-button ec-button-danger" onClick={remove}>Remove</button></div>
      </div></div>}
    </div>
  );
}
