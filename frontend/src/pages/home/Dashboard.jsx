import React from "react";
import AdminDashboard from "./AdminDashboard";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../redux/slices/authSlice";
import SuperAdminDashboard from "./SuperAdminDashboard";
import TeacherDashboard from "./TeacherDashboard";
import ParentDashboard from "./parents/ParentDashboard";
import BursarDashboard from "./bursars/BursarDashboard";

const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser);
  return (
    <>
      {currentUser.role === "superadmin" ? (
        <SuperAdminDashboard />
      ) : currentUser.role === "admin" ? (
        <AdminDashboard />
      ) : currentUser.role === "teacher" ? (
        <TeacherDashboard />
      ) : currentUser.role === "bursar" ? (
        <BursarDashboard />
      ) : (
        <ParentDashboard />
      )}
    </>
  );
};

export default Dashboard;
