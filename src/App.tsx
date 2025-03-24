import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProfilePage from "../src/pages/Profile";
import MainPage from "./pages/Main";
import LoginPage from "./pages/Login";
import SearchPage from "./pages/Search";
import DetailPage from "./pages/Detail";

const App: React.FC = () => {
    //const basename = process.env.REACT_APP_BASENAME || "/";
    //console.log("Router Basename: ", basename);

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/main" element={<MainPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/detail/:gameId" element={<DetailPage />} />
            </Routes>
        </Router>
    );
};

export default App;
