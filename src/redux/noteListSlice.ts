import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "./store";

import { setNumberOfAllNotes } from "./paginationSlice";

export interface Note
{
    id: number;
    title: string;
    contents: string;
    date_added: string;
    category_id: number;
    user_id: number;
    tagIds: number[] | null;
};

export interface NoteListState
{
    list: { [key: number]: Note };
};

const initialState: NoteListState =
{
    list: {}
};

export const noteListSlice = createSlice(
{
    name: "notelist",
    initialState,
    reducers: {
        add: (state, action: PayloadAction<Note>) => {
            state.list = {...state.list, [action.payload.id]: action.payload}
        },
        remove: (state, action: PayloadAction<number>) =>
        {
            delete state.list[action.payload];
        },
        edit: (state, action: PayloadAction<Note>) =>
        {
            state.list[action.payload.id] = action.payload;
        },
        getFromDB: (state, action: PayloadAction<any>) => {
            state.list = action.payload;
        },
        addTag: (state, action: PayloadAction<{ note: Note, tagId: number }>) =>
        {
            if (state.list[action.payload.note.id].tagIds)
                state.list[action.payload.note.id].tagIds!.push(action.payload.tagId);
            else
                state.list[action.payload.note.id].tagIds = [ action.payload.tagId ];
        },
        removeTag: (state, action: PayloadAction<{ note: Note, tagId: number }>) =>
        {
            const index = state.list[action.payload.note.id].tagIds!.indexOf(action.payload.tagId);
            state.list[action.payload.note.id].tagIds!.splice(index, 1);
            if (state.list[action.payload.note.id].tagIds!.length === 0)
                state.list[action.payload.note.id].tagIds = null;
        }
    }
});

export async function fetchNotes(dispatch: any, getState: () => RootState)
{
    let url = `/api/notes/get/?items-per-page=`;
    url += `${getState().pagination.itemsPerPage}`;
    url += `&page=${getState().pagination.currentPage}`;

    if (getState().filters.categories.length !== 0)
        url += `&categories=${JSON.stringify(getState().filters.categories)}`;
    if (getState().filters.dateRange !== null)
    {
        url += `&date-range-start=${getState().filters.dateRange!.start}`;
        url += `&date-range-end=${getState().filters.dateRange!.end}`;
    }
    
    const init = {
        method: "GET",
        headers: {
            'Content-Type': 'application/json'
        }
    };
    // const response = await fetch("/api/notes/get", init);
    const response = await fetch(url, init);
    if (!response.ok) throw new Error("Couldn't fetch notes from database");
    const data = await response.json();
    // console.log(data.responseData.notes);

    let normalisedList = {};
    data.responseData.notes.forEach((item: any, index: number) =>
    {
        if (item.tags)
        {
            let tagArray = JSON.parse(item.tags);
            item.tagIds = tagArray;
            // console.log(item.tagIds);
        }
        normalisedList = { ...normalisedList,  [item.id]: item};
    });

    // console.log("Normalised list = ");
    // console.log(normalisedList);

    // dispatch(getFromDB(data.responseData.notes));
    dispatch(getFromDB(normalisedList));
    dispatch(setNumberOfAllNotes(data.responseData.numberOfAllNotes));
};

export const { add, remove, edit, getFromDB, addTag, removeTag } = noteListSlice.actions;
export const selectNoteList = (state: RootState) => state.noteList.list;

export default noteListSlice.reducer;