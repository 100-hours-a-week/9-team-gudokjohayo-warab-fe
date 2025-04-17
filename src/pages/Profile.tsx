import React, {
    useState,
    useEffect,
    Profiler,
    ProfilerOnRenderCallback,
} from "react";
import Header from "../components/Header";
import ToastMessage from "../components/ToastMessage";
import CategoryModal from "../components/CategoryModal";
import ConfirmationModal from "../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { getCategoriesByIds } from "../services/categoryService";
import {
    checkNicknameDuplication,
    userLogOut,
    checkAuthentication,
} from "../services/userService";
import { debounce } from "lodash";
import { safeRequest, captureError } from "../sentry/errorHandler";
import { useUserStore } from "../store/userStore";

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
    const [originalNickname, setOriginalNickname] = useState<string>("");
    const [showToast, setShowToast] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [hasChanges, setHasChanges] = useState<boolean>(false);

    // 유효성 검사 상태
    const [nicknameHelperText, setNicknameHelperText] = useState<string>("");
    const [isNicknameValid, setIsNicknameValid] = useState<boolean>(true);

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

    const {
        userProfile,
        isLoading: userProfileLoading,
        updateUserProfileData,
    } = useUserStore();

    const onRenderCallback: ProfilerOnRenderCallback = (
        id: string,
        phase: "mount" | "update" | "nested-update",
        actualDuration: number,
        baseDuration: number,
        startTime: number,
        commitTime: number
    ) => {
        // 가독성 있게 콘솔 로그 정리
        console.log(`
      Profiler Info for Component: ${id}
      ---------------------------------------------------
      Phase: ${phase}
      Actual Rendering Time: ${actualDuration.toFixed(4)} ms
      Base Rendering Time: ${baseDuration.toFixed(4)} ms
      Start Time: ${startTime.toFixed(4)} ms
      Commit Time: ${commitTime.toFixed(4)} ms
      ---------------------------------------------------
    `);
    };

    // 인증 상태 확인
    useEffect(() => {
        const checkUserAuthentication = async () => {
            setAuthLoading(true);
            try {
                const authResponse = await safeRequest(
                    () => checkAuthentication(),
                    "ProfilePage - checkAuthentication"
                );
                if (
                    authResponse &&
                    authResponse.data !== null &&
                    authResponse.message !== "not_authenticated"
                ) {
                    setIsAuthenticated(true);
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
    useEffect(() => {
        if (userProfile && !userProfileLoading) {
            setNickname(userProfile.nickname);
            setOriginalNickname(userProfile.nickname);

            if (userProfile.categorys && userProfile.categorys.length > 0) {
                setCategoryData(userProfile.categorys);

                const categoryIds = userProfile.categorys.map(
                    (cat) => cat.category_id
                );
                setSelectedCategoryIds(categoryIds);
                setOriginalCategoryIds([...categoryIds]);

                const categoryNames = userProfile.categorys.map(
                    (cat) => cat.category_name
                );
                setCategoryDisplayNames(categoryNames);
            }
        }
    }, [userProfile, userProfileLoading]);

    // 변경사항 감지
    useEffect(() => {
        const checkChanges = () => {
            const nicknameChanged = nickname !== originalNickname;

            // 카테고리 변경 감지를 위해 배열을 정렬한 후 비교
            const sortedOriginal = [...originalCategoryIds].sort();
            const sortedCurrent = [...selectedCategoryIds].sort();
            const categoriesChanged =
                JSON.stringify(sortedOriginal) !==
                JSON.stringify(sortedCurrent);

            setHasChanges(nicknameChanged || categoriesChanged);
        };

        checkChanges();
    }, [nickname, selectedCategoryIds, originalNickname, originalCategoryIds]);

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
            return;
        }

        // 특수문자 체크
        if (specialCharRegex.test(nickname)) {
            setNicknameHelperText("닉네임에 특수문자를 포함할 수 없습니다.");
            setIsNicknameValid(false);
            return;
        }

        // 빈 닉네임 체크
        if (!nickname) {
            setNicknameHelperText("닉네임을 입력해주세요.");
            setIsNicknameValid(false);
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
                    return;
                }
            } catch (error) {
                console.error("닉네임 중복 확인 중 오류 발생:", error);
                setNicknameHelperText("중복 확인 중 오류가 발생했습니다.");
                setIsNicknameValid(false);
                setIsSaving(false);
                return;
            }
        }

        // 모든 검증을 통과했으므로 닉네임이 유효하다고 설정
        setIsNicknameValid(true);

        // 실제 저장 로직 실행
        setIsSaving(true);
        try {
            // userStore의 updateUserProfileData 메서드를 사용
            await updateUserProfileData(nickname, selectedCategoryIds);

            setOriginalNickname(nickname);
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
            setNicknameHelperText("프로필 저장 중 오류가 발생했습니다.");
        } finally {
            setIsSaving(false);
        }
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

    const handleNavigateToMyServers = () => {
        navigate("/my-server");
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
            captureError(error, "ProfilePage - userLogOut");
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
        <Profiler id="Profile" onRender={onRenderCallback}>
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
                        ) : isCategoryLoading ? (
                            <div className="flex justify-center items-center h-64">
                                <p>프로필 정보를 불러오는 중...</p>
                            </div>
                        ) : (
                            <div className="p-6 flex flex-col h-full">
                                <div className="space-y-6">
                                    {/* 프로필 제목 */}
                                    <h2 className="text-xl font-semibold text-center mb-4">
                                        내 프로필
                                    </h2>

                                    {/* 닉네임 섹션 */}
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

                                    {/* 선호 카테고리 섹션 */}
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
                                                                    {
                                                                        categoryName
                                                                    }
                                                                </button>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        )}
                                    </div>

                                    {/* 새로운 섹션: 내 활동 */}
                                    <div className="space-y-4 mt-8">
                                        <h3 className="text-lg font-medium">
                                            내 활동
                                        </h3>

                                        {/* 내 링크 메뉴 */}
                                        <div
                                            className="flex items-center justify-between border-b border-gray-200 py-4 cursor-pointer"
                                            onClick={handleNavigateToMyServers}
                                        >
                                            <div className="flex items-center">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="h-6 w-6 text-orange-500 mr-3"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                                                    />
                                                </svg>
                                                <span className="text-sm font-medium">
                                                    내 서버
                                                </span>
                                            </div>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 text-gray-400"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path
                                                    fillRule="evenodd"
                                                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        </div>
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
        </Profiler>
    );
};

export default ProfilePage;
