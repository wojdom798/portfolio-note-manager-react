import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import type { AlertTypes } from "../components/alerts/alertTypes";

interface Alert
{
    id: number;
    type: AlertTypes;
    message: string;
}

interface IAlertListState
{
    alerts: Alert[]
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
        add: (state, action: PayloadAction<Alert>) =>
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