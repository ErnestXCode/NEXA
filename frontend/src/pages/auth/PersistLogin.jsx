import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { setCredentials } from "../../redux/slices/authSlice";
import api from "../../api/axios";
import Navigation from "../../components/layout/Navigation";
import LoadingWithFacts from "../../components/layout/LoadingWithFacts";

const PersistLogin = ({ hideNav }) => {
  const dispatch = useDispatch();
  const { accessToken, user } = useSelector((state) => state.auth);

  // NEW: track if we've already attempted to refresh
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const verifyRefreshToken = async () => {
      try {
        const res = await api.post("/auth/refresh");
        dispatch(setCredentials(res.data));
      } catch (err) {
        console.error("Refresh failed:", err.response?.status, err.response?.data);
      } finally {
        if (isMounted) {
          setLoading(false);
          setHasAttemptedRefresh(true); // ✅ mark that we've tried
        }
      }
    };

    // 🚨 Problem fix: wait until Redux finishes hydrating.
    // When accessToken === undefined, Redux state isn't ready yet.
    if (accessToken === undefined) {
      return; // just wait — don’t do anything yet
    }

    // ✅ Only refresh if no token and we haven’t tried yet
    if (!accessToken && !hasAttemptedRefresh) {
      verifyRefreshToken();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [accessToken, dispatch, hasAttemptedRefresh]); // ✅ include the new state

  if (loading) return <LoadingWithFacts />;

  return (
    <>
      {!hideNav && <Navigation />}
      <Outlet />
    </>
  );
};

export default PersistLogin;
