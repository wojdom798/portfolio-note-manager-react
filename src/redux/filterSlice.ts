import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

interface IDateRange
{
    start: string,
    end: string,
};

export interface Filter
{
    categories: number[];
    dateRange: IDateRange | null;
};

const initialState: Filter =
{
    categories: [],
    dateRange: null
};

export const filterSlice = createSlice(
{
    name: "filters",
    initialState,
    reducers: {
        setCategoriesFilter: (state, action: PayloadAction<number[]>) =>
        {
            state.categories = action.payload;
        },
        setDateRangeFilter: (state, action: PayloadAction<IDateRange | null>) =>
        {
            state.dateRange = action.payload;
        }
    }
});

export const { setCategoriesFilter, setDateRangeFilter } = filterSlice.actions;
export const selectFilters = (state: RootState) => state.filters;

export default filterSlice.reducer;