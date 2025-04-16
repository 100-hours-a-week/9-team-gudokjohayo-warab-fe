import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "../src/pages/Profile";
import MainPage from "./pages/Main";
import LoginPage from "./pages/Login";
import SearchPage from "./pages/Search";
import DetailPage from "./pages/Detail";
import FeaturesPage from "./pages/info";
import MyServerPage from "./pages/MyServer";
import ReactGA from "react-ga4";
import TrackingWrapper from "./components/TrackingWrapper";
import { GA_ID } from "./api/config";
import ErrorBoundary from "./sentry/ErrorBoundary";
import { CategoryProvider } from "./contexts/CategoryContext";

// GA ID가 있을 경우 초기화
if (GA_ID) {
    ReactGA.initialize(GA_ID);
}

const App: React.FC = () => {
    return (
        <Router>
            <TrackingWrapper />
            <ErrorBoundary>
                <CategoryProvider>
                    <Routes>
                        <Route path="/" element={<LoginPage />} />
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/main" element={<MainPage />} />
                        <Route path="/search" element={<SearchPage />} />
                        <Route path="/games/:gameId" element={<DetailPage />} />
                        <Route path="/info" element={<FeaturesPage />} />
                        <Route path="/my-server" element={<MyServerPage />} />
                    </Routes>
                </CategoryProvider>
            </ErrorBoundary>
        </Router>
    );
};

export default App;
