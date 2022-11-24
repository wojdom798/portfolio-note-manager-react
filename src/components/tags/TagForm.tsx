import React, { useState, useEffect, SyntheticEvent } from 'react';

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import {
    add as addTag,
    edit as editTag,
    selectTagList
} from "../../redux/tagSlice";

// Type imports
import { ITag, TagFormInputsEnum, TagFormProps } from "../../types";

// Helper imports
import helper from '../../helper';

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function TagForm({ tagToEdit, onFormClose }: TagFormProps)
{
    const dispatch = useAppDispatch();
    const [formTitle, setFormTitle] = useState<string>("");
    const [nameInput, setNameInput] = useState("");
    const [dateAddedInput, setDateAddedInput] = useState("");

    useEffect(() =>
    {
        if (tagToEdit)
        {
            setNameInput(tagToEdit.name);
            setDateAddedInput(tagToEdit.date_added);
            setFormTitle("Edit Tag");
        }
        else
        {
            setDateAddedInput(helper.getCurrentDateTimeString());
            setFormTitle("Add New Tag");
        }
    }, []);

    function handleFormInputFieldChange(
        event: SyntheticEvent, fieldName: TagFormInputsEnum)
    {
        const evTarget = event.target as HTMLInputElement;
        if (fieldName === TagFormInputsEnum.NAME)
        {
            if (typeof evTarget.value === "string")
                setNameInput(evTarget.value);
        }
        else if (fieldName === TagFormInputsEnum.DATE_ADDED)
        {
            setDateAddedInput(evTarget.value);
        }
    };

    async function handleFormSubmit(event: SyntheticEvent)
    {
        event.preventDefault();

        let tagToSubmit;
        let payload;

        if (tagToEdit)
        {
            tagToSubmit = {
                id: tagToEdit.id,
                name: nameInput,
                date_added: dateAddedInput,
            };
            payload = JSON.stringify({ "tagToEdit": tagToSubmit });
            const init = {
                method: "PUT",
                body: payload,
                headers: { "Content-Type": "application/json" }
            };
            const response = await fetch("/api/tags/edit", init);
            // if (!response.ok) // ...
            const data = await response.json();

            dispatch(editTag(tagToSubmit));
        }
        else
        {
            tagToSubmit = {
                name: nameInput,
                date_added: dateAddedInput,
            };
            payload = JSON.stringify({ newTag: tagToSubmit });
            const init = {
                method: "POST",
                body: payload,
                headers: { "Content-Type": "application/json" }
            };
            const response = await fetch("/api/tags/add", init);
            // if (!response.ok) // ...
            const data = await response.json();

            dispatch(addTag({
                ...tagToSubmit,
                id: data.responseData.id,
            }));
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
                    htmlFor="tag-name-input">Name</label>
                <input
                    id="tag-name-input"
                    name="tag-name-input"
                    className="form__input-field"
                    type="text"
                    value={nameInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(
                            event,
                            TagFormInputsEnum.NAME
                        );
                    }}/>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="tag-dateadded-input">Date Added</label>
                <input
                    id="tag-dateadded-input"
                    name="tag-dateadded-input"
                    className="form__input-field"
                    type="text"
                    value={dateAddedInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(
                            event,
                            TagFormInputsEnum.DATE_ADDED
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

export default TagForm;