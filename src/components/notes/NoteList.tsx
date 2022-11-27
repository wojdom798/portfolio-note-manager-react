import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from "react-dom";

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
import { setCategoriesFilter } from "../../redux/filterSlice";
import {
    selectUser,
    remove as removeUser,
    setWasUserLoggedOut
} from "../../redux/authSlice";
import { add as addAlert } from "../../redux/alertListSlice";

// Type imports
import { AlertTypesEnum, INote } from "../../types";

// App component imports
import Note from "./Note";
import NoteForm from './NoteForm';
import NoteTagManager from "./NoteTagManager";
import AlertList from "../alerts/AlertList";
import UserLoginForm from "../users/UserLoginForm";
import UserRegisterForm from "../users/UserRegisterForm";
import FilterMenu from "../filters/FilterMenu";
import Pagination from "../pagination/Pagination";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import {
    Modal as BootstrapModal
} from "react-bootstrap/";

// Material UI imports
import {
    Stack as MuiStack,
    Chip as MuiChip,
    Button as MuiButton
} from "@mui/material";


function NoteList(props: any)
{
    const dispatch = useAppDispatch();
    // const [notes, setNotes] = useState([]);
    const notes = useAppSelector(selectNoteList);
    const categories = useAppSelector(selectCategoryList);
    const tags = useAppSelector(selectTagList);
    const pagination = useAppSelector(selectPagination);
    const loggedInUser = useAppSelector(selectUser);
    // const [areNotesFetched, setAreNotesFetched] = useState(0);
    // const [itemsPerPageInput, setItemsPerPageInput] = useState<number>(5);
    
    const [isModalActive, setIsModalActive] = useState<boolean>(false);
    // if truthy, then edit note form will show up in modal body
    const [noteToEdit, setNoteToEdit] = useState<INote | null>(null);
    // if truthy, then tag manager will show up in modal body
    const [tagManagerNoteId, setTagManagerNoteId] =
        useState<number | undefined>(undefined);

    
    useEffect(() =>
    {
        if (props.wasAddItemButtonClicked)
        {
            setIsModalActive(true);
            setNoteToEdit(null);
        }
    }, [props.wasAddItemButtonClicked]);

    const handleCloseModal = () =>
    {
        setIsModalActive(false);
        props.onAddItemFormClose();
        setTimeout(() =>
        {
            setNoteToEdit(null);
            setTagManagerNoteId(undefined);
        }, 200);
    }
    
    const handleAddNewNoteButtonClick = () =>
    {
        setIsModalActive(true);
    }

    const showNoteTagManagerModal = (noteId: number) =>
    {
        setTagManagerNoteId(noteId);
        setIsModalActive(true);
    };

    function handleAddNoteToList(newNote: INote)
    {
        // let n: never[] = [...notes, newNote];
        // setNotes(n);

        if (pagination.numberOfAllNotes % pagination.itemsPerPage === 0)
        {
            const numOfPages = Math.ceil(pagination.numberOfAllNotes / pagination.itemsPerPage);
            // remove all notes only from RAM (redux store)
            // items inside the database will remain unaffected
            dispatch(removeAllNotes());
            dispatch(add(newNote));
            dispatch(setNumberOfAllNotes(pagination.numberOfAllNotes + 1));
            dispatch(setCurrentPage(numOfPages + 1));
        }
        else
        {
            dispatch(add(newNote));
            dispatch(setNumberOfAllNotes(pagination.numberOfAllNotes + 1));
        }
    }

    async function handleSubmitEditedNote(editedNote: INote)
    {
        // console.log("edited note:");
        // console.log(editedNote);

        let payload = JSON.stringify({
            noteToEdit: editedNote
        });

        const url = `/api/notes/edit`;
        const init = {
            method: "PUT",
            body: payload,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(url, init);
        if (!response.ok) throw new Error("Failed to delete a note.");
        // const data = await response.json();
        dispatch(edit(editedNote));
        setNoteToEdit(null);
    }

    function handleAddTagsBtnClick(event: any, noteId: number)
    {
        console.log("adding tags to noteId: " + noteId);
    }

    function handleEditNoteButtonClick(noteId: number)
    {
        // console.log(`edit button #${noteId} was clicked`);
        setNoteToEdit(notes[noteId]);
        setIsModalActive(true);
    }

    function renderNotes()
    {
        // console.log("renderNotes()");
        // console.log(Object.values(notes));
        return Object.values(notes).map((item: INote, index: number) =>
        {
            return <Note
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        contents={item.contents}
                        date_added={item.date_added}
                        category_id={item.category_id}
                        tagIds={item.tagIds}
                        onNoteEditButtonClick={handleEditNoteButtonClick}
                        onOpenNoteTagManagerButtonClick={showNoteTagManagerModal}
                    />;
        });
    }

    function renderSelectedModalBody()
    {
        if (tagManagerNoteId)
        {
            return (
                <NoteTagManager
                    noteId={tagManagerNoteId}
                    onCloseButtonClick={handleCloseModal}
                />
            );
        }
        else if (noteToEdit) // edit/add note modal
        {
            return (
                <NoteForm
                    noteToEdit={noteToEdit}
                    updateNoteList={handleAddNoteToList}
                    onEditNoteFormSubmit={handleSubmitEditedNote}
                    onCloseButtonClick={handleCloseModal}
                />
            );
        }
        return (
            <NoteForm
                updateNoteList={handleAddNoteToList}
                onCloseButtonClick={handleCloseModal}
            />
        );
    }
    
    if (pagination.numberOfAllNotes)
    {
        return (
        <Fragment>
            <Fragment>
                <FilterMenu />

                <Pagination>
                    <div className="note-list-container">
                        { renderNotes() }
                    </div>
                </Pagination>
            </Fragment>

            <AlertList />

            <BootstrapModal
                show={isModalActive}
                backdrop="static"
                keyboard={false}>
                <BootstrapModal.Body
                    className="daterange-picker__bootstrap-modal-body--padding-0"
                >
                    
                    { renderSelectedModalBody() }

                </BootstrapModal.Body>
            </BootstrapModal>

        </Fragment>
        );
    }
    else // pagination.numberOfAllNotes = falsy
    {
        return (
        <Fragment>
            <Fragment>
                <FilterMenu />

                <div className="empty-list-message-container">
                    <div className="centered-container">
                        <h3 className="title">Couldn't Find Any Notes For This Filter.</h3>
                        <div className="message-container">
                            <p className="message">Consider using some other filter.</p>
                            <p className="message">If you haven't added any notes yet, <span className="add-new-note-span" onClick={handleAddNewNoteButtonClick}>click here to add one</span>.</p>
                        </div>
                    </div>
                </div>
            </Fragment>

            <AlertList />

            <BootstrapModal
                show={isModalActive}
                backdrop="static"
                keyboard={false}>
                <BootstrapModal.Body
                    className="daterange-picker__bootstrap-modal-body--padding-0"
                >
                    
                    { renderSelectedModalBody() }

                </BootstrapModal.Body>
            </BootstrapModal>
        </Fragment>
        );
    }
}

export default NoteList;