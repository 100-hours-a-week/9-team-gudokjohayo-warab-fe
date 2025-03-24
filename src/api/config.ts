import axios from "axios";

const api = axios.create({
    baseURL: "https://dev.api.warab.store/api/v1", // API 기본 URL
    timeout: 10000, // 요청 제한 시간 (5초)
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
export {};
