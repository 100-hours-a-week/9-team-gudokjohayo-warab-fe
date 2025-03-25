import axios from "axios";

export const kakaoBaseURL = "http://localhost:8080";

// https://dev.api.warab.store/api/v1
const api = axios.create({
    baseURL: "http://localhost:8080/api/v1", // API 기본 URL
    timeout: 10000, // 요청 제한 시간 (10초)
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // CORS 요청에 인증 정보를 포함 (쿠키 등)
});

export default api;
export {};
