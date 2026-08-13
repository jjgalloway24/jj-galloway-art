export interface Category {
  id: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "oil", label: "Oil Painting" },
  { id: "illustration", label: "Illustration" },
];

export interface Project {
  title: string;
  tag: string;
  category: string;
  image: string;
}

// add an `image` field (e.g. "/images/neon-bloom.jpg") to show a real
// thumbnail — drop the file in public/images/ first. Leave it out and the
// card falls back to the placeholder gradient.
export const PROJECTS: Project[] = [
  { title: "Cats and Dogs", tag: "Digital Painting", category: "illustration", image: "/images/cats-and-dogs.jpg" },
  { title: "Glass Orchard", tag: "Digital Painting", category: "oil", image: "" },
  { title: "Static Hymn", tag: "Animation", category: "oil", image: "" },
  { title: "Fractured Light", tag: "3D Render", category: "illustration", image: "" },
  { title: "Echo Chamber", tag: "Installation", category: "illustration", image: "" },
];
