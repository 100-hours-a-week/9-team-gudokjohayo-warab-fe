import api from "../api/config";

interface Category {
    id: number;
    name: string;
}

interface ProfileResponse {
    message: string;
    data: {
        nickname: string;
        discord_link: string;
        categories: Category[]; // Updated to match the new response format
    };
}
interface DuplicationResponse {
    message: string;
    duplication: boolean;
}

// 프로필 정보 요청
export const getUserProfile = async (): Promise<ProfileResponse> => {
    try {
        const response = await api.get("/users/profile");
        return response.data;
    } catch (error) {
        console.error("프로필 정보 요청 중 오류 발생:", error);
        throw error;
    }
};

// 닉네임 중복 확인
export const checkNicknameDuplication = async (
    nickname: string
): Promise<DuplicationResponse> => {
    try {
        const response = await api.get(
            `/users/check_nickname?nickname=${encodeURIComponent(nickname)}`
        );
        return response.data;
    } catch (error) {
        console.error("닉네임 중복 확인 중 오류 발생:", error);
        throw error;
    }
};

// 디스코드 링크 중복 확인
export const checkDiscordLinkDuplication = async (
    discordLink: string
): Promise<DuplicationResponse> => {
    try {
        const response = await api.get(
            `/users/check_discord_link/?discord_link=${encodeURIComponent(discordLink)}`
        );
        return response.data;
    } catch (error) {
        console.error("디스코드 링크 중복 확인 중 오류 발생:", error);
        throw error;
    }
};

// 프로필 정보 업데이트
export const updateUserProfile = async (
    nickname: string,
    discordLink: string,
    categoryIds: number[] // We'll still pass category IDs for the request
): Promise<any> => {
    try {
        const response = await api.patch("/users/profile", {
            nickname,
            discord: discordLink,
            category: categoryIds, // API expects category IDs in the request
        });
        return response.data;
    } catch (error) {
        console.error("프로필 정보 업데이트 중 오류 발생:", error);
        throw error;
    }
};
