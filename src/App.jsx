import { useEffect, useState } from "react";
import bigLogo from "../biglogo.svg";

const navItems = [
  { label: "Home", target: "top" },
  { label: "Code demo", target: "code-demo" },
  { label: "Werking", target: "werking" },
  { label: "LoRaWAN", target: "lorawan" },
];

const workSteps = [
  "De wintersporter draagt het Apache-device tijdens het skiën of snowboarden.",
  "Een Arduino verwerkt de gegevens van het device, zoals locatie en een mogelijke noodsituatie.",
  "Via LoRaWAN wordt compacte data verstuurd over grote afstand met laag energieverbruik.",
  "De ontvangen locatie kan worden gebruikt om hulp gerichter naar de juiste plek te sturen.",
];

const codeFrames = [
  {
    label: "Setup",
    status: "Arduino start op",
    detail: "Seriele monitor, GPS-module en LoRaWAN-radio worden klaargezet.",
    signal: "Initialiseren",
    telemetry: ["GPS: zoeken", "LoRaWAN: standby", "Batterij: 94%"],
    code: [
      "void setup() {",
      "  Serial.begin(9600);",
      "  gps.begin();",
      "  LoRa.begin(868E6);",
      "}",
    ],
  },
  {
    label: "Locatie",
    status: "GPS-locatie gevonden",
    detail: "Het device bepaalt waar de wintersporter zich bevindt.",
    signal: "Locatie actief",
    telemetry: ["Lat: 46.8523", "Lng: 9.5314", "Hoogte: 1840m"],
    code: [
      "location = gps.read();",
      "if (location.valid) {",
      "  lastLocation = location;",
      "}",
    ],
  },
  {
    label: "Controle",
    status: "Noodsituatie wordt gecontroleerd",
    detail: "De Arduino kijkt of er een alarmstatus verstuurd moet worden.",
    signal: "Sensor check",
    telemetry: ["Beweging: laag", "Alarmknop: actief", "Status: SOS"],
    code: [
      "if (buttonPressed || impactDetected) {",
      "  emergency = true;",
      "  buildPacket(lastLocation);",
      "}",
    ],
  },
  {
    label: "Verzenden",
    status: "LoRaWAN-pakket verzonden",
    detail: "Alleen de belangrijkste data gaat door: status, locatie en batterij.",
    signal: "Uplink verzonden",
    telemetry: ["Pakket: SOS", "Bereik: LoRaWAN", "Payload: 18 bytes"],
    code: [
      "packet.status = SOS;",
      "packet.battery = readBattery();",
      "packet.location = lastLocation;",
      "LoRa.send(packet);",
    ],
  },
  {
    label: "Ontvangen",
    status: "Locatie zichtbaar voor hulp",
    detail: "De verzonden data helpt om sneller richting de juiste plek te zoeken.",
    signal: "Hulp geinformeerd",
    telemetry: ["Gateway: ontvangen", "Kaart: bijgewerkt", "Zoekgebied: kleiner"],
    code: [
      "if (gateway.received(packet)) {",
      "  map.update(packet.location);",
      "  notifyRescueTeam();",
      "}",
    ],
  },
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveFrame((current) => (current + 1) % codeFrames.length);
    }, 1700);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const handleNavigate = () => {
    setIsMenuOpen(false);
  };

  const codeDemo = (
    <div id="code-demo" className="inline-code-demo" aria-labelledby="code-demo-title">
      <div className="section-layout">
        <div className="section-heading">
          <h2 id="code-demo-title">Zo ziet de code-uitvoering eruit.</h2>
        </div>

        <div className="code-demo text-box" aria-label="Arduino code demo">
          <div className="code-visual">
            <div className="code-window" aria-label="Code venster">
              <div className="window-dots" aria-hidden="true">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <pre>
                <code>{codeFrames[activeFrame].code.join("\n")}</code>
              </pre>
            </div>

            <div className="device-panel" aria-label="Device status">
              <div className="device-ring">
                <span>{codeFrames[activeFrame].label}</span>
              </div>
              <h3>{codeFrames[activeFrame].status}</h3>
              <p>{codeFrames[activeFrame].detail}</p>
              <ul>
                {codeFrames[activeFrame].telemetry.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="demo-controls">
            <button
              className="button primary"
              type="button"
              onClick={() => setIsPlaying((current) => !current)}
            >
              {isPlaying ? "Pauzeer" : "Speel af"}
            </button>
            <div className="demo-timeline" aria-label="Simulatie stappen">
              {codeFrames.map((frame, index) => (
                <button
                  className={index === activeFrame ? "is-active" : ""}
                  type="button"
                  key={frame.label}
                  onClick={() => {
                    setActiveFrame(index);
                    setIsPlaying(false);
                  }}
                >
                  <span>{frame.label}</span>
                </button>
              ))}
            </div>
            <p className="signal-label">{codeFrames[activeFrame].signal}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <header className="site-header" aria-label="Main navigation">
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
          <div className="hero-content">
            <h1 id="hero-title">Apache</h1>
            <p className="hero-kicker">Als elke minuut telt, moet hulp weten waar je bent.</p>
            <p className="hero-copy">
              Een LoRaWAN Arduino-device voor wintersporters. Wanneer er een
              ongeluk gebeurt en een telefoon geen bereik of batterij meer
              heeft, helpt Apache om de locatie van de drager door te geven.
            </p>
            <div className="hero-actions" aria-label="Primary actions">
              <a className="button primary" href="#doel">
                Ons doel
              </a>
              <a className="button secondary" href="#werking">
                Hoe het werkt
              </a>
            </div>
          </div>
          <img className="hero-logo" src={bigLogo} alt="" aria-hidden="true" />
        </section>

        <section id="doel" className="content-section" aria-labelledby="code-demo-title">
          {codeDemo}
        </section>

        <section id="werking" className="content-section" aria-labelledby="work-title">
          <div className="section-layout">
            <div className="section-heading">
              <h2 id="work-title">Hoe werkt Apache?</h2>
            </div>
            <ol className="step-list">
              {workSteps.map((step, index) => (
                <li className="text-box" key={step}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="lorawan" className="content-section" aria-labelledby="lorawan-title">
          <div className="section-layout">
            <div className="section-heading">
              <h2 id="lorawan-title">
                Waarom LoRaWAN?
              </h2>
            </div>
            <div className="section-copy text-box">
              <p>
                LoRaWAN is geschikt voor berichten die klein zijn, maar belangrijk:
                een locatie, een status of een noodsignaal. Het vraagt weinig
                energie en kan veel verder reiken dan normale korte-afstandsverbindingen.
              </p>
              <p>
                Daardoor past het goed bij een draagbaar wintersport-device. Het
                hoeft geen telefoon te vervangen; het vult juist het gat op
                wanneer de telefoon niet bruikbaar is.
              </p>
            </div>
          </div>

          <div className="wide-callout text-box">
            <h3>Apache is bedoeld als extra veiligheidslaag.</h3>
            <p>
              Het device helpt om sneller een locatie door te geven, maar blijft
              onderdeel van een groter veiligheidssysteem met goede voorbereiding,
              zichtbaarheid, lokale hulpdiensten en verantwoordelijk gedrag op de piste.
            </p>
          </div>
        </section>

      </main>
    </div>
  );
}
