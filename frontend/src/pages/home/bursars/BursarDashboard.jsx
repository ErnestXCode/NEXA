import React from "react";
import { useNavigate } from "react-router-dom";

const BursarDashboard = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Messages",
      description: "Send or view in-app messages.",
      link: "/dashboard/communication",
      bgColor: "bg-blue-600",
    },
    {
      title: "View Fees",
      description: "Check student fees records.",
      link: "/dashboard/fees",
      bgColor: "bg-gray-800",
    },
    {
      title: "Record Payment",
      description: "Add a new student payment.",
      link: "/dashboard/fees/add",
      bgColor: "bg-green-600",
    },
  ];

  return (
    <main className="p-6 bg-gray-950 min-h-screen flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
        {actions.map((action, idx) => (
          <div
            key={idx}
            onClick={() => navigate(action.link)}
            className={`cursor-pointer ${action.bgColor} hover:scale-105 transform transition rounded-2xl shadow-xl p-6 flex flex-col justify-between text-white`}
          >
            <div>
              <h2 className="text-xl font-bold mb-2">{action.title}</h2>
              <p className="text-gray-200">{action.description}</p>
            </div>
            <div className="mt-4 text-gray-300 text-sm">Go &rarr;</div>
          </div>
        ))}
      </div>
    </main>
  );
};

export default BursarDashboard;
