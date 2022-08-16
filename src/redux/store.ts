import { configureStore, Action } from "@reduxjs/toolkit";
import noteListReducer from "./noteListSlice";

export const store = configureStore({
    reducer: {
        noteList: noteListReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;