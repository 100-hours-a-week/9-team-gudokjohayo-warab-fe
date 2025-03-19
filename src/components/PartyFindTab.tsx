import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getComments, createComment } from "../services/commentService";
import { getUserProfile } from "../services/userService";

interface PartyFindTabProps {
    gameId?: number;
}

interface Comment {
    comment_id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    delete_at: null | string;
    nickname?: string; // 사용자 닉네임 (API에서 따로 가져옴)
}

interface UserProfile {
    nickname: string;
    discord_link: string;
}

const PartyFindTab: React.FC<PartyFindTabProps> = ({ gameId = 1 }) => {
    // Comments state
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Current user message
    const [currentMessage, setCurrentMessage] = useState<string>("");

    // Fetch comments on component mount
    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                const commentsData = await getComments(gameId);
                setComments(commentsData);
                setLoading(false);
            } catch (err) {
                setError("댓글을 불러오는 데 실패했습니다.");
                setLoading(false);
                console.error("Error fetching comments:", err);
            }
        };

        const fetchUserProfile = async () => {
            try {
                const profileData = await getUserProfile();
                setUserProfile(profileData.data);
            } catch (err) {
                console.error("Error fetching user profile:", err);
            }
        };

        fetchComments();
        fetchUserProfile();
    }, [gameId]);

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentMessage(e.target.value);
    };

    // Handle send message
    const handleSendMessage = async () => {
        if (currentMessage.trim() === "") return;

        try {
            await createComment(gameId, currentMessage);

            // Optimistic update of UI
            const newComment: Comment = {
                comment_id: Date.now(), // 임시 ID
                user_id: -1, // 임시 사용자 ID
                content: currentMessage,
                created_at: new Date().toISOString().split("T")[0],
                updated_at: new Date().toISOString().split("T")[0],
                delete_at: null,
                nickname: userProfile?.nickname || "나",
            };

            setComments([...comments, newComment]);
            setCurrentMessage("");

            // 실제 데이터로 UI 업데이트
            const updatedComments = await getComments(gameId);
            setComments(updatedComments);
        } catch (error) {
            console.error("Error sending comment:", error);
        }
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleSendMessage();
        }
    };

    // Function to truncate username if needed while maintaining display structure
    const formatUsername = (username: string) => {
        if (username.length > 12) {
            return username.substring(0, 12) + "...";
        }
        return username;
    };

    // Find nickname for user_id (in a real app, you'd fetch this from the API)
    const getNickname = (userId: number) => {
        // 이 부분은 실제 구현에서는 사용자 정보를 API에서 가져오거나
        // 댓글 API 응답에 사용자 정보가 포함되도록 수정하는 것이 좋습니다.
        const userMap: Record<number, string> = {
            1: "ivan",
            5: "mona",
        };

        return userMap[userId] || `user${userId}`;
    };

    if (loading) {
        return <div className="p-4 text-center">댓글을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    return (
        <div className="flex flex-col h-full">
            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto mb-3">
                {comments.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.comment_id}
                            className="p-2 mb-2 bg-white rounded-lg shadow-sm"
                        >
                            <div className="flex">
                                <div className="w-8 h-8 mr-2 flex justify-center">
                                    <img
                                        src="/images/discord.png"
                                        alt="Discord"
                                        className="w-5 h-5"
                                    />
                                </div>
                                <div className="flex flex-1">
                                    <div className="w-20 min-w-20 mr-2">
                                        <span className="font-medium text-gray-800 truncate block text-xs">
                                            {formatUsername(
                                                comment.nickname ||
                                                    getNickname(comment.user_id)
                                            )}
                                        </span>
                                    </div>
                                    <span className="text-gray-400 mr-2 text-xs">
                                        |
                                    </span>
                                    <span className="text-gray-600 flex-1 break-words text-xs">
                                        {comment.content}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Message input */}
            <div className="mt-auto relative">
                <div className="flex items-center bg-white rounded-full border border-gray-300">
                    <input
                        type="text"
                        placeholder="메시지를 입력하세요."
                        className="flex-1 py-2 px-4 bg-transparent outline-none rounded-full text-sm"
                        value={currentMessage}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                    />
                    <button
                        className={`absolute right-2 p-1.5 rounded-full ${
                            currentMessage.trim() === ""
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-orange-500 text-white"
                        }`}
                        onClick={handleSendMessage}
                        disabled={currentMessage.trim() === ""}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PartyFindTab;
