import React from "react";

const Modal = ({ title, message, onClose, type = "info" }) => {
  // Adjust accent colors based on type
  const accent =
    type === "success"
      ? "text-green-400 border-green-600"
      : type === "error"
      ? "text-red-400 border-red-600"
      : "text-blue-400 border-blue-600";

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div
        className={`bg-gray-900 border ${accent} rounded-2xl shadow-2xl w-[90%] max-w-md p-6 transform transition-all duration-300`}
      >
        <h2
          className={`text-2xl font-bold mb-3 text-center ${
            type === "success"
              ? "text-green-400"
              : type === "error"
              ? "text-red-400"
              : "text-blue-400"
          }`}
        >
          {title}
        </h2>
        <p className="text-center text-gray-200 mb-6">{message}</p>
        <div className="flex justify-center">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
