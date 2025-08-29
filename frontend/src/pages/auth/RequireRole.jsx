import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const RequireRole = ({ allowedRoles }) => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user.role)
    ? <Outlet />
    : <Navigate to="/unauthorized" replace />;
};

export default RequireRole;
