import api from "../api/config";

interface GameDetailResponse {
    message: string;
    data: {
        title: string;
        thumbnail: string;
        price: number;
        lowest_price: number;
        description: string;
        release_date: string;
        developer: string;
        publisher: string;
        rating: number;
        player_count: string;
        recent_player: number;
        categories: string[];
        updated_at: string;
    };
}

/**
 * Fetch game details by ID
 * @param id Game ID
 * @returns Game detail data
 */
export const getGameDetails = async (id: string) => {
    try {
        const response = await api.get<GameDetailResponse>(`/games/${id}`);

        if (response.data.message === "game_detail_info_inquiry_success") {
            return response.data.data;
        } else {
            throw new Error("Failed to fetch game details");
        }
    } catch (error) {
        console.error("Error fetching game details:", error);
        throw error;
    }
};

/**
 * Get game price comparison data
 * @param id Game ID
 * @returns Price comparison data
 */
export const getGamePriceComparison = async (id: string) => {
    try {
        const response = await api.get(`/games/${id}/prices`);
        return response.data;
    } catch (error) {
        console.error("Error fetching price comparison:", error);
        throw error;
    }
};

/**
 * Get game party finding data
 * @param id Game ID
 * @returns Party finding data
 */
export const getGamePartyData = async (id: string) => {
    try {
        const response = await api.get(`/games/${id}/parties`);
        return response.data;
    } catch (error) {
        console.error("Error fetching party data:", error);
        throw error;
    }
};

/**
 * Get game related videos
 * @param id Game ID
 * @returns Related videos data
 */
export const getGameVideos = async (id: string) => {
    try {
        const response = await api.get(`/games/${id}/videos`);
        return response.data;
    } catch (error) {
        console.error("Error fetching game videos:", error);
        throw error;
    }
};
