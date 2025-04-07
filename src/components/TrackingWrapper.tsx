// TrackingWrapper.tsx
import React from "react";
import usePageTracking from "../api/usePageTracking";

const TrackingWrapper: React.FC = () => {
    usePageTracking();
    return null;
};

export default TrackingWrapper;
