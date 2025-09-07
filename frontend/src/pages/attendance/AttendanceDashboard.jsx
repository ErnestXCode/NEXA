import React from 'react'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from "../../redux/slices/authSlice";
import AttendanceDashboardAdmin from './AttendanceDashboardAdmin';
import AttendanceDashboardClassTeacher from './AttendanceDashboardClassTeacher';


const AttendanceDashboard = () => {
  const currentUser = useSelector(selectCurrentUser)
  return (
    <>{
      currentUser.role === 'admin' ? <AttendanceDashboardAdmin /> : <AttendanceDashboardClassTeacher />
    }</>
  )
}

export default AttendanceDashboard