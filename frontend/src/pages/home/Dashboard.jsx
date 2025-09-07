import React from 'react'
import AdminDashboard from './AdminDashboard'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from "../../redux/slices/authSlice";
import SuperAdminDashboard from './SuperAdminDashboard';


const Dashboard = () => {
  const currentUser = useSelector(selectCurrentUser)
  return (
    <>
    {currentUser.role === 'superadmin' ? <SuperAdminDashboard /> : <AdminDashboard />}
    </>
  )
}

export default Dashboard