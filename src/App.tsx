import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { Privacy, Terms } from "./pages/Legal";
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* <Route index element={<Home />} /> */}
        <Route path="project_1" index element={<Home />} />
        <Route path="project_1/services" element={<Services />} />
        <Route path="project_1/work" element={<Work />} />
        <Route path="project_1/about" element={<About />} />
        <Route path="project_1/contact" element={<Contact />} />
        <Route path="project_1/auth" element={<Auth />} />
        <Route path="project_1/privacy" element={<Privacy />} />
        <Route path="project_1/terms" element={<Terms />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
