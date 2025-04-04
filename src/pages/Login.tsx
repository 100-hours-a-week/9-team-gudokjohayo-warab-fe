import React from "react";
import { kakaoBaseURL } from "../api/config";
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

interface LoginButtonProps {
    icon: string;
    text: string;
    backgroundColor: string;
    textColor?: string;
    onClick: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({
    icon,
    text,
    backgroundColor,
    textColor = "white",
    onClick,
}) => {
    return (
        <button
            className="w-full flex items-center py-3 px-4 rounded-full mb-4"
            style={{ backgroundColor, color: textColor }}
            onClick={onClick}
        >
            <div className="w-6 h-6 mr-3 flex items-center justify-center">
                <img src={icon} alt="Icon" className="max-w-full max-h-full" />
            </div>
            <span className="flex-1 text-center font-medium">{text}</span>
        </button>
    );
};

interface LoginPageProps {
    logoSrc?: string;
}

const LoginPage: React.FC<LoginPageProps> = ({
    logoSrc = `${process.env.PUBLIC_URL}/images/warab_logo_black.png`,
}) => {
    const navigate = useNavigate(); // Initialize useNavigate hook

    const handleKakaoLogin = () => {
        const kakaoAuthUrl = `${kakaoBaseURL}/oauth2/authorization/kakao`;
        window.location.href = kakaoAuthUrl;
    };

    // Function to handle guest access
    const handleGuestAccess = () => {
        // Navigate to the main page
        navigate("/main");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div
                className="bg-white flex flex-col items-center justify-center"
                style={{
                    width: "402px",
                    maxWidth: "100vw",
                }}
            >
                <div className="w-full max-w-md flex flex-col items-center p-6">
                    {/* Logo Section - Single Image */}
                    <div className="flex flex-col items-center mb-16">
                        <img
                            src={logoSrc}
                            alt="Logo"
                            className="w-40 h-auto mb-4" // Changed from w-64 to w-40
                        />
                        <h1
                            className="font-bitbit text-xl font-bold flex-1 text-center cursor-pointer"
                            onClick={() => navigate("/main", { replace: true })}
                        >
                            WARA :B
                        </h1>
                    </div>

                    {/* Login Buttons Section */}
                    <div className="w-full">
                        <LoginButton
                            icon={`${process.env.PUBLIC_URL}/images/kakao.png`}
                            text="카카오로 3초만에 시작하기"
                            backgroundColor="#FAE100"
                            textColor="#3A1D1D"
                            onClick={handleKakaoLogin}
                        />

                        {/* Guest Access Text Link */}
                        <div className="w-full text-center mt-6">
                            {/* Using button styled as a link instead of <a> tag */}
                            <button
                                onClick={handleGuestAccess}
                                className="text-gray-600 hover:text-gray-900 underline text-sm cursor-pointer bg-transparent border-none p-0"
                            >
                                비회원으로 계속하기
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
