import React, { useEffect, useState } from "react";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
    add, remove as removeNote,
    removeAll as removeAllNotes,
    edit, fetchNotes, selectNoteList
} from "../../redux/noteListSlice";
import { selectCategoryList } from "../../redux/categorySlice";
import { selectTagList } from "../../redux/tagSlice";
import {
    setItemsPerPage, setCurrentPage,
    selectPagination, setNumberOfAllNotes
} from "../../redux/paginationSlice";

// Type imports
import { NoteActionTypesEnum, NoteProps } from "../../types";
import apiUrls from "../../apiRoutes";

// App component imports
import MultiActionButton from "./MultiActionButton";

// Material UI imports
import {
    Stack as MuiStack,
    Chip as MuiChip,
    Button as MuiButton
} from "@mui/material";


export default function Note({
    id, title, contents,
    date_added, category_id, tagIds,
    onNoteEditButtonClick,
    onOpenNoteTagManagerButtonClick,
    onDeleteNoteButtonClick, isDeletionConfirmed, resetNoteIdToDelete }: NoteProps)
{
    const dispatch = useAppDispatch();
    const notes = useAppSelector(selectNoteList);
    const categories = useAppSelector(selectCategoryList);
    const tags = useAppSelector(selectTagList);
    const pagination = useAppSelector(selectPagination);

    useEffect(() =>
    {
        if (isDeletionConfirmed)
        {
            deleteNote(id);
            resetNoteIdToDelete();
        }
    }, [isDeletionConfirmed]);

    async function deleteNote(id: number)
    {
        // console.log("deleting note id = " + id);
        const url = apiUrls.deleteNote + String(id);
        const init = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(url, init);
        if (!response.ok) throw new Error("Failed to delete a note.");
        // const data = await response.json();

        const numOfNotesOnCurrentPage = Object.keys(notes).length;
        if (numOfNotesOnCurrentPage === 1)
        {
            dispatch(removeNote(id));
            dispatch(setCurrentPage(pagination.currentPage - 1));
            dispatch(fetchNotes);
        }
        else
        {
            dispatch(removeNote(id));
            dispatch(setNumberOfAllNotes(pagination.numberOfAllNotes - 1));
        }
    }

    function handleActionClick(type: NoteActionTypesEnum, noteId: number)
    {
        switch (type)
        {
            case (NoteActionTypesEnum.EDIT):
                onNoteEditButtonClick(noteId);
                break;
            case (NoteActionTypesEnum.DELETE):
                // deleteNote(noteId);
                onDeleteNoteButtonClick(noteId);
                break;
            case (NoteActionTypesEnum.MANAGE_TAGS):
                onOpenNoteTagManagerButtonClick(noteId);
                break;
        }
    }

    return (
        <div className="note" key={id}>
            <div className="note__header">
                <h2 className="note__title">{title}</h2>
                <div className="note__header-action-button-container">
                    <MultiActionButton
                        onEditAction={
                            () => handleActionClick(NoteActionTypesEnum.EDIT, id)
                        }
                        onDeleteAction={
                            () => handleActionClick(NoteActionTypesEnum.DELETE, id)
                        }
                        onManageTagsAction={
                            () => handleActionClick(NoteActionTypesEnum.MANAGE_TAGS, id)
                        }
                    />
                </div>
            </div>

            <div className="note__contents">
                <p>{contents}</p>
            </div>
            
            <div className="note__footer">
                <span>{date_added}</span>
                <span>{categories[category_id].name}</span>
            </div>
            
            <div className="tag-container">
                <MuiStack direction="row" spacing={1} alignItems="center">
                    { tagIds != null ?
                        tagIds.map((id: number) =>
                        { return (
                            <MuiChip key={id} label={tags[id].name} color="primary" />
                        );}) :
                        null
                    }
                </MuiStack>
            </div>
        </div>
    );
}