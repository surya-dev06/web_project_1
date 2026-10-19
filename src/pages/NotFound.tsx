import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
export default function NotFound() {
  return (
    <section className="page-hero section-wrap">
      <SEO
        title="Page not found | surya Studio"
        description="The page could not be found."
      />
      <p className="eyebrow">404 / Wrong turn</p>
      <h1>
        This page took
        <br />
        <em>a different route.</em>
      </h1>
      <p className="hero-intro">
        The link may be outdated, or the page may have moved.
      </p>
      <Link to="/project_1/" className="button button-dark">
        Back to home ↗
      </Link>
    </section>
  );
}
