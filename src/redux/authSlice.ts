import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { User } from "../types";

interface IUserSliceState
{
    user: User | null;
    wasUserLoggedOut: boolean;
};

const initialState: IUserSliceState =
{
    user: null,
    wasUserLoggedOut: false
};

export const userSlice = createSlice(
{
    name: "user",
    initialState,
    reducers: {
        set: (state, action: PayloadAction<User | null>) =>
        {
            state.user = action.payload;
        },
        remove: (state) =>
        {
            state.user = null;
        },
        setWasUserLoggedOut: (state, action: PayloadAction<boolean>) =>
        {
            state.wasUserLoggedOut = action.payload;
        }
    }
});

export default userSlice.reducer;
export const { set, remove, setWasUserLoggedOut } = userSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;
export const selectWasUserLoggedOut = (state: RootState) => state.auth.wasUserLoggedOut;