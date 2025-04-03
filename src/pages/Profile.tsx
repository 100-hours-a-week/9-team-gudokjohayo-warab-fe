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
    userLogOut,
    checkAuthentication,
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
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [nickname, setNickname] = useState<string>("");
    const [discordUrl, setDiscordUrl] = useState<string>("");
    const [originalNickname, setOriginalNickname] = useState<string>("");
    const [originalDiscordUrl, setOriginalDiscordUrl] = useState<string>("");
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // 유효성 검사 상태
    const [nicknameHelperText, setNicknameHelperText] = useState<string>("");
    const [discordHelperText, setDiscordHelperText] = useState<string>("");
    const [isNicknameValid, setIsNicknameValid] = useState<boolean>(true);
    const [isDiscordValid, setIsDiscordValid] = useState<boolean>(true);

    // 카테고리 관련 상태
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>(
        []
    );
    const [originalCategoryIds, setOriginalCategoryIds] = useState<number[]>(
        []
    );
    const [categoryDisplayNames, setCategoryDisplayNames] = useState<string[]>(
        []
    );
    const [categoryData, setCategoryData] = useState<Category[]>([]);
    const [isCategoryLoading, setIsCategoryLoading] = useState<boolean>(false);

    // 모달 상태
    const [showCancelConfirmation, setShowCancelConfirmation] =
        useState<boolean>(false);
    const [showLogoutConfirmation, setShowLogoutConfirmation] =
        useState<boolean>(false);

    // 인증 상태 확인
    useEffect(() => {
        const checkUserAuthentication = async () => {
            setAuthLoading(true);
            try {
                const authResponse = await checkAuthentication();
                // 인증 성공: data가 null이 아니고, message가 "not_authenticated"가 아닌 경우
                if (
                    authResponse &&
                    authResponse.data !== null &&
                    authResponse.message !== "not_authenticated"
                ) {
                    setIsAuthenticated(true);
                    await fetchProfileData(); // 인증된 경우에만 프로필 데이터 가져오기
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("인증 상태 확인 중 오류 발생:", error);
                setIsAuthenticated(false);
            } finally {
                setAuthLoading(false);
            }
        };

        checkUserAuthentication();
    }, []);

    // 초기 프로필 정보 불러오기
    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            const profileData = await getUserProfile();
            console.log(profileData);
            setNickname(profileData.data.nickname);
            setDiscordUrl(profileData.data.discord_link);
            setOriginalNickname(profileData.data.nickname);
            setOriginalDiscordUrl(profileData.data.discord_link);

            // 디스코드 링크가 비어있는 경우 헬퍼 텍스트 설정
            if (!profileData.data.discord_link) {
                setDiscordHelperText(
                    "*링크를 등록하지 않으면 게임 상세 페이지 내 댓글 기능 사용이 제한됩니다."
                );
            }

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
                setOriginalCategoryIds([...categoryIds]);

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

    // 변경사항 감지
    useEffect(() => {
        const checkChanges = () => {
            const nicknameChanged = nickname !== originalNickname;
            const discordChanged = discordUrl !== originalDiscordUrl;

            // 카테고리 변경 감지를 위해 배열을 정렬한 후 비교
            const sortedOriginal = [...originalCategoryIds].sort();
            const sortedCurrent = [...selectedCategoryIds].sort();
            const categoriesChanged =
                JSON.stringify(sortedOriginal) !==
                JSON.stringify(sortedCurrent);

            setHasChanges(
                nicknameChanged || discordChanged || categoriesChanged
            );
        };

        checkChanges();
    }, [
        nickname,
        discordUrl,
        selectedCategoryIds,
        originalNickname,
        originalDiscordUrl,
        originalCategoryIds,
    ]);

    // 닉네임 중복 확인 (디바운스 적용)
    const checkNickname = debounce(async (value: string) => {
        // 공백 체크
        if (value.includes(" ")) {
            setNicknameHelperText("닉네임에 공백을 포함할 수 없습니다.");
            setIsNicknameValid(false);
            return;
        }

        const specialCharRegex = /[~!@#$%^&*()_+`\-={}[\]|\\:;"'<>,.?/₩]/;
        if (specialCharRegex.test(value)) {
            setNicknameHelperText("닉네임에 특수문자를 포함할 수 없습니다.");
            setIsNicknameValid(false);
            return;
        }

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
            setDiscordHelperText(
                "*링크를 등록하지 않으면 게임 상세 페이지 내 댓글 기능 사용이 제한됩니다."
            );
            setIsDiscordValid(true); // 비어있어도 유효함
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

            if (result.duplication) {
                setDiscordHelperText("이미 사용 중인 디스코드 링크입니다.");
                setIsDiscordValid(false);
            } else {
                setDiscordHelperText("사용 가능한 디스코드 링크입니다.");
                setIsDiscordValid(true);
            }
        } catch (error) {
            console.error("유효한 링크가 아닙니다.:", error);
            setDiscordHelperText("유효하지 않은 링크입니다.");
            setIsDiscordValid(false);
        }
    }, 500);

    // 닉네임 변경 핸들러
    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setNickname(value);
        checkNickname(value);
    };

    const handleNicknameKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>
    ) => {
        // 허용되지 않는 키 입력 차단
        const specialChars = /[~!@#$%^&*()_+`\-={}[\]|\\:;"'<>,.?/₩ ]/;
        if (specialChars.test(e.key) && e.key.length === 1) {
            e.preventDefault();
            setNicknameHelperText(
                "닉네임에 특수문자나 공백을 포함할 수 없습니다."
            );
            // 메시지 잠시 후 사라짐
            setTimeout(() => {
                if (nickname) {
                    checkNickname(nickname);
                } else {
                    setNicknameHelperText("닉네임을 입력해주세요.");
                    setIsNicknameValid(false);
                }
            }, 1500);
        }
    };

    // 디스코드 링크 변경 핸들러
    const handleDiscordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setDiscordUrl(value);

        if (!value) {
            setDiscordHelperText(
                "*링크를 등록하지 않으면 게임 상세 페이지 내 댓글 기능 사용이 제한됩니다."
            );
            setIsDiscordValid(true); // 비어있어도 유효함
        } else {
            checkDiscordLink(value);
        }
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
        // 변경사항이 없으면 저장하지 않음
        if (!hasChanges) {
            navigate("/main");
            return;
        }

        // 저장 직전에 닉네임 특수문자 검사를 한 번 더 수행
        const specialCharRegex = /[~!@#$%^&*()_+`\-={}[\]|\\:;"'<>,.?/]/;

        // 공백 체크
        if (nickname.includes(" ")) {
            setNicknameHelperText("닉네임에 공백을 포함할 수 없습니다.");
            setIsNicknameValid(false);
            // 토스트 메시지 제거
            return;
        }

        // 특수문자 체크
        if (specialCharRegex.test(nickname)) {
            setNicknameHelperText("닉네임에 특수문자를 포함할 수 없습니다.");
            setIsNicknameValid(false);
            // 토스트 메시지 제거
            return;
        }

        // 빈 닉네임 체크
        if (!nickname) {
            setNicknameHelperText("닉네임을 입력해주세요.");
            setIsNicknameValid(false);
            // 토스트 메시지 제거
            return;
        }

        // 닉네임이 변경되었다면 중복 체크를 한 번 더 수행
        if (nickname !== originalNickname) {
            setIsSaving(true);
            try {
                const result = await checkNicknameDuplication(nickname);
                if (result.duplication) {
                    setNicknameHelperText("이미 사용 중인 닉네임입니다.");
                    setIsNicknameValid(false);
                    setIsSaving(false);
                    // 토스트 메시지 제거
                    return;
                }
            } catch (error) {
                console.error("닉네임 중복 확인 중 오류 발생:", error);
                setNicknameHelperText("중복 확인 중 오류가 발생했습니다.");
                setIsNicknameValid(false);
                setIsSaving(false);
                // 토스트 메시지 제거
                return;
            }
        }

        // 모든 검증을 통과했으므로 닉네임이 유효하다고 설정
        setIsNicknameValid(true);

        // 실제 저장 로직 실행
        setIsSaving(true);
        try {
            await updateUserProfile(nickname, discordUrl, selectedCategoryIds);
            setOriginalNickname(nickname);
            setOriginalDiscordUrl(discordUrl);
            setOriginalCategoryIds([...selectedCategoryIds]);
            setHasChanges(false);

            // 저장이 성공했을 때만 토스트 메시지 표시
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                navigate("/main");
            }, 500);
        } catch (error) {
            console.error("프로필 저장 중 오류 발생:", error);
            // 저장 실패 시 에러 메시지 표시 (선택적)
            setNicknameHelperText("프로필 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleClearDiscord = () => {
        setDiscordUrl("");
        setDiscordHelperText(
            "*링크를 등록하지 않으면 게임 상세 페이지 내 댓글 기능 사용이 제한됩니다."
        );
        setIsDiscordValid(true); // 비어있어도 유효함
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
        if (hasChanges) {
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

    const handleLogoutConfirm = async () => {
        setShowLogoutConfirmation(false);
        try {
            await userLogOut(); // Call the logout API to clear the session
            console.log("Logged out successfully");
            setIsAuthenticated(false); // Update authentication state
            navigate("/login"); // Navigate to the login page after logout
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    const handleLogoutDismiss = () => {
        setShowLogoutConfirmation(false);
    };

    // Handler for login button
    const handleLoginClick = () => {
        navigate("/login");
    };

    // 로그인하지 않은 사용자를 위한 컴포넌트
    const UnauthenticatedView = () => {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                        로그인이 필요합니다
                    </h2>
                    <p className="text-gray-600 mb-6">
                        프로필을 보거나 수정하려면 먼저 로그인해주세요.
                    </p>
                    <button
                        className="bg-orange-500 text-white rounded-full py-3 px-8 font-medium"
                        onClick={handleLoginClick}
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
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
                    {authLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p>인증 상태를 확인하는 중...</p>
                        </div>
                    ) : !isAuthenticated ? (
                        <UnauthenticatedView />
                    ) : isLoading ? (
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
                                        onKeyDown={handleNicknameKeyDown}
                                        maxLength={12}
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
                                            className={`text-xs ${!discordUrl || isDiscordValid ? "text-gray-500" : "text-red-500"}`}
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
                                            게임 추천 기능이 제한됩니다.
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
                                <div className="mb-4">
                                    {showToast && (
                                        <ToastMessage message="수정 완료" />
                                    )}
                                </div>

                                <div className="flex justify-center space-x-14">
                                    <button
                                        className="px-4 py-2 rounded-full bg-white border border-gray-300 text-sm"
                                        onClick={handleCancelClick}
                                    >
                                        취소
                                    </button>
                                    <button
                                        className={`px-4 py-2 rounded-full bg-orange-500 text-white text-sm ${
                                            isSaving ||
                                            !isNicknameValid ||
                                            !hasChanges
                                                ? "opacity-50 cursor-not-allowed"
                                                : ""
                                        }`}
                                        onClick={handleSave}
                                        disabled={
                                            isSaving ||
                                            !isNicknameValid ||
                                            !hasChanges
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
