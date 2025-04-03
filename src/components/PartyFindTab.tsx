import React, { useState, useEffect, useCallback } from "react";
import {
    getComments,
    createComment,
    updateComment,
    deleteComment,
} from "../services/commentService";
import ConfirmationModal from "./ConfirmationModal";
import ToastMessage from "./ToastMessage";
import { getUserProfile } from "../services/userService";

interface PartyFindTabProps {
    gameId: string;
}

interface Comment {
    comment_id: number;
    user_id: number;
    user_discord?: string;
    name: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: null | string;
}

interface UserProfile {
    nickname: string;
    discord_link?: string;
}

const PartyFindTab: React.FC<PartyFindTabProps> = ({ gameId }) => {
    // Comments state
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    // 댓글 전송 중 상태 추가
    const [isSending, setIsSending] = useState<boolean>(false);

    // New state for discord link copying
    const [discordLinkMap, setDiscordLinkMap] = useState<{
        [key: string]: string;
    }>({});
    const [toastMessage, setToastMessage] = useState<string>("");
    const [showToast, setShowToast] = useState<boolean>(false);

    // Current user message
    const [currentMessage, setCurrentMessage] = useState<string>("");

    // Edit state
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
        null
    );
    const [editContent, setEditContent] = useState<string>("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

    // 댓글 데이터 가져오기 함수 - useCallback으로 감싸서 의존성 문제 해결
    const fetchComments = useCallback(async () => {
        try {
            const commentsData = await getComments(gameId);
            // 최신순 정렬
            const sortedComments = commentsData.sort(
                (a: Comment, b: Comment) =>
                    new Date(b.created_at).getTime() -
                    new Date(a.created_at).getTime()
            );
            setComments(sortedComments);

            // Create discord link map from comments
            const linkMap: { [key: string]: string } = {};
            sortedComments.forEach((comment) => {
                console.log(comment.created_at);
                console.log(comment.content);
                if (comment.user_discord) {
                    linkMap[comment.name] = comment.user_discord;
                }
            });
            setDiscordLinkMap(linkMap);
        } catch (err) {
            setError("댓글을 불러오는 데 실패했습니다.");
            console.error("Error fetching comments:", err);
        }
    }, [gameId]);

    useEffect(() => {
        const fetchUserProfileAndComments = async () => {
            try {
                // Fetch user profile first
                const profile = await getUserProfile();
                setUserProfile(profile.data);

                // 댓글 가져오기
                await fetchComments();

                setLoading(false);
            } catch (err) {
                setError("사용자 정보 또는 댓글을 불러오는 데 실패했습니다.");
                setLoading(false);
                console.error("Error fetching data:", err);
            }
        };

        fetchUserProfileAndComments();
    }, [gameId, fetchComments]);

    // Calculate relative time
    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();

        const secondsDiff = Math.floor((now.getTime() - date.getTime()) / 1000);

        // Less than 24 hours
        if (secondsDiff < 86400) {
            return "오늘";
        }

        // Less than 7 days
        if (secondsDiff < 604800) {
            const days = Math.floor(secondsDiff / 86400);
            return `${days}일 전`;
        }

        // Less than 30 days
        if (secondsDiff < 2592000) {
            const weeks = Math.floor(secondsDiff / 604800);
            return `${weeks}주 전`;
        }

        // Less than 12 months
        if (secondsDiff < 31536000) {
            const months = Math.floor(secondsDiff / 2592000);
            return `${months}개월 전`;
        }

        // More than a year
        const years = Math.floor(secondsDiff / 31536000);
        return `${years}년 전`;
    };

    // Handle Discord link copy
    const handleDiscordLinkCopy = (username: string) => {
        const discordLink = discordLinkMap[username];

        if (discordLink) {
            navigator.clipboard
                .writeText(discordLink)
                .then(() => {
                    setToastMessage(
                        `${username}의 디스코드 링크가 복사되었습니다.`
                    );
                    setShowToast(true);

                    // Hide toast after 3 seconds
                    setTimeout(() => {
                        setShowToast(false);
                    }, 3000);
                })
                .catch((err) => {
                    console.error("Failed to copy discord link:", err);
                });
        } else {
            setToastMessage(" 이 링크는 더 이상 존재하지 않습니다.");
            setShowToast(true);

            setTimeout(() => {
                setShowToast(false);
            }, 3000);
        }
    };

    // Handle input change
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 50) {
            setCurrentMessage(e.target.value);
            // 자동 높이 조절
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
    };

    // Handle edit input change
    const handleEditInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ) => {
        if (e.target.value.length <= 50) {
            setEditContent(e.target.value);
            // 자동 높이 조절
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
        }
    };

    // Start editing a comment
    const handleStartEdit = (comment: Comment) => {
        setEditingCommentId(comment.comment_id);
        setEditContent(comment.content);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingCommentId(null);
        setEditContent("");
    };

    // Save edited comment
    const handleSaveEdit = async (commentId: number) => {
        if (editContent.trim() === "") return;

        try {
            await updateComment(commentId, editContent);

            // Reset edit state
            setEditingCommentId(null);
            setEditContent("");

            // Refresh comments from server
            await fetchComments();
        } catch (error) {
            console.error("Error updating comment:", error);
        }
    };

    // Open delete confirmation modal
    const openDeleteModal = (commentId: number) => {
        setCommentToDelete(commentId);
        setIsModalOpen(true);
    };

    // Close modal
    const closeModal = () => {
        setIsModalOpen(false);
        setCommentToDelete(null);
    };

    // Delete a comment
    const confirmDeleteComment = async () => {
        if (commentToDelete === null) return;

        try {
            await deleteComment(commentToDelete);

            // Close modal
            closeModal();

            // Refresh comments from server
            await fetchComments();
        } catch (error) {
            console.error("Error deleting comment:", error);
            closeModal();
        }
    };

    // Handle send message with Discord link check
    const handleSendMessage = async () => {
        // Check if user has Discord link
        if (!userProfile?.discord_link) {
            setToastMessage("디스코드 링크를 먼저 등록해주세요.");
            setShowToast(true);
            return;
        }

        if (currentMessage.trim() === "" || isSending) return;

        try {
            // 전송 중 상태로 설정
            setIsSending(true);

            await createComment(gameId, currentMessage);
            setCurrentMessage("");

            // 실제 데이터로 UI 업데이트
            await fetchComments();
        } catch (error) {
            console.error("Error sending comment:", error);
        } finally {
            // 전송 완료 상태로 설정
            setIsSending(false);
        }
    };

    // Handle key press (Enter to send)
    const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
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

    // Modify isOwnComment to check against user_id
    const isOwnComment = (nickname: string) => {
        return nickname === userProfile?.nickname;
    };

    if (loading) {
        return <div className="p-4 text-center">댓글을 불러오는 중...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-red-500">{error}</div>;
    }

    // Check if Discord link is set before rendering comment input
    const canPostComment = !!userProfile?.discord_link;

    return (
        <div className="flex flex-col h-full">
            {/* Message input */}
            <div className="mb-3 relative">
                <div className="flex items-center bg-white border border-gray-300 rounded-lg">
                    <textarea
                        placeholder={
                            !canPostComment
                                ? "프로필 > 디스코드에 링크를 입력해주세요."
                                : "메시지를 입력하세요."
                        }
                        className="flex-1 py-2 px-4 bg-transparent outline-none rounded-lg text-sm resize-none overflow-hidden min-h-[40px] max-h-40"
                        value={currentMessage}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyPress}
                        disabled={!canPostComment || isSending}
                        style={{
                            lineHeight: "24px",
                            alignItems: "center",
                            paddingTop: "8px",
                            paddingBottom: "8px",
                        }}
                    />
                    <button
                        className={`mr-2 p-1.5 rounded-full ${
                            !canPostComment ||
                            currentMessage.trim() === "" ||
                            isSending
                                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                                : "bg-orange-500 text-white"
                        }`}
                        onClick={handleSendMessage}
                        disabled={
                            !canPostComment ||
                            currentMessage.trim() === "" ||
                            isSending
                        }
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
                {/* Character count */}
                <div className="text-xs text-right mt-1 text-gray-500">
                    {currentMessage.length}/50
                </div>
            </div>

            {/* Chat messages */}
            <div className="flex-1 overflow-y-auto mb-6">
                {comments.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        아직 댓글이 없습니다.
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment.comment_id}
                            className="p-3 mb-3 bg-white rounded-lg shadow-sm"
                        >
                            {/* Header row with username and actions */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    {/* Discord copy button */}
                                    <div
                                        className="flex items-center bg-[#5865F2] bg-opacity-10 hover:bg-opacity-20 rounded-full px-2 py-1 cursor-pointer mr-2"
                                        onClick={() =>
                                            handleDiscordLinkCopy(comment.name)
                                        }
                                    >
                                        {/* Discord icon */}
                                        <img
                                            src={`${process.env.PUBLIC_URL}/images/discord.png`}
                                            alt="Discord"
                                            className="w-4 h-4"
                                        />

                                        {/* Copy icon */}
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="12"
                                            height="12"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#5865F2"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="ml-1"
                                        >
                                            <rect
                                                x="9"
                                                y="9"
                                                width="13"
                                                height="13"
                                                rx="2"
                                                ry="2"
                                            ></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </div>

                                    {/* Username */}
                                    <span className="font-medium text-black font-800 text-sm">
                                        {formatUsername(comment.name)}
                                    </span>
                                </div>

                                {/* Action buttons for user's own comments */}
                                {isOwnComment(comment.name) && (
                                    <div className="flex">
                                        {editingCommentId ===
                                        comment.comment_id ? (
                                            <>
                                                <button
                                                    className="text-green-500 px-1"
                                                    onClick={() =>
                                                        handleSaveEdit(
                                                            comment.comment_id
                                                        )
                                                    }
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
                                                            d="M5 13l4 4L19 7"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="text-red-500 px-1"
                                                    onClick={handleCancelEdit}
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
                                                            d="M6 18L18 6M6 6l12 12"
                                                        />
                                                    </svg>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 px-1"
                                                    onClick={() =>
                                                        handleStartEdit(comment)
                                                    }
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
                                                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                        />
                                                    </svg>
                                                </button>
                                                <button
                                                    className="text-gray-400 hover:text-gray-600 px-1"
                                                    onClick={() =>
                                                        openDeleteModal(
                                                            comment.comment_id
                                                        )
                                                    }
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
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Content area */}
                            <div className="pl-1">
                                {editingCommentId === comment.comment_id ? (
                                    <div className="w-full">
                                        <textarea
                                            className="w-full p-2 text-sm border rounded resize-none overflow-hidden max-h-40"
                                            value={editContent}
                                            onChange={handleEditInputChange}
                                            onKeyPress={(e) => {
                                                if (
                                                    e.key === "Enter" &&
                                                    !e.shiftKey
                                                ) {
                                                    e.preventDefault();
                                                    if (editingCommentId) {
                                                        handleSaveEdit(
                                                            editingCommentId
                                                        );
                                                    }
                                                }
                                            }}
                                            autoFocus
                                            maxLength={50}
                                            placeholder="최대 50자까지 입력 가능합니다."
                                        />
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-gray-700 break-words text-sm mb-1">
                                            {comment.content}
                                        </p>
                                        <div className="text-gray-400 text-xs">
                                            {comment.updated_at &&
                                            comment.updated_at !==
                                                comment.created_at ? (
                                                <span className="inline-block">
                                                    {getRelativeTime(
                                                        comment.updated_at
                                                    )}{" "}
                                                    (수정됨)
                                                </span>
                                            ) : (
                                                <span className="inline-block">
                                                    {getRelativeTime(
                                                        comment.created_at
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <ToastMessage message={toastMessage} isVisible={showToast} />

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                title="댓글 삭제"
                message="이 댓글을 정말 삭제하시겠습니까?"
                confirmButtonText="삭제"
                cancelButtonText="취소"
                onConfirm={confirmDeleteComment}
                onCancel={closeModal}
            />
        </div>
    );
};

export default PartyFindTab;
