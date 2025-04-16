import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { getUserProfile } from "../services/userService";
import { safeRequest } from "../sentry/errorHandler";

// 타입 정의
interface Category {
    category_id: number;
    category_name: string;
}

interface UserProfile {
    nickname: string;
    categorys: Category[];
    // 기타 필요한 사용자 정보
}

interface UserContextType {
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: Error | null;
    updateCategories: (categories: Category[]) => void;
    refreshUserProfile: () => Promise<void>;
}

// Context 생성
const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider 컴포넌트
export const UserProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchUserProfile = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await safeRequest(
                () => getUserProfile(),
                "UserContext - getUserProfile"
            );

            if (response?.data) {
                setUserProfile(response.data);
            }
        } catch (err) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
            console.error("Error fetching user profile:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // 컴포넌트가 마운트될 때 사용자 프로필 로드
    useEffect(() => {
        fetchUserProfile();
    }, []);

    // 카테고리 업데이트 함수
    const updateCategories = (categories: Category[]) => {
        if (userProfile) {
            setUserProfile({
                ...userProfile,
                categorys: categories,
            });
        }
    };

    // 프로필 새로고침 함수
    const refreshUserProfile = async () => {
        await fetchUserProfile();
    };

    const value = {
        userProfile,
        isLoading,
        error,
        updateCategories,
        refreshUserProfile,
    };

    return (
        <UserContext.Provider value={value}>{children}</UserContext.Provider>
    );
};

// 커스텀 훅 - 컴포넌트에서 쉽게 Context 사용
export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};
