import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "../src/pages/Profile";
import MainPage from "./pages/Main";
import LoginPage from "./pages/Login";
import SearchPage from "./pages/Search";
import DetailPage from "./pages/Detail";
import FeaturesPage from "./pages/info";

const App: React.FC = () => {
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
