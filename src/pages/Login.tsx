// import React, { useEffect, useState } from "react";

import React from "react";
import { kakaoBaseURL } from "../api/config";

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
    logoSrc = `${process.env.PUBLIC_URL}/images/warab_logo.png`,
}) => {
    const handleKakaoLogin = () => {
        const kakaoAuthUrl = `${kakaoBaseURL}/oauth2/authorization/kakao`;

        // 카카오 로그인 페이지로 리다이렉트
        window.location.href = kakaoAuthUrl;
    };

    const handleDiscordLogin = () => {
        console.log("Discord login attempted");
        // Implement Discord login logic here
    };

    const handleSteamLogin = () => {
        console.log("Steam login attempted");
        // Implement Steam login logic here
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div
                className="relative bg-white"
                style={{
                    width: "402px",
                    height: "auto", // 높이를 자동으로 조정하여 스크롤 가능하게 함
                    maxWidth: "100vw",
                    minHeight: "100vh", // 최소 높이를 뷰포트 높이로 설정
                }}
            >
                <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="w-full max-w-md flex flex-col items-center">
                        {/* Logo Section - Single Image */}
                        <div className="flex flex-col items-center mb-16">
                            <img
                                src={logoSrc}
                                alt="Logo"
                                className="w-64 h-auto mb-4"
                            />
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

                            <LoginButton
                                icon={`${process.env.PUBLIC_URL}/images/discord.png`}
                                text="디스코드 계정으로 로그인하기"
                                backgroundColor="#5F70BE"
                                onClick={handleDiscordLogin}
                            />

                            <LoginButton
                                icon={`${process.env.PUBLIC_URL}/images/steam.png`}
                                text="스팀 계정으로 로그인하기"
                                backgroundColor="#101B38"
                                onClick={handleSteamLogin}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
