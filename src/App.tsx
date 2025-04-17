import React, { useEffect } from "react";
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
import { useUserStore } from "./store/userStore";
import { useCategoryStore } from "./store/categoryStore";

// GA ID가 있을 경우 초기화
if (GA_ID) {
    ReactGA.initialize(GA_ID);
}

const App: React.FC = () => {
    const fetchUserProfile = useUserStore((state) => state.fetchUserProfile);
    const refreshCategories = useCategoryStore(
        (state) => state.refreshCategories
    );

    // 컴포넌트 마운트 시 프로필 정보 가져오기
    useEffect(() => {
        fetchUserProfile();
        refreshCategories();
    }, [fetchUserProfile, refreshCategories]);

    return (
        <Router>
            <TrackingWrapper />
            <ErrorBoundary>
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
            </ErrorBoundary>
        </Router>
    );
};

export default App;
