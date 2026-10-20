import { Link } from "react-router-dom";
import { SEO } from "../components/SEO";
import { Focus } from "../components/Blocks";
export default function About() {
  return (<>
    <SEO title="About | Surya Studio" description="About Surya Studio." path="/project_1/about" />
    <section className="ax-page-head"><h1>About Us</h1><p>A full stack development studio based in Bengaluru, India.</p></section>
    <section className="ax-list"><h2>Who we are</h2><p>Surya Studio is led by Surya S, a full stack developer working with Java, Spring Boot, Node.js, TypeScript, React and AWS. Experience building ride-hailing, WebRTC video and financial gateway systems shapes how we build for clients: simple, secure and ready for real users.</p><p>We work directly with business owners, so you talk to the person building your product.</p><Link className="ax-btn" to="/project_1/contact">Start a project</Link></section>
    <Focus />
  </>);
}
