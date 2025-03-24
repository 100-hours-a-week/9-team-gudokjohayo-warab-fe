import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:4000", // API 기본 URL
    timeout: 10000, // 요청 제한 시간 (5초)
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
export {};
