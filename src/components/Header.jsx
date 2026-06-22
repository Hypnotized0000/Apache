import { useState } from "react";

export function Header({ navItems, onNavigate }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (event, target) => {
    event.preventDefault();
    onNavigate(target);
    setIsMenuOpen(false);
  };

  return (
    <header className="site-header" aria-label="Hoofdnavigatie">
      <a
        className="brand"
        href="#top"
        aria-label="Apache home"
        onClick={(event) => handleNavigate(event, "top")}
      >
        <img className="brand-logo" src="/media/small-logo.svg" alt="" />
        <span>Apache</span>
      </a>

      <nav
        className={`nav-links ${isMenuOpen ? "is-open" : ""}`}
        aria-label="Pagina"
      >
        {navItems.map((item) => (
          <a
            key={item.target}
            href={`#${item.target}`}
            onClick={(event) => handleNavigate(event, item.target)}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <button
        className="menu-button"
        type="button"
        aria-expanded={isMenuOpen}
        aria-label="Menu"
        onClick={() => setIsMenuOpen((current) => !current)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
    </header>
  );
}
