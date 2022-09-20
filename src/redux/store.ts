import { configureStore, Action } from "@reduxjs/toolkit";
import noteListReducer from "./noteListSlice";
import categoryListReducer from "./categorySlice";
import tagListReducer from "./tagSlice";
import paginationReducer from "./paginationSlice";
import filterReducer from "./filterSlice";
import alertListReducer from "./alertListSlice";
import authReducer from "./authSlice";

export const store = configureStore({
    reducer: {
        noteList: noteListReducer,
        categoryList: categoryListReducer,
        tagList: tagListReducer,
        pagination: paginationReducer,
        filters: filterReducer,
        alertList: alertListReducer,
        auth: authReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;