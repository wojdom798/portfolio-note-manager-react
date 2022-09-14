import React, { useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import helper from '../../helper';

import { useAppDispatch } from "../../redux/hooks";
import { add as addAlert,  } from "../../redux/alertListSlice";
import { AlertTypes } from "../alerts/alertTypes";

function UserLoginForm(props: any)
{
    const dispatch = useAppDispatch();
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");

    function handleNoteFormInputFieldChange(event: any, fieldName: any)
    {
        if (fieldName === "USERNAME")
        {
            if (typeof event.target.value === "string")
                setUsernameInput(event.target.value);
        }
        else if (fieldName === "PASSWORD")
        {
            if (typeof event.target.value === "string")
                setPasswordInput(event.target.value);
        }
    };

    async function handleFormSubmit(event: any)
    {
        event.preventDefault();
        
        let alert;

        const url = `api/auth/login/`;

        const userToLogIn = {
            username: usernameInput,
            password: passwordInput
        };

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userToLogIn)
        };
        try
        {
            let alertType: AlertTypes = AlertTypes.Success;
            const response = await fetch(url, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            if (response.status === 401) alertType = AlertTypes.Error;
            const data = await response.json();
            props.onUserLoggedIn(data.username);
            alert = 
            {
                id: (new Date()).getTime(),
                type: alertType,
                message: data.responseMsg
            };
            dispatch(addAlert(alert));
        }
        catch (error: any)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypes.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    }

    return (
        <Form>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="login-username-input">Username</Form.Label>
                <Form.Control
                    defaultValue={usernameInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "USERNAME") }}
                    id="login-username-input"
                    type="text"/>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label  htmlFor="login-password-input">Password</Form.Label>
                <Form.Control
                    defaultValue={passwordInput}
                    onChange={(event: any) => { handleNoteFormInputFieldChange(event, "PASSWORD") }}
                    id="login-password-input"
                    type="password" />
            </Form.Group>
            <Button
                onClick={handleFormSubmit}
                variant="primary"
                type="submit"
            >Log In</Button>
        </Form>
    );
}

export default UserLoginForm;