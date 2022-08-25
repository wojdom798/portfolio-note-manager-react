import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export interface Filter
{
    categories: number[]
};

const initialState: Filter =
{
    categories: []
};

export const filterSlice = createSlice(
{
    name: "filters",
    initialState,
    reducers: {
        setCategoriesFilter: (state, action: PayloadAction<number[]>) =>
        {
            state.categories = action.payload;
        }
    }
});

export const { setCategoriesFilter } = filterSlice.actions;
export const selectFilters = (state: RootState) => state.filters;

export default filterSlice.reducer;