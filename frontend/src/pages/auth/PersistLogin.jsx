import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { setCredentials, logOut } from "../../redux/slices/authSlice";
import api from "../../api/axios";

const PersistLogin = () => {
//   const userDetails = useSelector((state) => state.auth);
//   const dispatch = useDispatch();
//   const [isLoading, setIsLoading] = useState(true);
 

//   useEffect(() => {
//     const verifyRefreshToken = async () => {
//       try {
//         const res = await api.post("/auth/refresh"); // cookie refresh
//         dispatch(
//           setCredentials({
//             ...userDetails,
//             accessToken: res.data.accessToken,
//           })
//         );
//       } catch (err) {
//         console.error("Refresh token failed", err);
//         dispatch(logOut());
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     verifyRefreshToken();
//   }, [dispatch]);

//   if (isLoading) return <p>Loading...</p>; // while checking refresh

//   // if after refresh still no token, force login
//   if (!userDetails.accessToken) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default PersistLogin;
