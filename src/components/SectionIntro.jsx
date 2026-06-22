export function SectionIntro({ id, eyebrow, title, body, variant = "intro" }) {
  const titleId = `${id}-title`;

  return (
    <section className={`section ${variant}`} id={id} aria-labelledby={titleId}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={titleId}>{title}</h2>
      </div>
      <p>{body}</p>
    </section>
  );
}
