import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import { getAllCategorys } from "../services/categoryService";
import { safeRequest } from "../sentry/errorHandler";

// Type definitions
interface Category {
    category_id: number;
    category_name: string;
}

interface CategoryContextType {
    categories: Category[];
    isLoading: boolean;
    error: Error | null;
    refreshCategories: () => Promise<void>;
}

// Create Context
const CategoryContext = createContext<CategoryContextType | undefined>(
    undefined
);

// Provider Component
export const CategoryProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const categoriesData = await safeRequest(
                () => getAllCategorys(),
                "CategoryContext - getAllCategorys"
            );
            setCategories(categoriesData || []);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err
                    : new Error("Failed to fetch categories")
            );
            console.error("Error fetching categories:", err);
        } finally {
            setIsLoading(false);
        }
    };

    // Load categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    // Refresh categories function
    const refreshCategories = async () => {
        await fetchCategories();
    };

    const value = {
        categories,
        isLoading,
        error,
        refreshCategories,
    };

    return (
        <CategoryContext.Provider value={value}>
            {children}
        </CategoryContext.Provider>
    );
};

// Custom hook for easy context usage in components
export const useCategories = () => {
    const context = useContext(CategoryContext);
    if (context === undefined) {
        throw new Error("useCategories must be used within a CategoryProvider");
    }
    return context;
};
