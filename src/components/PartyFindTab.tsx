import React, { useState, useEffect } from "react";
import {
    getComments,
    createComment,
    updateComment,
    deleteComment,
} from "../services/commentService";
import { getUserProfile } from "../services/userService";
import ConfirmationModal from "./ConfirmationModal";

interface PartyFindTabProps {
    gameId?: number;
}

interface Comment {
    comment_id: number;
    user_id: number;
    name: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: null | string;
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

    // Edit state
    const [editingCommentId, setEditingCommentId] = useState<number | null>(
        null
    );
    const [editContent, setEditContent] = useState<string>("");

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [commentToDelete, setCommentToDelete] = useState<number | null>(null);

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

    // Handle edit input change
    const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditContent(e.target.value);
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
            await updateComment(gameId, commentId, editContent);

            // Update UI optimistically
            setComments(
                comments.map((comment) =>
                    comment.comment_id === commentId
                        ? {
                              ...comment,
                              content: editContent,
                              updated_at: new Date()
                                  .toISOString()
                                  .split("T")[0],
                          }
                        : comment
                )
            );

            // Reset edit state
            setEditingCommentId(null);
            setEditContent("");

            // Refresh comments from server
            const updatedComments = await getComments(gameId);
            setComments(updatedComments);
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
            await deleteComment(gameId, commentToDelete);

            // Update UI
            setComments(
                comments.filter(
                    (comment) => comment.comment_id !== commentToDelete
                )
            );

            // Close modal
            closeModal();

            // Refresh comments from server
            const updatedComments = await getComments(gameId);
            setComments(updatedComments);
        } catch (error) {
            console.error("Error deleting comment:", error);
            closeModal();
        }
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
                name: userProfile?.nickname || "나",
                content: currentMessage,
                created_at: new Date().toISOString().split("T")[0],
                updated_at: new Date().toISOString().split("T")[0],
                deleted_at: null,
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
            if (editingCommentId) {
                handleSaveEdit(editingCommentId);
            } else {
                handleSendMessage();
            }
        }
    };

    // Function to truncate username if needed while maintaining display structure
    const formatUsername = (username: string) => {
        if (username.length > 12) {
            return username.substring(0, 12) + "...";
        }
        return username;
    };

    // Check if the comment belongs to current user (simplified for demo)
    const isOwnComment = (comment: Comment) => {
        // In a real app, you would compare with the logged-in user's ID
        // return userProfile?.nickname === comment.name || comment.user_id === -1;
        return true;
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
                                            {formatUsername(comment.name)}
                                        </span>
                                    </div>
                                    <span className="text-gray-400 mr-2 text-xs">
                                        |
                                    </span>
                                    {editingCommentId === comment.comment_id ? (
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                className="w-full p-1 text-xs border rounded"
                                                value={editContent}
                                                onChange={handleEditInputChange}
                                                onKeyPress={handleKeyPress}
                                                autoFocus
                                            />
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 flex-1 break-words text-xs">
                                            {comment.content}
                                        </span>
                                    )}

                                    {/* Edit and Delete buttons for user's own comments */}
                                    {isOwnComment(comment) && (
                                        <div className="flex ml-2">
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
                                                        onClick={
                                                            handleCancelEdit
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
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="text-gray-400 px-1"
                                                        onClick={() =>
                                                            handleStartEdit(
                                                                comment
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
                                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                                            />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        className="text-gray-400 px-1"
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
