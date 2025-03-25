import api from "../api/config";

interface Category {
    category_id: number;
    category_name: string;
}

interface CategoryResponse {
    message: string;
    data: {
        categorys: Category[];
    };
}

/**
 * Fetch all game categories
 * @returns List of game categories
 */
export const getAllCategorys = async (): Promise<Category[]> => {
    try {
        const response = await api.get<CategoryResponse>("/category");

        if (response.data.message === "category_list_inquiry_success") {
            return response.data.data.categorys;
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
    category_id: number
): Promise<Category | undefined> => {
    try {
        const categories = await getAllCategorys();
        return categories.find(
            (category) => category.category_id === category_id
        );
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
        const categories = await getAllCategorys();
        return categories.filter((category) =>
            ids.includes(category.category_id)
        );
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
        const categories = await getAllCategorys();
        const lowercaseQuery = query.toLowerCase();
        return categories.filter((category) =>
            category.category_name.toLowerCase().includes(lowercaseQuery)
        );
    } catch (error) {
        console.error("Error searching categories:", error);
        throw error;
    }
};
