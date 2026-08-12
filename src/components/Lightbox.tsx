import { motion } from "framer-motion";

interface LightboxProps {
  title: string;
  subtitle?: string;
  description?: string;
  onClose: () => void;
}

export default function Lightbox({ title, subtitle, description, onClose }: LightboxProps) {
  return (
    <motion.div
      className="lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="lightbox-frame"
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="lightbox-image" />
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
