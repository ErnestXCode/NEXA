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
    <div className="flex flex-col items-center justify-center min-h-screen text-white bg-gray-950 p-6">
      <div className="animate-spin border-4 border-white border-t-transparent rounded-full w-16 h-16 mb-6"></div>
      <p className="text-center text-gray-300 text-lg">
        {facts[factIndex]}
      </p>
    </div>
  );
}
