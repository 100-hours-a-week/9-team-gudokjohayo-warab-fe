import api from "../api/config";
import axios, { AxiosError } from "axios";

export interface GameVideo {
    thumbnail: string;
    title: string;
    views: number;
    upload_date: string;
    channel_thumbnail: string;
    channel_name: string;
    video_url: string;
}

export async function fetchGameVideos(gameId: string): Promise<GameVideo[]> {
    try {
        // axios 인스턴스를 사용하여 API 호출
        const response = await api.get(`/games/${gameId}/video`);

        // axios는 자동으로 JSON 파싱을 처리합니다
        const result = response.data;

        if (result && result.data) {
            return result.data;
        } else {
            console.error("Unexpected API response structure:", result);
            return [];
        }
    } catch (error) {
        // axios 에러 처리
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            // 서버 응답이 있는 경우
            if (axiosError.response) {
                console.error("API Error Status:", axiosError.response.status);
                console.error("API Error Response:", axiosError.response.data);
                throw new Error(
                    `Failed to fetch videos: ${axiosError.response.status}`
                );
            }
            // 요청은 만들어졌지만 응답을 받지 못한 경우
            else if (axiosError.request) {
                console.error("No response received:", axiosError.request);
                throw new Error("No response received from server");
            }
            // 요청을 만드는 중에 에러가 발생한 경우
            else {
                console.error("Request Error:", axiosError.message);
                throw new Error(`Request failed: ${axiosError.message}`);
            }
        } else {
            // axios 에러가 아닌 다른 에러인 경우
            console.error("Fetch Error:", error);
            const errorMessage =
                error instanceof Error ? error.message : String(error);
            throw new Error(`Error fetching videos: ${errorMessage}`);
        }
    }
}
