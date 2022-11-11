import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { IUser } from "../types";

interface IUserSliceState
{
    user: IUser | null;
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
        set: (state, action: PayloadAction<IUser | null>) =>
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