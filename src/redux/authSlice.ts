import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "./store";

interface User
{
    id: number;
    username: string;
};

interface IUserSliceState
{
    user: User | null
};

const initialState: IUserSliceState =
{
    user: null
};

export const userSlice = createSlice(
{
    name: "user",
    initialState,
    reducers: {
        set: (state, action: PayloadAction<User>) =>
        {
            state.user = action.payload;
        },
        remove: (state) =>
        {
            state.user = null;
        }
    }
});

export default userSlice.reducer;
export const { set, remove } = userSlice.actions;
export const selectUser = (state: RootState) => state.auth.user;