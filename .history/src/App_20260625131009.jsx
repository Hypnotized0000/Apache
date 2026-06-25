import { useEffect, useState } from "react";
import bigLogo from "../biglogo.svg";
import SecureChannel from "./SecureChannel.jsx";

const navItems = [
  { label: "Kanaal", target: "kanaal" },
  { label: "Werking", target: "werking" },
  { label: "LoRaWAN", target: "lorawan" },
];

const heroMeta = ["Versleuteld", "LoRaWAN", "Real-time"];

const workSteps = [
  {
    title: "Dragen",
    body: "De wintersporter draagt het Apache-device tijdens het skien of snowboarden.",
  },
  {
    title: "Verwerken",
    body: "Een Arduino verwerkt de gegevens van het device, zoals locatie en een mogelijke noodsituatie.",
  },
  {
    title: "Versturen",
    body: "Via LoRaWAN gaat compacte, versleutelde data over grote afstand met laag energieverbruik.",
  },
  {
    title: "Vinden",
    body: "De ontvangen locatie helpt om hulp gerichter naar de juiste plek te sturen.",
  },
];

const loraSpecs = [
  { label: "Bereik", value: "Kilometers, ook buiten dekking" },
  { label: "Energie", value: "Zuinig genoeg voor een hele dag" },
  { label: "Payload", value: "Enkele bytes per bericht" },
];

const footerMeta = [
  { label: "Cijfer", value: "XTEA-128 / CTR" },
  { label: "Transport", value: "LoRaWAN / USB-serial" },
  { label: "Demo", value: "Live aan de stand" },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavigate = () => setIsMenuOpen(false);

  return (
    <div className="app-shell">
      <header className={`site-header ${scrolled ? "is-scrolled" : ""}`} aria-label="Main navigation">
        <a className="brand" href="#top" onClick={handleNavigate}>
          Apache
        </a>

        <nav
          id="site-navigation"
          className={`site-nav ${isMenuOpen ? "is-open" : ""}`}
          aria-label="Page sections"
        >
          {navItems.map((item) => (
            <a key={item.target} href={`#${item.target}`} onClick={handleNavigate}>
              {item.label}
            </a>
          ))}
          <a className="nav-cta" href="#kanaal" onClick={handleNavigate}>
            Open kanaal
          </a>
        </nav>

        <button
          className={`menu-button ${isMenuOpen ? "is-open" : ""}`}
          type="button"
          aria-expanded={isMenuOpen}
          aria-controls="site-navigation"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((current) => !current)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      <main id="top">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-inner">
            <div className="hero-text">
              <p className="eyebrow">Beveiligde communicatie over LoRaWAN</p>
              <h1 id="hero-title">Apache</h1>
              <p className="hero-statement">Als elke minuut telt, moet hulp weten waar je bent.</p>
              <p className="hero-copy">
                Een LoRaWAN Arduino-device voor wintersporters. Wanneer er een ongeluk gebeurt
                en een telefoon geen bereik of batterij meer heeft, geeft Apache de locatie van
                de drager versleuteld door.
              </p>
              <div className="hero-actions" aria-label="Primary actions">
                <a className="button primary" href="#kanaal">
                  Open het kanaal
                </a>
                <a className="button ghost" href="#werking">
                  Hoe het werkt
                </a>
              </div>
            </div>
            <div className="hero-visual" aria-hidden="true">
              <img className="hero-logo" src={bigLogo} alt="" />
            </div>
          </div>
          <ul className="hero-meta" aria-label="Kenmerken">
            {heroMeta.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section id="kanaal" className="channel-section" aria-labelledby="channel-title">
          <div className="channel-section-inner">
            <header className="channel-intro">
              <p className="eyebrow eyebrow-light">Live demo</p>
              <h2 id="channel-title">Stuur het device een versleuteld bericht.</h2>
              <p className="section-lead section-lead-light">
                Verbind met het Apache-device naast je. Je tekst wordt in de browser versleuteld,
                gaat als ruwe bytes over de kabel naar de Arduino en verschijnt daar ontsleuteld
                op het scherm. Het device stuurt versleuteld een antwoord terug.
              </p>
            </header>
            <SecureChannel />
          </div>
        </section>

        <section id="werking" className="content-section" aria-labelledby="work-title">
          <div className="section-shell">
            <header className="section-head">
              <p className="eyebrow">Werking</p>
              <h2 id="work-title">Hoe werkt Apache?</h2>
            </header>
            <ol className="steps">
              {workSteps.map((step, index) => (
                <li className="step" key={step.title}>
                  <span className="step-num" aria-hidden="true">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="step-text">
                    <h3>{step.title}</h3>
                    <p>{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="lorawan" className="content-section alt" aria-labelledby="lorawan-title">
          <div className="section-shell">
            <header className="section-head">
              <p className="eyebrow">LoRaWAN</p>
              <h2 id="lorawan-title">Waarom LoRaWAN?</h2>
            </header>
            <div className="lorawan-body">
              <div className="lorawan-copy">
                <p>
                  LoRaWAN is geschikt voor berichten die klein zijn, maar belangrijk: een locatie,
                  een status of een noodsignaal. Het vraagt weinig energie en reikt veel verder
                  dan normale korte-afstandsverbindingen.
                </p>
                <p>
                  Daardoor past het goed bij een draagbaar wintersport-device. Het hoeft geen
                  telefoon te vervangen; het vult juist het gat op wanneer de telefoon niet
                  bruikbaar is.
                </p>
              </div>
              <dl className="spec-list">
                {loraSpecs.map((spec) => (
                  <div className="spec-item" key={spec.label}>
                    <dt>{spec.label}</dt>
                    <dd>{spec.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <aside className="callout">
              <h3>Apache is bedoeld als extra veiligheidslaag.</h3>
              <p>
                Het device helpt om sneller een locatie door te geven, maar blijft onderdeel van
                een groter veiligheidssysteem met goede voorbereiding, zichtbaarheid, lokale
                hulpdiensten en verantwoordelijk gedrag op de piste.
              </p>
            </aside>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="footer-word">Apache</span>
            <p>Beveiligde, versleutelde communicatie over LoRaWAN.</p>
            <a className="button primary" href="#kanaal">
              Open het kanaal
            </a>
          </div>
          <dl className="footer-meta">
            {footerMeta.map((item) => (
              <div key={item.label}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="footer-base">
          <span>Apache - presentatieproject</span>
          <ul className="footer-tags" aria-hidden="true">
            <li>Beveiligd</li>
            <li>Versleuteld</li>
            <li>Real-time</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}
