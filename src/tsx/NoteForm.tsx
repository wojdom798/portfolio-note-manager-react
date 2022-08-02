import React, { useState, useEffect, Fragment } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

function NoteForm(props: any)
{
    const [titleInput, setTitleInput] = useState("");
    const [contentsInput, setContentsInput] = useState("");

    function handleNoteFormInputFieldChange(event: any, fieldName: any)
    {
        // console.log(event.target.value + "; fieldName= " + fieldName);
        if (fieldName === "TITLE")
        {
            setTitleInput(event.target.value);
        }
        else if (fieldName === "CONTENTS")
        {
            setContentsInput(event.target.value);
        }
    };

    function handleFormSubmit(event: any)
    {
        event.preventDefault();
        // console.log("Form submit:");
        // console.log("title= " + titleInput);
        // console.log("contents= " + contentsInput);
        
        const submittedData = {
            newNote: {
                title: titleInput,
                contents: contentsInput,
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
                id: data.responseData.id,
                title: titleInput,
                contents: contentsInput,
            });
        })
        .catch(err => {
            console.log("Error [NoteForm.tsx, handleFormSubmit()]: ", err.message);
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
            <Button
                onClick={handleFormSubmit}
                variant="primary"
                type="submit"
            >Submit</Button>
        </Form>
    );
}

export default NoteForm;