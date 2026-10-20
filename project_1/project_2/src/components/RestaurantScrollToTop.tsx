import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "lucide-react";

/**
 * - Every route change (home, menu, cart, order status, admin) opens at the top.
 * - Links with a hash (e.g. /project_2/#how-it-works) scroll smoothly to that section.
 * - Floating "scroll to top" button appears after scrolling down.
 */
export default function RestaurantScrollToTop() {
  const { pathname, hash, key } = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      const frame = window.requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      });
      return () => window.cancelAnimationFrame(frame);
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, hash, key]);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`r-scroll-top${visible ? " is-visible" : ""}`}
      aria-label="Scroll to top"
      title="Scroll to top"
      tabIndex={visible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={19} strokeWidth={2.2} />
    </button>
  );
}