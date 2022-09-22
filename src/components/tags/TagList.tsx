import React, { useState, useEffect, Fragment } from "react";

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
    add as addTag,
    edit as editTag,
    remove as deleteTag,
    selectTagList,
    Tag
} from "../../redux/tagSlice";

import TagForm from "./TagForm";

import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from "react-bootstrap/Card";

function TagList()
{
    const tags = useAppSelector(selectTagList);
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [tagToEdit, setTagToEdit] = useState<Tag | null>(null);

    useEffect(() =>
    {
        
    }, []);

    const handleShowModal = () =>
    {
        setTagToEdit(null);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    function categoriesToElement()
    {
        return Object.values(tags).map((item: any) =>
        {
            return (
            <Card key={item.id} border="primary" style={{ width: '18rem' }}>
                <Card.Header>{item.date_added}</Card.Header>
                <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Button
                    onClick={() => { handleEditTagButtonClick(item.id) }}
                    variant="primary">edit</Button>
                <Button
                    onClick={ () => { handleDeleteTagButtonClick(item.id); }}
                    variant="danger">delete</Button>
                </Card.Body>
            </Card>
            );
        });
    }

    function handleEditTagButtonClick(tagId: number)
    {
        setTagToEdit(tags[tagId]);
        setShowModal(true);
    }

    async function handleDeleteTagButtonClick(tagId: number)
    {
        const url = `api/tags/delete/${tagId}`;
        const init = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            dispatch(deleteTag(tagId));
        }
        catch (error: any)
        {
            console.log("Error [TagList.tsx, handleDeleteTagButtonClick()]: ", error.message);
        }
    }

    function handleAddNewTagFormSubmit(newTag: Tag)
    {
        let apiUrl = "/api/tags/add";
        let payload = JSON.stringify({ newTag: newTag });

        const init = {
            method: "POST",
            body: payload,
            headers: { 'Content-Type': 'application/json' }
        };
        fetch(apiUrl, init)
        .then(response => response.json())
        .then(data => {

            dispatch(addTag({
                ...newTag,
                id: data.responseData.id,
            }));
        })
        .catch(err => {
            console.log("Error [TagList.tsx, handleAddNewTagFormSubmit()]: ", err.message);
        });
    }

    async function handleEditTagFormSubmit(tagToEdit: Tag)
    {
        let payload = JSON.stringify({ tagToEdit: tagToEdit });

        const init = {
            method: "PUT",
            body: payload,
            headers: { 'Content-Type': 'application/json' }
        };
        try
        {
            const response = await fetch("/api/tags/edit", init);
            const data = await response.json();
            dispatch(editTag(tagToEdit));
        }
        catch (error: any)
        {
            console.log("Error [TagList.tsx, handleEditTagFormSubmit()]: ", error.message);
        }
        finally
        {
            setTagToEdit(null);
            setShowModal(false);
        }
    }
    
    if (!tagToEdit)
    {
        return (
        <Fragment>
            <Fragment>
                {categoriesToElement()}
                <Button
                    onClick={handleShowModal}
                    variant="primary"
                    className="floating-action-btn-round"
                    type="button">
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
                    <TagForm onFormSubmit={handleAddNewTagFormSubmit} />
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
                {categoriesToElement()}
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
                    <TagForm
                        tagToEdit={tagToEdit}
                        onFormSubmit={handleEditTagFormSubmit}
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

export default TagList;