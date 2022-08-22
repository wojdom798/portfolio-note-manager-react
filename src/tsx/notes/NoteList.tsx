import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import NoteForm from './NoteForm';

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { add, remove, edit, fetchNotes, selectNoteList, Note } from "../../redux/noteListSlice";
import { selectCategoryList } from "../../redux/categorySlice";

import { store } from "../../redux/store";

function NoteList(props: any)
{
    // const [notes, setNotes] = useState([]);
    const notes = useAppSelector(selectNoteList);
    const categories = useAppSelector(selectCategoryList);
    const dispatch = useAppDispatch();
    // const [areNotesFetched, setAreNotesFetched] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState<Note | null>(null);

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

    if (!noteToEdit)
    {
        return (
        <Fragment>
            <Fragment>
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