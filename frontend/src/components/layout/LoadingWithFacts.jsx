// src/components/LoadingWithFacts.jsx
import { useEffect, useState } from "react";

const facts = [
  "Honey never spoils.",
  "Bananas are berries, but strawberries aren't.",
  "Wombat poop is cube-shaped.",
  "Octopuses have three hearts.",
  "A group of flamingos is called a 'flamboyance'.",
  "Sloths can hold their breath longer than dolphins.",
  "There's a species of jellyfish that is immortal.",
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
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-950 p-6">
      <div className="animate-spin border-4 border-white border-t-transparent rounded-full w-16 h-16 mb-6"></div>
      <p className="text-center text-gray-300 text-lg">
        {facts[factIndex]}
      </p>
    </div>
  );
}
