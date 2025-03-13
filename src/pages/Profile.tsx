import React, { useState } from "react";
import Header from "../components/Header";
import ToastMessage from "../components/ToastMessage";
import CategoryModal from "../components/CategoryModal";
import ConfirmationModal from "../components/ConfirmationModal";

interface ProfilePageProps {
    // Add any props if needed
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
    const [nickname, setNickname] = useState<string>("조이줄");
    const [discordUrl, setDiscordUrl] = useState<string>("https://discord.com");
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

    // State for confirmation modals
    const [showCancelConfirmation, setShowCancelConfirmation] =
        useState<boolean>(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] =
        useState<boolean>(false);

    const handleSave = () => {
        // Process form submission
        setShowToast(true);

        // Hide toast after 3 seconds
        setTimeout(() => {
            setShowToast(false);
        }, 3000);
    };

    const handleClearDiscord = () => {
        setDiscordUrl("");
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirmCategories = (categories: string[]) => {
        setSelectedCategories(categories);
    };

    // Cancel button handlers
    const handleCancelClick = () => {
        setShowCancelConfirmation(true);
    };

    const handleCancelConfirm = () => {
        // Handle cancel confirmation (e.g., navigate back or reset form)
        setShowCancelConfirmation(false);
        // Additional logic for cancellation can be added here
    };

    const handleCancelDismiss = () => {
        setShowCancelConfirmation(false);
    };

    // Logout handlers
    const handleLogoutClick = () => {
        setShowLogoutConfirmation(true);
    };

    const handleLogoutConfirm = () => {
        // Handle logout confirmation (e.g., clear session, navigate to login)
        setShowLogoutConfirmation(false);
        // Additional logout logic can be added here
    };

    const handleLogoutDismiss = () => {
        setShowLogoutConfirmation(false);
    };

    return (
        <div className="flex flex-col h-screen bg-white">
            <Header />

            <div className="flex-1 p-6 flex flex-col">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium"
                            htmlFor="nickname"
                        >
                            닉네임
                        </label>
                        <input
                            id="nickname"
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                        <p className="text-xs text-red-500">*helperText</p>
                    </div>

                    <div className="space-y-2">
                        <label
                            className="block text-sm font-medium"
                            htmlFor="discord"
                        >
                            디스코드
                        </label>
                        <div className="relative">
                            <input
                                id="discord"
                                type="text"
                                value={discordUrl}
                                onChange={(e) => setDiscordUrl(e.target.value)}
                                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md"
                            />
                            {discordUrl && (
                                <button
                                    type="button"
                                    onClick={handleClearDiscord}
                                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-5 w-5 text-gray-400"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                </button>
                            )}
                        </div>
                        <p className="text-xs text-red-500">*helperText</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="block text-sm font-medium">
                                선호 카테고리
                            </label>
                            <button
                                type="button"
                                className="bg-orange-500 text-white rounded-full py-2 px-4 text-sm"
                                onClick={handleOpenModal}
                            >
                                선택 하기
                            </button>
                        </div>
                        <p className="text-xs text-red-500">
                            *선호 카테고리를 등록하지 않으면 게시 추천 기능이
                            제한됩니다.
                        </p>

                        {selectedCategories.length > 0 && (
                            <div className="overflow-x-auto pb-2 -mx-2 px-2">
                                <div className="flex space-x-2 mt-4 min-w-max">
                                    {selectedCategories.map(
                                        (category, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
                                            >
                                                {category}
                                            </button>
                                        )
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex flex-col">
                    {/* Logout text with click handler */}
                    <p
                        className="text-center mb-8 font-medium cursor-pointer"
                        onClick={handleLogoutClick}
                    >
                        로그아웃
                    </p>

                    {/* Fixed height container for toast to prevent layout shifts */}
                    <div className="h-16 mb-4">
                        {showToast && (
                            <ToastMessage message="프로필을 수정했어요." />
                        )}
                    </div>

                    <div className="flex justify-center space-x-4">
                        <button
                            className="px-6 py-2 rounded-full bg-white border border-gray-300 text-sm"
                            onClick={handleCancelClick}
                        >
                            취소
                        </button>
                        <button
                            className="px-6 py-2 rounded-full bg-orange-500 text-white text-sm"
                            onClick={handleSave}
                        >
                            완료
                        </button>
                    </div>
                </div>
            </div>

            {/* Category Modal */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmCategories}
                initialSelectedCategories={selectedCategories}
            />

            {/* Cancel Confirmation Modal */}
            <ConfirmationModal
                isOpen={showCancelConfirmation}
                title="프로필 수정을 취소하시겠습니까?"
                message="모든 변경사항이 폐기됩니다."
                confirmButtonText="확인"
                cancelButtonText="취소"
                onConfirm={handleCancelConfirm}
                onCancel={handleCancelDismiss}
            />

            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLogoutConfirmation}
                title="로그아웃 하시겠습니까?"
                message="로그인 페이지로 이동합니다."
                confirmButtonText="확인"
                cancelButtonText="취소"
                onConfirm={handleLogoutConfirm}
                onCancel={handleLogoutDismiss}
            />
        </div>
    );
};

export default ProfilePage;
