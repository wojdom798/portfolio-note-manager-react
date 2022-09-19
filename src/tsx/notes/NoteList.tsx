import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from "react-dom";
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";
import {
    Stack as MuiStack,
    Chip as MuiChip,
    Button as MuiButton
} from "@mui/material";

import NoteForm from './NoteForm';
import DateTimeFilter from "../filters/DateTimeFilter";
import NoteTagManager from "./NoteTagManager";

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { add, remove, edit, fetchNotes, selectNoteList, Note } from "../../redux/noteListSlice";
import { Category, selectCategoryList } from "../../redux/categorySlice";
import { Tag, selectTagList } from "../../redux/tagSlice";
import { setItemsPerPage, setCurrentPage, selectPagination } from "../../redux/paginationSlice";
import { setCategoriesFilter } from "../../redux/filterSlice";

import { store } from "../../redux/store";

import MainModal from "../MainModal";
import AlertList from "../alerts/AlertList";
import { AlertTypes } from "../alerts/alertTypes";
import { add as addAlert } from "../../redux/alertListSlice";

import UserLoginForm from "../users/UserLoginForm";
import UserRegisterForm from "../users/UserRegisterForm";

function NoteList(props: any)
{
    // const [notes, setNotes] = useState([]);
    const notes = useAppSelector(selectNoteList);
    const categories = useAppSelector(selectCategoryList);
    const tags = useAppSelector(selectTagList);
    const pagination = useAppSelector(selectPagination);
    const dispatch = useAppDispatch();
    // const [areNotesFetched, setAreNotesFetched] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
    // const [itemsPerPageInput, setItemsPerPageInput] = useState<number>(5);
    const [isLoginFormActive, setIsLoginFormActive] = useState<boolean>(false);
    const [isRegisterFormActive, setIsRegisterFormActive] = useState<boolean>(false);
    const [user, setUser] = useState<string>("");

    let popover = (
        <Popover id="popover-basic">
            <Popover.Header as="h3">select categories</Popover.Header>
            <Popover.Body>
                <Fragment>
                <ButtonGroup aria-label="">
                    <Button
                        disabled
                        onClick={handleFilterSelectAllCategoriesBtnClick}
                        variant="outline-secondary">all</Button>
                    <Button disabled variant="outline-secondary">none</Button>
                </ButtonGroup>
                <Form.Group className="mb-3">
                    { getCategoriesAsCheckboxes() }
                </Form.Group>
                </Fragment>
            </Popover.Body>
        </Popover>
    );

    // const popover = () =>
    // {
    //     return (
    //         <Popover id="popover-basic">
    //             <Popover.Header as="h3">select categories</Popover.Header>
    //             <Popover.Body>
    //                 <Fragment>
    //                 <ButtonGroup aria-label="">
    //                     <Button
    //                         disabled
    //                         onClick={handleFilterSelectAllCategoriesBtnClick}
    //                         variant="outline-secondary">all</Button>
    //                     <Button disabled variant="outline-secondary">none</Button>
    //                 </ButtonGroup>
    //                 <Form.Group className="mb-3">
    //                     { getCategoriesAsCheckboxes() }
    //                 </Form.Group>
    //                 </Fragment>
    //             </Popover.Body>
    //         </Popover>
    //     );
    // }
    

    function getCategoriesAsCheckboxes()
    {
        return Object.values(categories).map((category: Category) =>
        {
            if (store.getState().filters.categories.includes(category.id))
            {
                return (
                    <Form.Check
                        checked
                        key={category.id}
                        id={`category-chbx-${category.id}`}
                        label={category.name}
                        onChange={(event: any) => handleCategoryFilterChbxChange(event, category.id)}
                        type="checkbox" />
                );
            }
            else
            {
                return (
                    <Form.Check
                        key={category.id}
                        id={`category-chbx-${category.id}`}
                        label={category.name}
                        onChange={(event: any) => handleCategoryFilterChbxChange(event, category.id)}
                        type="checkbox" />
                );
            }
        });
    }

    function handleApplyFiltersBtnClick()
    {
        dispatch(setCurrentPage(1));
        dispatch(fetchNotes);
    }

    function handleCategoryFilterChbxChange(event: any, categoryId: number)
    {
        // if (event.target.checked)
        if (!store.getState().filters.categories.includes(categoryId))
        {
            dispatch(setCategoriesFilter([...store.getState().filters.categories, categoryId]));
        }
        else
        {
            dispatch(setCategoriesFilter(store.getState().filters.categories.filter((c: number) => c !== categoryId)));
        }
    }

    function handleFilterSelectAllCategoriesBtnClick()
    {
        // setFilters({
        //     ...filters,
        //     ctg: Object.values(categories).map(c => c.id)
        // });
    }

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

    function handleAddNoteToList(newNote: Note)
    {
        // let n: never[] = [...notes, newNote];
        // setNotes(n);
        dispatch(add(newNote));
    }

    async function handleDeleteNote(id: number)
    {
        // console.log("deleting note id = " + id);
        const url = `/api/notes/delete/${id}`;
        const init = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        const response = await fetch(url, init);
        if (!response.ok) throw new Error("Failed to delete a note.");
        // const data = await response.json();
        dispatch(remove(id));
    }

    function handleEditNoteButtonClick(noteId: number)
    {
        // console.log(`edit button #${noteId} was clicked`);
        setNoteToEdit(notes[noteId]);
        setShowModal(true);
    }

    async function handleSubmitEditedNote(editedNote: Note)
    {
        console.log("edited note:");
        console.log(editedNote);

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

    function notesToElement()
    {
        // console.log("notesToElement()");
        // console.log(Object.values(notes));
        return Object.values(notes).map((item: Note, index: number) => {
            return (
                <div className="note-container col-md-auto ms-sm-auto col-lg-auto px-md-auto" key={item.id}>
                    <div className="note-header-container">
                        <h2 className="note-title">{item.title}</h2>
                        <div className="note-header-buttons-container">
                            <Button
                                    onClick={ () => handleEditNoteButtonClick(item.id) }
                                    variant="warning"
                                    type="button">
                            <span>edit</span>
                            </Button>
                            <Button
                                    onClick={ () => handleDeleteNote(item.id) }
                                    variant="danger"
                                    type="button">
                            <span>delete</span>
                            </Button>
                            <MuiButton
                                // onClick={(event: any) => { handleAddTagsBtnClick(event, item.id) }}
                                onClick={(event: any) => { handleShowNoteTagManagerModal(event, item.id) }}
                                size="small"
                                variant="contained"
                                style={ { textTransform: "lowercase" } }
                            >manage tags</MuiButton>
                        </div>
                    </div>

                    <div className="note-contents-container">
                        <p>{item.contents}</p>
                        
                    </div>
                    
                    <div className="note-contents-footer">
                        <span>{item.date_added}</span>
                        <span>{categories[item.category_id].name}</span>
                    </div>
                    
                    <div className="tag-container">
                        <MuiStack direction="row" spacing={1} alignItems="center">
                            { item.tagIds != null ?
                                item.tagIds.map((id: number) =>
                                { return (
                                    <MuiChip key={id} label={tags[id].name} color="primary" />
                                );}) :
                                null
                            }
                        </MuiStack>
                    </div>
                </div>
            );
        });
    }

    function handlePaginationInputFieldChange(event: any, fieldName: any)
    {
        if (fieldName === "IPP")
        {
            if (typeof event.target.value === "string")
            {
                console.log(event.target.value);
                // setItemsPerPageInput(Number(event.target.value));
                dispatch(setItemsPerPage(Number(event.target.value)));
                dispatch(setCurrentPage(1));
                dispatch(fetchNotes);
            }
        }
    }

    function getPaginationButtons()
    {
        let paginationButtons: any = [];
        let numOfPages = Math.ceil(pagination.numberOfAllNotes / pagination.itemsPerPage);
        for (let i  = 0; i < numOfPages; i++)
        {
            // const tempBtn = (
            //     <ButtonGroup key={i} className="me-2" aria-label={`group #${i+1}`}>
            //         <Button
            //             onClick={(event: any) => handlePageBtnClick(event, i+1) }
            //         >{i+1}</Button>
            //     </ButtonGroup>
            // );
            const tempBtn = (
                <button
                    key={i}
                    className={i+1 === pagination.currentPage ? "pagination-button active" : "pagination-button"}
                    onClick={(event: any) => handlePageBtnClick(event, i+1) }
                >{i+1}</button>
            );
            paginationButtons.push(tempBtn);
        }
        return paginationButtons;
    }

    function handlePageBtnClick(event: any, pageNumber: number)
    {
        // console.log(`selected page: ${pageNumber}`);
        dispatch(setCurrentPage(pageNumber));
        dispatch(fetchNotes);
    }

    /********************************
        TEMPORARY
    ********************************/
    const [showNoteTagManagerModal, setShowNoteTagManagerModal] = useState<boolean>(false);
    const [noteToAddTagsTo, setNoteToAddTagsTo] = useState<number>(-1);
    const handleShowNoteTagManagerModal = (event: any, noteId: number) =>
    {
        setNoteToEdit(null); // will close the previous modal if opened by chance
        setNoteToAddTagsTo(noteId);
        setShowNoteTagManagerModal(true);
    };

    const handleClosNoteTagManagereModal = () => setShowNoteTagManagerModal(false);
    /********************************
        END: TEMPORARY
    ********************************/

    function renderModal()
    {
        if (showNoteTagManagerModal)
        {
            return (
                <MainModal
                    showModal={showNoteTagManagerModal}
                    onHide={handleClosNoteTagManagereModal}
                    title={"Add Tags To Note #?"}
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
                    title={"Add / Edit Note #?"}
                    onApplyBtnClick={handleCloseModal}
                    applyBtnText={"Apply"}
                    onCloseBtnClick={handleCloseModal}
                    closeBtnText={"Close"}
                >
                    <NoteForm
                        noteToEdit={noteToEdit}
                        updateNoteList={handleAddNoteToList} />
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
            type: AlertTypes.Info,
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
                type: AlertTypes.Info,
                message: data.responseMsg
            };
            dispatch(addAlert(alert));
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypes.Error,
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
                type: AlertTypes.Info,
                message: data.responseMsg
            };
            dispatch(addAlert(alert));
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypes.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    };

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
                type: AlertTypes.Info,
                message: data.responseMsg
            };
            localStorage.removeItem("user");
            dispatch(addAlert(alert));
            setUser("n/a");
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypes.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    };

    return (
    <Fragment>
        <Fragment>
            <p>{`user: ${user}`}</p>
            <div className="filters-main-container">
                {/* <DropdownButton id="filters-categories-dropdown-btn" title="categories">
                    <Dropdown.Item as={Form.Check}>abcdef</Dropdown.Item>
                </DropdownButton> */}
                <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                    <Button variant="primary">categories</Button>
                </OverlayTrigger>
                <DateTimeFilter />
                <Button
                    variant="outline-primary"
                    onClick={handleApplyFiltersBtnClick}
                    >apply filters</Button>
                <Button
                    variant="outline-primary"
                    onClick={handleOnAddAlertDebugBtnClick}
                    >add alert (debug)</Button>
                <Button
                    variant="outline-secondary"
                    // onClick={handleOnSignUpDebugBtnClick}
                    onClick={() => { setIsRegisterFormActive(true) }}
                    >sign up (debug)</Button>
                <Button
                    variant="outline-secondary"
                    // onClick={handleOnLogInDebugBtnClick}
                    onClick={() => { setIsLoginFormActive(true) }}
                    >log in (debug)</Button>
                <Button
                    variant="outline-secondary"
                    // onClick={handleOnLogInDebugBtnClick}
                    onClick={handleUserLogOutBtnClick}
                    >log out (debug)</Button>
            </div>
            <div className="pagination-container-top-main">
                <h5>all notes: {pagination.numberOfAllNotes}</h5>
                {/* <Form.Group className="mb-3">
                    <Form.Label  htmlFor="pagination-ipp-input">items per page</Form.Label>
                    <Form.Select
                        aria-label="select the number of items per page"
                        value={pagination.itemsPerPage}
                        onChange={(event: any) => { handlePaginationInputFieldChange(event, "IPP") }}
                        id="pagination-ipp-input">
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </Form.Select>
                </Form.Group> */}

                <div className="items-per-page-container">
                    <label htmlFor="ipp-select">Items per page: </label>
                    <select
                        value={pagination.itemsPerPage}
                        onChange={(event: any) => { handlePaginationInputFieldChange(event, "IPP") }}
                        id="ipp-select"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                    </select>
                </div>
                
            </div>
            {notesToElement()}
            <div className="pagination-container-bottom-main">
                {/* <ButtonToolbar aria-label="Toolbar with button groups">
                    { getPaginationButtons() }
                </ButtonToolbar> */}
                <div className="pagination-container-bottom">
                    { getPaginationButtons() }
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

export default NoteList;