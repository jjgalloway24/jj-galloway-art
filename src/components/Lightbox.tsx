import { useEffect } from "react";
import { motion } from "framer-motion";

interface LightboxProps {
  title: string;
  subtitle?: string;
  description?: string;
  image?: string;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export default function Lightbox({
  title,
  subtitle,
  description,
  image,
  onClose,
  onPrev,
  onNext,
}: LightboxProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft" && onPrev) onPrev();
      else if (e.key === "ArrowRight" && onNext) onNext();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      className="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {onPrev && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous"
        >
          ‹
        </button>
      )}
      {onNext && (
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next"
        >
          ›
        </button>
      )}
      <motion.div
        key={image}
        className="lightbox-frame"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lightbox-image">
          {image && (
            <img src={image} alt={title} onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
        </div>
        <div className="lightbox-caption">
          <h2>{title}</h2>
          {subtitle && <span>{subtitle}</span>}
          {description && <p>{description}</p>}
        </div>
        <button className="close-btn lightbox-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}
