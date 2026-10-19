import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Clock3,
  Leaf,
  ScanLine,
  Sparkles,
  Star,
} from "lucide-react";
import { demoMenu } from "../data/menu";
const marqueeItems = ["FRESHLY PREPARED", "BIG FLAVOUR", "MADE TO SHARE"];
export default function RestaurantHome() {
  return (
    <div className="r-home">
      <section className="r-hero">
        <div className="r-hero-copy">
          <div className="r-kicker">
            <span className="r-live-dot" /> YOUR TABLE, YOUR PACE
          </div>
          <h1>
            Good food.
            <br />
            <em>Great mood.</em>
          </h1>
          <p className="r-hero-intro">
            Fresh plates, playful flavours and the kind of meal you’ll talk
            about tomorrow. Scan, order, relax.
          </p>
          <div className="r-hero-actions">
            <Link to="/project_2/menu" className="r-primary-btn">
              Explore the menu <ArrowUpRight size={18} />
            </Link>
            <Link className="r-secondary-link" to={{ hash: "#how-it-works" }}>
              How ordering works <span>↓</span>
            </Link>
          </div>
          <div className="r-social-proof">
            <div className="r-avatar-stack">
              <span>J</span>
              <span>M</span>
              <span>A</span>
              <span>+</span>
            </div>
            <div>
              <div className="r-stars">
                <Star />
                <Star />
                <Star />
                <Star />
                <Star />
              </div>
              <small>Made for sharing, loved by locals</small>
            </div>
          </div>
        </div>
        <div className="r-hero-art">
          <div className="r-orbit r-orbit-one" />
          <div className="r-orbit r-orbit-two" />
          <div className="r-floating-note note-top">
            <Sparkles size={15} /> Made fresh, always
          </div>
          <div className="r-hero-food">
            <img
              src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=90"
              alt="Colourful fresh restaurant bowl"
            />
          </div>
          <div className="r-food-chip chip-left">
            <span>01</span>
            <div>
              <b>Fresh ingredients</b>
              <small>Seasonal & local</small>
            </div>
          </div>
          <div className="r-floating-note note-bottom">
            <Leaf size={15} /> Plenty of veggie love
          </div>
        </div>
        <div className="r-hero-stamp">
          GOOD
          <br />
          VIBES
          <br />
          <span>ONLY</span>
        </div>
      </section>
      <section className="r-marquee" aria-label="Our promise">
        <div className="r-marquee-viewport">
          <div className="r-marquee-track">
            {[0, 1].map((copy) => (
              <div
                className="r-marquee-group"
                key={copy}
                aria-hidden={copy === 1}
              >
                {[...marqueeItems, ...marqueeItems].map((text, i) => (
                  <span className="r-marquee-item" key={`${copy}-${i}`}>
                    {text}
                    <i>✳</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="r-section r-featured">
        <div className="r-section-heading">
          <div>
            <span className="r-kicker">THE CROWD PLEASERS</span>
            <h2>
              A little something
              <br />
              for <em>every craving.</em>
            </h2>
          </div>
          <Link to="/project_2/menu" className="r-text-link">
            Full menu <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="r-dish-grid">
          {demoMenu
            .filter((d) => d.is_featured)
            .slice(0, 3)
            .map((dish, i) => (
              <article
                className={`r-dish-card dish-card-${i + 1}`}
                key={dish.id}
              >
                <div className="r-dish-image">
                  <img src={dish.image_url} alt={dish.name} />
                  <span className="r-dish-number">0{i + 1}</span>
                </div>
                <div className="r-dish-info">
                  <div>
                    <h3>{dish.name}</h3>
                    <p>{dish.description}</p>
                  </div>
                  <b>₹{dish.price}</b>
                </div>
                <span className="r-dish-category">{dish.category}</span>
              </article>
            ))}
        </div>
      </section>
      <section className="r-how" id="how-it-works">
        <div className="r-how-visual">
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1100&q=85"
            alt="Friends enjoying a meal at a restaurant"
          />
          <div className="r-qr-card">
            <ScanLine size={25} />
            <b>Scan. Tap. Eat.</b>
            <span>That's the whole process.</span>
          </div>
        </div>
        <div className="r-how-copy">
          <span className="r-kicker">NO APP. NO FUSS.</span>
          <h2>
            Your table.
            <br />
            Your <em>kind of easy.</em>
          </h2>
          <p>
            Skip the queue and order right from your phone. Your favourites are
            only a few taps away.
          </p>
          <div className="r-steps">
            <div>
              <span>01</span>
              <div>
                <b>Scan the table QR</b>
                <p>Open the menu instantly in your browser.</p>
              </div>
            </div>
            <div>
              <span>02</span>
              <div>
                <b>Pick your favourites</b>
                <p>Customise your plate and add it to your cart.</p>
              </div>
            </div>
            <div>
              <span>03</span>
              <div>
                <b>We’ll get cooking</b>
                <p>Place your order and follow its progress.</p>
              </div>
            </div>
          </div>
          <Link to="/project_2/menu" className="r-primary-btn">
            Let's find your flavour <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="r-bottom-cta">
        <div>
          <span className="r-kicker">YOUR NEXT FAVOURITE IS HERE</span>
          <h2>
            Come hungry.
            <br />
            <em>Leave happy.</em>
          </h2>
        </div>
        <Link to="/project_2/menu" className="r-light-btn">
          Order something lovely <ArrowUpRight size={18} />
        </Link>
        <div className="r-cta-orb" />
      </section>
    </div>
  );
}
