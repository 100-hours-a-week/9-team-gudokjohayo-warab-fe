import api from "../api/config";

interface Category {
    category_id: number;
    category_name: string;
}

interface ProfileResponse {
    message: string;
    data: {
        nickname: string;
        discord_link: string;
        categorys: Category[]; // Updated to match the new response format
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
            `/users/check_discord_link?discord_link=${encodeURIComponent(discordLink)}`
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
        console.log(categoryIds);
        const response = await api.put("/users/profile", {
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

// 로그아웃
export const userLogOut = async (): Promise<any> => {
    try {
        const response = await api.post("/auth/logout"); // Send the logout request to the server
        console.log(response);
        return response.data; // Return the response data (optional)
    } catch (error) {
        console.error("Logout failed:", error);
        throw error; // Throw the error to be handled by the caller
    }
};
