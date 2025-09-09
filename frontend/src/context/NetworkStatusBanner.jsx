import React from "react";
import { useLocation } from "react-router-dom";
import { useNetworkStatus } from "../context/networkStatus.js";

const NetworkStatusBanner = () => {
  const isOnline = useNetworkStatus();
  const location = useLocation();

  // Hide on AttendancePage
  if (isOnline || location.pathname === "/dashboard/attendance/mark") return null;

  return (
    <div className="bg-red-600 text-white p-2 text-center z-50">
      You are offline. Some features may not work.
    </div>
  );
};

export default NetworkStatusBanner;
