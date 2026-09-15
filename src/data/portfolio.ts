export interface Category {
  id: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: "oil", label: "Oil Painting" },
  { id: "illustration", label: "Illustration" },
  { id: "drawings", label: "Drawings" },
  { id: "3d", label: "3D" },
];

export interface Project {
  title: string;
  tag: string;
  category: string;
  // optional — when omitted (e.g. a video with no separate still), the card
  // falls back to the placeholder gradient, or to the video itself if set
  image?: string;
  // optional — when set, the lightbox plays this video instead of showing
  // `image` full-size; `image` (if present) is used as the grid thumbnail/poster
  video?: string;
}

// add an `image` field (e.g. "/images/neon-bloom.jpg") to show a real
// thumbnail — drop the file in public/images/ first. Leave it out and the
// card falls back to the placeholder gradient.
export const PROJECTS: Project[] = [
  // Oil Painting
  { title: "Forest Stream", tag: "Oil Painting", category: "oil", image: "/images/forest-stream.jpg" },
  { title: "Rock Pool", tag: "Oil Painting", category: "oil", image: "/images/rock-pool.jpg" },
  { title: "The Garden Monument", tag: "Oil Painting", category: "oil", image: "/images/garden-monument.jpg" },
  { title: "Fallen Log", tag: "Oil Painting", category: "oil", image: "/images/fallen-log.jpg" },
  { title: "Boulder Among Birches", tag: "Oil Painting", category: "oil", image: "/images/boulder-among-birches.jpg" },
  { title: "Snow-Laden Branches", tag: "Oil Painting", category: "oil", image: "/images/snow-laden-branches.jpg" },
  { title: "Blue Vein", tag: "Oil Painting", category: "oil", image: "/images/blue-vein.jpg" },
  { title: "Roots in the Snow", tag: "Oil Painting", category: "oil", image: "/images/roots-in-snow.jpg" },
  { title: "Sunlit Boulder", tag: "Oil Painting", category: "oil", image: "/images/sunlit-boulder.jpg" },
  { title: "Study in Progress", tag: "Oil Painting", category: "oil", image: "/images/study-in-progress.jpg" },
  { title: "Bridge", tag: "Oil Painting", category: "oil", image: "/images/bridge.jpg" },
  { title: "Dungeon Entrance", tag: "Oil Painting", category: "oil", image: "/images/dungeon-entrance.jpg" },
  { title: "Friends", tag: "Oil Painting", category: "oil", image: "/images/friends.jpg" },
  { title: "Moss and Water", tag: "Oil Painting", category: "oil", image: "/images/moss-and-water.jpg" },
  { title: "Now This is Epic", tag: "Oil Painting", category: "oil", image: "/images/now-this-is-epic.jpg" },
  { title: "Paint Bender", tag: "Oil Painting", category: "oil", image: "/images/paint-bender.jpg" },

  // Illustration
  { title: "Cats and Dogs", tag: "Digital Painting", category: "illustration", image: "/images/cats-and-dogs.jpg" },
  { title: "Wind Mage", tag: "Digital Illustration", category: "illustration", image: "/images/wind-mage.jpg" },
  { title: "The Butcher's Ritual", tag: "Ink Illustration", category: "illustration", image: "/images/butchers-ritual.jpg" },
  { title: "Salvage", tag: "Ink Illustration", category: "illustration", image: "/images/salvage.jpg" },

  // Drawings
  { title: "Cleric", tag: "Character Drawing", category: "drawings", image: "/images/cleric.jpg" },
  { title: "Dungeon Archeologist", tag: "Character Drawing", category: "drawings", image: "/images/dungeon-archeologist.jpg" },
  { title: "Woot Woblin", tag: "Character Drawing", category: "drawings", image: "/images/woot-woblin.jpg" },
  { title: "Merchant", tag: "Character Drawing", category: "drawings", image: "/images/merchant.jpg" },

  // 3D
  { title: "Macintosh", tag: "3D Render", category: "3d", image: "/images/macintosh.jpg" },
  {
    title: "Field Walker",
    tag: "3D Render / Video",
    category: "3d",
    video: "/videos/field-walker-turntable.mp4",
  },
];
