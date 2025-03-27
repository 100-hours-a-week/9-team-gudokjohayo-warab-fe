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

interface CurrentPriceResponse {
    message: string;
    data: {
        lowest_prices: {
            platform: string;
            price: number;
            store_url: string;
            logo?: string; // Optional logo URL
        }[];
    };
}

interface LowestPriceResponse {
    message: string;
    data: {
        history_lowest_price: number;
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

/**
 * Get current prices for a game across different platforms
 * @param id Game ID
 * @returns Current price comparison data
 */
export const getCurrentPricesByPlatform = async (id: string) => {
    try {
        const response = await api.get<CurrentPriceResponse>(
            `/games/${id}/current-price`
        );

        if (response.data.message === "get_lowest_price_by_platform_success") {
            return response.data.data.lowest_prices.map((price) => ({
                ...price,
                // Map platform names to match existing logos in PriceTab
                logo: getPlatformLogo(price.platform),
            }));
        } else {
            throw new Error("Failed to fetch current prices");
        }
    } catch (error) {
        console.error("Error fetching current prices:", error);
        throw error;
    }
};

// Helper function to map platform names to logo paths
const getPlatformLogo = (platform: string): string => {
    const platformLogos: { [key: string]: string } = {
        Steam: "/images/steam-logo.png",
        Epic: "/images/epic-logo.png",
        Ubisoft: "/images/ubisoft-logo.png",
        // Add more mappings as needed
        default: "/images/placeholder.png",
    };

    return platformLogos[platform] || platformLogos["default"];
};

/**
 * Get the historical lowest price for a game
 * @param id Game ID
 * @returns Historical lowest price
 */
export const getHistoricalLowestPrice = async (id: string) => {
    try {
        const response = await api.get<LowestPriceResponse>(
            `/games/${id}/lowest-price`
        );

        if (response.data.message === "get_lowest_price_success") {
            return response.data.data.history_lowest_price;
        } else {
            throw new Error("Failed to fetch historical lowest price");
        }
    } catch (error) {
        console.error("Error fetching historical lowest price:", error);
        // Return a fallback value or re-throw the error
        return 0;
    }
};
