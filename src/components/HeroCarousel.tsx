import { useEffect, useState } from "react";

const heroImages = [
  "https://res.cloudinary.com/dikkedkzf/image/upload/v1771089909/Screenshot_61_q8mwz2.png",
  "https://res.cloudinary.com/dikkedkzf/image/upload/v1771089909/Screenshot_62_tutzkr.png",
  "https://res.cloudinary.com/dikkedkzf/image/upload/v1771089911/Screenshot_63_cv6bb2.png",
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);

  // Auto slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroImages.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-20 max-w-5xl mx-auto relative overflow-hidden rounded-xl shadow-2xl border border-gray-200 h-150 md:h-175">
      {heroImages.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`App Preview ${idx + 1}`}
          className={`w-full h-full object-contain transition-opacity duration-1000 rounded-xl ${
            idx === current ? "opacity-100" : "opacity-0 absolute inset-0"
          }`}
        />
      ))}

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
        {heroImages.map((_, idx) => (
          <span
            key={idx}
            className={`w-4 h-4 rounded-full transition-colors ${
              idx === current ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}
