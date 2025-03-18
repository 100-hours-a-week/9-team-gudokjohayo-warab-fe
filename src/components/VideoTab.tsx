import React, { useState, useEffect } from "react";

interface VideoTabProps {
    // Add any props if needed
}

interface Video {
    id: string;
    title: string;
    thumbnail: string;
    channel: string;
    views: number;
    publishedDays: number;
}

const VideoTab: React.FC<VideoTabProps> = () => {
    // Sample video data
    // In a real implementation, this would come from the YouTube API
    const [videos] = useState<Video[]>([
        {
            id: "1",
            title: "8번 출구 | 이상 현상이 일어나는 지하도에서 출구 찾는 게임",
            thumbnail: "/images/video-thumbnail-1.jpg",
            channel: "침착맨 플러스",
            views: 73982,
            publishedDays: 1,
        },
        {
            id: "2",
            title: "8번 출구 | 이상 현상이 일어나는 지하도에서 출구 찾는 게임",
            thumbnail: "/images/video-thumbnail-2.jpg",
            channel: "침착맨 플러스",
            views: 73982,
            publishedDays: 1,
        },
        {
            id: "3",
            title: "8번 출구 | 이상 현상이 일어나는 지하도에서 출구 찾는 게임",
            thumbnail: "/images/video-thumbnail-3.jpg",
            channel: "침착맨 플러스",
            views: 73982,
            publishedDays: 1,
        },
        {
            id: "4",
            title: "8번 출구 | 이상 현상이 일어나는 지하도에서 출구 찾는 게임",
            thumbnail: "/images/video-thumbnail-4.jpg",
            channel: "침착맨 플러스",
            views: 73982,
            publishedDays: 1,
        },
        {
            id: "5",
            title: "8번 출구 | 이상 현상이 일어나는 지하도에서 출구 찾는 게임",
            thumbnail: "/images/video-thumbnail-5.jpg",
            channel: "침착맨 플러스",
            views: 73982,
            publishedDays: 1,
        },
    ]);

    // YouTube API implementation would go here
    // This is a placeholder for the actual API integration
    const fetchYouTubeVideos = async () => {
        try {
            // In a real implementation, fetch data from YouTube API
            // const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=8번출구게임&type=video&key=${API_KEY}`);
            // const data = await response.json();
            // Process the data and update the videos state

            // For now, we'll just use our sample data
            console.log("Would fetch videos from YouTube API here");
        } catch (error) {
            console.error("Error fetching YouTube videos:", error);
        }
    };

    useEffect(() => {
        // Call the fetch function when component mounts
        fetchYouTubeVideos();
    }, []);

    // Format view count to Korean style (e.g., 73,982 -> 조회수 73982회)
    const formatViewCount = (count: number) => {
        return `조회수 ${count}회`;
    };

    // Format published days (e.g., 1 -> 1일 전)
    const formatPublishedDays = (days: number) => {
        return `${days}일 전`;
    };

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Navigation tabs would be here in the parent component */}

            {/* Video list */}
            <div className="flex-1 overflow-y-auto pb-4">
                {videos.map((video) => (
                    <div key={video.id} className="flex mb-4">
                        {/* Video thumbnail */}
                        <div className="w-40 h-24 bg-gray-200 mr-3 flex-shrink-0">
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

                        {/* Video details */}
                        <div className="flex flex-col flex-1">
                            {/* Video title - 글자 크기 감소 */}
                            <h3 className="text-sm font-medium mb-1">
                                {video.title}
                            </h3>

                            {/* Video metadata - 글자 크기 감소 */}
                            <div className="text-xs text-gray-500 mb-1">
                                {formatViewCount(video.views)} •{" "}
                                {formatPublishedDays(video.publishedDays)}
                            </div>

                            {/* Channel info - 글자 크기 감소 */}
                            <div className="flex items-center mt-auto">
                                <div className="w-6 h-6 bg-gray-200 rounded-full mr-2">
                                    {/* Channel avatar - would be from YouTube API */}
                                </div>
                                <span className="text-xs text-gray-600">
                                    {video.channel}
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
