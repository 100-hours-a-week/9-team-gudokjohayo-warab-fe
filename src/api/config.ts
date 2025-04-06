import axios from "axios";

export const kakaoBaseURL = process.env.REACT_APP_KAKAOURL;
export const GA_ID = process.env.REACT_APP_GA_ID;

/*
local test 용 링크
export const kakaoBaseURL = "http://localhost:8080";
baseURL: "http://localhost:8080/api/v1"
*/

// https://dev.api.warab.store/api/v1

const api = axios.create({
    baseURL: process.env.REACT_APP_BASEURL, // API 기본 URL
    timeout: 10000, // 요청 제한 시간 (10초)
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // CORS 요청에 인증 정보를 포함 (쿠키 등)
});

export default api;
export {};
