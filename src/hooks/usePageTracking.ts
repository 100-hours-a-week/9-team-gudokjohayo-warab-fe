import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import ReactGA from "react-ga4";
import { GA_ID } from "../api/config";

const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (GA_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname });
    }
  }, [location]);
};

export default usePageTracking;
