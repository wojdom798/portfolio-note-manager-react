import React, { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import helper from '../../helper';

function TagForm(props: any)
{
    const [nameInput, setNameInput] = useState("");
    const [dateAddedInput, setDateAddedInput] = useState("");

    useEffect(() =>
    {
        if (props.hasOwnProperty("tagToEdit"))
        {
            setNameInput(props.tagToEdit.name);
            setDateAddedInput(props.tagToEdit.date_added);
        }
        else
        {
            setDateAddedInput(helper.getCurrentDateTimeString());
        }
    }, []);

    function handleNoteFormInputFieldChange(event: any, fieldName: any)
    {
        if (fieldName === "NAME")
        {
            if (typeof event.target.value === "string")
                setNameInput(event.target.value);
        }
        else if (fieldName === "DATE_ADDED")
        {
            setDateAddedInput(event.target.value);
        }
    };

    function handleFormSubmit(event: any)
    {
        event.preventDefault();
        
        if (props.hasOwnProperty("tagToEdit"))
        {
            const tagToEdit = {
                id: props.tagToEdit.id,
                name: nameInput,
                date_added: dateAddedInput,
                user_id: 1,
            }
            props.onFormSubmit(tagToEdit);
        }
        else
        {
            props.onFormSubmit({
                name: nameInput,
                date_added: dateAddedInput,
                user_id: 1,
            });
        }
    }

    return (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="tag-name-input">Name</Form.Label>
                <Form.Control
                    defaultValue={nameInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "NAME") }}
                    id="tag-name-input"
                    type="text"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label  htmlFor="tag-dateadded-input">Date Added</Form.Label>
                <Form.Control
                    defaultValue={dateAddedInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "DATE_ADDED") }}
                    id="tag-dateadded-input"
                    type="text"/>
            </Form.Group>
            <Button
                onClick={handleFormSubmit}
                variant="primary"
                type="submit"
            >Submit</Button>
        </Form>
    );
}

export default TagForm;