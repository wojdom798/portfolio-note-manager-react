import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";
import { ICategory } from "../types";
import apiUrls from "../apiRoutes";

export interface CategoryListState
{
    categories: { [key: number]: ICategory }
};

const initialState: CategoryListState =
{
    categories: {}
};

export const categoryListSlice = createSlice(
{
    name: "categorylist",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<ICategory>) =>
        {
            state.categories = {...state.categories, [action.payload.id]: action.payload};
        },
        edit: (state, action: PayloadAction<ICategory>) =>
        {
            state.categories[action.payload.id] = action.payload;
        },
        remove: (state, action: PayloadAction<number | number[]>) =>
        {
            if (Array.isArray(action.payload))
            {
                for (const categoryId of action.payload)
                {
                    delete state.categories[categoryId];
                }
            }
            else
                delete state.categories[action.payload];
        },
        removeAll: (state) =>
        {
            state.categories = {};
        },
        getFromDb: (state, action: PayloadAction<any>) =>
        {
            state.categories = action.payload;
        }
    }
});

export async function fetchCategories(dispatch: any)
{
    const init = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        mode: "cors" as RequestMode
        // mode: "no-cors" as RequestMode
    };
    const response = await fetch(apiUrls.getCategories, init);
    // if (!response.ok) throw new Error("Couldn't fetch categories from database.");
    if (response.ok)
    {
        const data = await response.json();
        let normalisedList = {};
        data.responseData.categories.forEach((item: ICategory) =>
        {
            normalisedList = { ...normalisedList, [item.id]: item };
        });
        
        dispatch(getFromDb(normalisedList));
    }
}

export const { add, edit, remove, removeAll, getFromDb } = categoryListSlice.actions;
export const selectCategoryList = (state: RootState) => state.categoryList.categories;

export default categoryListSlice.reducer;