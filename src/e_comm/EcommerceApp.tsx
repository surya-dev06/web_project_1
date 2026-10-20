import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  CircleUserRound,
  CreditCard,
  Heart,
  LoaderCircle,
  LogIn,
  LogOut,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  SlidersHorizontal,
  Sparkles,
  Truck,
  X,
} from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import {
  ecommerceSupabase as db,
  isEcommerceConfigured,
} from "../lib/supabase-ecommerce";
import type { CartItem, OrderSummary, Product } from "./types";
import "./ecommerce.css";

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);
const fallbackProducts: Product[] = [
  {
    id: "sample-1",
    name: "Studio Headphones",
    slug: "studio-headphones",
    description:
      "Immersive sound, soft-touch cushions and a beautifully balanced everyday listening experience.",
    category: "Tech",
    price: 6499,
    compare_at_price: 7999,
    image_avif: null,
    image_svg: null,
    image_jpg:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85",
    stock: 12,
    is_featured: true,
    is_active: true,
    created_at: "",
  },
  {
    id: "sample-2",
    name: "Everyday Carry Pack",
    slug: "everyday-carry-pack",
    description:
      "A lightweight, weather-resistant backpack made for commutes, weekends and everywhere between.",
    category: "Lifestyle",
    price: 3299,
    compare_at_price: null,
    image_avif: null,
    image_svg: null,
    image_jpg:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=85",
    stock: 9,
    is_featured: true,
    is_active: true,
    created_at: "",
  },
  {
    id: "sample-3",
    name: "Minimal Desk Lamp",
    slug: "minimal-desk-lamp",
    description:
      "Warm, considered lighting for focused work and slower evenings.",
    category: "Home",
    price: 2199,
    compare_at_price: 2799,
    image_avif: null,
    image_svg: null,
    image_jpg:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85",
    stock: 15,
    is_featured: false,
    is_active: true,
    created_at: "",
  },
  {
    id: "sample-4",
    name: "Modern Timepiece",
    slug: "modern-timepiece",
    description:
      "A clean dial, timeless silhouette and versatile everyday styling.",
    category: "Lifestyle",
    price: 4599,
    compare_at_price: null,
    image_avif: null,
    image_svg: null,
    image_jpg:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=85",
    stock: 7,
    is_featured: true,
    is_active: true,
    created_at: "",
  },
  {
    id: "sample-5",
    name: "Everyday Trainers",
    slug: "everyday-trainers",
    description:
      "A versatile low-profile silhouette built for long days on the move.",
    category: "Style",
    price: 3899,
    compare_at_price: 4499,
    image_avif: null,
    image_svg: null,
    image_jpg:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85",
    stock: 18,
    is_featured: false,
    is_active: true,
    created_at: "",
  },
  {
    id: "sample-6",
    name: "Ceramic Pour-over Set",
    slug: "ceramic-pour-over-set",
    description:
      "A simple ritual, thoughtful form and a beautifully brewed cup at home.",
    category: "Home",
    price: 1699,
    compare_at_price: null,
    image_avif: null,
    image_svg: null,
    image_jpg:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1000&q=85",
    stock: 20,
    is_featured: false,
    is_active: true,
    created_at: "",
  },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function ProductImage({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  const jpg =
    product.image_jpg ||
    fallbackProducts.find((p) => p.slug === product.slug)?.image_jpg ||
    fallbackProducts[0].image_jpg!;
  return (
    <picture className={`ec-picture ${className}`}>
      {product.image_avif && (
        <source srcSet={product.image_avif} type="image/avif" />
      )}
      {product.image_svg && (
        <source srcSet={product.image_svg} type="image/svg+xml" />
      )}
      <img src={jpg} alt={product.name} loading="lazy" decoding="async" />
    </picture>
  );
}

function StoreHeader({
  cartCount,
  session,
  onSignOut,
}: {
  cartCount: number;
  session: Session | null;
  onSignOut: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="ec-header">
      <div className="ec-topline">
        Thoughtful finds for everyday living{" "}
        <span>Free shipping on orders over ₹2,999</span>
      </div>
      <div className="ec-nav ec-shell">
        <Link
          className="ec-brand"
          to="/e_comm/"
          onClick={() => setMenuOpen(false)}
        >
          <span className="ec-brand-mark">s.</span>
          <span>
            studio<span className="ec-brand-light">/store</span>
          </span>
        </Link>
        <nav className={menuOpen ? "ec-links is-open" : "ec-links"}>
          <Link to="/e_comm/" onClick={() => setMenuOpen(false)}>
            Discover
          </Link>
          <a href="/e_comm/#collection" onClick={() => setMenuOpen(false)}>
            Shop all
          </a>
          <Link to="/e_comm/orders" onClick={() => setMenuOpen(false)}>
            Your orders
          </Link>
        </nav>
        <div className="ec-nav-actions">
          <Link
            aria-label="Account"
            className="ec-icon-link"
            to="/e_comm/account"
          >
            <CircleUserRound size={20} />
          </Link>
          <Link
            aria-label={`Cart with ${cartCount} items`}
            className="ec-icon-link ec-cart-link"
            to="/e_comm/cart"
          >
            <ShoppingBag size={20} />
            <span>{cartCount}</span>
          </Link>
          <button
            className="ec-menu-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {session && (
        <div className="ec-session-bar">
          <span>Signed in as {session.user.email}</span>
          <button onClick={onSignOut}>
            <LogOut size={14} /> Sign out
          </button>
        </div>
      )}
    </header>
  );
}

function ProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  return (
    <article className="ec-product-card">
      <Link
        to={`/e_comm/product/${product.slug}`}
        className="ec-product-visual"
      >
        <ProductImage product={product} />
        {product.compare_at_price &&
          product.compare_at_price > product.price && (
            <span className="ec-sale-tag">
              Save{" "}
              {Math.round((1 - product.price / product.compare_at_price) * 100)}
              %
            </span>
          )}
        <span className="ec-quick-view">
          Explore <ArrowRight size={15} />
        </span>
      </Link>
      <div className="ec-product-info">
        <div className="ec-product-meta">
          <span>{product.category}</span>
          {product.stock < 5 && product.stock > 0 && (
            <span className="ec-stock-low">Low stock</span>
          )}
        </div>
        <Link
          to={`/e_comm/product/${product.slug}`}
          className="ec-product-name"
        >
          {product.name}
        </Link>
        <div className="ec-product-bottom">
          <div className="ec-price">
            {money(product.price)}
            {product.compare_at_price &&
              product.compare_at_price > product.price && (
                <del>{money(product.compare_at_price)}</del>
              )}
          </div>
          <button
            className="ec-add-mini"
            aria-label={`Add ${product.name} to cart`}
            onClick={() => onAdd(product)}
            disabled={product.stock < 1}
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
    </article>
  );
}

