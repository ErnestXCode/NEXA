import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import api from "../../api/axios";
import { logOut, setCredentials } from "../../redux/slices/authSlice";


const PersistLogin = () => {
  const { accessToken, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        const res = await api.post("/auth/refresh"); // sends cookie
        dispatch(setCredentials({ 
          user: user || res.data.user, 
          accessToken: res.data.accessToken 
        }));
      } catch (err) {
        console.error("Refresh token failed", err);
        dispatch(logOut());
      } finally {
        setIsLoading(false);
      }
    };

    if (!accessToken) {
      verifyRefreshToken();
    } else {
      setIsLoading(false);
    }
  }, []);

//   if (isLoading) return <InitialLoader fullscreen={true} />;

  // If after refresh there’s still no access token, redirect to login
//   if (!accessToken) return <Navigate to="/login" />;

  // Otherwise render child routes
  return <Outlet />;
};

export default PersistLogin;
