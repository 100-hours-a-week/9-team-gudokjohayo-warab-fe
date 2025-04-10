import React, { useState, useMemo, useEffect } from "react";
import ConfirmationModal from "./ConfirmationModal";
import AddServerModal from "./AddServerModal";
import {
    getGameServers,
    addServer,
    deleteServer,
    ServerInfo,
} from "../services/serverService";

interface PartyRegistrationProps {
    gameId: string;
    userId?: number; // Current user ID
}

const PartyRegistration: React.FC<PartyRegistrationProps> = ({
    gameId,
    userId,
}) => {
    const [servers, setServers] = useState<ServerInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"newest" | "expiration">(
        "newest"
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch servers on component mount
    useEffect(() => {
        const fetchServers = async () => {
            try {
                setLoading(true);
                const serverData = await getGameServers(gameId);
                setServers(serverData);
                setError(null);
            } catch (err) {
                setError("서버 목록을 불러오는데 실패했습니다.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchServers();
    }, [gameId]);

    // Sort servers using useMemo to avoid unnecessary re-renders
    const sortedServers = useMemo(() => {
        const sorted = [...servers];
        if (sortOrder === "newest") {
            return sorted.sort(
                (a, b) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
        } else {
            // Handle null expires_at by putting them at the end
            return sorted.sort((a, b) => {
                if (!a.expires_at) return 1;
                if (!b.expires_at) return -1;
                return (
                    new Date(a.expires_at).getTime() -
                    new Date(b.expires_at).getTime()
                );
            });
        }
    }, [sortOrder, servers]);

    // Format relative time (e.g., "3일 전", "일주일 전")
    const formatRelativeTime = (dateString: string | null): string => {
        if (!dateString) return "무기한";

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

    // Delete server handler - shows confirmation dialog
    const handleDeletePrompt = (serverId: number) => {
        setServerToDelete(serverId);
    };

    // Confirm delete server
    const confirmDeleteServer = async () => {
        if (serverToDelete) {
            try {
                await deleteServer(gameId, serverToDelete);
                setServers((prevServers) =>
                    prevServers.filter(
                        (server) => server.server_id !== serverToDelete
                    )
                );
                setSuccessMessage("서버가 성공적으로 삭제되었습니다!");
                setTimeout(() => setSuccessMessage(""), 3000);
            } catch (err) {
                setError("서버 삭제에 실패했습니다.");
                console.error(err);
            } finally {
                setServerToDelete(null);
            }
        }
    };

    // Handle adding a new server
    const handleAddServer = async (discordLink: string) => {
        try {
            await addServer(gameId, { url: discordLink });
            // Refresh server list
            const serverData = await getGameServers(gameId);
            setServers(serverData);
            setSuccessMessage("서버가 성공적으로 등록되었습니다!");
            setTimeout(() => setSuccessMessage(""), 3000);
            setShowAddModal(false);
        } catch (err) {
            setError("서버 등록에 실패했습니다.");
            console.error(err);
        }
    };

    // Join Discord server
    const handleJoinServer = (discordLink: string) => {
        window.open(discordLink, "_blank");
    };

    if (loading) {
        return (
            <div className="py-8 text-center">서버 목록을 불러오는 중...</div>
        );
    }

    if (error) {
        return <div className="py-8 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="py-2">
            {/* Header with sort options and add button */}
            <div className="flex justify-between items-center mb-6">
                <div className="inline-flex rounded-md shadow-sm bg-gray-100 p-1">
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
                        onClick={() => setSortOrder("expiration")}
                    >
                        만료순
                    </button>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center justify-center w-10 h-10 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition shadow-md"
                    aria-label="서버 추가"
                >
                    <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                </button>
            </div>

            {/* Success message */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-center mb-4">
                    {successMessage}
                </div>
            )}

            {/* Server list */}
            <div className="space-y-3">
                {sortedServers.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        등록된 서버가 없습니다. 새 서버를 추가해보세요!
                    </div>
                ) : (
                    sortedServers.map((server) => (
                        <div
                            key={server.server_id}
                            className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition p-4"
                        >
                            <div className="flex">
                                {/* Server icon */}
                                <div className="mr-3 flex-shrink-0">
                                    <img
                                        src={
                                            server.icon_url ||
                                            "/api/placeholder/80/80"
                                        }
                                        alt={`${server.name} 아이콘`}
                                        className="w-12 h-12 rounded-full object-cover"
                                        onError={(e) => {
                                            // If image fails to load, use placeholder
                                            (e.target as HTMLImageElement).src =
                                                "/api/placeholder/80/80";
                                        }}
                                    />
                                </div>

                                {/* Server details */}
                                <div className="flex-1">
                                    <div className="flex justify-between">
                                        <h3 className="font-bold text-gray-800">
                                            {server.name}
                                        </h3>
                                        <span className="text-xs text-orange-500">
                                            {formatRelativeTime(
                                                server.expires_at
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 mb-3">
                                        {server.description}
                                    </p>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center text-xs text-gray-500">
                                            <svg
                                                className="w-3 h-3 mr-1"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v2h8v-2zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-2a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 015-2.906z" />
                                            </svg>
                                            {server.member_count}명
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex space-x-2">
                                            {server.user_id === userId && (
                                                <button
                                                    onClick={() =>
                                                        handleDeletePrompt(
                                                            server.server_id
                                                        )
                                                    }
                                                    className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition"
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
                                            )}
                                            <button
                                                onClick={() =>
                                                    handleJoinServer(
                                                        server.discord_url
                                                    )
                                                }
                                                className="px-4 py-1.5 bg-orange-500 text-white rounded-full text-xs hover:bg-orange-600 transition"
                                            >
                                                참가하기
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Delete confirmation modal using ConfirmationModal component */}
            <ConfirmationModal
                isOpen={serverToDelete !== null}
                title="서버 삭제 확인"
                message="정말로 이 서버를 삭제하시겠습니까?"
                confirmButtonText="삭제"
                cancelButtonText="취소"
                onConfirm={confirmDeleteServer}
                onCancel={() => setServerToDelete(null)}
            />

            {/* Add server modal using AddServerModal component */}
            <AddServerModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onAddServer={handleAddServer}
            />
        </div>
    );
};

export default PartyRegistration;
