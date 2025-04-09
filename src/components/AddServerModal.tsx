import React, { useState } from "react";
import { checkDiscordLinkDuplication } from "../services/userService";
import { AxiosError } from "axios";

interface AddServerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddServer: (discordLink: string) => void;
}

const AddServerModal: React.FC<AddServerModalProps> = ({
    isOpen,
    onClose,
    onAddServer,
}) => {
    const [inviteLink, setInviteLink] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        // 기본 형식 검증
        if (!inviteLink.startsWith("https://discord.gg/")) {
            setError("유효한 디스코드 초대 링크가 아닙니다.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // userService의 checkDiscordLinkDuplication 함수 사용
            const result = await checkDiscordLinkDuplication(inviteLink);

            // 응답에 따른 처리
            if (result.duplication) {
                // 중복된 링크인 경우
                setError("이미 등록된 디스코드 서버입니다.");
                setIsLoading(false);
            } else {
                // 유효하고 중복되지 않은 링크인 경우
                onAddServer(inviteLink);
                setInviteLink("");
                setIsLoading(false);
                onClose();
            }
        } catch (err) {
            // error를 AxiosError로 타입 캐스팅
            const error = err as AxiosError;
            console.error("서버 등록 중 오류 발생:", error);

            if (error.response) {
                const status = error.response.status;
                switch (status) {
                    case 400:
                        setError("유효하지 않은 디스코드 링크입니다.");
                        break;
                    case 401:
                        setError("로그인이 필요합니다.");
                        break;
                    case 403:
                        setError("이 작업을 수행할 권한이 없습니다.");
                        break;
                    case 404:
                        setError("요청한 리소스를 찾을 수 없습니다.");
                        break;
                    case 429:
                        setError(
                            "요청이 너무 많습니다. 잠시 후 다시 시도해주세요."
                        );
                        break;
                    default:
                        setError(
                            "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
                        );
                }
            } else {
                setError(
                    "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요."
                );
            }

            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            {/* Overlay */}
            <div
                className="fixed inset-0 bg-gray-500 bg-opacity-50"
                onClick={onClose}
            ></div>

            {/* Modal Container */}
            <div className="bg-white rounded-lg overflow-hidden shadow-xl z-10 mx-4 max-w-sm w-full">
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-4 text-center">
                        디스코드 서버 등록
                    </h3>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            디스코드 초대 링크
                        </label>
                        <input
                            type="text"
                            value={inviteLink}
                            onChange={(e) => {
                                setInviteLink(e.target.value);
                                setError("");
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            placeholder="https://discord.gg/your-invite-code"
                        />
                        {error && (
                            <p className="mt-1 text-sm text-red-500">{error}</p>
                        )}
                        <p className="mt-2 text-xs text-gray-500">
                            [서버 &gt; 채널 &gt; 초대 코드 만들기 아이콘 클릭
                            &gt; 주소 복사]
                            <br />
                            디스코드 초대 링크를 입력하면 서버 정보가 자동으로
                            가져와집니다.
                        </p>
                    </div>

                    <div className="flex space-x-4 justify-center mt-6">
                        <button
                            className="px-6 py-2 rounded-full bg-white border border-gray-300 text-sm"
                            onClick={onClose}
                        >
                            취소
                        </button>
                        <button
                            className={`px-6 py-2 rounded-full bg-orange-500 text-white text-sm ${
                                isLoading || !inviteLink
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-orange-600"
                            }`}
                            onClick={handleSubmit}
                            disabled={isLoading || !inviteLink}
                        >
                            {isLoading ? "처리 중..." : "등록하기"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddServerModal;
