import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center p-4 bg-white border-b">
            <button onClick={() => navigate(-1)} className="mr-4">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                    />
                </svg>
            </button>
            <h1
                className="font-bitbit text-xl font-bold flex-1 text-center cursor-pointer"
                onClick={() => navigate("/main")}
            >
                WARA :B
            </h1>
            <div
                className="w-8 h-8 rounded-full bg-transparent border border-gray-300 flex items-center justify-center cursor-pointer"
                onClick={() => navigate("/profile")}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-600"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        fill="black"
                    />
                    <circle cx="12" cy="7" r="4" fill="black" />
                </svg>
            </div>
        </div>
    );
};

export default Header;
