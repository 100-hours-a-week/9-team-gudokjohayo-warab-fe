import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ToastMessage from "../components/ToastMessage";
import CategoryModal from "../components/CategoryModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { getCategoriesByIds } from "../services/categoryService";
import {
    getUserProfile,
    checkNicknameDuplication,
    checkDiscordLinkDuplication,
    updateUserProfile,
} from "../services/userService";
import { debounce } from "lodash"; // 디바운스 함수를 위해 lodash 가져오기

interface Category {
    category_id: number;
    category_name: string;
}

interface ProfilePageProps {
    // Add any props if needed
}

const ProfilePage: React.FC<ProfilePageProps> = () => {
    const navigate = useNavigate();
    const [nickname, setNickname] = useState<string>("");
    const [discordUrl, setDiscordUrl] = useState<string>("");
    const [originalNickname, setOriginalNickname] = useState<string>("");
    const [originalDiscordUrl, setOriginalDiscordUrl] = useState<string>("");
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    // 유효성 검사 상태
    const [nicknameHelperText, setNicknameHelperText] = useState<string>("");
    const [discordHelperText, setDiscordHelperText] = useState<string>("");
    const [isNicknameValid, setIsNicknameValid] = useState<boolean>(true);
    const [isDiscordValid, setIsDiscordValid] = useState<boolean>(true);

    // 카테고리 관련 상태
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        []
    );
    const [categoryDisplayNames, setCategoryDisplayNames] = useState<string[]>(
        []
    );
    //const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);

    // 모달 상태
    const [showCancelConfirmation, setShowCancelConfirmation] =
        useState<boolean>(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] =
        useState<boolean>(false);

    // 초기 프로필 정보 불러오기
    useEffect(() => {
        const fetchProfileData = async () => {
            setIsLoading(true);
            try {
                const profileData = await getUserProfile();
                console.log(profileData);
                setNickname(profileData.data.nickname);
                setDiscordUrl(profileData.data.discord_link);
                setOriginalNickname(profileData.data.nickname);
                setOriginalDiscordUrl(profileData.data.discord_link);

                // Extract category data from the response
                if (
                    profileData.data.categorys &&
                    profileData.data.categorys.length > 0
                ) {
                    // Set the category data directly
                    setCategoryData(profileData.data.categorys);

                    // Extract and set just the IDs for the selected categories
                    const categoryIds = profileData.data.categorys.map(
                        (cat) => cat.category_id
                    );
                    setSelectedCategoryIds(categoryIds);

                    // Extract and set the names for display
                    const categoryNames = profileData.data.categorys.map(
                        (cat) => cat.category_name
                    );
                    setCategoryDisplayNames(categoryNames);
                }
            } catch (error) {
                console.error("프로필 정보를 가져오는 중 오류 발생:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    // 닉네임 중복 확인 (디바운스 적용)
    const checkNickname = debounce(async (value: string) => {
        if (!value) {
            setNicknameHelperText("닉네임을 입력해주세요.");
            setIsNicknameValid(false);
            return;
        }

        // 원래 닉네임과 동일하면 중복 체크 스킵
        if (value === originalNickname) {
            setNicknameHelperText("");
            setIsNicknameValid(true);
            return;
        }

        try {
            const result = await checkNicknameDuplication(value);
            if (result.duplication) {
                setNicknameHelperText("이미 사용 중인 닉네임입니다.");
                setIsNicknameValid(false);
            } else {
                setNicknameHelperText("사용 가능한 닉네임입니다.");
                setIsNicknameValid(true);
            }
        } catch (error) {
            console.error("닉네임 중복 확인 중 오류 발생:", error);
            setNicknameHelperText("중복 확인 중 오류가 발생했습니다.");
            setIsNicknameValid(false);
        }
    }, 500);

    // 디스코드 링크 중복 확인 (디바운스 적용)
    const checkDiscordLink = debounce(async (value: string) => {
        if (!value) {
            setDiscordHelperText("");
            setIsDiscordValid(true);
            return;
        }

        // 원래 디스코드 링크와 동일하면 중복 체크 스킵
        if (value === originalDiscordUrl) {
            setDiscordHelperText("");
            setIsDiscordValid(true);
            return;
        }

        try {
            const result = await checkDiscordLinkDuplication(value);
            console.log(result.message);
            if (result.message === "invalid_discordlink") {
                setDiscordHelperText("유효하지않은 링크입니다.");
                setIsDiscordValid(false);
            } else {
                if (result.duplication) {
                    setDiscordHelperText("이미 사용 중인 디스코드 링크입니다.");
                    setIsDiscordValid(false);
                } else {
                    setDiscordHelperText("사용 가능한 디스코드 링크입니다.");
                    setIsDiscordValid(true);
                }
            }
        } catch (error) {
            console.error("유효한 링크가 아닙니다.:", error);
            setDiscordHelperText("중복 확인 중 오류가 발생했습니다.");
            setIsDiscordValid(false);
        }
    }, 500);

    // 닉네임 변경 핸들러
    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNickname(value);
        checkNickname(value);
    };

    // 디스코드 링크 변경 핸들러
    const handleDiscordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDiscordUrl(value);
        checkDiscordLink(value);
    };

    // 선택된 카테고리 ID가 변경될 때마다 표시 이름 업데이트
    useEffect(() => {
        const fetchCategoryNames = async () => {
            // Check if we need to fetch categories or if we already have them from the profile
            if (selectedCategoryIds.length === 0) {
                setCategoryDisplayNames([]);
                return;
            }

            // Check if we already have the category data that matches the selected IDs
            const hasAllCategories = selectedCategoryIds.every((id) =>
                categoryData.some((cat) => cat.category_id === id)
            );

            // If we have all categories, just update display names
            if (hasAllCategories) {
                const names = selectedCategoryIds
                    .map((id) => {
                        const category = categoryData.find(
                            (cat) => cat.category_id === id
                        );
                        return category ? category.category_name : "";
                    })
                    .filter((name) => name !== "");

                setCategoryDisplayNames(names);
                return;
            }

            // If we don't have all categories, fetch them
            setIsCategoryLoading(true);
            try {
                const categories =
                    await getCategoriesByIds(selectedCategoryIds);
                // Update category data with any new categories
                const newCategoryData = [...categoryData];

                categories.forEach((newCat) => {
                    if (
                        !newCategoryData.some(
                            (cat) => cat.category_id === newCat.category_id
                        )
                    ) {
                        newCategoryData.push(newCat);
                    }
                });

                setCategoryData(newCategoryData);
                setCategoryDisplayNames(
                    categories.map((cat) => cat.category_name)
                );
            } catch (error) {
                console.error("카테고리 정보를 가져오는 중 오류 발생:", error);
            } finally {
                setIsCategoryLoading(false);
            }
        };

        fetchCategoryNames();
    }, [selectedCategoryIds, categoryData]);

    const handleSave = async () => {
        // 유효성 검사
        if (!isNicknameValid || !isDiscordValid) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
            return;
        }

        setIsSaving(true);
        try {
            // Include selectedCategoryIds in the update request
            await updateUserProfile(nickname, discordUrl, selectedCategoryIds);
            setOriginalNickname(nickname);
            setOriginalDiscordUrl(discordUrl);
            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error("프로필 저장 중 오류 발생:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearDiscord = () => {
        setDiscordUrl("");
        setDiscordHelperText("");
        setIsDiscordValid(true);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleConfirmCategories = (categoryIds: number[]) => {
        setSelectedCategoryIds(categoryIds);
    };

    // Cancel button handlers
    const handleCancelClick = () => {
        // Sort the arrays to ensure reliable comparison
        const originalCategoriesIds = getCategoryIdsFromOriginalProfile(); // We need to get this from somewhere
        const currentCategoriesIds = [...selectedCategoryIds].sort();

        // Compare arrays by converting to strings
        const originalIdsString = JSON.stringify(originalCategoriesIds);
        const currentIdsString = JSON.stringify(currentCategoriesIds);

        if (
            nickname !== originalNickname ||
            discordUrl !== originalDiscordUrl ||
            originalIdsString !== currentIdsString
        ) {
            setShowCancelConfirmation(true);
        } else {
            navigate("/main");
        }
    };

    const handleCancelConfirm = () => {
        setShowCancelConfirmation(false);
        navigate("/main");
    };

    const handleCancelDismiss = () => {
        setShowCancelConfirmation(false);
    };

    // Logout handlers
    const handleLogoutClick = () => {
        setShowLogoutConfirmation(true);
    };

    const handleLogoutConfirm = () => {
        setShowLogoutConfirmation(false);
        navigate("/login");
    };

    const handleLogoutDismiss = () => {
        setShowLogoutConfirmation(false);
    };

    const getCategoryIdsFromOriginalProfile = () => {
        // If you stored the original categories somewhere
        return [...selectedCategoryIds].sort(); // This is a placeholder, needs proper implementation
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <div
                className="relative bg-white"
                style={{
                    width: "402px",
                    height: "auto",
                    maxWidth: "100vw",
                    minHeight: "100vh",
                }}
            >
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 w-full">
                    <Header />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p>프로필 정보를 불러오는 중...</p>
                        </div>
                    ) : (
                        <div className="p-6 flex flex-col h-full">
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
                                        onChange={handleNicknameChange}
                                        className={`w-full px-3 py-2 border ${
                                            isNicknameValid
                                                ? "border-gray-300"
                                                : "border-red-500"
                                        } rounded-md`}
                                    />
                                    {nicknameHelperText && (
                                        <p
                                            className={`text-xs ${isNicknameValid ? "text-green-500" : "text-red-500"}`}
                                        >
                                            {nicknameHelperText}
                                        </p>
                                    )}
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
                                            onChange={handleDiscordChange}
                                            className={`w-full px-3 py-2 pr-10 border ${
                                                isDiscordValid
                                                    ? "border-gray-300"
                                                    : "border-red-500"
                                            } rounded-md`}
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
                                    {discordHelperText && (
                                        <p
                                            className={`text-xs ${isDiscordValid ? "text-green-500" : "text-red-500"}`}
                                        >
                                            {discordHelperText}
                                        </p>
                                    )}
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

                                    {categoryDisplayNames.length === 0 && (
                                        <p className="text-xs text-red-500">
                                            *선호 카테고리를 등록하지 않으면
                                            게시 추천 기능이 제한됩니다.
                                        </p>
                                    )}

                                    {isCategoryLoading ? (
                                        <p className="text-sm text-gray-500">
                                            카테고리 정보를 불러오는 중...
                                        </p>
                                    ) : (
                                        categoryDisplayNames.length > 0 && (
                                            <div className="overflow-x-auto pb-2 -mx-2 px-2">
                                                <div className="flex space-x-2 mt-4 min-w-max">
                                                    {categoryDisplayNames.map(
                                                        (
                                                            categoryName,
                                                            index
                                                        ) => (
                                                            <button
                                                                key={index}
                                                                type="button"
                                                                className="bg-orange-500 text-white px-4 py-2 rounded-md text-sm whitespace-nowrap"
                                                            >
                                                                {categoryName}
                                                            </button>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>

                            <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 mt-auto flex flex-col">
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
                                        className={`px-6 py-2 rounded-full bg-orange-500 text-white text-sm ${
                                            isSaving ||
                                            !isNicknameValid ||
                                            !isDiscordValid
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        onClick={handleSave}
                                        disabled={
                                            isSaving ||
                                            !isNicknameValid ||
                                            !isDiscordValid
                                        }
                                    >
                                        {isSaving ? "저장 중..." : "완료"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Category Modal */}
            <CategoryModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onConfirm={handleConfirmCategories}
                initialSelectedCategoryIds={selectedCategoryIds}
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
