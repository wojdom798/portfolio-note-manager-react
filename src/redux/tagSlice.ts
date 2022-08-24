import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

export interface Tag
{
    id: number;
    name: string;
    date_added: string;
    user_id: number;
};

export interface TagListState
{
    tags: { [key: number]: Tag }
};

const initialState: TagListState =
{
    tags: {}
};

export const tagListSlice = createSlice(
{
    name: "taglist",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<Tag>) =>
        {
            state.tags = { ...state.tags, [action.payload.id]: action.payload };
        },
        edit: (state, action: PayloadAction<Tag>) =>
        {
            state.tags[action.payload.id] = action.payload;
        },
        remove: (state, action: PayloadAction<number>) =>
        {
            delete state.tags[action.payload];
        },
        getFromDB: (state, action: PayloadAction<{ [key: number]: Tag }>) =>
        {
            state.tags = action.payload;
        }
    }
});

export async function fetchTags(dispatch: any)
{
    const init = {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    };
    const response = await fetch("api/tags/get", init);
    if (!response.ok) throw new Error("Couldn't fetch tags from database.");
    const data = await response.json();

    let normalizedList = {};
    data.responseData.tags.forEach((item: Tag) =>
    {
        normalizedList = { ...normalizedList, [item.id]: item };
    });

    dispatch(getFromDB(normalizedList));
}

export const { add, edit, remove, getFromDB } = tagListSlice.actions;
export const selectTagList = (state: RootState) => state.tagList.tags;

export default tagListSlice.reducer;