import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import AttendanceDashboardAdmin from "./AttendanceDashboardAdmin";
import AttendanceDashboardClassTeacher from "./AttendanceDashboardClassTeacher";

const AttendanceDashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  // const [isDesktop, setIsDesktop] = useState(true);

  // // 🔹 Detect screen size
  // useEffect(() => {
  //   const checkScreenSize = () => {
  //     setIsDesktop(window.innerWidth >= 1024); // 1024px = desktop breakpoint
  //   };
  //   checkScreenSize();
  //   window.addEventListener("resize", checkScreenSize);
  //   return () => window.removeEventListener("resize", checkScreenSize);
  // }, []);

  // // 🔹 Block mobile/tablet users
  // if (!isDesktop) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-screen text-center p-6">
  //       <h1 className="text-2xl font-bold mb-4">⚠️ Desktop Required</h1>
  //       <p className="text-gray-300">
  //         The attendance dashboard is only available on a desktop or laptop
  //         device. Please switch to a larger screen to continue.
  //       </p>
  //     </div>
  //   );
  // }

  return (
    <>
      {currentUser.role === "admin" ? (
        <AttendanceDashboardAdmin />
      ) : currentUser.isClassTeacher && (
        <AttendanceDashboardClassTeacher />
      )}
    </>
  );
};

export default AttendanceDashboard;
