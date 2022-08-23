import { configureStore, Action } from "@reduxjs/toolkit";
import noteListReducer from "./noteListSlice";
import categoryListReducer from "./categorySlice";
import paginationReducer from "./paginationSlice";

export const store = configureStore({
    reducer: {
        noteList: noteListReducer,
        categoryList: categoryListReducer,
        pagination: paginationReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;