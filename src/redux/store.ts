import { configureStore, Action } from "@reduxjs/toolkit";
import noteListReducer from "./noteListSlice";
import categoryListReducer from "./categorySlice";
import tagListReducer from "./tagSlice";
import paginationReducer from "./paginationSlice";

export const store = configureStore({
    reducer: {
        noteList: noteListReducer,
        categoryList: categoryListReducer,
        tagList: tagListReducer,
        pagination: paginationReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;