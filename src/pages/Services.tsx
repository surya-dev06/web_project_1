import { ArrowUpRight, Compass, Code2, Search, Cuboid } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "../components/Reveal";
import { SEO } from "../components/SEO";
const items = [
  {
    icon: Compass,
    n: "01",
    title: "Strategy & identity",
    body: "Positioning, messaging, information architecture, and a clear digital direction.",
  },
  {
    icon: Code2,
    n: "02",
    title: "Business websites",
    body: "Responsive React builds, accessible interfaces, conversion-minded page journeys, and CMS-ready foundations.",
  },
  {
    icon: Cuboid,
    n: "03",
    title: "Motion & 3D",
    body: "Purposeful transitions, scroll reveals, and interactive 3D moments with reduced-motion support.",
  },
  {
    icon: Search,
    n: "04",
    title: "SEO & measurement",
    body: "Technical SEO, structured data, Search Console, analytics events, and performance improvements.",
  },
];
export default function Services() {
  return (
    <>
      <SEO
        title="Services | surya Studio"
        description="Website strategy, React development, 3D interactions, technical SEO and analytics foundations."
        path="/project_1/services"
      />
      <section className="page-hero section-wrap">
        <Reveal>
          <p className="eyebrow">Services / Strategy to launch</p>
          <h1>
            Built around your
            <br />
            <em>next chapter.</em>
          </h1>
          <p className="hero-intro">
            A joined-up digital partner, from the first sharp question to a site
            that is ready to grow.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap service-detail-list">
        {items.map(({ icon: Icon, n, title, body }, i) => (
          <Reveal key={n} delay={i * 0.06}>
            <article className="detail-row">
              <span className="detail-num">{n}</span>
              <Icon size={30} strokeWidth={1.4} />
              <div>
                <h2>{title}</h2>
                <p>{body}</p>
              </div>
              <ArrowUpRight />
            </article>
          </Reveal>
        ))}
      </section>
      <section className="statement-section">
        <div className="section-wrap statement-inner">
          <p className="eyebrow">A practical process</p>
          <h2>
            Discover. Design.
            <br />
            <em>Build. Learn.</em>
          </h2>
          <p className="large-copy">
            We start with your business goals, make the important decisions
            visible, build in focused iterations, and measure what happens after
            launch.
          </p>
        </div>
      </section>
      <section className="final-cta section-wrap">
        <Reveal>
          <h2>Have a project in mind?</h2>
          <Link to="/project_1/contact" className="button button-dark">
            Let’s talk <ArrowUpRight />
          </Link>
        </Reveal>
      </section>
    </>
  );
}
