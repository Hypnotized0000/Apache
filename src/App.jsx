import { ConfidenceBand } from "./components/ConfidenceBand.jsx";
import { FeatureGrid } from "./components/FeatureGrid.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { ProcessSteps } from "./components/ProcessSteps.jsx";
import { SectionIntro } from "./components/SectionIntro.jsx";
import { useSmoothScroll } from "./hooks/useSmoothScroll.js";
import { features, hero, navItems, processSteps } from "./content.js";

export default function App() {
  const navigateTo = useSmoothScroll();

  return (
    <>
      <Header navItems={navItems} onNavigate={navigateTo} />
      <main id="top">
        <Hero hero={hero} onNavigate={navigateTo} />
        <SectionIntro
          id="product"
          eyebrow="Product"
          title="Gemaakt voor lange afstand en weinig gedoe."
          body="Apache gebruikt LoRaWAN om data energiezuinig te versturen over grote afstanden. Daardoor blijft het apparaat bruikbaar op plekken waar wifi of mobiele data niet vanzelfsprekend zijn."
        />
        <FeatureGrid features={features} />
        <ProcessSteps steps={processSteps} />
        <ConfidenceBand />
      </main>
    </>
  );
}
