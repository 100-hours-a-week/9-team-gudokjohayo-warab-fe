import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import ConfirmationModal from "../components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import { checkAuthentication } from "../services/userService";
import {
    getUserServers,
    deleteServer,
    UserServerInfo,
} from "../services/serverService";

const MyServer: React.FC = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [authLoading, setAuthLoading] = useState<boolean>(true);
    const [servers, setServers] = useState<UserServerInfo[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sortOrder, setSortOrder] = useState<
        "newest" | "expiration" | "game"
    >("game");
    const [serverToDelete, setServerToDelete] = useState<{
        gameId: number;
        serverId: number;
    } | null>(null);
    const [successMessage, setSuccessMessage] = useState<string>("");

    // 인증 상태 확인
    useEffect(() => {
        const checkUserAuthentication = async () => {
            setAuthLoading(true);
            try {
                const authResponse = await checkAuthentication();
                if (
                    authResponse &&
                    authResponse.data !== null &&
                    authResponse.message !== "not_authenticated"
                ) {
                    setIsAuthenticated(true);
                    fetchUserServers();
                } else {
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error("인증 상태 확인 중 오류 발생:", error);
                setIsAuthenticated(false);
            } finally {
                setAuthLoading(false);
            }
        };

        checkUserAuthentication();
    }, []);

    // 사용자의 서버 정보 불러오기
    const fetchUserServers = async () => {
        setIsLoading(true);
        try {
            const serverData = await getUserServers();
            setServers(serverData);
        } catch (error) {
            console.error("서버 정보를 가져오는 중 오류 발생:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // 만료 시간 형식화 함수
    const formatRelativeTime = (dateString: string | null): string => {
        if (!dateString) return "만료 없음";

        const now = new Date();
        const date = new Date(dateString);
        const diffTime = date.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return "만료됨";
        if (diffDays === 0) return "오늘 만료";
        if (diffDays === 1) return "내일 만료";
        if (diffDays <= 7) return `${diffDays}일 후 만료`;
        if (diffDays <= 30) return `${Math.floor(diffDays / 7)}주 후 만료`;
        return `${Math.floor(diffDays / 30)}개월 후 만료`;
    };

    // 정렬된 서버 목록
    const sortedServers = React.useMemo(() => {
        const sorted = [...servers];
        if (sortOrder === "newest") {
            return sorted.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
        } else if (sortOrder === "expiration") {
            // null 값은 가장 나중에 정렬되도록 처리
            return sorted.sort((a, b) => {
                if (!a.expires_at) return 1;
                if (!b.expires_at) return -1;
                return (
                    new Date(a.expires_at).getTime() -
                    new Date(b.expires_at).getTime()
                );
            });
        } else {
            // 게임 이름 기준 정렬
            return sorted.sort((a, b) =>
                a.game_name.localeCompare(b.game_name)
            );
        }
    }, [sortOrder, servers]);

    // 서버 삭제 확인 모달 표시
    const handleDeletePrompt = (
        gameId: number,
        serverId: number,
        e: React.MouseEvent
    ) => {
        e.stopPropagation();
        setServerToDelete({ gameId, serverId });
    };

    // 서버 삭제 확정
    const confirmDeleteServer = async () => {
        if (serverToDelete) {
            try {
                await deleteServer(
                    serverToDelete.gameId.toString(),
                    serverToDelete.serverId
                );
                setServers((prevServers) =>
                    prevServers.filter(
                        (server) =>
                            server.server_id !== serverToDelete.serverId ||
                            server.game_id !== serverToDelete.gameId
                    )
                );
                setSuccessMessage(
                    "디스코드 서버 링크가 성공적으로 삭제되었습니다!"
                );
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (error) {
                console.error("서버 삭제 중 오류 발생:", error);
                setSuccessMessage("서버 삭제 중 오류가 발생했습니다.");
                setTimeout(() => setSuccessMessage(""), 3000);
            } finally {
                setServerToDelete(null);
            }
        }
    };

    // New utility function to truncate text
    const truncateText = (text: string, maxLength: number = 30) => {
        return text.length > maxLength
            ? `${text.substring(0, maxLength)}...`
            : text;
    };

    // 게임 상세 페이지로 이동
    const handleGameClick = (gameId: number) => {
        navigate(`/games/${gameId}`);
    };

    // 로그인하지 않은 사용자를 위한 컴포넌트
    const UnauthenticatedView = () => {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[70vh] p-6">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2">
                        로그인이 필요합니다
                    </h2>
                    <p className="text-gray-600 mb-6">
                        내 서버 목록을 보려면 먼저 로그인해주세요.
                    </p>
                    <button
                        className="bg-orange-500 text-white rounded-full py-3 px-8 font-medium"
                        onClick={() => navigate("/login")}
                    >
                        로그인하기
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-white">
            <div
                className="relative bg-white"
                style={{
                    width: "402px",
                    height: "auto",
                    maxWidth: "100vw",
                    minHeight: "100vh",
                }}
            >
                {/* Fixed Header */}
                <div className="sticky top-0 z-10 w-full">
                    <Header />
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-auto p-6">
                    {authLoading ? (
                        <div className="flex justify-center items-center h-64">
                            <p>인증 상태를 확인하는 중...</p>
                        </div>
                    ) : !isAuthenticated ? (
                        <UnauthenticatedView />
                    ) : (
                        <>
                            <h2 className="text-xl font-semibold text-center mb-6">
                                내 등록 게임
                            </h2>

                            {/* 정렬 옵션 */}
                            <div className="flex justify-center mb-6">
                                <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                                            sortOrder === "game"
                                                ? "bg-orange-500 text-white"
                                                : "text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setSortOrder("game")}
                                    >
                                        게임순
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                                            sortOrder === "newest"
                                                ? "bg-orange-500 text-white"
                                                : "text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() => setSortOrder("newest")}
                                    >
                                        최신순
                                    </button>
                                    <button
                                        className={`px-4 py-2 text-sm font-medium rounded-md transition ${
                                            sortOrder === "expiration"
                                                ? "bg-orange-500 text-white"
                                                : "text-gray-700 hover:bg-gray-200"
                                        }`}
                                        onClick={() =>
                                            setSortOrder("expiration")
                                        }
                                    >
                                        만료순
                                    </button>
                                </div>
                            </div>

                            {/* 성공 메시지 */}
                            {successMessage && (
                                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-center mb-4">
                                    {successMessage}
                                </div>
                            )}

                            {/* 서버 목록 */}
                            {isLoading ? (
                                <div className="flex justify-center items-center h-64">
                                    <p>게임 정보를 불러오는 중...</p>
                                </div>
                            ) : sortedServers.length === 0 ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-500 mb-4">
                                        등록된 게임이 없습니다.
                                    </p>
                                    <button
                                        onClick={() => navigate("/main")}
                                        className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm"
                                    >
                                        게임 둘러보기
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {sortedServers.map((server) => (
                                        <div
                                            key={`${server.game_id}-${server.server_id}`}
                                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                                            onClick={() =>
                                                handleGameClick(server.game_id)
                                            }
                                        >
                                            <div className="flex items-center justify-between">
                                                {/* 게임 이름 (하이퍼링크처럼 보이게) */}
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-black-600 hover:underline cursor-pointer">
                                                        {truncateText(
                                                            server.game_name
                                                        )}
                                                    </h3>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        <span className="truncate block">
                                                            {server.discord_url}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* 오른쪽 영역: 만료일 + 삭제 버튼 */}
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs text-orange-500 mb-2">
                                                        {formatRelativeTime(
                                                            server.expires_at
                                                        )}
                                                    </span>
                                                    <button
                                                        onClick={(e) =>
                                                            handleDeletePrompt(
                                                                server.game_id,
                                                                server.server_id,
                                                                e
                                                            )
                                                        }
                                                        className="p-1 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
                                                        aria-label="서버 삭제"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            className="h-4 w-4"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            stroke="currentColor"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                strokeWidth={2}
                                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 삭제 확인 모달 */}
            <ConfirmationModal
                isOpen={serverToDelete !== null}
                title="디스코드 링크 삭제 확인"
                message="정말 이 디스코드 링크를 삭제하시겠습니까?"
                confirmButtonText="삭제"
                cancelButtonText="취소"
                onConfirm={confirmDeleteServer}
                onCancel={() => setServerToDelete(null)}
            />
        </div>
    );
};

export default MyServer;
