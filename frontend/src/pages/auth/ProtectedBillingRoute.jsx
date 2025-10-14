import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import LoadingWithFacts from "../../components/layout/LoadingWithFacts";

const ProtectedBillingRoute = () => {
  const { accessToken , user } = useSelector((state) => state.auth);
    if (accessToken === undefined || !user) {
    return <LoadingWithFacts />;
  }

  // If pilot school, skip all checks
  if (user?.school?.isPilotSchool) {
    return <Outlet />;
  }

  

  const schoolPaid = user?.school?.paidPesapal;

  // If school hasn't paid
  if (!schoolPaid) {
    if (user?.role === "admin") {
      // Admin should go to billing page
      return <Navigate to="/dashboard/billing" replace />;
    } else {
      // Non-admin user sees a blocked page
      return (
        <div className="p-6 text-center text-red-400">
          Admin has not paid yet. Access restricted.
        </div>
      );
    }
  }

  // Role check
  //   if (!allowedRoles.includes(user.role)) {
  //     return (
  //       <div className="p-6 text-center text-red-400">
  //         You do not have permission to access this page.
  //       </div>
  //     );
  //   }

  // Everything ok, render child routes
  return <Outlet />;
};

export default ProtectedBillingRoute;
