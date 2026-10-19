import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChefHat,
  CircleDollarSign,
  ClipboardList,
  Clock3,
  LayoutDashboard,
  LogOut,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Table2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { demoMenu } from "../../data/menu";
import type { MenuItem, Order } from "../../types";
type Tab = "overview" | "orders" | "menu" | "tables" | "reports";
const money = (n: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
export default function AdminDashboard() {
  const [session, setSession] = useState<any>(undefined),
    [allowed, setAllowed] = useState(false),
    [tab, setTab] = useState<Tab>("overview"),
    [orders, setOrders] = useState<Order[]>([]),
    [menu, setMenu] = useState<MenuItem[]>(demoMenu),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState(""),
    [search, setSearch] = useState(""),
    [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    description: "",
    category: "Mains",
    price: "",
    image_url: "",
    is_vegetarian: true,
  });
  useEffect(() => {
    const client = supabase;
    if (!client) {
      setSession(null);
      return;
    }
    let alive = true;
    client.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      if (data.session) {
        const { data: admin } = await client
          .from("admin_users")
          .select("user_id")
          .eq("user_id", data.session.user.id)
          .maybeSingle();
        if (alive) setAllowed(Boolean(admin));
      }
    });
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (!s) setAllowed(false);
    });
    return () => {
      alive = false;
      subscription.unsubscribe();
    };
  }, []);
  const load = async () => {
    if (!supabase) return;
    setBusy(true);
    const [o, m] = await Promise.all([
      supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("menu_items")
        .select("*")
        .order("created_at", { ascending: false }),
    ]);
    if (o.data) setOrders(o.data as Order[]);
    if (m.data) setMenu(m.data as MenuItem[]);
    setBusy(false);
  };
  useEffect(() => {
    if (allowed) load();
  }, [allowed]);
  if (session === undefined)
    return <div className="r-admin-loading">Loading secure workspace…</div>;
  if (!session) return <Navigate to="/project_2/admin/login" replace />;
  if (!allowed)
    return (
      <main className="r-admin-denied">
        <div className="r-login-card">
          <div className="r-brand-mark">
            <LockKeyholeIcon />
          </div>
          <h1>
            Admin access
            <br />
            required.
          </h1>
          <p>
            Your signed-in account is not on the restaurant staff allowlist.
          </p>
          <button
            className="r-primary-btn"
            onClick={async () => {
              await supabase?.auth.signOut();
            }}
          >
            Sign out and try another account
          </button>
        </div>
      </main>
    );
  const activeOrders = orders.filter((o) =>
    ["new", "preparing", "ready"].includes(o.status),
  );
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total), 0);
  const updateStatus = async (o: Order, status: Order["status"]) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", o.id);
    if (error) setNotice(error.message);
    else {
      setOrders((old) =>
        old.map((x) => (x.id === o.id ? { ...x, status } : x)),
      );
      setNotice(`Order ${o.order_number} marked ${status}.`);
    }
  };
  const toggleAvailability = async (d: MenuItem) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("menu_items")
      .update({ is_available: !d.is_available })
      .eq("id", d.id);
    if (error) setNotice(error.message);
    else
      setMenu((old) =>
        old.map((x) =>
          x.id === d.id ? { ...x, is_available: !x.is_available } : x,
        ),
      );
  };
  const addDish = async (e: FormEvent) => {
    e.preventDefault();
    if (!supabase) return setNotice("Configure Supabase to save menu changes.");
    const { data, error } = await supabase
      .from("menu_items")
      .insert({
        name: draft.name,
        description: draft.description,
        category: draft.category,
        price: Number(draft.price),
        image_url:
          draft.image_url ||
          "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
        is_vegetarian: draft.is_vegetarian,
        is_available: true,
        is_featured: false,
      })
      .select()
      .single();
    if (error) setNotice(error.message);
    else {
      setMenu((old) => [data as MenuItem, ...old]);
      setShowForm(false);
      setDraft({
        name: "",
        description: "",
        category: "Mains",
        price: "",
        image_url: "",
        is_vegetarian: true,
      });
      setNotice("Dish added to your menu.");
    }
  };
  const removeDish = async (d: MenuItem) => {
    if (!confirm(`Remove ${d.name} from the menu?`)) return;
    if (!supabase) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", d.id);
    if (error) setNotice(error.message);
    else {
      setMenu((old) => old.filter((x) => x.id !== d.id));
      setNotice(`${d.name} removed.`);
    }
  };
  return (
    <div className="r-admin-app">
      <aside className="r-admin-sidebar">
        <Link to="/project_2/" className="r-admin-logo">
          <span className="r-brand-mark">
            <UtensilsCrossed size={17} />
          </span>
          <span>
            PLUM & PLATE<small>ADMIN WORKSPACE</small>
          </span>
        </Link>
        <div className="r-admin-side-label">WORKSPACE</div>
        {(
          [
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "orders", label: "Orders", icon: ClipboardList },
            { id: "menu", label: "Menu management", icon: UtensilsCrossed },
            { id: "tables", label: "Tables", icon: Table2 },
            { id: "reports", label: "Reports", icon: Activity },
          ] as const
        ).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              className={tab === item.id ? "active" : ""}
              onClick={() => {
                setTab(item.id);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            >
              <Icon size={18} />
              {item.label}
              {item.id === "orders" && activeOrders.length > 0 && (
                <span>{activeOrders.length}</span>
              )}
            </button>
          );
        })}
        <div className="r-admin-sidebar-bottom">
          <div className="r-admin-user">
            <span className="r-admin-user-avatar">
              {session.user.email?.[0]?.toUpperCase() || "S"}
            </span>
            <div>
              <b>Restaurant admin</b>
              <small>{session.user.email}</small>
            </div>
          </div>
          <button
            onClick={async () => {
              await supabase?.auth.signOut();
            }}
          >
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>
      <main className="r-admin-main">
        <header className="r-admin-topbar">
          <div>
            <span className="r-kicker">PLUM & PLATE / OPERATIONS</span>
            <h1>
              {
                (
                  {
                    overview: "Good afternoon.",
                    orders: "Orders",
                    menu: "Menu management",
                    tables: "Table overview",
                    reports: "Reports & insights",
                  } as any
                )[tab]
              }
            </h1>
          </div>
          <div className="r-admin-top-actions">
            <span className="r-admin-open">
              <i /> Service dashboard
            </span>
            <button
              className="r-icon-button"
              onClick={load}
              title="Refresh data"
            >
              <RefreshCw size={17} />
            </button>
          </div>
        </header>
        {notice && (
          <div className="r-admin-notice">
            {notice}
            <button onClick={() => setNotice("")}>
              <X size={15} />
            </button>
          </div>
        )}
        {tab === "overview" && (
          <>
            <div className="r-admin-welcome">
              <div>
                <span>YOUR RESTAURANT AT A GLANCE</span>
                <h2>
                  Make today
                  <br />a <em>delicious one.</em>
                </h2>
                <p>Here’s what’s happening across your service right now.</p>
              </div>
              <div className="r-admin-welcome-art">
                <img
                  src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=85"
                  alt="Restaurant table setting"
                />
                <span>Good service starts here.</span>
              </div>
            </div>
            <div className="r-admin-metrics">
              <Metric
                title="Active orders"
                value={String(activeOrders.length)}
                note="Need your attention"
                icon={ClipboardList}
              />
              <Metric
                title="Orders today"
                value={String(
                  orders.filter(
                    (o) =>
                      new Date(o.created_at).toDateString() ===
                      new Date().toDateString(),
                  ).length,
                )}
                note="All order statuses"
                icon={ChefHat}
              />
              <Metric
                title="Gross order value"
                value={money(revenue)}
                note="Excludes cancelled orders"
                icon={CircleDollarSign}
              />
              <Metric
                title="Menu items"
                value={String(menu.length)}
                note={`${menu.filter((x) => x.is_available).length} available today`}
                icon={UtensilsCrossed}
              />
            </div>
            <section className="r-admin-panel">
              <div className="r-admin-panel-head">
                <div>
                  <h2>Live order queue</h2>
                  <p>Keep an eye on every plate in progress.</p>
                </div>
                <button
                  onClick={() => {
                    setTab("orders");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  View all orders <ArrowUpRight size={15} />
                </button>
              </div>
              <OrderTable
                orders={activeOrders.slice(0, 5)}
                updateStatus={updateStatus}
              />
            </section>
          </>
        )}
        {tab === "orders" && (
          <section className="r-admin-panel">
            <div className="r-admin-panel-head">
              <div>
                <h2>Order queue</h2>
                <p>Update status as each order moves through the kitchen.</p>
              </div>
              <button onClick={load}>
                <RefreshCw size={15} /> Refresh
              </button>
            </div>
            <OrderTable
              orders={orders.filter((o) =>
                `${o.order_number} ${o.customer_name} ${o.status}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              updateStatus={updateStatus}
            />
            <label className="r-admin-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders by number, customer or status"
              />
            </label>
          </section>
        )}
        {tab === "menu" && (
          <section className="r-admin-panel">
            <div className="r-admin-panel-head">
              <div>
                <h2>Your menu</h2>
                <p>Add new dishes, remove items or mark a dish unavailable.</p>
              </div>
              <button
                className="r-admin-add"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus size={16} /> Add a dish
              </button>
            </div>
            {showForm && (
              <form className="r-dish-add-form" onSubmit={addDish}>
                <label>
                  Dish name
                  <input
                    required
                    value={draft.name}
                    onChange={(e) =>
                      setDraft({ ...draft, name: e.target.value })
                    }
                  />
                </label>
                <label>
                  Description
                  <input
                    required
                    value={draft.description}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value })
                    }
                  />
                </label>
                <div className="r-form-two">
                  <label>
                    Category
                    <select
                      value={draft.category}
                      onChange={(e) =>
                        setDraft({ ...draft, category: e.target.value })
                      }
                    >
                      {["Starters", "Mains", "Desserts", "Drinks"].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Price (₹)
                    <input
                      type="number"
                      min="1"
                      required
                      value={draft.price}
                      onChange={(e) =>
                        setDraft({ ...draft, price: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label>
                  Image URL
                  <input
                    type="url"
                    value={draft.image_url}
                    onChange={(e) =>
                      setDraft({ ...draft, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </label>
                <label className="r-admin-check">
                  <input
                    type="checkbox"
                    checked={draft.is_vegetarian}
                    onChange={(e) =>
                      setDraft({ ...draft, is_vegetarian: e.target.checked })
                    }
                  />{" "}
                  Vegetarian
                </label>
                <button className="r-primary-btn">
                  Save dish <Plus size={16} />
                </button>
              </form>
            )}
            <div className="r-admin-menu-list">
              {menu
                .filter((d) =>
                  d.name.toLowerCase().includes(search.toLowerCase()),
                )
                .map((d) => (
                  <div className="r-admin-menu-item" key={d.id}>
                    <img src={d.image_url} alt={d.name} />
                    <div>
                      <b>{d.name}</b>
                      <small>
                        {d.category} ·{" "}
                        {d.is_vegetarian ? "Vegetarian" : "Non-vegetarian"}
                      </small>
                    </div>
                    <strong>{money(d.price)}</strong>
                    <span
                      className={
                        d.is_available
                          ? "r-status-available"
                          : "r-status-unavailable"
                      }
                    >
                      {d.is_available ? "Available" : "Hidden"}
                    </span>
                    <button onClick={() => toggleAvailability(d)}>
                      {d.is_available ? "Hide" : "Show"}
                    </button>
                    <button
                      className="r-delete-dish"
                      onClick={() => removeDish(d)}
                      aria-label={`Remove ${d.name}`}
                    >
                      <X size={17} />
                    </button>
                  </div>
                ))}
            </div>
          </section>
        )}
        {tab === "tables" && (
          <section className="r-admin-panel">
            <div className="r-admin-panel-head">
              <div>
                <h2>Table overview</h2>
                <p>
                  Demo table map derived from the active orders. Configure your
                  actual floor plan to match your venue.
                </p>
              </div>
            </div>
            <div className="r-table-grid">
              {Array.from({ length: 12 }, (_, i) => {
                const n = i + 1;
                const matching = activeOrders.filter(
                  (o) => o.table_number === n,
                );
                return (
                  <article
                    className={`r-table-tile ${matching.length ? "occupied" : ""}`}
                    key={n}
                  >
                    <Table2 size={21} />
                    <b>Table {String(n).padStart(2, "0")}</b>
                    <span>
                      {matching.length
                        ? `${matching.length} active order${matching.length > 1 ? "s" : ""}`
                        : "No active orders"}
                    </span>
                    <small>
                      {matching.length ? "In service" : "Available"}
                    </small>
                  </article>
                );
              })}
            </div>
          </section>
        )}
        {tab === "reports" && (
          <section className="r-admin-panel">
            <div className="r-admin-panel-head">
              <div>
                <h2>Service snapshot</h2>
                <p>
                  Summary of orders currently stored in your Supabase project.
                </p>
              </div>
            </div>
            <div className="r-admin-metrics">
              <Metric
                title="Total orders"
                value={String(orders.length)}
                note="Orders in the latest 100"
                icon={ClipboardList}
              />
              <Metric
                title="Completed"
                value={String(
                  orders.filter((o) => o.status === "served").length,
                )}
                note="Marked served"
                icon={ChefHat}
              />
              <Metric
                title="Cancelled"
                value={String(
                  orders.filter((o) => o.status === "cancelled").length,
                )}
                note="Cancelled orders"
                icon={ArrowDownRight}
              />
              <Metric
                title="Gross value"
                value={money(revenue)}
                note="Not accounting revenue"
                icon={CircleDollarSign}
              />
            </div>
            <div className="r-report-note">
              <Settings2 size={19} />
              <div>
                <b>Next step for production reporting</b>
                <p>
                  Add date-range filters, tax/refund handling and an export job
                  once the restaurant's real operating rules are confirmed.
                </p>
              </div>
            </div>
          </section>
        )}
        <footer className="r-admin-footer">
          PLUM & PLATE · Restaurant Ordering Demo{" "}
          <span>{busy ? "Syncing…" : "Connected workspace"}</span>
        </footer>
      </main>
    </div>
  );
}
function Metric({
  title,
  value,
  note,
  icon: Icon,
}: {
  title: string;
  value: string;
  note: string;
  icon: any;
}) {
  return (
    <article className="r-admin-metric">
      <div className="r-admin-metric-top">
        <span>{title}</span>
        <Icon size={18} />
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}
function OrderTable({
  orders,
  updateStatus,
}: {
  orders: Order[];
  updateStatus: (o: Order, s: Order["status"]) => void;
}) {
  return (
    <div className="r-orders-table-wrap">
      <table className="r-orders-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer / table</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <b>{o.order_number}</b>
                <small>
                  {new Date(o.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </td>
              <td>
                {o.customer_name}
                <small>
                  {o.table_number ? `Table ${o.table_number}` : "Takeaway"}
                </small>
              </td>
              <td>{o.items?.reduce((s, i) => s + i.quantity, 0) || 0} items</td>
              <td>{money(Number(o.total))}</td>
              <td>
                <span className={`r-order-status status-${o.status}`}>
                  {o.status}
                </span>
              </td>
              <td>
                <select
                  aria-label={`Update ${o.order_number}`}
                  value={o.status}
                  onChange={(e) =>
                    updateStatus(o, e.target.value as Order["status"])
                  }
                >
                  {["new", "preparing", "ready", "served", "cancelled"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ),
                  )}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <div className="r-admin-empty">
          <ClipboardList size={25} />
          <b>No orders yet</b>
          <span>New customer orders will appear here.</span>
        </div>
      )}
    </div>
  );
}
function LockKeyholeIcon() {
  return <span>🔒</span>;
}
