import { ArrowUpRight } from "lucide-react";
import { Reveal } from "../components/Reveal";
import { SEO } from "../components/SEO";
const work = [
  {
    title: "Gather & Grain",
    type: "Hospitality concept",
    img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1500&q=85",
    alt: "Restaurant dining setup",
  },
  {
    title: "Form / Function",
    type: "Architecture concept",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1500&q=85",
    alt: "Modern architecture",
  },
  {
    title: "Common Ground",
    type: "Consulting concept",
    img: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1500&q=85",
    alt: "Creative office interior",
  },
];
export default function Work() {
  return (
    <>
      <SEO
        title="Selected work | surya Studio"
        description="Explore illustrative website concepts for hospitality, architecture and consulting businesses."
        path="/work"
      />
      <section className="page-hero section-wrap">
        <Reveal>
          <p className="eyebrow">Selected work / Concept gallery</p>
          <h1>
            Ideas made
            <br />
            <em>visible.</em>
          </h1>
          <p className="hero-intro">
            A look at how distinct industries can show up online with clarity
            and character.
          </p>
        </Reveal>
      </section>
      <section className="section-wrap gallery-grid">
        {work.map((w, i) => (
          <Reveal key={w.title} delay={i * 0.08} className="gallery-item">
            <div className="image-frame">
              <img src={w.img} alt={w.alt} loading="lazy" />
              <span className="image-action">
                <ArrowUpRight />
              </span>
            </div>
            <div className="work-meta">
              <div>
                <h3>{w.title}</h3>
                <p>{w.type}</p>
              </div>
              <span>0{i + 1}</span>
            </div>
          </Reveal>
        ))}
      </section>
      <p className="section-wrap disclaimer">
        These are concept directions using licensed Unsplash photography, not
        verified client case studies. Replace with genuine work, outcomes and
        approved client names before publishing.
      </p>
    </>
  );
}
