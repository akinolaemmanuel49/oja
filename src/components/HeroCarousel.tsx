import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const heroImages = [
  "https://res.cloudinary.com/dikkedkzf/image/upload/v1771089909/Screenshot_61_q8mwz2.png",
  "https://res.cloudinary.com/dikkedkzf/image/upload/v1771089909/Screenshot_62_tutzkr.png",
  "https://res.cloudinary.com/dikkedkzf/image/upload/v1771089911/Screenshot_63_cv6bb2.png",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-20 max-w-5xl mx-auto relative overflow-hidden rounded-xl shadow-2xl border border-gray-200 h-150 md:h-175 bg-gray-100">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={heroImages[current]}
          alt={`App Preview ${current + 1}`}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="w-full h-full object-contain rounded-xl"
        />
      </AnimatePresence>

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
        {heroImages.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setCurrent(idx)}
            whileHover={{ scale: 1.3 }}
            className={`w-3 h-3 rounded-full transition-colors ${
              idx === current ? "bg-blue-600" : "bg-white/60"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
