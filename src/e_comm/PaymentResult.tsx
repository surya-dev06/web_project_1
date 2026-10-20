import { Link, useSearchParams } from "react-router-dom";
import { CircleCheck, CircleX } from "lucide-react";

export function PaymentSuccess() {
  const [q] = useSearchParams();
  return (
    <main className="ec-shell ec-page ec-result ec-fade">
      <CircleCheck size={64} className="ec-result-ok" />
      <h1 className="ec-page-title">Payment <em>successful.</em></h1>
      <p>Thank you! Your payment was verified{q.get("order") ? <> for order <strong>{q.get("order")}</strong></> : null}. A confirmation email is on its way.</p>
      <div className="ec-result-actions">
        <Link className="ec-button ec-button-dark" to="/e_comm/orders">View my orders</Link>
        <Link className="ec-button" to="/e_comm/">Continue shopping</Link>
      </div>
    </main>
  );
}
export function PaymentFailed() {
  return (
    <main className="ec-shell ec-page ec-result ec-fade">
      <CircleX size={64} className="ec-result-bad" />
      <h1 className="ec-page-title">Payment <em>not completed.</em></h1>
      <p>No money was taken, or any amount debited will be refunded by your bank within 5–7 working days. Your items are back in your bag.</p>
      <div className="ec-result-actions">
        <Link className="ec-button ec-button-dark" to="/e_comm/checkout">Try again</Link>
        <Link className="ec-button" to="/e_comm/cart">Back to bag</Link>
      </div>
    </main>
  );
}
