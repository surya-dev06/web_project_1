import type { ReactNode } from "react";
const S = ({ t, children }: { t: string; children: ReactNode }) => <section><h2>{t}</h2>{children}</section>;
const wrap = (title: string, body: ReactNode) => (
  <main className="ec-shell ec-page ec-legal ec-fade">
    <h1 className="ec-page-title">{title}</h1>
    <p className="ec-muted">Last updated: {new Date().toLocaleDateString("en-IN", { dateStyle: "long" })}. Replace the bracketed business details before launch.</p>
    {body}
  </main>
);
export const StoreTerms = () => wrap("Terms & Conditions", <>
  <S t="1. About these terms"><p>By using this store you agree to these terms. The store is operated by [Your legal business name], [address], India.</p></S>
  <S t="2. Orders and pricing"><p>All prices are in INR and include applicable taxes unless stated. An order is accepted when payment is confirmed. We may cancel an order if an item is unavailable or priced in error; you will be refunded in full.</p></S>
  <S t="3. Payments"><p>Payments are processed by Razorpay. We never see or store your card, UPI or bank details. A failed payment does not create a confirmed order.</p></S>
  <S t="4. Shipping"><p>Orders above ₹2,999 ship free; otherwise a ₹149 fee applies. Delivery estimates are indicative, not guaranteed.</p></S>
  <S t="5. Returns and refunds"><p>Report damaged or incorrect items within 7 days of delivery. Approved refunds go back to the original payment method within 5–7 working days.</p></S>
  <S t="6. Accounts"><p>You are responsible for your account credentials and for the accuracy of the details you provide.</p></S>
  <S t="7. Governing law"><p>These terms are governed by the laws of India. Disputes fall under the courts of [your city].</p></S>
  <S t="8. Contact"><p>[support@yourdomain.com]</p></S>
</>);
export const StorePrivacy = () => wrap("Privacy Policy", <>
  <S t="What we collect"><p>Name, email, phone number, delivery address and order history that you give us, plus basic device data needed to keep the site secure.</p></S>
  <S t="How we use it"><p>To process and deliver orders, take payments, send order updates and prevent fraud. We do not sell your personal data.</p></S>
  <S t="Who we share it with"><p>Supabase (hosting and database), Razorpay (payments) and our delivery and email providers, only as needed to serve your order.</p></S>
  <S t="Retention and your rights"><p>We keep order records as required by Indian tax law. You may request access, correction or deletion of your data by emailing [support@yourdomain.com].</p></S>
  <S t="Cookies and storage"><p>We store your bag and theme choice in your browser, and a sign-in session. No advertising trackers are used by this store.</p></S>
</>);
