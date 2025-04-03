import api from "../api/config";

export interface Game {
    game_id: number;
    title: string;
    thumbnail: string;
    price: number;
    lowest_price: number;
}

interface SearchResponseData {
    message: string;
    data: {
        games: Game[];
    };
}

interface SearchParams {
    query?: string;
    categoryIds?: number[];
    ratingMin?: number;
    ratingMax?: number;
    priceMin?: number;
    priceMax?: number;
    singlePlay?: boolean;
    multiPlay?: boolean;
    onlinePlayersMin?: number;
    onlinePlayersMax?: number;
    mode?: "discounted" | "recommended" | "default";
    sort?: string;
    limit?: number;
    page?: number;
}

/**
 * Build query string from search parameters
 * @param params Search parameters
 * @returns Formatted query string
 */
const buildQueryString = (params: SearchParams): string => {
    const queryParts: string[] = [];

    if (params.query) {
        queryParts.push(`query=${encodeURIComponent(params.query)}`);
    }

    if (params.categoryIds && params.categoryIds.length > 0) {
        params.categoryIds.forEach((id) => {
            queryParts.push(`category_ids=${id}`);
        });
    }

    if (params.ratingMin !== undefined) {
        queryParts.push(`rating_min=${params.ratingMin}`);
    }

    if (params.ratingMax !== undefined) {
        queryParts.push(`rating_max=${params.ratingMax}`);
    }

    if (params.priceMin !== undefined) {
        queryParts.push(`price_min=${params.priceMin}`);
    }

    if (params.priceMax !== undefined) {
        queryParts.push(`price_max=${params.priceMax}`);
    }

    if (params.singlePlay !== undefined) {
        queryParts.push(`single_play=${params.singlePlay}`);
    }

    if (params.multiPlay !== undefined) {
        queryParts.push(`multi_play=${params.multiPlay}`);
    }

    if (params.onlinePlayersMin !== undefined) {
        queryParts.push(`online_players_min=${params.onlinePlayersMin}`);
    }

    if (params.onlinePlayersMax !== undefined) {
        queryParts.push(`online_players_max=${params.onlinePlayersMax}`);
    }

    if (params.mode) {
        queryParts.push(`mode=${params.mode}`);
    }

    if (params.page) {
        queryParts.push(`page=${params.page}`);
    }

    // if (params.sort) {
    //     queryParts.push(`sort=${params.sort}`);
    // }

    // if (params.limit) {
    //     queryParts.push(`limit=${params.limit}`);
    // }
    if (queryParts.length <= 0) queryParts.push("/");
    return queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
};

/**
 * Search games with various filter options
 * @param params Search parameters
 * @param signal AbortController signal for cancelling requests
 * @returns List of games matching the search criteria
 */
export const searchGames = async (
    params: SearchParams,
    signal?: AbortSignal
): Promise<Game[]> => {
    try {
        const queryString = buildQueryString(params);
        // console.log("Search query string:", queryString);
        const response = await api.get<SearchResponseData>(
            `/games${queryString}`,
            { signal } // AbortController signal 전달
        );

        if (response.data.message === "game_list_inquiry_success") {
            return response.data.data.games;
        } else {
            throw new Error(response.data.message || "Failed to fetch games");
        }
    } catch (error: unknown) {
        // AbortError는 상위로 전달하여 적절히 처리
        if (error instanceof DOMException && error.name === "AbortError") {
            throw error;
        }

        // axios 오류인 경우 (axios가 AxiosError 타입을 사용함)
        if (
            typeof error === "object" &&
            error !== null &&
            "isAxiosError" in error
        ) {
            console.error("Axios error fetching games:", error);
        } else {
            console.error("Error fetching games:", error);
        }

        // Return mock data if API fails (not aborted)
        return getMockGames();
    }
};

/**
 * Get mock games data as fallback
 * @returns Mock game data
 */
const getMockGames = (): Game[] => {
    return [
        {
            game_id: 1,
            title: "Dota 2",
            thumbnail:
                "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/570/header.jpg?t=1739210483",
            price: 0,
            lowest_price: 0,
        },
        {
            game_id: 2,
            title: "New World: Aeternum",
            thumbnail:
                "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1063730/header.jpg?t=1739224826",
            price: 5999,
            lowest_price: 4199,
        },
        {
            game_id: 3,
            title: "Black Myth: Wukong",
            thumbnail:
                "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/2358720/header.jpg?t=1739542141",
            price: 5999,
            lowest_price: 5999,
        },
        {
            game_id: 4,
            title: "Call of Duty: Modern Warfare II",
            thumbnail:
                "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1962660/header.jpg?t=1710969334",
            price: 6999,
            lowest_price: 4899,
        },
    ];
};

export const convertFiltersToParams = (
    filters: any,
    searchQuery?: string,
    mode?: "discounted" | "recommended" | "default"
): SearchParams => {
    const params: SearchParams = {};

    if (searchQuery) {
        params.query = searchQuery;
    }

    if (filters) {
        // Add categories - use categoryIds directly if available
        if (filters.categoryIds && filters.categoryIds.length > 0) {
            params.categoryIds = filters.categoryIds;
        }
        // Fallback to old method if no direct categoryIds
        else if (filters.categories && filters.categories.length > 0) {
            params.categoryIds = filters.categories.map(
                (_: any, index: number) => index + 1
            );
        }

        // Add rating
        if (filters.rating) {
            // [Min,Max)
            params.ratingMin = filters.rating * 2;
            params.ratingMax = filters.rating * 2 + 2;
        }

        // Add price range
        if (filters.priceRange && filters.priceRange.length === 2) {
            params.priceMin = filters.priceRange[0];
            params.priceMax = filters.priceRange[1];
        }

        // Add player type (single/multi)
        if (filters.singlePlay !== undefined) {
            params.singlePlay = filters.singlePlay;
        }

        if (filters.multiPlay !== undefined) {
            params.multiPlay = filters.multiPlay;
        }

        // Add player range for concurrent players
        if (filters.playerRange && filters.playerRange.length === 2) {
            params.onlinePlayersMin = filters.playerRange[0];
            params.onlinePlayersMax = filters.playerRange[1];
        }
    }

    // Add mode
    if (mode) {
        params.mode = mode;
    }

    // Default parameters
    params.sort = "price_asc";
    params.limit = 10;

    return params;
};
