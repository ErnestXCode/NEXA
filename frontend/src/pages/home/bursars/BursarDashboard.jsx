import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import useUnreadMessages from "../../../hooks/useUnreadMessages";
import { selectCurrentUser } from "../../../redux/slices/authSlice";

const BursarDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  const { unreadCount } = useUnreadMessages(currentUser);

const actions = [
  {
    title: "Messages",
    description: "Send or view in-app messages.",
    link: "/dashboard/communication",
    gradient: "from-indigo-700 via-purple-700 to-pink-700",
    hasBadge: true,
  },
  {
    title: "View Fees",
    description: "Check student fees records.",
    link: "/dashboard/fees",
    gradient: "from-blue-700 via-cyan-600 to-sky-500",
  },
  {
    title: "Record Payment",
    description: "Add a new student payment.",
    link: "/dashboard/fees/add",
    gradient: "from-green-700 via-lime-600 to-emerald-500",
  },
  {
    title: "Fee Logs",
    description: "View all student fee transactions and history.",
    link: "/dashboard/fees/logs",
   gradient: "from-red-700 via-red-600 to-orange-500"

  }
];


  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <main className="flex flex-col gap-6 max-w-md mx-auto">
        {actions.map((action, idx) => (
          <NavLink
            key={idx}
            to={action.link}
            className={`relative bg-gradient-to-r ${action.gradient} shadow-lg rounded-xl p-6 flex flex-col items-start transition transform hover:scale-105 hover:shadow-2xl duration-300`}
          >
            <h2 className="text-white text-2xl font-bold mb-2">
              {action.title}
            </h2>
            <p className="text-gray-200 text-sm">{action.description}</p>

            {/* Show badge for Messages */}
            {action.hasBadge && unreadCount > 0 && (
              <span
                className="absolute -top-2 -right-2 
             bg-gray-900 text-white text-xs font-bold 
             px-2 py-0.5 rounded-full ring-2 ring-purple-400 shadow-lg"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </NavLink>
        ))}
      </main>
    </div>
  );
};

export default BursarDashboard;
