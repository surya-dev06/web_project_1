import type { ReactNode } from "react";
const P = ({ title, children }: { title: string; children: ReactNode }) => <section className="sv-section sv-doc"><h2>{title}</h2>{children}</section>;
const H = ({ t, children }: { t: string; children: ReactNode }) => <><h3>{t}</h3><p>{children}</p></>;
export const About = () => <P title="About Plum & Plate"><p>Plum &amp; Plate is a neighbourhood kitchen built around one idea: great food shouldn't mean waiting to catch a waiter's eye. Scan the table QR, pick your dishes, and the kitchen gets your order instantly — you can follow its progress live until it reaches your table.</p><p>Our menu is cooked fresh to order from locally sourced ingredients, with clearly marked vegetarian options.</p></P>;
export const Contact = () => <P title="Contact"><p>For reservations, feedback or order help, reach us at the details below or speak to any team member at your table.</p><p>{import.meta.env.VITE_RESTAURANT_PHONE ? `Phone: ${import.meta.env.VITE_RESTAURANT_PHONE}` : "Phone: add VITE_RESTAURANT_PHONE to your environment"}</p><p>{import.meta.env.VITE_RESTAURANT_EMAIL ? `Email: ${import.meta.env.VITE_RESTAURANT_EMAIL}` : "Email: add VITE_RESTAURANT_EMAIL to your environment"}</p></P>;
export const Terms = () => <P title="Terms & Conditions">
  <H t="Orders">Orders placed through this site are sent directly to the kitchen. Preparation times are estimates. An order can be cancelled only before the kitchen starts preparing it.</H>
  <H t="Prices">Prices are in INR. Applicable taxes are handled by the restaurant and shown on your final bill.</H>
  <H t="Allergies">Please mention allergies in the order notes and tell your server. Our kitchen handles common allergens, so we cannot guarantee any dish is allergen-free.</H>
  <H t="Payments">This site does not collect payment online; you pay at the restaurant unless the restaurant tells you otherwise.</H>
  <H t="Changes">We may update these terms from time to time. Continued use of the site means you accept the updated terms.</H></P>;
export const Privacy = () => <P title="Privacy Policy">
  <H t="What we collect">Your name, optional phone number, table number and order notes, only to prepare and serve your order.</H>
  <H t="How we use it">To process your order, show you its status and contact you about it. We do not sell your data or use it for advertising.</H>
  <H t="Storage">Orders are stored securely with our database provider, Supabase. Your cart is kept only in your browser session.</H>
  <H t="Your rights">You may ask us to correct or delete your order details by contacting the restaurant.</H></P>;
