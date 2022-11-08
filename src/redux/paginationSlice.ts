import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { Pagination } from "../types";


const initialState: Pagination =
{
    itemsPerPage: 5,
    currentPage: 1,
    numberOfAllNotes: -1
};

export const paginationSlice = createSlice(
{
    name: "pagination",
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<number>) =>
        {
            state.itemsPerPage = action.payload;
        },
        setCurrentPage: (state, action: PayloadAction<number>) =>
        {
            state.currentPage = action.payload;
        },
        setNumberOfAllNotes: (state, action: PayloadAction<number>) =>
        {
            state.numberOfAllNotes = action.payload;
        }
    }
});

export const { setItemsPerPage, setCurrentPage, setNumberOfAllNotes } = paginationSlice.actions;
export const selectPagination = (state: RootState) => state.pagination;

export default paginationSlice.reducer;