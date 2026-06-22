export function FeatureGrid({ features }) {
  return (
    <section className="feature-grid" aria-label="Producteigenschappen">
      {features.map((feature) => (
        <article className="feature-card" key={feature.title}>
          <span
            className={`feature-icon ${feature.icon}-icon`}
            aria-hidden="true"
          ></span>
          <h3>{feature.title}</h3>
          <p>{feature.body}</p>
        </article>
      ))}
    </section>
  );
}
