import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const TRACKING_ID = "G-SHF2843JP8"; // <-- replace with your GA Measurement ID

// Initialize GA once (safe to call multiple times, GA handles it)
ReactGA.initialize(TRACKING_ID);

export default function Analytics() {
  const location = useLocation();

  useEffect(() => {
    // send page view on every route change
    ReactGA.send({
      hitType: "pageview",
      page: location.pathname + location.search,
    });
  }, [location]);

  return null; // invisible component
}
