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
    dateRangeLimit: IDateRange | null;
};

const initialState: Filter =
{
    categories: [],
    dateRange: null,
    dateRangeLimit: null
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
        },
        setDateRangeLimit: (state, action: PayloadAction<IDateRange>) =>
        {
            state.dateRangeLimit = action.payload;
        }
    }
});

export async function fetchMaxDateRange(dispatch: any, getState: () => RootState)
{
    const url = "/api/get-date-range";
    const init = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        },
        mode: "cors" as RequestMode
    };
    const response = await fetch(url, init);
    const data = await response.json();
    const dateRangeLimit =
    {
        start: data.responseData.minDate as string,
        end: data.responseData.maxDate as string,
    };
    dispatch(setDateRangeLimit(dateRangeLimit));
}

export const { setCategoriesFilter, setDateRangeFilter, setDateRangeLimit } = filterSlice.actions;
export const selectFilters = (state: RootState) => state.filters;

export default filterSlice.reducer;