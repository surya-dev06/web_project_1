import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Focus, Projects, ServiceCards } from "../components/Blocks";
export default function Home() {
  return (
    <>
      <SEO title="Surya Studio | Websites & Web Apps" description="Full stack websites, web apps and payment-ready stores for businesses in India." path="/project_1/" />
      <section className="ax-hero">
        <div className="ax-hero-bg" style={{ backgroundImage: "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1800&q=80)" }} />
        <div className="ax-hero-copy">
          <h1>Empowering Business Success</h1>
          <p>Elevate your business with expert web and software services</p>
          <div><Link className="ax-btn" to="/project_1/about">About Us</Link><Link className="ax-btn dark" to="/project_1/contact">Get in Touch</Link></div>
        </div>
      </section>
      <section className="ax-overlap"><ServiceCards /></section>
      <Focus />
      <Projects />
    </>
  );
}
