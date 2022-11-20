import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from "react-dom";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { store } from "../../redux/store";
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
import { AlertTypesEnum, INote, NoteActionTypesEnum } from "../../types";

// App component imports
import Note from "./Note";
import NoteForm from './NoteForm';
import DateTimeFilter from "../filters/DateRangeFilter";
import NoteTagManager from "./NoteTagManager";
import MainModal from "../MainModal";
import AlertList from "../alerts/AlertList";
import UserLoginForm from "../users/UserLoginForm";
import UserRegisterForm from "../users/UserRegisterForm";
import FilterMenu from "../filters/FilterMenu";
import Pagination from "../pagination/Pagination";
import MultiActionButton from "./MultiActionButton";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

// Material UI imports
import {
    Stack as MuiStack,
    Chip as MuiChip,
    Button as MuiButton
} from "@mui/material";


function NoteList(props: any)
{
    // const [notes, setNotes] = useState([]);
    const notes = useAppSelector(selectNoteList);
    const categories = useAppSelector(selectCategoryList);
    const tags = useAppSelector(selectTagList);
    const pagination = useAppSelector(selectPagination);
    const loggedInUser = useAppSelector(selectUser);
    const dispatch = useAppDispatch();
    // const [areNotesFetched, setAreNotesFetched] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<INote | null>(null);
    // const [itemsPerPageInput, setItemsPerPageInput] = useState<number>(5);
    const [isLoginFormActive, setIsLoginFormActive] = useState<boolean>(false);
    const [isRegisterFormActive, setIsRegisterFormActive] = useState<boolean>(false);
    const [user, setUser] = useState<string>("");


    useEffect(() =>
    {
        /*const init = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch("/api/notes/get", init)
        .then(response => response.json())
        .then(data => {
            // console.log("MainDashboard.tsx, useEffect(): ");
            // console.log(data.responseData);

            // setNotes(data.responseData.notes);
        })
        .catch(err => {
            console.log("Error (MainDashboard.tsx, useEffect()):", err.message);
        });*/

        // store.dispatch(fetchNotes);
        
    // }, [areNotesFetched]);
    }, []);

    const handleShowModal = () =>
    {
        setNoteToEdit(null);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

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
        setShowModal(true);
    }

    function renderNotes()
    {
        // console.log("renderNotes()");
        // console.log(Object.values(notes));
        return Object.values(notes).map((item: INote, index: number) => {
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


    /********************************
        TEMPORARY
    ********************************/
    const [isOpenedNoteTagManagerModal, setIsOpenedNoteTagManagerModal] = useState<boolean>(false);
    const [noteToAddTagsTo, setNoteToAddTagsTo] = useState<number>(-1);
    const showNoteTagManagerModal = (noteId: number) =>
    {
        setNoteToEdit(null); // will close the previous modal if opened by chance
        setNoteToAddTagsTo(noteId);
        setIsOpenedNoteTagManagerModal(true);
    };

    const handleClosNoteTagManagereModal = () => setIsOpenedNoteTagManagerModal(false);
    /********************************
        END: TEMPORARY
    ********************************/

    function renderModal()
    {
        if (isOpenedNoteTagManagerModal)
        {
            return (
                <MainModal
                    showModal={isOpenedNoteTagManagerModal}
                    onHide={handleClosNoteTagManagereModal}
                    title={"Add Tags To INote #?"}
                    onApplyBtnClick={handleClosNoteTagManagereModal}
                    applyBtnText={"Apply"}
                    onCloseBtnClick={handleClosNoteTagManagereModal}
                    closeBtnText={"Close"}
                >
                    <NoteTagManager
                        noteId={noteToAddTagsTo}
                    />
                </MainModal>
            );
        }
        else if (showModal) // edit/add note modal
        {
            return (
                <MainModal
                    showModal={showModal}
                    onHide={handleCloseModal}
                    title={"Add / Edit INote #?"}
                    onApplyBtnClick={handleCloseModal}
                    applyBtnText={"Apply"}
                    onCloseBtnClick={handleCloseModal}
                    closeBtnText={"Close"}
                >
                    <NoteForm
                        noteToEdit={noteToEdit}
                        updateNoteList={handleAddNoteToList}
                        submitEditedNote={handleSubmitEditedNote}/>
                </MainModal>
            );
        }
        else if (isLoginFormActive)
        {
            return (
                <MainModal
                    showModal={isLoginFormActive}
                    onHide={handleCloseLoginModal}
                    title={"Log In"}
                    onApplyBtnClick={handleCloseLoginModal}
                    applyBtnText={"Apply"}
                    onCloseBtnClick={handleCloseLoginModal}
                    closeBtnText={"Close"}
                >
                    <UserLoginForm onUserLoggedIn={(u: string) => { setUser(u) }} />
                    {/* <UserLoginForm /> */}
                </MainModal>
            );
        }
        else if (isRegisterFormActive)
        {
            return (
                <MainModal
                    showModal={isRegisterFormActive}
                    onHide={handleCloseRegisterModal}
                    title={"Sign Up"}
                    onApplyBtnClick={handleCloseRegisterModal}
                    applyBtnText={"Apply"}
                    onCloseBtnClick={handleCloseRegisterModal}
                    closeBtnText={"Close"}
                >
                    <UserRegisterForm />
                </MainModal>
            );
        }
        return <MainModal />;
    }

    const handleCloseLoginModal = () =>
    {
        setIsLoginFormActive(false);
    };

    const handleCloseRegisterModal = () =>
    {
        setIsRegisterFormActive(false);
    };

    // debug
    const handleOnAddAlertDebugBtnClick = () =>
    {
        const alertToAddDbg =
        {
            id: (new Date()).getTime(),
            type: AlertTypesEnum.Info,
            message: "Some Event Happened"
        }
        dispatch(addAlert(alertToAddDbg));
    };

    // debug
    const handleOnSignUpDebugBtnClick = async () =>
    {
        let alert;

        // const url = `api/auth/login/`;
        const url = `api/auth/sign-up/`;

        const newUsers =
        [
            { username: "User 1", password: "123qwe99" },
            { username: "User 2", password: "123qwe33" },
        ];

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newUsers[1])
        };
        try
        {
            const response = await fetch(url, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            const data = await response.json();
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Info,
                message: data.responseMsg
            };
            dispatch(addAlert(alert));
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    };

    const handleOnLogInDebugBtnClick = async () =>
    {
        let alert;

        const url = `api/auth/login/`;

        const users =
        [
            { username: "User 1", password: "123qwe99" },
            { username: "User 2", password: "123qwe33" },
        ];

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(users[1])
        };
        try
        {
            const response = await fetch(url, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            const data = await response.json();
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Info,
                message: data.responseMsg
            };
            dispatch(addAlert(alert));
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    };

    // duplicate code
    const handleUserLogOutBtnClick = async () =>
    {
        let alert;

        const url = `api/auth/logout/`;

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            const data = await response.json();
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Info,
                message: data.responseMsg
            };
            localStorage.removeItem("user");
            localStorage.setItem("wasUserLoggedOut", "true");
            dispatch(setWasUserLoggedOut(true));
            dispatch(removeUser());
            dispatch(addAlert(alert));
            setUser("n/a");
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    };

    
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

                <Button
                    onClick={handleShowModal}
                    variant="primary"
                    className="floating-action-btn-round"
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal">
                <span>&#x2B;</span>
                </Button>
            </Fragment>

            {/* Alerts */}
            <AlertList />
            
            {/* Modals */}
            { renderModal() }
        </Fragment>
        );
    }
    else
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
                            <p className="message">If you haven't added any notes yet, <span className="add-new-note-span" onClick={handleShowModal}>click here to add one</span>.</p>
                        </div>
                    </div>
                </div>
                
                <Button
                    onClick={handleShowModal}
                    variant="primary"
                    className="floating-action-btn-round"
                    type="button"
                    data-bs-toggle="modal"
                    data-bs-target="#exampleModal">
                <span>&#x2B;</span>
                </Button>
            </Fragment>

            {/* Alerts */}
            <AlertList />
            
            {/* Modals */}
            { renderModal() }
        </Fragment>
        );
    }
}

export default NoteList;