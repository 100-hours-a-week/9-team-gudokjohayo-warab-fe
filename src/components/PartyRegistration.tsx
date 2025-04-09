import React, { useState, useMemo } from "react";
import ConfirmationModal from "./ConfirmationModal";
import AddServerModal from "./AddServerModal";

interface PartyRegistrationProps {
    gameId: string;
    userId?: string; // Current user ID
}

interface ServerInfo {
    id: string;
    name: string;
    description: string;
    iconUrl: string;
    discordLink: string;
    memberCount: number;
    expiresAt: string; // When the server listing expires
    createdAt: string;
    ownerId: string; // To check if current user is the owner
}

// Sample data
const sampleServers: ServerInfo[] = [
    {
        id: "1",
        name: "엘든 링 초보자 모임",
        description: "처음 게임을 시작하는 초보자들을 위한 서버입니다.",
        iconUrl: "/api/placeholder/80/80",
        discordLink: "https://discord.gg/example1",
        memberCount: 328,
        expiresAt: "2023-06-15",
        createdAt: "2023-04-15",
        ownerId: "user1",
    },
    {
        id: "2",
        name: "프로 플레이어 길드",
        description:
            "숙련된 플레이어들의 모임. PVP 및 보스 레이드를 함께합니다.",
        iconUrl: "/api/placeholder/80/80",
        discordLink: "https://discord.gg/example2",
        memberCount: 156,
        expiresAt: "2025-04-30",
        createdAt: "2023-03-22",
        ownerId: "user2",
    },
    {
        id: "3",
        name: "주말 게이머 클럽",
        description:
            "주로 주말에 모여서 함께 게임하는 편안한 분위기의 서버입니다.",
        iconUrl: "/api/placeholder/80/80",
        discordLink: "https://discord.gg/example3",
        memberCount: 87,
        expiresAt: "2025-04-10",
        createdAt: "2023-05-10",
        ownerId: "user1", // This user owns this server (same as first mock user)
    },
];

const PartyRegistration: React.FC<PartyRegistrationProps> = ({
    gameId,
    userId = "user1",
}) => {
    const [servers, setServers] = useState<ServerInfo[]>(sampleServers);
    const [sortOrder, setSortOrder] = useState<"newest" | "expiration">(
        "newest"
    );
    const [showAddModal, setShowAddModal] = useState(false);
    const [serverToDelete, setServerToDelete] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState("");

    // Sort servers using useMemo to avoid infinite re-renders
    const sortedServers = useMemo(() => {
        const sorted = [...servers];
        if (sortOrder === "newest") {
            return sorted.sort(
                (a, b) =>
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
            );
        } else {
            return sorted.sort(
                (a, b) =>
                    new Date(a.expiresAt).getTime() -
                    new Date(b.expiresAt).getTime()
            );
        }
    }, [sortOrder, servers]);

    // Format relative time (e.g., "3일 전", "일주일 전")
    const formatRelativeTime = (dateString: string): string => {
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
    const handleDeletePrompt = (serverId: string) => {
        setServerToDelete(serverId);
    };

    // Confirm delete server
    const confirmDeleteServer = () => {
        if (serverToDelete) {
            setServers((prevServers) =>
                prevServers.filter((server) => server.id !== serverToDelete)
            );
            setServerToDelete(null);
            setSuccessMessage("서버가 성공적으로 삭제되었습니다!");
            setTimeout(() => setSuccessMessage(""), 3000);
        }
    };

    // Handle adding a new server
    const handleAddServer = (discordLink: string) => {
        // Simulating server response with mock data
        const newServer: ServerInfo = {
            id: `${servers.length + 1}`,
            name: "새로운 디스코드 서버",
            description: "디스코드 API에서 가져온 서버 설명",
            iconUrl: "/api/placeholder/80/80",
            discordLink: discordLink,
            memberCount: 42,
            expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                .toISOString()
                .split("T")[0], // 14 days from now
            createdAt: new Date().toISOString().split("T")[0],
            ownerId: userId,
        };

        setServers((prevServers) => [newServer, ...prevServers]);
        setSuccessMessage("서버가 성공적으로 등록되었습니다!");
        setTimeout(() => setSuccessMessage(""), 3000);
    };

    // Join Discord server
    const handleJoinServer = (discordLink: string) => {
        window.open(discordLink, "_blank");
    };

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
                {sortedServers.map((server) => (
                    <div
                        key={server.id}
                        className="bg-white border border-gray-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition p-4"
                    >
                        <div className="flex">
                            {/* Server icon */}
                            <div className="mr-3 flex-shrink-0">
                                <img
                                    src={server.iconUrl}
                                    alt={`${server.name} 아이콘`}
                                    className="w-12 h-12 rounded-full object-cover"
                                />
                            </div>

                            {/* Server details */}
                            <div className="flex-1">
                                <div className="flex justify-between">
                                    <h3 className="font-bold text-gray-800">
                                        {server.name}
                                    </h3>
                                    <span className="text-xs text-orange-500">
                                        {formatRelativeTime(server.expiresAt)}
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
                                        {server.memberCount}명
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex space-x-2">
                                        {server.ownerId === userId && (
                                            <button
                                                onClick={() =>
                                                    handleDeletePrompt(
                                                        server.id
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
                                                    server.discordLink
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
                ))}
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
