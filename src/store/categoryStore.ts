import { create } from "zustand";
import { getAllCategorys } from "../services/categoryService";
import { safeRequest } from "../sentry/errorHandler";

interface Category {
    category_id: number;
    category_name: string;
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: Error | null;
    refreshCategories: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: true,
    error: null,

    refreshCategories: async () => {
        set({ isLoading: true, error: null });
        try {
            const categoriesData = await safeRequest(
                () => getAllCategorys(),
                "CategoryStore - getAllCategorys"
            );
            set({ categories: categoriesData || [], isLoading: false });
        } catch (err) {
            set({
                error:
                    err instanceof Error
                        ? err
                        : new Error("Failed to fetch categories"),
                isLoading: false,
            });
            console.error("Error fetching categories:", err);
        } finally {
            set({ isLoading: false });
        }
    },

    refreshCategory: async () => {
        return get().refreshCategories();
    },
}));
