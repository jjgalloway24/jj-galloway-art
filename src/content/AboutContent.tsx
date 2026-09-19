import { PHOTO_SRC, RESUME_SRC, BIO_PARAGRAPHS, TAGS } from "../data/about";

export default function AboutContent() {
  return (
    <div className="about">
      <div className="about-photo">
        <img
          src={PHOTO_SRC}
          alt="Portrait"
          decoding="sync"
          onError={(e) => (e.currentTarget.style.display = "none")}
        />
      </div>
      {BIO_PARAGRAPHS.map((paragraph, i) => (
        <p key={i}>{paragraph}</p>
      ))}
      <a className="resume-link" href={RESUME_SRC} target="_blank" rel="noopener noreferrer">
        View Resume (PDF)
      </a>
      <div className="tags">
        {TAGS.map((tag) => (
          <span className="tag" key={tag}>
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
