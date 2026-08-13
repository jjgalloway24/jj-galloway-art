export interface ArchiveEntry {
  date: string;
  title: string;
  description: string;
  image?: string;
}

// add an `image` field (e.g. "/images/ink-study-01.jpg") to show a real
// photo of that day's work — drop the file in public/images/ first.
export const ENTRIES: ArchiveEntry[] = [
  {
    date: "2026-06-03",
    title: "Ink Study 01",
    description: "First pass at a loose ink study, working on confident linework without underdrawing.",
  },
  {
    date: "2026-06-11",
    title: "Ink Study 02",
    description: "Follow-up study focused on cross-hatching for shadow depth rather than line weight alone.",
  },
  {
    date: "2026-06-19",
    title: "Color Test",
    description: "Testing a limited palette to see how far a three-color scheme could carry a full illustration.",
  },
  {
    date: "2026-07-02",
    title: "Sketchbook Page",
    description: "A page of quick thumbnail sketches exploring composition options for an upcoming piece.",
  },
  {
    date: "2026-07-15",
    title: "Character Design",
    description: "Design pass on a recurring character, focused on nailing down a consistent silhouette.",
  },
  {
    date: "2026-07-28",
    title: "Landscape Study",
    description: "Plein-air-style landscape study, mostly about value grouping and atmospheric perspective.",
  },
  {
    date: "2026-08-04",
    title: "Digital Portrait",
    description: "A digital portrait built up in layers, experimenting with a softer painterly brush set.",
  },
  {
    date: "2026-08-09",
    title: "Texture Experiment",
    description: "Experimenting with hand-painted texture overlays to add grain to otherwise flat digital shapes.",
  },
];
