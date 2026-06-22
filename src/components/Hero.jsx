export function Hero({ hero, onNavigate }) {
  const handleNavigate = (event, target) => {
    event.preventDefault();
    onNavigate(target);
  };

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage">
        <p className="eyebrow">{hero.eyebrow}</p>
        <img className="hero-logo" src="/media/big-logo.svg" alt="Apache logo" />
        <h1 id="hero-title" className="hero-wordmark">
          {hero.title}
        </h1>
        <p className="hero-slogan">{hero.slogan}</p>
        <p className="hero-body">{hero.body}</p>
        <div className="hero-actions" aria-label="Belangrijkste acties">
          {hero.actions.map((action) => (
            <a
              key={action.target}
              className={`button ${action.variant}`}
              href={`#${action.target}`}
              onClick={(event) => handleNavigate(event, action.target)}
            >
              {action.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
