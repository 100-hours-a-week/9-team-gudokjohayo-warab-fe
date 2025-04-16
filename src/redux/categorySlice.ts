import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getAllCategorys } from "../services/categoryService";
import { safeRequest } from "../sentry/errorHandler";

// Type definitions
export interface Category {
    category_id: number;
    category_name: string;
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CategoryState = {
    categories: [],
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
    "category/fetchCategories",
    async (_, { rejectWithValue }) => {
        try {
            const categoriesData = await safeRequest(
                () => getAllCategorys(),
                "categorySlice - getAllCategorys"
            );
            return categoriesData || [];
        } catch (err) {
            return rejectWithValue(
                err instanceof Error
                    ? err.message
                    : "Failed to fetch categories"
            );
        }
    }
);

const categorySlice = createSlice({
    name: "category",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            });
    },
});

export default categorySlice.reducer;
