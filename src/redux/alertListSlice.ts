import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { IAlert } from "../types";

interface IAlertListState
{
    alerts: IAlert[]
}

const initialState: IAlertListState =
{
    alerts: []
};

export const alertListSlice = createSlice(
{
    name: "alertList",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<IAlert>) =>
        {
            state.alerts.push(action.payload);
        },
        remove: (state, action: PayloadAction<number>) =>
        {
            state.alerts.splice(
                state.alerts.findIndex((alert) => alert.id === action.payload), 1);
        }
    }
});

export const { add, remove } = alertListSlice.actions;
export const selectAlertList = (state: RootState) => state.alertList.alerts;

export default alertListSlice.reducer;