import React, { useState, useEffect, Fragment } from 'react';
import { createPortal } from "react-dom";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectCategoryList } from "../../redux/categorySlice";
import { add as addAlert } from "../../redux/alertListSlice";

// Type imports
import { AlertTypesEnum, ICategory } from "../../types";

// Helper funtions / Utils
import helper from '../../helper';

// App component imports
// [...]

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


function NoteForm(props: any)
{
    const [titleInput, setTitleInput] = useState("");
    const [contentsInput, setContentsInput] = useState("");
    const [dateAddedInput, setDateAddedInput] = useState("");
    const [categoryInput, setCategoryInput] = useState<number>(-1);
    const categories = useAppSelector(selectCategoryList);
    const dispatch = useAppDispatch();

    useEffect(() =>
    {
        if (props.noteToEdit)
        {
            setTitleInput(props.noteToEdit.title);
            setContentsInput(props.noteToEdit.contents);
            setDateAddedInput(props.noteToEdit.date_added);
            setCategoryInput(props.noteToEdit.category_id);
        }
        else
        {
            setDateAddedInput(helper.getCurrentDateTimeString());
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
        
        if (props.noteToEdit)
        {
            const noteToEdit = {
                id: props.noteToEdit.id,
                title: titleInput,
                contents: contentsInput,
                date_added: dateAddedInput,
                category_id: categoryInput,
                // user_id: 1,
            }
            props.submitEditedNote(noteToEdit);
        }
        else
        {
            const submittedData = {
                newNote: {
                    title: titleInput,
                    contents: contentsInput,
                    date_added: dateAddedInput,
                    category_id: categoryInput,
                    user_id: 1,
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
                console.log("NoteForm.tsx, handleFormSubmit() [response]");
                console.log(data);

                props.updateNoteList({
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
                console.log("Error [NoteForm.tsx, handleFormSubmit()]: ", err.message);
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

    function getCategoryOptions()
    {
        return Object.values(categories).map((item: ICategory) =>
        {
            return (
                <option key={ item.id } value={ item.id }>{ item.name }</option>
            );
        });
    }

    return (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="note-title-input">Title</Form.Label>
                <Form.Control
                    defaultValue={titleInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "TITLE") }}
                    id="note-title-input"
                    type="text"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label  htmlFor="note-contents-input">Contents</Form.Label>
                <Form.Control
                    defaultValue={contentsInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "CONTENTS") }}
                    id="note-contents-input"
                    as="textarea"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label  htmlFor="note-dateadded-input">Date Added</Form.Label>
                <Form.Control
                    defaultValue={dateAddedInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "DATE_ADDED") }}
                    id="note-dateadded-input"
                    type="text"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label  htmlFor="note-category-input">Category</Form.Label>
                <Form.Select
                    aria-label="select category"
                    value={categoryInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "CATEGORY") }}
                    id="note-category-input">
                    {/* <option value={-1}>-- select category --</option> */}
                    { getCategoryOptions() }
                </Form.Select>
            </Form.Group>
            <Button
                onClick={handleFormSubmit}
                variant="primary"
                type="submit"
            >Submit</Button>
        </Form>
    );
}

export default NoteForm;