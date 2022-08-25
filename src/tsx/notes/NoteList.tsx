import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Popover from "react-bootstrap/Popover";

import NoteForm from './NoteForm';

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { add, remove, edit, fetchNotes, selectNoteList, Note } from "../../redux/noteListSlice";
import { Category, selectCategoryList } from "../../redux/categorySlice";
import { setItemsPerPage, setCurrentPage, selectPagination } from "../../redux/paginationSlice";
import { setCategoriesFilter } from "../../redux/filterSlice";

import { store } from "../../redux/store";

function NoteList(props: any)
{
    // const [notes, setNotes] = useState([]);
    const notes = useAppSelector(selectNoteList);
    const categories = useAppSelector(selectCategoryList);
    const pagination = useAppSelector(selectPagination);
    const dispatch = useAppDispatch();
    // const [areNotesFetched, setAreNotesFetched] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);
    // const [itemsPerPageInput, setItemsPerPageInput] = useState<number>(5);

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

    function notesToElement()
    {
        // console.log("notesToElement()");
        // console.log(Object.values(notes));
        return Object.values(notes).map((item: any, index: number) => {
            return (
                <div className="note-container" key={item.id}>
                    <h3 className="note-title">{item.title}</h3>
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
                    <p>{item.contents}</p>
                    <p>category: {categories[item.category_id].name}</p>
                    <p>{item.date_added}</p>
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
            const tempBtn = (
                <ButtonGroup key={i} className="me-2" aria-label={`group #${i+1}`}>
                    <Button
                        onClick={(event: any) => handlePageBtnClick(event, i+1) }
                    >{i+1}</Button>
                </ButtonGroup>
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

    if (!noteToEdit)
    {
        return (
        <Fragment>
            <Fragment>
                <div className="filters-container">
                    {/* <DropdownButton id="filters-categories-dropdown-btn" title="categories">
                        <Dropdown.Item as={Form.Check}>abcdef</Dropdown.Item>
                    </DropdownButton> */}
                <h3>Filters</h3>
                <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                    <Button variant="primary">categories</Button>
                </OverlayTrigger>
                <Button
                    variant="outline-primary"
                    onClick={handleApplyFiltersBtnClick}
                    >apply filters</Button>
                </div>
                <div className="pagination">
                    <h5>all notes: {pagination.numberOfAllNotes}</h5>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                    <ButtonToolbar aria-label="Toolbar with button groups">
                        { getPaginationButtons() }
                    </ButtonToolbar>
                </div>
                {notesToElement()}
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
    
            {/* modal dialog */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>
    
                <Modal.Body>
                    <NoteForm updateNoteList={handleAddNoteToList} />
                </Modal.Body>
    
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={handleCloseModal}>Save changes</Button>
                </Modal.Footer>
            </Modal>
            {/* end: modal dialog */}
        </Fragment>
        );
    }
    else
    {
        return (
        <Fragment>
            <Fragment>
                <div className="filters-container">
                        {/* <DropdownButton id="filters-categories-dropdown-btn" title="categories">
                            <Dropdown.Item as={Form.Check}>abcdef</Dropdown.Item>
                        </DropdownButton> */}
                    <h3>Filters</h3>
                    <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
                        <Button variant="primary">categories</Button>
                    </OverlayTrigger>
                    <Button
                        variant="outline-primary"
                        onClick={handleApplyFiltersBtnClick}
                        >apply filters</Button>
                </div>
                <div className="pagination">
                    <p>all notes: {pagination.numberOfAllNotes}</p>
                    <Form.Group className="mb-3">
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
                    </Form.Group>
                    <ButtonToolbar aria-label="Toolbar with button groups">
                        { getPaginationButtons() }
                    </ButtonToolbar>
                </div>
                {notesToElement()}
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
    
            {/* modal dialog */}
            <Modal
                show={showModal}
                onHide={handleCloseModal}
                backdrop="static"
                keyboard={false}>
                <Modal.Header closeButton>
                    <Modal.Title>Modal title</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    {/* display edit form */}
                    <NoteForm
                        noteToEdit={noteToEdit}
                        submitEditedNote={handleSubmitEditedNote}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={handleCloseModal}>Save changes</Button>
                </Modal.Footer>
            </Modal>
            {/* end: modal dialog */}
        </Fragment>
        );
    }
    
}

export default NoteList;