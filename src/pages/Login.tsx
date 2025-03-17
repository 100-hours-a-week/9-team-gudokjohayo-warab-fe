import React from "react";

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
    logoSrc = "/images/warab_logo.png",
}) => {
    const handleKakaoLogin = () => {
        console.log("Kakao login attempted");
        // Implement Kakao login logic here
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
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
            <div className="w-full max-w-md flex flex-col items-center mb-16">
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
                        icon="/images/kakao.png"
                        text="카카오로 3초만에 시작하기"
                        backgroundColor="#FAE100"
                        textColor="#3A1D1D"
                        onClick={handleKakaoLogin}
                    />

                    <LoginButton
                        icon="/images/discord.png"
                        text="디스코드 계정으로 로그인하기"
                        backgroundColor="#5F70BE"
                        onClick={handleDiscordLogin}
                    />

                    <LoginButton
                        icon="/images/steam.png"
                        text="스팀 계정으로 로그인하기"
                        backgroundColor="#101B38"
                        onClick={handleSteamLogin}
                    />
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
