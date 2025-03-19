import axios from "axios";

const api = axios.create({
    baseURL: "https://00330be2-14d5-4f9a-8bb5-43fdd9caf98c.mock.pstmn.io", // API 기본 URL
    timeout: 10000, // 요청 제한 시간 (5초)
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;
export {};
