import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';

// Type imports
import { ICategory, CategoryFormInputsEnum, CategoryFormProps } from "../../types";

// Helper imports
import helper from '../../helper';

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function CategoryForm({
    categoryToEdit, onFormSubmit, onFormClose
}: CategoryFormProps)
{
    const [formTitle, setFormTitle] = useState<string>("");
    const [nameInput, setNameInput] = useState("");
    const [dateAddedInput, setDateAddedInput] = useState("");

    useEffect(() =>
    {
        if (categoryToEdit)
        {
            setNameInput(categoryToEdit.name);
            setDateAddedInput(categoryToEdit.date_added);
            setFormTitle("Edit Category");
        }
        else
        {
            setDateAddedInput(helper.getCurrentDateTimeString());
            setFormTitle("Add New Category");
        }
    }, []);

    function handleFormInputFieldChange(event: SyntheticEvent, fieldName: any)
    {
        if (fieldName === CategoryFormInputsEnum.NAME)
        {
            if (typeof (event.target as HTMLInputElement).value === "string")
                setNameInput((event.target as HTMLInputElement).value);
        }
        else if (fieldName === CategoryFormInputsEnum.DATE_ADDED)
        {
            setDateAddedInput((event.target as HTMLInputElement).value);
        }
    };

    function handleFormSubmit(event: SyntheticEvent)
    {
        event.preventDefault();
        
        if (categoryToEdit)
        {
            const categoryToEditSubmitted = {
                id: categoryToEdit.id,
                name: nameInput,
                date_added: dateAddedInput,
                // user_id: 1,
            } as ICategory;
            onFormSubmit(categoryToEditSubmitted);
        }
        else
        {
            onFormSubmit({
                name: nameInput,
                date_added: dateAddedInput,
                // user_id: 1,
            } as ICategory);
        }
    }

    const handleCloseFormButtonClick = (event: SyntheticEvent) =>
    {
        event.preventDefault();
        onFormClose();
    };

    return (
        <form>
            <h2 className="form__title">{formTitle}</h2>
            <div className="form__container">
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="category-name-input">Name</label>
                <input
                    id="category-name-input"
                    name="category-name-input"
                    className="form__input-field"
                    type="text"
                    value={nameInput}
                    onChange={(event: any) => {
                        handleFormInputFieldChange(
                            event,
                            CategoryFormInputsEnum.NAME
                        );
                    }}/>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="category-dateadded-input">Date Added</label>
                <input
                    id="category-dateadded-input"
                    name="category-dateadded-input"
                    className="form__input-field"
                    type="text"
                    value={dateAddedInput}
                    onChange={(event: any) => {
                        handleFormInputFieldChange(
                            event,
                            CategoryFormInputsEnum.DATE_ADDED
                        );
                    }}/>
            </div>
            <div className="form__button-group">
                <button
                    className="form__button daterange-picker__ok-button"
                    type="submit"
                    onClick={handleFormSubmit}
                >submit</button>
                <button
                    className="form__button daterange-picker__ok-button"
                    onClick={handleCloseFormButtonClick}
                >close</button>
            </div>
            </div>
        </form>
    );
}

export default CategoryForm;