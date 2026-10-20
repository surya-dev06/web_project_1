import { useEffect, useState } from "react";
import { Check, CircleAlert, X } from "lucide-react";

type Toast = { id: number; text: string; kind: "ok" | "error" };
// Call notify() from anywhere; <ToastHost /> renders it. Replaces alert().
export const notify = (text: string, kind: "ok" | "error" = "ok") =>
  window.dispatchEvent(new CustomEvent("ec-toast", { detail: { text, kind } }));

export function ToastHost() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const on = (e: Event) => {
      const { text, kind } = (e as CustomEvent).detail;
      const id = Date.now() + Math.random();
      setItems((o) => [...o, { id, text, kind }]);
      window.setTimeout(() => setItems((o) => o.filter((t) => t.id !== id)), 3600);
    };
    window.addEventListener("ec-toast", on);
    return () => window.removeEventListener("ec-toast", on);
  }, []);
  return (
    <div className="ec-toasts" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className={`ec-pop ec-pop-${t.kind}`}>
          {t.kind === "ok" ? <Check size={16} /> : <CircleAlert size={16} />}
          <span>{t.text}</span>
          <button aria-label="Dismiss" onClick={() => setItems((o) => o.filter((x) => x.id !== t.id))}><X size={14} /></button>
        </div>
      ))}
    </div>
  );
}
