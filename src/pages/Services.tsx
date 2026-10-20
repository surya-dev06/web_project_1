import { SEO } from "../components/SEO";
import { CARDS, Focus } from "../components/Blocks";
import { Reveal } from "../components/Reveal";
const more = ["Responsive business websites and landing pages", "Custom web applications with React, TypeScript, Node.js and Spring Boot", "Online ordering, booking and e-commerce systems", "Razorpay payment integration and order management", "Supabase / AWS back ends, authentication and admin panels", "Ongoing maintenance, performance and SEO improvements"];
export default function Services() {
  return (<>
    <SEO title="Services | Surya Studio" description="Website design, web applications, payments and integrations." path="/project_1/services" />
    <section className="ax-page-head"><h1>Our Services</h1><p>End-to-end web development, from first design to a secure, working product.</p></section>
    <section className="ax-overlap flat"><div className="ax-cards">{CARDS.map(([I, t, d]) => <Reveal key={t}><article className="ax-card"><I size={38} strokeWidth={1.4} /><h3>{t}</h3><p>{d}</p></article></Reveal>)}</div></section>
    <section className="ax-list"><h2>What we build</h2><ul>{more.map((m) => <li key={m}>{m}</li>)}</ul></section>
    <Focus />
  </>);
}
