import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Lightbox from "../components/Lightbox";

interface Category {
  id: string;
  label: string;
}

const CATEGORIES: Category[] = [
  { id: "oil", label: "Oil Painting" },
  { id: "illustration", label: "Illustration" },
];

// add an `image` field (e.g. "/images/neon-bloom.jpg") to show a real
// thumbnail — drop the file in public/images/ first. Leave it out and the
// card falls back to the placeholder gradient.
const PROJECTS = [
  { title: "Cats and Dogs", tag: "Digital Painting", category: "illustration", image: "/images/cats-and-dogs.jpg" },
  { title: "Glass Orchard", tag: "Digital Painting", category: "oil", image: "" },
  { title: "Static Hymn", tag: "Animation", category: "oil", image: "" },
  { title: "Fractured Light", tag: "3D Render", category: "illustration", image: "" },
  { title: "Echo Chamber", tag: "Installation", category: "illustration", image: "" },
];

export default function PortfolioContent() {
  const [category, setCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<(typeof PROJECTS)[number] | null>(null);

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

  return (
    <>
      <button className="back-btn" onClick={() => setCategory(null)}>
        ← All Folders
      </button>
      <h2 className="section-subtitle">{activeCategory.label}</h2>
      <div className="grid-cards">
        {projects.map((p) => (
          <div className="card" key={p.title} onClick={() => setSelected(p)}>
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
        {selected && (
          <Lightbox
            title={selected.title}
            subtitle={selected.tag}
            image={selected.image}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
