// src/components/LoadingWithFacts.jsx
import { useEffect, useState } from "react";

const facts = [
  "Nexa can save you hours on attendance tracking each week!",
  "Did you know? You can record exam results in bulk with Nexa.",
  "Nexa remembers every student's fees history—no more manual tracking!",
  "Quick tip: Use the communication module to send instant messages to parents.",
  "Schools using Nexa have fewer missed payments thanks to automated reminders.",
  "Fun fact: Nexa was designed to handle all your small-school admin in one place.",
  "You can audit results and credits with just a few clicks in Nexa!",
];

export default function LoadingWithFacts({ interval = 3000 }) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % facts.length);
    }, interval);
    return () => clearInterval(id);
  }, [interval]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-6">
      {/* Glowing Dual-Ring Spinner */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer rotating ring */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 border-4 border-t-transparent border-white/40 rounded-full animate-spin-slow"></div>

        {/* Inner pulsing ring */}
        <div className="absolute w-12 h-12 sm:w-14 sm:h-14 border-4 border-white/20 border-t-white rounded-full animate-spin-fast blur-[1px]"></div>

        {/* Subtle glow */}
        <div className="absolute w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/5 blur-2xl animate-pulse"></div>
      </div>

      {/* Fact text */}
      <p
        className="text-center text-gray-200 text-base sm:text-lg md:text-xl 
                   max-w-md leading-relaxed px-4 animate-fade"
      >
        {facts[factIndex]}
      </p>
    </div>
  );
}
