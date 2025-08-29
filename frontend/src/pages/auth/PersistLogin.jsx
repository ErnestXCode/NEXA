import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setCredentials } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";

const PersistLogin = () => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const res = await api.post("/auth/refresh");
        dispatch(setCredentials(res.data));
      } catch (err) {
        console.error(
          "Refresh failed:",
          err.response?.status,
          err.response?.data
        );
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // ✅ Only refresh if no accessToken
    if (!accessToken) {
      verifyRefreshToken();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [accessToken, dispatch]);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navigation />
      <Outlet />
    </>
  );
};

export default PersistLogin;
