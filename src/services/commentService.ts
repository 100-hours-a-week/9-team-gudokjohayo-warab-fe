import api from "../api/config";

interface Comment {
    comment_id: number;
    user_id: number;
    content: string;
    created_at: string;
    updated_at: string;
    delete_at: null | string;
}

interface CommentListResponse {
    message: string;
    data: {
        comments: Comment[];
    };
}

// 댓글 목록 조회
export const getComments = async (gameId: number): Promise<Comment[]> => {
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
    gameId: number,
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
