const LOGO_NAMES = [
  "Château d'Or",
  "Belle Fleur",
  "Lumière Studio",
  "Maison Rosé",
  "Douce Table",
];

export function LogoMarquee() {
  return (
    <div className="logo-marquee">
      <div className="logo-track">
        {[...LOGO_NAMES, ...LOGO_NAMES].map((name, i) => (
          <span key={i} className="logo-text-item">{name}</span>
        ))}
      </div>
    </div>
  );
}
