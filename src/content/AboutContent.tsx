import { PHOTO_SRC } from "../data/about";

export default function AboutContent() {
  return (
    <div className="about">
      <div className="about-photo">
        <img src={PHOTO_SRC} alt="Portrait" onError={(e) => (e.currentTarget.style.display = "none")} />
      </div>
      <p>
        Replace this with your bio — a couple of paragraphs about who you are, how you got
        into digital art, and what you're drawn to making.
      </p>
      <p>
        Mention your process here: Blender, tablet, traditional media, whatever's part of
        your story.
      </p>
      <div className="tags">
        <span className="tag">Blender</span>
        <span className="tag">3D Animation</span>
        <span className="tag">Digital Painting</span>
      </div>
    </div>
  );
}
