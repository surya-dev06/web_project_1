import { ArrowDownRight, ArrowUpRight, MoveUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'
import { Reveal } from '../components/Reveal'
import Scene3D from '../components/Scene3D'
import { SEO } from '../components/SEO'
const photos = {
  restaurant: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85',
  architecture: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=85',
  workspace: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=85'
}
export default function Home() {
  const reduced = useReducedMotion()
  return <><SEO title="Northstar Studio | Digital experiences that move business forward" description="Strategy-led websites, expressive design, and digital systems that help ambitious businesses grow." path="/" />
    <section className="hero section-wrap"><div className="hero-copy"><p className="eyebrow"><span className="status-dot"/> Independent digital studio · Bengaluru / Worldwide</p>
      <motion.h1 initial={reduced ? false : { opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .8, ease: 'easeOut' }}>Make your next<br/>move <em>matter.</em></motion.h1>
      <motion.p className="hero-intro" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: .25, duration: .8 }}>We build thoughtful digital experiences that turn first impressions into lasting business.</motion.p>
      <motion.div className="hero-actions" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .4 }}><Link className="button button-lime" to="/contact">Start a project <ArrowUpRight size={17}/></Link><Link className="text-link" to="/work">Explore our work <ArrowDownRight size={16}/></Link></motion.div>
      <div className="hero-note"><span>01 / Strategy</span><span>02 / Design</span><span>03 / Development</span></div>
    </div><div className="hero-visual"><div className="visual-halo"/><Scene3D/><div className="orbit-label orbit-top">Ideas into impact <MoveUpRight size={14}/></div><div className="orbit-label orbit-bottom">Design with direction</div></div>
    </section>
    <section className="trust-strip"><span>Built for people with ambition</span><div><b>HOSPITALITY</b><b>CONSULTING</b><b>CREATIVE</b><b>STARTUPS</b></div></section>
    <section className="section-wrap intro-section"><Reveal><p className="eyebrow">Not just another website</p><h2>Clear thinking.<br/><span>Unforgettable execution.</span></h2></Reveal><Reveal delay={.12}><p className="large-copy">Your website should do more than look good. It should communicate what makes you different, earn trust, and help the right people take action.</p><Link to="/about" className="text-link">Meet your digital partner <ArrowUpRight size={16}/></Link></Reveal></section>
    <section className="services-section section-wrap"><Reveal><div className="section-heading"><div><p className="eyebrow">What we do</p><h2>Digital, with <em>purpose.</em></h2></div><Link to="/services" className="text-link">All services <ArrowUpRight size={16}/></Link></div></Reveal>
      {[['01','Brand-led websites','Fast, responsive websites with a distinct point of view and clear conversion paths.'],['02','Interactive & 3D','Immersive details and motion that make your story tangible, never distracting.'],['03','SEO & growth foundations','Technical SEO, analytics, structured data, and a plan for learning what works.']].map(([n,title,desc],i)=><Reveal key={n} delay={i*.07}><Link className="service-row" to="/services"><span>{n}</span><h3>{title}</h3><p>{desc}</p><ArrowUpRight className="service-arrow"/></Link></Reveal>)}
    </section>
    <section className="work-section section-wrap"><Reveal><div className="section-heading"><div><p className="eyebrow">A glimpse of possibility</p><h2>Made to be <em>remembered.</em></h2></div><Link to="/work" className="text-link">View project concepts <ArrowUpRight size={16}/></Link></div></Reveal>
      <div className="work-grid"><Reveal className="work-card work-tall"><Link to="/work"><div className="image-frame"><img src={photos.restaurant} alt="Intimate restaurant dining room with warm lighting" loading="lazy"/><span className="image-action"><ArrowUpRight/></span></div><div className="work-meta"><div><h3>Gather & Grain</h3><p>Hospitality · Website concept</p></div><span>01</span></div></Link></Reveal>
      <Reveal delay={.1} className="work-card work-offset"><Link to="/work"><div className="image-frame"><img src={photos.architecture} alt="Contemporary city architecture photographed from below" loading="lazy"/><span className="image-action"><ArrowUpRight/></span></div><div className="work-meta"><div><h3>Form / Function</h3><p>Architecture · Website concept</p></div><span>02</span></div></Link></Reveal>
      <Reveal delay={.18} className="work-card"><Link to="/work"><div className="image-frame"><img src={photos.workspace} alt="Bright modern creative studio workspace" loading="lazy"/><span className="image-action"><ArrowUpRight/></span></div><div className="work-meta"><div><h3>Common Ground</h3><p>Consulting · Website concept</p></div><span>03</span></div></Link></Reveal></div>
      <p className="disclaimer">Photography is sourced from Unsplash. These are illustrative portfolio concepts, not claims of completed client work. Replace with licensed project assets before launch.</p>
    </section>
    <section className="statement-section"><div className="section-wrap statement-inner"><Reveal><p className="eyebrow">The Northstar approach</p><h2>Good design earns attention.<br/><em>Good strategy earns trust.</em></h2><Link to="/about" className="button button-lime">How we work <ArrowUpRight size={16}/></Link></Reveal></div></section>
    <section className="final-cta section-wrap"><Reveal><p className="eyebrow">Have a good thing going?</p><h2>Let’s make the internet<br/><em>notice.</em></h2><Link to="/contact" className="button button-dark">Tell us what you’re building <ArrowUpRight size={16}/></Link></Reveal></section>
  </>
}