function StoreHome({
  products,
  onAdd,
  loading,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
  loading: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const categories = useMemo(
    () => [
      "All",
      ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
    ],
    [products],
  );
  const filtered = useMemo(
    () =>
      products
        .filter(
          (p) =>
            (category === "All" || p.category === category) &&
            `${p.name} ${p.description} ${p.category}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "price-low"
            ? a.price - b.price
            : sort === "price-high"
              ? b.price - a.price
              : sort === "newest"
                ? b.created_at.localeCompare(a.created_at)
                : Number(b.is_featured) - Number(a.is_featured),
        ),
    [products, category, query, sort],
  );
  return (
    <main className="ec-main">
      <section className="ec-hero ec-shell">
        <div className="ec-hero-copy ec-reveal">
          <div className="ec-eyebrow">
            <Sparkles size={15} /> A LITTLE MORE CONSIDERED
          </div>
          <h1>
            Good things.
            <br />
            <em>Better living.</em>
          </h1>
          <p>
            Everyday essentials, distinctive objects and small upgrades that
            make a difference.
          </p>
          <a href="#collection" className="ec-button ec-button-dark">
            Explore the collection <ArrowDownRight size={17} />
          </a>
          <div className="ec-hero-note">
            <span className="ec-note-line" /> Carefully chosen. Made to be
            loved.
          </div>
        </div>
        <div className="ec-hero-art">
          <div className="ec-hero-image ec-float">
            <img
              src="https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&w=1300&q=88"
              alt="Warm, minimal modern home interior"
              fetchPriority="high"
            />
            <div className="ec-image-caption">
              <span>THE EVERYDAY EDIT</span>
              <span>01 / 04</span>
            </div>
          </div>
          <div className="ec-orbit ec-orbit-one" />
          <div className="ec-orbit ec-orbit-two" />
          <div className="ec-hero-sticker">
            Made for
            <br />
            <strong>
              your kind
              <br />
              of everyday.
            </strong>
          </div>
        </div>
      </section>
      <section className="ec-benefits ec-shell">
        <div>
          <Truck />
          <span>
            <strong>Complimentary delivery</strong>
            <small>On orders above ₹2,999</small>
          </span>
        </div>
        <div>
          <ShieldCheck />
          <span>
            <strong>Secure checkout</strong>
            <small>Your details stay protected</small>
          </span>
        </div>
        <div>
          <PackageCheck />
          <span>
            <strong>Picked with care</strong>
            <small>Quality over quantity</small>
          </span>
        </div>
      </section>
      <section className="ec-collection ec-shell" id="collection">
        <div className="ec-section-heading">
          <div>
            <div className="ec-eyebrow">THE COLLECTION</div>
            <h2>
              Find your <em>favourite.</em>
            </h2>
          </div>
          <p>
            Useful things, beautiful details.
            <br />A collection worth coming back to.
          </p>
        </div>
        <div className="ec-toolbar">
          <div className="ec-search">
            <Search size={17} />
            <input
              aria-label="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection…"
            />
            <kbd>⌕</kbd>
          </div>
          <div className="ec-sort">
            <SlidersHorizontal size={16} />
            <select
              aria-label="Sort products"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured first</option>
              <option value="newest">Newest</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
            <ChevronDown size={14} />
          </div>
        </div>
        <div className="ec-category-row">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "ec-category active" : "ec-category"}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="ec-loading">
            <LoaderCircle className="ec-spin" /> Curating the collection…
          </div>
        ) : filtered.length ? (
          <div className="ec-product-grid">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} />
            ))}
          </div>
        ) : (
          <div className="ec-empty">
            <Search />
            <h3>No matches just yet</h3>
            <p>Try another search or choose a different category.</p>
            <button
              className="ec-button ec-button-outline"
              onClick={() => {
                setQuery("");
                setCategory("All");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
        <div className="ec-results-count">
          Showing {filtered.length} of {products.length} pieces
        </div>
      </section>
      <section className="ec-note-banner ec-shell">
        <div className="ec-note-photo">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=85"
            alt="Thoughtfully curated retail space"
            loading="lazy"
          />
        </div>
        <div>
          <div className="ec-eyebrow">LESS, BUT BETTER</div>
          <h2>
            Objects with a little
            <br />
            <em>more meaning.</em>
          </h2>
          <p>
            We believe the things you use every day should feel considered.
            Explore pieces chosen for their quality, function and quiet
            character.
          </p>
          <a href="#collection" className="ec-text-link">
            Shop the edit <ArrowRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}

function ProductDetail({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (p: Product) => void;
}) {
  const { slug } = useParams();
  const product = products.find((p) => p.slug === slug);
  if (!product)
    return (
      <main className="ec-shell ec-page">
        <div className="ec-empty">
          <h2>We couldn't find that piece.</h2>
          <Link to="/e_comm/" className="ec-button ec-button-dark">
            Back to shop
          </Link>
        </div>
      </main>
    );
  return (
    <main className="ec-shell ec-page">
      <Link to="/e_comm/" className="ec-back">
        <ArrowLeft size={16} /> Back to the collection
      </Link>
      <div className="ec-detail">
        <div className="ec-detail-image">
          <ProductImage product={product} />
        </div>
        <div className="ec-detail-copy">
          <div className="ec-eyebrow">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="ec-detail-price">
            {money(product.price)}{" "}
            {product.compare_at_price &&
              product.compare_at_price > product.price && (
                <del>{money(product.compare_at_price)}</del>
              )}
          </div>
          <p>{product.description}</p>
          <div className="ec-stock-note">
            {product.stock > 0 ? (
              <>
                <Check size={16} /> In stock · {product.stock} available
              </>
            ) : (
              "Currently out of stock"
            )}
          </div>
          <button
            className="ec-button ec-button-dark ec-full-button"
            disabled={product.stock < 1}
            onClick={() => onAdd(product)}
          >
            Add to bag <Plus size={18} />
          </button>
          <div className="ec-detail-assurances">
            <span>
              <Truck size={17} /> Thoughtful delivery
            </span>
            <span>
              <ShieldCheck size={17} /> Secure checkout
            </span>
          </div>
          <div className="ec-detail-description">
            <h3>A little more about it</h3>
            <p>{product.description}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

function CartPage({
  cart,
  setQuantity,
  remove,
  onCheckout,
}: {
  cart: CartItem[];
  setQuantity: (id: string, n: number) => void;
  remove: (id: string) => void;
  onCheckout: () => void;
}) {
  const subtotal = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 2999 ? 0 : 149;
  return (
    <main className="ec-shell ec-page">
      <div className="ec-eyebrow">YOUR SELECTION</div>
      <h1 className="ec-page-title">
        Your <em>bag.</em>
      </h1>
      {!cart.length ? (
        <div className="ec-empty">
          <ShoppingBag size={34} />
          <h2>Room for something good.</h2>
          <p>Your bag is waiting for its first find.</p>
          <Link className="ec-button ec-button-dark" to="/e_comm/">
            Explore the collection <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="ec-cart-layout">
          <div className="ec-cart-items">
            {cart.map((item) => (
              <article className="ec-cart-item" key={item.id}>
                <Link to={`/e_comm/product/${item.slug}`}>
                  <ProductImage product={item} />
                </Link>
                <div className="ec-cart-item-copy">
                  <Link
                    to={`/e_comm/product/${item.slug}`}
                    className="ec-product-name"
                  >
                    {item.name}
                  </Link>
                  <small>{item.category}</small>
                  <strong>{money(item.price)}</strong>
                  <div className="ec-quantity">
                    <button
                      aria-label="Decrease quantity"
                      onClick={() => setQuantity(item.id, item.quantity - 1)}
                    >
                      <Minus size={14} />
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      aria-label="Increase quantity"
                      disabled={item.quantity >= item.stock}
                      onClick={() => setQuantity(item.id, item.quantity + 1)}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <button
                  className="ec-remove"
                  aria-label={`Remove ${item.name}`}
                  onClick={() => remove(item.id)}
                >
                  <X size={17} />
                </button>
              </article>
            ))}
          </div>
          <aside className="ec-summary">
            <h2>Order summary</h2>
            <div>
              <span>Subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <div>
              <span>Delivery</span>
              <strong>{shipping ? money(shipping) : "Complimentary"}</strong>
            </div>
            {subtotal < 2999 && (
              <p className="ec-shipping-hint">
                You're {money(2999 - subtotal)} away from complimentary
                delivery.
              </p>
            )}
            <div className="ec-summary-total">
              <span>Total</span>
              <strong>{money(subtotal + shipping)}</strong>
            </div>
            <button
              className="ec-button ec-button-dark ec-full-button"
              onClick={onCheckout}
            >
              Continue to checkout <ArrowRight size={17} />
            </button>
            <p className="ec-safe-note">
              <ShieldCheck size={15} /> Secure account-based order placement
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

function AccountPage({
  session,
  refreshSession,
}: {
  session: Session | null;
  refreshSession: () => Promise<void>;
}) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (session)
    return (
      <main className="ec-shell ec-page ec-account">
        <div className="ec-account-mark">
          <CircleUserRound size={30} />
        </div>
        <div className="ec-eyebrow">YOUR ACCOUNT</div>
        <h1>
          Welcome <em>back.</em>
        </h1>
        <p>Signed in as {session.user.email}</p>
        <div className="ec-account-actions">
          <Link className="ec-button ec-button-dark" to="/e_comm/orders">
            View your orders <ArrowRight size={16} />
          </Link>
          <Link className="ec-button ec-button-outline" to="/e_comm/">
            Continue shopping
          </Link>
        </div>
      </main>
    );
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    setMessage("");
    const result =
      mode === "signin"
        ? await db.auth.signInWithPassword({ email, password })
        : await db.auth.signUp({ email, password });
    setBusy(false);
    if (result.error) setMessage(result.error.message);
    else {
      setMessage(
        mode === "signup" && !result.data.session
          ? "Account created. Check your email to confirm the address, then sign in."
          : "You are signed in.",
      );
      await refreshSession();
    }
  }
  return (
    <main className="ec-shell ec-page ec-account">
      <div className="ec-account-mark">
        <CircleUserRound size={30} />
      </div>
      <div className="ec-eyebrow">THE STUDIO ACCOUNT</div>
      <h1>
        {mode === "signin" ? (
          <>
            Good to <em>see you.</em>
          </>
        ) : (
          <>
            Make it <em>yours.</em>
          </>
        )}
      </h1>
      <p>Sign in to keep track of your orders and your favourite finds.</p>
      <form className="ec-auth-form" onSubmit={submit}>
        <label>
          Email address
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@example.com"
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={
              mode === "signin" ? "current-password" : "new-password"
            }
            placeholder="At least 6 characters"
          />
        </label>
        {message && (
          <p className="ec-form-message" role="status">
            {message}
          </p>
        )}
        <button
          className="ec-button ec-button-dark ec-full-button"
          disabled={busy || !db}
        >
          {busy ? (
            <LoaderCircle className="ec-spin" />
          ) : mode === "signin" ? (
            <>
              <LogIn size={17} /> Sign in
            </>
          ) : (
            <>
              <Check size={17} /> Create account
            </>
          )}
        </button>
      </form>
      <p className="ec-switch-auth">
        {mode === "signin" ? "New around here?" : "Already have an account?"}{" "}
        <button
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setMessage("");
          }}
        >
          {mode === "signin" ? "Create an account" : "Sign in instead"}
        </button>
      </p>
    </main>
  );
}

function OrdersPage({ session }: { session: Session | null }) {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let live = true;
    async function load() {
      if (!db || !session) {
        setLoading(false);
        return;
      }
      const { data, error } = await db
        .from("ecommerce_orders")
        .select("id,order_number,customer_name,total,status,created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      if (!live) return;
      if (error) setError(error.message);
      else setOrders((data || []) as OrderSummary[]);
      setLoading(false);
    }
    void load();
    return () => {
      live = false;
    };
  }, [session]);
  if (!session)
    return (
      <main className="ec-shell ec-page ec-account">
        <h1>
          Your <em>orders.</em>
        </h1>
        <p>Sign in to see your order history.</p>
        <Link className="ec-button ec-button-dark" to="/e_comm/account">
          Sign in
        </Link>
      </main>
    );
  return (
    <main className="ec-shell ec-page">
      <div className="ec-eyebrow">YOUR ACCOUNT</div>
      <h1 className="ec-page-title">
        Order <em>history.</em>
      </h1>
      {loading ? (
        <div className="ec-loading">
          <LoaderCircle className="ec-spin" /> Loading your orders…
        </div>
      ) : error ? (
        <p className="ec-form-message">{error}</p>
      ) : !orders.length ? (
        <div className="ec-empty">
          <PackageCheck size={34} />
          <h2>Nothing here yet.</h2>
          <p>When you place an order, it will appear here.</p>
          <Link className="ec-button ec-button-dark" to="/e_comm/">
            Find something good
          </Link>
        </div>
      ) : (
        <div className="ec-orders">
          {orders.map((o) => (
            <article className="ec-order" key={o.id}>
              <div>
                <small>ORDER {o.order_number}</small>
                <strong>
                  {new Date(o.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </strong>
              </div>
              <span className={`ec-status ec-status-${o.status}`}>
                {o.status.replaceAll("_", " ")}
              </span>
              <strong>{money(Number(o.total))}</strong>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

function CheckoutPage({
  cart,
  clearCart,
  session,
  refreshSession,
}: {
  cart: CartItem[];
  clearCart: () => void;
  session: Session | null;
  refreshSession: () => Promise<void>;
}) {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const subtotal = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= 2999 ? 0 : 149;
  useEffect(() => {
    if (session?.user.email && !name)
      setName(session.user.user_metadata?.full_name || "");
  }, [session, name]);
  if (!session)
    return (
      <main className="ec-shell ec-page ec-account">
        <h1>
          One quick <em>step.</em>
        </h1>
        <p>Sign in or create an account before placing your order.</p>
        <Link className="ec-button ec-button-dark" to="/e_comm/account">
          Continue to account <ArrowRight size={16} />
        </Link>
      </main>
    );
  if (!cart.length) return <Navigate to="/e_comm/cart" replace />;
  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!db) return;
    setBusy(true);
    setError("");
    const { data, error } = await db.rpc("create_ecommerce_order", {
      p_customer_name: name,
      p_phone: phone,
      p_shipping_address: address,
      p_items: cart.map((i) => ({ product_id: i.id, quantity: i.quantity })),
    });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    const row = Array.isArray(data) ? data[0] : data;
    const orderId = row?.order_id || row?.id;
    if (!orderId) {
      setError(
        "The order was not returned by the server. Please check your order history before retrying.",
      );
      return;
    }
    clearCart(); // Best-effort notification only; order placement does not depend on email.
    try {
      await db.functions.invoke("order-notification", {
        body: { order_id: orderId },
      });
    } catch {
      /* order remains created even if email service is unavailable */
    }
    navigate("/e_comm/orders", { replace: true });
  }
  return (
    <main className="ec-shell ec-page">
      <div className="ec-eyebrow">ALMOST YOURS</div>
      <h1 className="ec-page-title">
        Secure <em>checkout.</em>
      </h1>
      <div className="ec-checkout-layout">
        <form className="ec-auth-form ec-checkout-form" onSubmit={placeOrder}>
          <h2>Delivery details</h2>
          <label>
            Full name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </label>
          <label>
            Phone number
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              inputMode="tel"
              minLength={8}
            />
          </label>
          <label>
            Shipping address
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              rows={4}
              autoComplete="street-address"
              placeholder="House / flat, street, city, state, PIN code"
            />
          </label>
          {error && (
            <p className="ec-form-message" role="alert">
              {error}
            </p>
          )}
          <div className="ec-checkout-notice">
            <CreditCard size={18} />
            <span>
              <strong>Payment note</strong>
              <small>
                This version records an order but does not charge a payment
                method. Connect a payment provider before accepting live
                payments.
              </small>
            </span>
          </div>
          <button
            className="ec-button ec-button-dark ec-full-button"
            disabled={busy || !db}
          >
            {busy ? (
              <LoaderCircle className="ec-spin" />
            ) : (
              <>
                Place order · {money(subtotal + shipping)}{" "}
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>
        <aside className="ec-summary">
          <h2>Your bag</h2>
          {cart.map((i) => (
            <div className="ec-checkout-item" key={i.id}>
              <ProductImage product={i} />
              <span>
                {i.name}
                <small>Qty {i.quantity}</small>
              </span>
              <strong>{money(i.price * i.quantity)}</strong>
            </div>
          ))}
          <div>
            <span>Subtotal</span>
            <strong>{money(subtotal)}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>{shipping ? money(shipping) : "Complimentary"}</strong>
          </div>
          <div className="ec-summary-total">
            <span>Total</span>
            <strong>{money(subtotal + shipping)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}

function AdminPage({ session }: { session: Session | null }) {
  const [allowed, setAllowed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState("");
  const load = useCallback(async () => {
    if (!db || !session) {
      setChecking(false);
      return;
    }
    setChecking(true);
    const { data: admin } = await db
      .from("ecommerce_admins")
      .select("user_id")
      .eq("user_id", session.user.id)
      .maybeSingle();
    if (!admin) {
      setAllowed(false);
      setChecking(false);
      return;
    }
    setAllowed(true);
    const { data, error } = await db
      .from("ecommerce_orders")
      .select(
        "id,order_number,customer_name,phone,shipping_address,total,status,created_at",
      )
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) setMessage(error.message);
    else setOrders(data || []);
    setChecking(false);
  }, [session]);
  useEffect(() => {
    void load();
  }, [load]);
  async function updateStatus(id: string, status: string) {
    if (!db) return;
    setBusyId(id);
    setMessage("");
    const { error } = await db
      .from("ecommerce_orders")
      .update({ status })
      .eq("id", id);
    setBusyId("");
    if (error) setMessage(error.message);
    else {
      setOrders((old) => old.map((o) => (o.id === id ? { ...o, status } : o)));
      setMessage("Order status updated.");
    }
  }
  if (!session)
    return (
      <main className="ec-shell ec-page ec-account">
        <ShieldCheck size={34} />
        <h1>
          Store <em>admin.</em>
        </h1>
        <p>Sign in with your store account first.</p>
        <Link className="ec-button ec-button-dark" to="/e_comm/account">
          Sign in
        </Link>
      </main>
    );
  if (checking)
    return (
      <main className="ec-shell ec-page">
        <div className="ec-loading">
          <LoaderCircle className="ec-spin" /> Checking admin access…
        </div>
      </main>
    );
  if (!allowed)
    return (
      <main className="ec-shell ec-page ec-account">
        <ShieldCheck size={34} />
        <h1>
          Admin <em>access.</em>
        </h1>
        <p>This account is not registered as a store administrator.</p>
        <Link className="ec-button ec-button-outline" to="/e_comm/">
          Back to store
        </Link>
      </main>
    );
  return (
    <main className="ec-shell ec-page">
      <div className="ec-eyebrow">STORE OPERATIONS</div>
      <h1 className="ec-page-title">
        Order <em>desk.</em>
      </h1>
      <p className="ec-admin-intro">
        Manage incoming orders. Status changes are saved in your store database.
      </p>
      {message && (
        <p className="ec-form-message" role="status">
          {message}
        </p>
      )}
      <div className="ec-admin-orders">
        {orders.map((o) => (
          <article className="ec-admin-order" key={o.id}>
            <div className="ec-admin-order-head">
              <div>
                <small>#{o.order_number}</small>
                <h3>{o.customer_name}</h3>
                <p>{new Date(o.created_at).toLocaleString("en-IN")}</p>
              </div>
              <strong>{money(Number(o.total))}</strong>
            </div>
            <p className="ec-address">
              {o.phone}
              <br />
              {o.shipping_address}
            </p>
            <div className="ec-admin-order-actions">
              <span className={`ec-status ec-status-${o.status}`}>
                {o.status.replaceAll("_", " ")}
              </span>
              <label>
                Update status
                <select
                  value={o.status}
                  disabled={busyId === o.id}
                  onChange={(e) => void updateStatus(o.id, e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </label>
            </div>
          </article>
        ))}
        {!orders.length && (
          <div className="ec-empty">
            <PackageCheck />
            <h2>No orders yet</h2>
          </div>
        )}
      </div>
    </main>
  );
}

export default function EcommerceApp() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(Boolean(db));
  const [session, setSession] = useState<Session | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState("");
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("ecomm-cart-v1");
      if (raw) setCart(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore invalid stored cart */
    }
  }, []);
  useEffect(() => {
    try {
      window.localStorage.setItem("ecomm-cart-v1", JSON.stringify(cart));
    } catch {
      /* private browsing storage may be disabled */
    }
  }, [cart]);
  useEffect(() => {
    if (!db) {
      setLoading(false);
      return;
    }
    let active = true;
    db.from("ecommerce_products")
      .select("*")
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .then(({ data, error }) => {
        if (!active) return;
        if (data && !error) setProducts(data as Product[]);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!db) return;
    let active = true;
    db.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);
  const refreshSession = useCallback(async () => {
    if (!db) return;
    const { data } = await db.auth.getSession();
    setSession(data.session);
  }, []);
  const onSignOut = useCallback(async () => {
    if (db) await db.auth.signOut();
    setSession(null);
  }, []);
  const addToCart = useCallback((product: Product) => {
    setCart((old) => {
      const found = old.find((i) => i.id === product.id);
      if (found)
        return old.map((i) =>
          i.id === product.id
            ? { ...i, quantity: Math.min(i.stock, i.quantity + 1) }
            : i,
        );
      return [...old, { ...product, quantity: 1 }];
    });
    setToast(`${product.name} added to your bag`);
    window.setTimeout(() => setToast(""), 2600);
  }, []);
  const setQuantity = useCallback(
    (id: string, quantity: number) =>
      setCart((old) =>
        quantity < 1
          ? old.filter((i) => i.id !== id)
          : old.map((i) =>
              i.id === id ? { ...i, quantity: Math.min(i.stock, quantity) } : i,
            ),
      ),
    [],
  );
  const remove = useCallback(
    (id: string) => setCart((old) => old.filter((i) => i.id !== id)),
    [],
  );
  const clearCart = useCallback(() => setCart([]), []);
  const navigate = useNavigate();
  return (
    <div className="ec-app">
      <ScrollToTop />
      <StoreHeader
        cartCount={cart.reduce((s, i) => s + i.quantity, 0)}
        session={session}
        onSignOut={onSignOut}
      />
      {!isEcommerceConfigured && (
        <div className="ec-config-banner">
          Preview mode: connect your separate e-commerce Supabase project in{" "}
          <code>.env.local</code> to enable sign-in, live products, orders and
          admin features.
        </div>
      )}
      <Routes>
        <Route
          index
          element={
            <StoreHome
              products={products}
              onAdd={addToCart}
              loading={loading}
            />
          }
        />
        <Route
          path="product/:slug"
          element={<ProductDetail products={products} onAdd={addToCart} />}
        />
        <Route
          path="cart"
          element={
            <CartPage
              cart={cart}
              setQuantity={setQuantity}
              remove={remove}
              onCheckout={() => navigate("/e_comm/checkout")}
            />
          }
        />
        <Route
          path="checkout"
          element={
            <CheckoutPage
              cart={cart}
              clearCart={clearCart}
              session={session}
              refreshSession={refreshSession}
            />
          }
        />
        <Route
          path="account"
          element={
            <AccountPage session={session} refreshSession={refreshSession} />
          }
        />
        <Route path="orders" element={<OrdersPage session={session} />} />
        <Route path="admin" element={<AdminPage session={session} />} />
        <Route path="*" element={<Navigate to="/e_comm/" replace />} />
      </Routes>
      <footer className="ec-footer">
        <div className="ec-shell ec-footer-inner">
          <Link className="ec-brand" to="/e_comm/">
            <span className="ec-brand-mark">s.</span>
            <span>
              studio<span className="ec-brand-light">/store</span>
            </span>
          </Link>
          <p>Good things for everyday living.</p>
          <div>
            <Link to="/e_comm/">Shop</Link>
            <Link to="/e_comm/account">Account</Link>
            <Link to="/e_comm/orders">Orders</Link>
            <Link to="/e_comm/admin">Admin</Link>
          </div>
          <small>
            © {new Date().getFullYear()} Studio / Store. Demo storefront.
          </small>
        </div>
      </footer>
      {toast && (
        <div className="ec-toast" role="status">
          <Check size={17} />
          {toast}
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
