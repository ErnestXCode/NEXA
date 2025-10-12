// src/components/CustomSelect.jsx
import React, { useState, useRef, useEffect } from "react";

const CustomSelect = ({ options, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Decide if dropdown should flip up
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const buttonRect = buttonRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // Estimate dropdown height (max-h-60 => 15rem ~ 240px)
    const dropdownHeight = Math.min(options.length * 40, 240);

    setDropUp(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
  }, [isOpen, options.length]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full p-2 rounded bg-gray-800 text-white border border-gray-700 flex justify-between items-center"
      >
        <span>{selectedOption ? selectedOption.label : placeholder}</span>
        <span
          className={`ml-2 transform transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          &#9662;
        </span>
      </button>

      {isOpen && (
        <ul
          className={`absolute z-50 w-full max-h-60 overflow-y-auto mt-1 bg-gray-900 border border-gray-700 rounded shadow-lg ${
            dropUp ? "bottom-full mb-1" : "top-full mt-1"
          }`}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`p-2 cursor-pointer hover:bg-gray-700 ${
                opt.value === value ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomSelect;
