import { useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Check, ChefHat, Clock3, CookingPot, PackageCheck, ArrowRight, Home } from "lucide-react";
import { supabase } from "../lib/supabase";
import type { Order } from "../types";

/** Where the customer lands after the order is served. */
const HOME_PATH = "/project_2/";
/** Seconds to show the thank-you message before going back home. */
const REDIRECT_SECONDS = 6;
/** How often we ask Supabase for the latest status. */
const POLL_MS = 5000;

type TrackedOrder = Pick<Order, "id" | "order_number" | "status" | "total"> &
  Partial<Pick<Order, "items" | "created_at">>;

const stages = [
  { key: "new", title: "Order received", detail: "We've got your order.", icon: Check },
  { key: "preparing", title: "Freshness in progress", detail: "Our kitchen is on it.", icon: CookingPot },
  { key: "ready", title: "Ready to enjoy", detail: "Your order is ready.", icon: PackageCheck },
  { key: "served", title: "Enjoy every bite", detail: "Thanks for ordering with us.", icon: ChefHat },
];

export default function OrderStatusPage() {
  const { orderId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_SECONDS);

  // Load the order, then keep it fresh (realtime + polling).
  useEffect(() => {
    let alive = true;
    let done = false;
    let channel: RealtimeChannel | undefined;
    let timer: number | undefined;
    // Local const: TypeScript keeps the "not null" check inside the callbacks below.
    const client = supabase;

    const start = async () => {
      if (orderId?.startsWith("demo-")) {
        const saved = JSON.parse(sessionStorage.getItem("pp-last-order") || "null");
        if (alive) setOrder(saved as TrackedOrder | null);
        return;
      }
      if (!client) {
        setError("Connect Supabase to look up this order.");
        return;
      }
      if (!orderId || !token) {
        setError("This order link is missing its private tracking token.");
        return;
      }

      const load = async () => {
        const { data, error: rpcError } = await client.rpc("get_order_status", {
          p_order_id: orderId,
          p_tracking_token: token,
        });
        if (!alive) return;
        if (rpcError) {
          setError(rpcError.message);
          return;
        }
        if (data) {
          setError("");
          setOrder(data as TrackedOrder);
          if (data.status === "served" || data.status === "cancelled") {
            done = true;
            if (timer) window.clearInterval(timer);
          }
        }
      };

      await load();
      if (!alive || done) return;

      // Realtime only reaches signed-in staff (RLS), so polling is what updates customers.
      channel = client
        .channel(`order-${orderId}`)
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },
          () => void load(),
        )
        .subscribe();
      timer = window.setInterval(() => void load(), POLL_MS);
    };

    void start();

    return () => {
      alive = false;
      if (timer) window.clearInterval(timer);
      if (channel && client) void client.removeChannel(channel);
    };
  }, [orderId, token]);

  const status = order?.status || "new";
  const active = stages.findIndex((s) => s.key === status);
  const isServed = status === "served";

  // Once served: say thanks, then send the customer back to the main page.
  useEffect(() => {
    if (!isServed) return;
    sessionStorage.removeItem("pp-last-order");
    sessionStorage.removeItem("pp-cart");
    setSecondsLeft(REDIRECT_SECONDS);
    const tick = window.setInterval(() => setSecondsLeft((s) => Math.max(s - 1, 0)), 1000);
    const go = window.setTimeout(() => navigate(HOME_PATH, { replace: true }), REDIRECT_SECONDS * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(go);
    };
  }, [isServed, navigate]);

  return (
    <div className="r-status-page">
      <div className="r-status-confetti"><span>✳</span><span>✦</span><span>✳</span></div>
      <div className="r-status-icon"><ChefHat size={34} /></div>
      <span className="r-kicker">THAT WAS A GOOD CHOICE</span>
      <h1>{isServed ? "Hope you loved it!" : status === "ready" ? "Your food is ready!" : "Order received!"}</h1>
      <p className="r-status-intro">Your taste buds have something to look forward to.</p>

      <div className="r-order-ticket">
        <div><span>ORDER NUMBER</span><b>{order?.order_number || params.get("number") || "Preparing..."}</b></div>
        <div><span>ORDER TOTAL</span><b>₹{order?.total ?? "—"}</b></div>
      </div>

      {error && <p className="r-form-error">{error}</p>}

      <div className="r-timeline">
        {stages.map((s, i) => {
          const Icon = s.icon;
          return (
            <div className={`r-timeline-step ${i < active ? "done" : i === active ? "current" : ""}`} key={s.key}>
              <span className="r-timeline-icon"><Icon size={18} /></span>
              <div><b>{s.title}</b><p>{s.detail}</p></div>
              {i < active && <Check size={17} />}
            </div>
          );
        })}
      </div>

      {isServed ? (
        <div className="r-redirect-note" role="status" aria-live="polite">
          <Home size={18} />
          <p>
            <b>Thanks for dining with us!</b>
            <br />
            Taking you back to the main page in {secondsLeft}s…
          </p>
          <Link to={HOME_PATH} replace className="r-redirect-now">Go now</Link>
        </div>
      ) : (
        <div className="r-status-tip">
          <Clock3 size={18} />
          <p>
            <b>Good things take a little time.</b>
            <br />
            Your status updates here when the restaurant updates your order.
          </p>
        </div>
      )}

      <Link to="/project_2/menu" className="r-primary-btn">Order a little more <ArrowRight size={17} /></Link>
    </div>
  );
}