import { Mail, MessageCircle, MapPin } from "lucide-react";
import ContactForm from "../components/ContactForm";
import { Reveal } from "../components/Reveal";
import { SEO } from "../components/SEO";
export default function Contact() {
  const phone = import.meta.env.VITE_WHATSAPP_NUMBER || "919876543210";
  return (
    <>
      <SEO
        title="Contact | surya Studio"
        description="Tell surya Studio about your website, design, 3D or SEO project."
        path="/contact"
      />
      <section className="page-hero section-wrap">
        <Reveal>
          <p className="eyebrow">Contact / Start a conversation</p>
          <h1>
            What are you
            <br />
            <em>imagining?</em>
          </h1>
          <p className="hero-intro">
            Tell us where you want to go. We’ll help you map the next step.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap contact-layout">
        <Reveal>
          <div className="contact-side">
            <h2>
              Good work starts
              <br />
              with a good question.
            </h2>
            <p>
              Share a little about your business, your goals, and what you need
              help with.
            </p>
            <a
              className="contact-method"
              href={`https://wa.me/${phone}?text=${encodeURIComponent("Hi, I would like to discuss a project.")}`}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle /> Message on WhatsApp <span>↗</span>
            </a>
            <a className="contact-method" href="mailto:hello@yourdomain.com">
              <Mail /> hello@yourdomain.com <span>↗</span>
            </a>
            <div className="contact-method">
              <MapPin /> Bengaluru, India · Working worldwide
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
