import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "../src/pages/Profile";
import MainPage from "./pages/Main";
import LoginPage from "./pages/Login";
import SearchPage from "./pages/Search";
import DetailPage from "./pages/Detail";
import FeaturesPage from "./pages/info";
import ReactGA from "react-ga4";
import usePageTracking from "./hooks/usePageTracking";
import { GA_ID } from "./api/config";

// GA ID가 있을 경우 초기화
if (GA_ID) {
    ReactGA.initialize(GA_ID);
}

const App: React.FC = () => {
    // GA 기능 활성화
    usePageTracking(); 
    
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/games/:gameId" element={<DetailPage />} />
                <Route path="/info" element={<FeaturesPage />} />
            </Routes>
        </Router>
    );
};

export default App;
