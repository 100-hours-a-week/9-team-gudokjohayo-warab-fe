import { create } from "zustand";
import { getUserProfile, updateUserProfile } from "../services/userService";
import { getCategoriesByIds } from "../services/categoryService";
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

interface UserState {
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
    fetchUserProfile: () => Promise<void>;
    updateCategories: (categories: Category[]) => void;
    updateUserProfileData: (
        nickname: string,
        categoryIds: number[]
    ) => Promise<void>;
    refreshUserProfile: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
    userProfile: null,
    isLoading: true,
    error: null,

    fetchUserProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await safeRequest(
                () => getUserProfile(),
                "UserStore - getUserProfile"
            );

            if (response?.data) {
                set({ userProfile: response.data, isLoading: false });
            }
        } catch (error) {
            set({
                error: error instanceof Error ? error.message : "Unknown error",
                isLoading: false,
            });
            console.error("Error fetching user profile:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    // Context API의 updateCategories와 유사한 메서드
    updateCategories: (categories) => {
        set((state) => ({
            userProfile: state.userProfile
                ? {
                      ...state.userProfile,
                      categorys: categories,
                  }
                : null,
        }));
    },

    // 프로필 전체 업데이트 메서드
    updateUserProfileData: async (nickname, categoryIds) => {
        try {
            await updateUserProfile(nickname, "", categoryIds);
            const categories = await getCategoriesByIds(categoryIds);

            set((state) => ({
                userProfile: state.userProfile
                    ? {
                          ...state.userProfile,
                          nickname,
                          categorys: categories,
                      }
                    : null,
            }));
        } catch (error) {
            set({
                error:
                    error instanceof Error
                        ? error.message
                        : "Failed to update profile",
            });
        }
    },

    // Context API의 refreshUserProfile과 동일한 메서드
    refreshUserProfile: async () => {
        return get().fetchUserProfile();
    },
}));
