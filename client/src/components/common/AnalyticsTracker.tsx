import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { initGoogleAnalytics, trackPageView } from "@/lib/analytics";

export const AnalyticsTracker: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    initGoogleAnalytics();
  }, []);

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
};
