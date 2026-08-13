import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lightbox from "../components/Lightbox";
import { CATEGORIES, PROJECTS } from "../data/portfolio";

export default function PortfolioContent() {
  const [category, setCategory] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  if (category === null) {
    return (
      <div className="folder-cards">
        {CATEGORIES.map((c) => (
          <div className="folder-card" key={c.id} onClick={() => setCategory(c.id)}>
            <div className="folder-card-icon" />
            <h3>{c.label}</h3>
          </div>
        ))}
      </div>
    );
  }

  const activeCategory = CATEGORIES.find((c) => c.id === category)!;
  const projects = PROJECTS.filter((p) => p.category === category);
  const selected = selectedIndex !== null ? projects[selectedIndex] : null;
  const showNav = projects.length > 1;

  return (
    <>
      <button className="back-btn" onClick={() => setCategory(null)}>
        ← All Folders
      </button>
      <h2 className="section-subtitle">{activeCategory.label}</h2>
      <div className="grid-cards">
        {projects.map((p, i) => (
          <div className="card" key={p.title} onClick={() => setSelectedIndex(i)}>
            <div className="card-thumb">
              {p.image && (
                <img src={p.image} alt={p.title} onError={(e) => (e.currentTarget.style.display = "none")} />
              )}
            </div>
            <div className="card-body">
              <h3>{p.title}</h3>
              <span>{p.tag}</span>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {selected && selectedIndex !== null && (
          <Lightbox
            title={selected.title}
            subtitle={selected.tag}
            image={selected.image}
            onClose={() => setSelectedIndex(null)}
            onPrev={showNav ? () => setSelectedIndex((selectedIndex - 1 + projects.length) % projects.length) : undefined}
            onNext={showNav ? () => setSelectedIndex((selectedIndex + 1) % projects.length) : undefined}
          />
        )}
      </AnimatePresence>
    </>
  );
}
