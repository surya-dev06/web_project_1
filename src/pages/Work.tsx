import { SEO } from "../components/SEO";
import { Projects } from "../components/Blocks";
export default function Work() {
  return (<>
    <SEO title="Projects | Surya Studio" description="Selected web projects." path="/project_1/work" />
    <section className="ax-page-head"><h1>Our Projects</h1><p>A selection of the products we have designed and built.</p></section>
    <Projects />
  </>);
}
