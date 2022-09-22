import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import helper from '../../helper';

function CategoryForm(props: any)
{
    const [nameInput, setNameInput] = useState("");
    const [dateAddedInput, setDateAddedInput] = useState("");

    useEffect(() =>
    {
        if (props.hasOwnProperty("categoryToEdit"))
        {
            setNameInput(props.categoryToEdit.name);
            setDateAddedInput(props.categoryToEdit.date_added);
        }
        else
        {
            setDateAddedInput(helper.getCurrentDateTimeString());
        }
    }, []);

    function handleNoteFormInputFieldChange(event: any, fieldName: any)
    {
        // console.log(event.target.value + "; fieldName= " + fieldName);
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
        
        if (props.hasOwnProperty("categoryToEdit"))
        {
            const categoryToEdit = {
                id: props.categoryToEdit.id,
                name: nameInput,
                date_added: dateAddedInput,
                user_id: 1,
            }
            props.onFormSubmit(categoryToEdit);
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
                <Form.Label htmlFor="category-name-input">Name</Form.Label>
                <Form.Control
                    defaultValue={nameInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "NAME") }}
                    id="category-name-input"
                    type="text"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label  htmlFor="category-dateadded-input">Date Added</Form.Label>
                <Form.Control
                    defaultValue={dateAddedInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "DATE_ADDED") }}
                    id="category-dateadded-input"
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

export default CategoryForm;