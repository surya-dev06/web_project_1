import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import Work from "./pages/Work";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { Privacy, Terms } from "./pages/Legal";
import RestaurantApp from "../project_2/src/RestaurantApp";
export default function App() {
 return <Routes>
  <Route path="/" element={<Navigate to="/project_1/" replace />} />
  <Route path="/project_1" element={<Layout/>}>
   <Route index element={<Home/>}/><Route path="services" element={<Services/>}/><Route path="work" element={<Work/>}/><Route path="about" element={<About/>}/><Route path="contact" element={<Contact/>}/><Route path="auth" element={<Auth/>}/><Route path="privacy" element={<Privacy/>}/><Route path="terms" element={<Terms/>}/>
  </Route>
  <Route path="/project_2/*" element={<RestaurantApp/>}/>
  <Route path="*" element={<NotFound/>}/>
 </Routes>;
}
