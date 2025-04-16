import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getUserProfile } from "../services/userService";
import { safeRequest } from "../sentry/errorHandler";

// 타입 정의
export interface Category {
    category_id: number;
    category_name: string;
}

export interface UserProfile {
    nickname: string;
    categorys: Category[];
    // 기타 필요한 사용자 정보
}

interface UserState {
    userProfile: UserProfile | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: UserState = {
    userProfile: null,
    isLoading: false,
    error: null,
};

// Async Thunks
export const fetchUserProfile = createAsyncThunk(
    "user/fetchUserProfile",
    async (_, { rejectWithValue }) => {
        try {
            const response = await safeRequest(
                () => getUserProfile(),
                "userSlice - getUserProfile"
            );

            if (!response) {
                throw new Error("Failed to fetch user profile");
            }

            return response.data;
        } catch (err) {
            return rejectWithValue(
                err instanceof Error ? err.message : "Unknown error"
            );
        }
    }
);

export const updateCategories = createAsyncThunk(
    "user/updateCategories",
    async (categories: Category[], { getState, dispatch }) => {
        const state = getState() as { user: UserState };
        if (state.user.userProfile) {
            return categories;
        }
        return [];
    }
);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUserProfile: (state, action: PayloadAction<UserProfile>) => {
            state.userProfile = action.payload;
        },
        setCategories: (state, action: PayloadAction<Category[]>) => {
            if (state.userProfile) {
                state.userProfile.categorys = action.payload;
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch user profile
            .addCase(fetchUserProfile.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.userProfile = action.payload;
                state.isLoading = false;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.error = action.payload as string;
                state.isLoading = false;
            })
            // Update categories
            .addCase(updateCategories.fulfilled, (state, action) => {
                if (state.userProfile) {
                    state.userProfile.categorys = action.payload;
                }
            });
    },
});

export const { setUserProfile, setCategories } = userSlice.actions;
export default userSlice.reducer;
