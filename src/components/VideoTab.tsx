import React, { useState, useEffect } from "react";
import { fetchGameVideos, GameVideo } from "../services/videoService";

interface VideoTabProps {
    gameId: string;
}

const VideoTab: React.FC<VideoTabProps> = ({ gameId }) => {
    const [videos, setVideos] = useState<GameVideo[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVideos = async () => {
            try {
                setLoading(true);
                console.log(`Loading videos for game ID: ${gameId}`);
                const gameVideos = await fetchGameVideos(gameId);
                console.log(gameVideos);
                setVideos(gameVideos);
                setError(null);
            } catch (err) {
                setError("Failed to load videos. Please try again later.");
                console.error("Error loading videos:", err);
            } finally {
                setLoading(false);
            }
        };

        loadVideos();
    }, [gameId]);

    // Format view count to Korean style
    const formatViewCount = (count: number) => {
        return `조회수 ${count.toLocaleString()}회`;
    };

    // Calculate time since upload with improved formatting
    const getTimeSinceUpload = (uploadDate: string) => {
        const uploadTime = new Date(uploadDate).getTime();
        const currentTime = new Date().getTime();
        const diffTime = currentTime - uploadTime;

        // Time constants in milliseconds
        const minute = 60 * 1000;
        const hour = 60 * minute;
        const day = 24 * hour;
        const week = 7 * day;
        const month = 30 * day;
        const year = 365 * day;

        if (diffTime < minute) {
            return "방금 전";
        } else if (diffTime < hour) {
            const minutes = Math.floor(diffTime / minute);
            return `${minutes}분 전`;
        } else if (diffTime < day) {
            const hours = Math.floor(diffTime / hour);
            return `${hours}시간 전`;
        } else if (diffTime < week) {
            const days = Math.floor(diffTime / day);
            return `${days}일 전`;
        } else if (diffTime < month) {
            const weeks = Math.floor(diffTime / week);
            return `${weeks}주 전`;
        } else if (diffTime < year) {
            const months = Math.floor(diffTime / month);
            return `${months}개월 전`;
        } else {
            const years = Math.floor(diffTime / year);
            return `${years}년 전`;
        }
    };

    // Function to handle video click
    const handleVideoClick = (videoUrl: string) => {
        window.open(videoUrl, "_blank", "noopener,noreferrer");
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full p-4">
                로딩 중...
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full text-red-500 p-4">
                {error}
            </div>
        );
    }

    if (videos.length === 0) {
        return (
            <div className="flex justify-center items-center h-full p-4">
                관련 영상이 없습니다.
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Video list */}
            <div className="flex-1 overflow-y-auto px-4">
                {videos.map((video, index) => (
                    <div
                        key={index}
                        className="flex py-4 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleVideoClick(video.video_url)}
                    >
                        {/* Video thumbnail - 고정된 크기로 설정 */}
                        <div className="w-32 h-20 bg-gray-200 mr-3 flex-shrink-0 rounded overflow-hidden">
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    // Fallback for missing thumbnails
                                    (e.target as HTMLImageElement).src =
                                        "/images/placeholder.jpg";
                                }}
                            />
                        </div>

                        {/* Video details - 최대 너비 설정 및 말줄임 처리 */}
                        <div className="flex flex-col flex-1 min-w-0">
                            {/* Video title - 한 줄에 표시되도록 설정 */}
                            <h3 className="text-sm font-medium mb-1 truncate">
                                {video.title}
                            </h3>

                            {/* Video metadata */}
                            <div className="text-xs text-gray-500 mb-2">
                                {formatViewCount(video.views)} •{" "}
                                {getTimeSinceUpload(video.upload_date)}
                            </div>

                            {/* Channel info */}
                            <div className="flex items-center mt-auto">
                                <div className="w-5 h-5 bg-gray-200 rounded-full mr-2 overflow-hidden flex-shrink-0">
                                    <img
                                        src={video.channel_thumbnail}
                                        alt={video.channel_name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src =
                                                "/images/placeholder-avatar.jpg";
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-gray-600 truncate">
                                    {video.channel_name}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VideoTab;
