import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';
import { createPortal } from "react-dom";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectCategoryList } from "../../redux/categorySlice";
import { add as addAlert } from "../../redux/alertListSlice";

// Type imports
import { NoteFormProps, AlertTypesEnum, ICategory } from "../../types";

// Helper funtions / Utils
import helper from '../../helper';

// App component imports
// [...]

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function NoteForm({
    noteToEdit, onEditNoteFormSubmit,
    updateNoteList, onCloseButtonClick
}: NoteFormProps)
{
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategoryList);
    const [formTitle, setFormTitle] = useState<string>("");
    const [titleInput, setTitleInput] = useState("");
    const [contentsInput, setContentsInput] = useState("");
    const [dateAddedInput, setDateAddedInput] = useState("");
    const [categoryInput, setCategoryInput] =
        useState<number>(Object.values(categories).length ?
        Object.values(categories)[0].id: -1);

    useEffect(() =>
    {
        if (noteToEdit)
        {
            setTitleInput(noteToEdit.title);
            setContentsInput(noteToEdit.contents);
            setDateAddedInput(noteToEdit.date_added);
            setCategoryInput(noteToEdit.category_id);
            setFormTitle("Edit Note");
        }
        else
        {
            setDateAddedInput(helper.getCurrentDateTimeString());
            setFormTitle("Add New Note");
        }
    }, []);

    function handleNoteFormInputFieldChange(event: any, fieldName: any)
    {
        // console.log(event.target.value + "; fieldName= " + fieldName);
        if (fieldName === "TITLE")
        {
            if (typeof event.target.value === "string")
                setTitleInput(event.target.value);
        }
        else if (fieldName === "CONTENTS")
        {
            setContentsInput(event.target.value);
        }
        else if (fieldName === "DATE_ADDED")
        {
            setDateAddedInput(event.target.value);
        }
        else if (fieldName === "CATEGORY")
        {
            setCategoryInput(event.target.value);
        }
    };

    function handleFormSubmit(event: any)
    {
        event.preventDefault();
        // console.log("Form submit:");
        // console.log("title= " + titleInput);
        // console.log("contents= " + contentsInput);
        
        if (noteToEdit)
        {
            const submittedNoteToEdit = {
                id: noteToEdit.id,
                title: titleInput,
                contents: contentsInput,
                date_added: dateAddedInput,
                category_id: categoryInput,
                tagIds: noteToEdit.tagIds
                // user_id: 1,
            }
            onEditNoteFormSubmit!(submittedNoteToEdit);
        }
        else
        {
            const submittedData = {
                newNote: {
                    title: titleInput,
                    contents: contentsInput,
                    date_added: dateAddedInput,
                    category_id: categoryInput,
                    tagIds: null
                    // user_id: 1,
                }
            };

            let apiUrl = "/api/notes/add";
            let payload = JSON.stringify(submittedData);

            const init = {
                method: "POST",
                body: payload,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
            fetch(apiUrl, init)
            .then(response => response.json())
            .then(data => {
                // console.log("NoteForm.tsx, handleFormSubmit() [response]");
                // console.log(data);

                updateNoteList!({
                    ...submittedData.newNote,
                    id: data.responseData.id,
                });

                const alert =
                {
                    id: (new Date()).getTime(),
                    type: AlertTypesEnum.Success,
                    message: "New note has been created."
                };
                dispatch(addAlert(alert));
            })
            .catch(err => {
                // console.log("Error [NoteForm.tsx, handleFormSubmit()]: ", err.message);
                const alert =
                {
                    id: (new Date()).getTime(),
                    type: AlertTypesEnum.Error,
                    message: "Error, couldn't create new note."
                };
                dispatch(addAlert(alert));
            });
        }
    }

    function renderCategorySelectOptions()
    {
        return Object.values(categories).map(({id, name}: ICategory) =>
        {
            return (
                <option key={id} value={id}>{name}</option>
            );
        });
    }

    const handleFormCloseButtonClick = (event: SyntheticEvent) =>
    {
        event.preventDefault();
        onCloseButtonClick();
    }

    return (
        <form>
            <h2 className="form__title">{formTitle}</h2>
            <div className="form__container">
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-title-input-1">Title</label>
                <input
                    id="note-title-input-1"
                    name="note-title-input-1"
                    className="form__input-field"
                    type="text"
                    value={titleInput}
                    onChange={(event: any) => {
                        handleNoteFormInputFieldChange(event, "TITLE")
                    }}/>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-contents-input-1">Contents</label>
                <textarea
                    id="note-contents-input-1"
                    name="note-contents-input-1"
                    className="form__input-field"
                    value={contentsInput}
                    onChange={(event: any) => {
                        handleNoteFormInputFieldChange(event, "CONTENTS")
                    }}></textarea>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-dateadded-input-1">Date Added</label>
                <input
                    id="note-dateadded-input-1"
                    name="note-dateadded-input-1"
                    className="form__input-field"
                    type="text"
                    value={dateAddedInput}
                    onChange={(event: any) => {
                        handleNoteFormInputFieldChange(event, "DATE_ADDED")
                    }}/>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-category-input-1">Category</label>
                <select
                    name="note-category-input-1"
                    id="note-category-input-1"
                    className="form__input-field"
                    value={categoryInput}
                    onChange={(event: any) => {
                        handleNoteFormInputFieldChange(event, "CATEGORY")
                    }}
                >
                    { renderCategorySelectOptions() }
                </select>
            </div>

            <div className="form__button-group">
                <button
                    className="form__button daterange-picker__ok-button"
                    type="submit"
                    onClick={handleFormSubmit}
                >submit</button>
                <button
                    className="form__button daterange-picker__ok-button"
                    onClick={handleFormCloseButtonClick}
                >close</button>
            </div>
            </div>
        </form>
    );
}

export default NoteForm;