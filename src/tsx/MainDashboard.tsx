import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import NoteForm from './NoteForm';

function MainDashboard()
{
    const [notes, setNotes] = useState([]);
    // const [areNotesFetched, setAreNotesFetched] = useState(0);
    const [showModal, setShowModal] = useState(false);

    useEffect(() =>
    {
        const init = {
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

            setNotes(data.responseData.notes);
        })
        .catch(err => {
            console.log("Error (MainDashboard.tsx, useEffect()):", err.message);
        });
    // }, [areNotesFetched]);
    }, []);

    function notesToElement()
    {
        return notes.map((item: any, index: number) => {
            return (
                <div key={item.id}>
                    <h3>{item.title}</h3>
                    <p>{item.contents}</p>
                    <p>{item.date_added}</p>
                </div>
            );
        });
    }

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    function handleUpdateNoteList(newNote: never)
    {
        let n: never[] = [...notes, newNote];
        setNotes(n);
    }

    return (
        // main-dashboard-container
        <div className="container-fluid main-dashboard-container">
            <div className="row">
                <nav className="col-md-3 col-lg-2 d-md-block bg-light collapse">
                    column 1
                </nav>
                <main className="col-md-6 ms-sm-auto col-lg-8 px-md-4">
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
                </main>
                <nav className="col-md-3 col-lg-2 d-md-block bg-light collapse">
                    column 3
                </nav>
            </div>

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
                    <NoteForm updateNoteList={handleUpdateNoteList} />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>Close</Button>
                    <Button variant="primary" onClick={handleCloseModal}>Save changes</Button>
                </Modal.Footer>
            </Modal>
            {/* end: modal dialog */}

        </div> // end: main-dashboard-container
    );
}

export default MainDashboard;