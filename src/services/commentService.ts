import api from "../api/config";

interface Comment {
    comment_id: number;
    user_id: number;
    name: string;
    content: string;
    created_at: string;
    updated_at: string | null;
    deleted_at: null | string;
}

interface CommentListResponse {
    message: string;
    data: {
        comments: Comment[];
    };
}

// 댓글 목록 조회
export const getComments = async (gameId: string): Promise<Comment[]> => {
    try {
        const response = await api.get<CommentListResponse>(
            `/games/${gameId}/comment`
        );
        return response.data.data.comments;
    } catch (error) {
        console.error("댓글 목록 조회 중 오류 발생:", error);
        throw error;
    }
};

// 댓글 작성
export const createComment = async (
    gameId: string,
    content: string
): Promise<Comment> => {
    try {
        const response = await api.post(`/games/${gameId}/comment`, {
            content,
        });
        return response.data;
    } catch (error) {
        console.error("댓글 작성 중 오류 발생:", error);
        throw error;
    }
};

// 댓글 수정
export const updateComment = async (
    commentId: number,
    content: string
): Promise<Comment> => {
    try {
        const response = await api.put(`/games/comment/${commentId}`, {
            content,
        });
        return response.data;
    } catch (error) {
        console.error("댓글 수정 중 오류 발생:", error);
        throw error;
    }
};

// 댓글 삭제
export const deleteComment = async (commentId: number): Promise<void> => {
    try {
        await api.delete(`/games/comment/${commentId}`);
    } catch (error) {
        console.error("댓글 삭제 중 오류 발생:", error);
        throw error;
    }
};
