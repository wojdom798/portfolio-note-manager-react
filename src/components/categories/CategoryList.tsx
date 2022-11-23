import React, { Fragment, useState, useEffect, SyntheticEvent } from "react";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
    add as addCategory,
    edit as editCategory,
    remove as deleteCategory,
    selectCategoryList
} from "../../redux/categorySlice";

// Type imports
import { ICategory } from "../../types";

// App component imports
import CategoryForm from "./CategoryForm";

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import BootstrapModal from 'react-bootstrap/Modal';


function CategoryList(props: any)
{
    const categories = useAppSelector(selectCategoryList);
    const dispatch = useAppDispatch();
    const [showModal, setShowModal] = useState(false);
    const [categoryToEdit, setCategoryToEdit] = useState<ICategory | null>(null);
    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

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

    const handleFormClose = () =>
    {
        setCategoryToEdit(null);
        setShowModal(false);
    };

    const handleToggleAllItemSelection = (event: SyntheticEvent) =>
    {
        if ((event.target as HTMLInputElement).checked)
        {
            const allIds: number[] = [];
            Object.values(categories).forEach(({id}: ICategory) =>
            {
                allIds.push(id)
            });
            setSelectedCategories(allIds);
        }
        else
        {
            setSelectedCategories([]);
        }
    }

    const handleToggleItemSelection = (itemId: number) =>
    {
        if (selectedCategories.includes(itemId))
        {
            setSelectedCategories(selectedCategories.filter((currentItem) =>
            {
                return currentItem !== itemId;
            }));
        }
        else
        {
            setSelectedCategories([...selectedCategories, itemId]);
        }
    }

    function renderCategoriesAsTableRows(categories: ICategory[])
    {
        return categories.map(
            ({ id, name, date_added }: ICategory, index: number) =>
        {
            return (
                <tr
                    className={
                        selectedCategories.includes(id) ?
                        "table-view__row table-view__row--active" : "table-view__row"
                    }
                    key={id}
                    onClick={() => {handleToggleItemSelection(id)}}
                >
                    <td className="table-view__column">
                        <input
                            checked={selectedCategories.includes(id)}
                            type="checkbox"
                            onChange={() => {handleToggleItemSelection(id)}}/>
                    </td>
                    <td className="table-view__column">{index+1}</td>
                    {/* <td>{id}</td> */}
                    <td
                        className={
                            "table-view__column " +
                            "table-view__column--horizontally-scrollable"
                        }
                    >{name}</td>
                    <td className="table-view__column">{date_added}</td>
                </tr>
            );
        });
    }

    function handleEditCategoryButtonClick(categoryId: number)
    {
        setCategoryToEdit(categories[categoryId]);
        setShowModal(true);
    }

    async function deleteCategoriesDB(categoryIds: number[])
    {
        let url;
        if (categoryIds.length === 1)
            url = `api/categories/delete/${categoryIds[0]}`;
        else
            url = `api/categories/delete/${JSON.stringify(categoryIds)}`;
        
        const init = {
            method: "DELETE",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            dispatch(deleteCategory(categoryIds));
        }
        catch (error: any)
        {
            console.log(
                "Error [CategoryForm.tsx, handleDeleteCategoryButtonClick()]: ",
                error.message
            );
        }
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
            console.log(
                "Error [CategoryForm.tsx, handleDeleteCategoryButtonClick()]: ",
                error.message
            );
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
            console.log(
                "Error [CategoryForm.tsx, handleFormSubmit()]: ",
                err.message
            );
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
            console.log(
                "Error [CategoryForm.tsx, handleEditCategoryFormSubmit()]: ",
                error.message
            );
        }
        finally
        {
            setCategoryToEdit(null);
            setShowModal(false);
        }
    }

    const handleEditActionClick = () =>
    {
        if (selectedCategories.length === 1)
        {
            setCategoryToEdit(categories[selectedCategories[0]]);
            setShowModal(true);
        }
    }

    const handleDeleteActionClick = () =>
    {
        console.log("deleting categories: ");
        console.log(selectedCategories);

        deleteCategoriesDB(selectedCategories);
        setSelectedCategories([]);
    }

    return (
    <Fragment>
        <div className="category-list">
            {/* {categoriesToElement()} */}
            <h2 className="category-list__title">Categories</h2>
            <div className="category-list__button-container">
                <button
                    className="notes-app-btn"
                    disabled={selectedCategories.length !== 1}
                    onClick={handleEditActionClick}
                >Edit</button>
                <button
                    className="notes-app-btn notes-app-btn--danger"
                    disabled={selectedCategories.length === 0}
                    onClick={handleDeleteActionClick}
                >Delete</button>
                {/* <button
                    className="notes-app-btn"
                    onClick={() => console.log(selectedCategories)}
                >log selected categories (DBG)</button> */}
            </div>
            <div className="category-list__table-container">
            <table className="table-view">
                <thead className="table-view__header">
                    <tr className="table-view__header-row">
                        <th className="table-view__column table-view__column--header">
                            <input
                                disabled={Object.values(categories).length === 0}
                                checked={
                                    Object.values(categories).length !== 0 &&
                                    Object.values(categories).length === 
                                    selectedCategories.length
                                }
                                type="checkbox"
                                onChange={handleToggleAllItemSelection}/>
                        </th>
                        <th
                            className="table-view__column table-view__column--header"
                        >#</th>
                        {/* <th>ID</th> */}
                        <th
                            className="table-view__column table-view__column--header"
                        >Name</th>
                        <th
                            className="table-view__column table-view__column--header"
                        >Date Added</th>
                    </tr>
                </thead>
                <tbody className="table-view__body">
                    { renderCategoriesAsTableRows(Object.values(categories)) }
                </tbody>
            </table>
            </div>

            <Button
                onClick={handleShowModal}
                variant="primary"
                className="floating-action-btn-round"
                type="button">
            <span>&#x2B;</span>
            </Button>
        </div>

        <BootstrapModal
            show={showModal}
            backdrop="static"
            keyboard={false}>
            <BootstrapModal.Body>
                { categoryToEdit ? (
                    <CategoryForm
                        categoryToEdit={categoryToEdit}
                        onFormSubmit={handleEditCategoryFormSubmit}
                        onFormClose={handleFormClose}
                    />
                ) : (
                    <CategoryForm
                        onFormSubmit={handleAddNewCategoryFormSubmit}
                        onFormClose={handleFormClose}
                    />
                )}
            </BootstrapModal.Body>
        </BootstrapModal>
    </Fragment>
    );
}

export default CategoryList;