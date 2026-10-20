import { Link } from "react-router-dom";
import { BarChart3, Gauge, Lightbulb, Layers, Settings, ShieldCheck, Target, type LucideIcon } from "lucide-react";
import { Reveal } from "./Reveal";
export const CARDS: [LucideIcon, string, string][] = [
  [Target, "Website Design", "Clean, fast, mobile-first websites that explain what you do and turn visitors into enquiries."],
  [Layers, "Web Applications", "Dashboards, booking and ordering systems built with React, Node.js and Spring Boot."],
  [Settings, "Payments & Integrations", "Razorpay payments, Supabase back ends and third-party APIs connected securely."],
];
export const FOCUS: [LucideIcon, string, string][] = [
  [Gauge, "Performance", "Fast load times and smooth interactions on every device."],
  [ShieldCheck, "Reliability", "Secure authentication, validated data and sensible error handling."],
  [Lightbulb, "Innovation", "Modern tooling and thoughtful UX instead of off-the-shelf templates."],
  [BarChart3, "Analytics", "Admin dashboards and reports so you can see how the business is doing."],
];
export const PROJECTS = [
  { t: "QR Restaurant Ordering", d: "Customers order from their table; the kitchen sees orders live and manages the menu from an admin dashboard.", img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80", to: "/project_2/" },
  { t: "E-Commerce with Razorpay", d: "Storefront, cart, secure online payments, order tracking and a full product and order admin panel.", img: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=800&q=80", to: "/e_comm/" },
  { t: "Real-time Platforms", d: "Ride-hailing, WebRTC video calling and a financial gateway built for production use.", img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80", to: "/project_1/work" },
];
export const ServiceCards = () => <div className="ax-cards">{CARDS.map(([I, t, d], i) => <Reveal key={t} delay={i * 0.08}><article className="ax-card"><I size={38} strokeWidth={1.4} /><h3>{t}</h3><p>{d}</p><Link className="ax-btn" to="/project_1/services">Learn More</Link></article></Reveal>)}</div>;
export const Focus = () => <section className="ax-focus"><h2>OUR FOCUS</h2><div className="ax-focus-grid">{FOCUS.map(([I, t, d], i) => <Reveal key={t} delay={i * 0.08}><div className="ax-focus-item"><I size={34} strokeWidth={1.4} /><h3>{t}</h3><p>{d}</p><Link className="ax-btn small" to="/project_1/services">Learn More</Link></div></Reveal>)}</div></section>;
export const Projects = ({ dark = true }: { dark?: boolean }) => <section className={`ax-projects ${dark ? "" : "light"}`}><h2>RECENT PROJECTS</h2><div className="ax-proj-grid">{PROJECTS.map((p, i) => <Reveal key={p.t} delay={i * 0.1}><article className="ax-proj"><div className="ax-proj-img"><img src={p.img} alt={p.t} loading="lazy" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} /></div><div className="ax-proj-body"><h3>{p.t}</h3><p>{p.d}</p><Link className="ax-btn small" to={p.to}>View</Link></div></article></Reveal>)}</div></section>;
