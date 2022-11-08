import React, { Fragment, useState, useEffect } from "react";

// Redux imports
import { store } from "../../redux/store";
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
    add as addCategory,
    edit as editCategory,
    remove as deleteCategory,
    fetchCategories,
    selectCategoryList
} from "../../redux/categorySlice";

// Type imports
import { ICategory } from "../../types";

// App component imports
import CategoryForm from "./CategoryForm";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Card from "react-bootstrap/Card";



function CategoryList(props: any)
{
    const categories = useAppSelector(selectCategoryList);
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<ICategory | null>(null);

    useEffect(() =>
    {
        // store.dispatch(fetchCategories);
    }, []);

    const handleShowModal = () =>
    {
        setCategoryToEdit(null);
        setShowModal(true);
    };

    const handleCloseModal = () => setShowModal(false);

    function categoriesToElement()
    {
        return Object.values(categories).map((item: any) =>
        {
            return (
            <Card key={item.id} border="primary" style={{ width: '18rem' }}>
                <Card.Header>{item.date_added}</Card.Header>
                <Card.Body>
                <Card.Title>{item.name}</Card.Title>
                <Button
                    onClick={() => { handleEditCategoryButtonClick(item.id) }}
                    variant="primary">edit</Button>
                <Button
                    onClick={ () => { handleDeleteCategoryButtonClick(item.id); }}
                    variant="danger">delete</Button>
                </Card.Body>
            </Card>
            );
        });
    }

    function handleEditCategoryButtonClick(categoryId: number)
    {
        setCategoryToEdit(categories[categoryId]);
        setShowModal(true);
    }

    async function handleDeleteCategoryButtonClick(categoryId: number)
    {
        const url = `api/categories/delete/${categoryId}`;
        const init = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            dispatch(deleteCategory(categoryId));
        }
        catch (error: any)
        {
            console.log("Error [CategoryForm.tsx, handleDeleteCategoryButtonClick()]: ", error.message);
        }
    }

    function handleAddNewCategoryFormSubmit(newCategory: ICategory)
    {
        let apiUrl = "/api/categories/add";
        let payload = JSON.stringify({ newCategory: newCategory });

        const init = {
            method: "POST",
            body: payload,
            headers: { 'Content-Type': 'application/json' }
        };
        fetch(apiUrl, init)
        .then(response => response.json())
        .then(data => {

            dispatch(addCategory({
                ...newCategory,
                id: data.responseData.id,
            }));
        })
        .catch(err => {
            console.log("Error [CategoryForm.tsx, handleFormSubmit()]: ", err.message);
        });
    }

    async function handleEditCategoryFormSubmit(categoryToEdit: ICategory)
    {
        let payload = JSON.stringify({ categoryToEdit: categoryToEdit });

        const init = {
            method: "PUT",
            body: payload,
            headers: { 'Content-Type': 'application/json' }
        };
        try
        {
            const response = await fetch("/api/categories/edit", init);
            const data = await response.json();
            dispatch(editCategory(categoryToEdit));
        }
        catch (error: any)
        {
            console.log("Error [CategoryForm.tsx, handleEditCategoryFormSubmit()]: ", error.message);
        }
        finally
        {
            setCategoryToEdit(null);
            setShowModal(false);
        }
    }
    
    if (!categoryToEdit)
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
                    <CategoryForm onFormSubmit={handleAddNewCategoryFormSubmit} />
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
                    <CategoryForm
                        categoryToEdit={categoryToEdit}
                        onFormSubmit={handleEditCategoryFormSubmit}
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

export default CategoryList;
