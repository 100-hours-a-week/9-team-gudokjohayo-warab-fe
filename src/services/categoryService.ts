import api from "../api/config";

interface Category {
    id: number;
    name: string;
}

interface CategoryResponse {
    message: string;
    data: {
        categories: Category[];
    };
}

/**
 * Fetch all game categories
 * @returns List of game categories
 */
export const getAllCategories = async (): Promise<Category[]> => {
    try {
        const response = await api.get<CategoryResponse>("/games/category");

        if (response.data.message === "게임 카테고리 목록입니다.") {
            return response.data.data.categories;
        } else {
            throw new Error("Failed to fetch game categories");
        }
    } catch (error) {
        console.error("Error fetching game categories:", error);
        throw error;
    }
};

/**
 * Get category by ID
 * @param id Category ID
 * @returns Category data or undefined if not found
 */
export const getCategoryById = async (
    id: number
): Promise<Category | undefined> => {
    try {
        const categories = await getAllCategories();
        return categories.find((category) => category.id === id);
    } catch (error) {
        console.error("Error getting category by ID:", error);
        throw error;
    }
};

/**
 * Get categories by multiple IDs
 * @param ids Array of category IDs
 * @returns Array of matching categories
 */
export const getCategoriesByIds = async (
    ids: number[]
): Promise<Category[]> => {
    try {
        const categories = await getAllCategories();
        return categories.filter((category) => ids.includes(category.id));
    } catch (error) {
        console.error("Error getting categories by IDs:", error);
        throw error;
    }
};

/**
 * Search categories by name
 * @param query Search query string
 * @returns Array of matching categories
 */
export const searchCategories = async (query: string): Promise<Category[]> => {
    try {
        const categories = await getAllCategories();
        const lowercaseQuery = query.toLowerCase();
        return categories.filter((category) =>
            category.name.toLowerCase().includes(lowercaseQuery)
        );
    } catch (error) {
        console.error("Error searching categories:", error);
        throw error;
    }
};
