import React, { SyntheticEvent, useState } from "react";

// Type imports
import { AlertTypesEnum } from "../../types";

// Redux imports
import { useAppDispatch } from "../../redux/hooks";
import { add as addAlert,  } from "../../redux/alertListSlice";
import { 
    selectUser,
    set as setUser
} from "../../redux/authSlice";

// Helper functions
import helper from '../../helper';
import {
    setUserInStorage,
    setSessionExpirationDateInLocalStorage
} from "../../localStorageUtils";

// App component imports
// [...]

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';


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

    async function handleFormSubmit(event: SyntheticEvent)
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
            let alertType: AlertTypesEnum = AlertTypesEnum.Success;
            const response = await fetch(url, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            if (response.status === 401) alertType = AlertTypesEnum.Error;
            const data = await response.json();

            const user = { 
                id: data.user.id,
                username: data.user.username
            } as { id: number, username: string };

            setUserInStorage(user); // save logged-in user to local storage
            setSessionExpirationDateInLocalStorage(new Date(`${data.sessionExpirationDate}`));
            dispatch(setUser(user));

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
                type: AlertTypesEnum.Error,
                message: error.message
            };
            dispatch(addAlert(alert));
        }
    }


    return (
        !props.isolated ? (
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="login-username-input">Username</Form.Label>
                    <Form.Control
                        defaultValue={usernameInput}
                        onChange={(event: SyntheticEvent) => { handleNoteFormInputFieldChange(event, "USERNAME") }}
                        id="login-username-input"
                        type="text"/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label  htmlFor="login-password-input">Password</Form.Label>
                    <Form.Control
                        defaultValue={passwordInput}
                        onChange={(event: SyntheticEvent) => { handleNoteFormInputFieldChange(event, "PASSWORD") }}
                        id="login-password-input"
                        type="password" />
                </Form.Group>
                <Button
                    onClick={handleFormSubmit}
                    variant="primary"
                    type="submit"
                >Log In</Button>
            </Form>
        ) : props.includeOptionalButton ? (
            // isolated = not in modal; e.g. no user is logged in
            <div className="form-container-isolated">
                <h2 className="form-title">Log Into Your Account</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="username-input">Username</label>
                            <input
                                placeholder="Username"
                                type="text"
                                id="username-input"
                                value={usernameInput}
                                onChange={(event: SyntheticEvent) => { handleNoteFormInputFieldChange(event, "USERNAME") }}/>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="password-input">Password</label>
                            <input
                                placeholder="Password"
                                type="password"
                                id="password-input"
                                value={passwordInput}
                                onChange={(event: SyntheticEvent) => { handleNoteFormInputFieldChange(event, "PASSWORD") }}/>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-input-container">
                        <div className="form-button-group">
                            <input onClick={handleFormSubmit} type="submit" value="Log in" />
                        </div>
                        </div>
                    </div>

                    {/* optional switch button between login/signup forms */}
                    <div className="form-row">
                        <div className="form-input-container">
                            <button
                                className="form-type-change-btn"
                                onClick={props.handleOnOptionalBtnClick}
                            >{props.optionalBtnText}</button> 
                        </div>
                    </div>
                </form>
            </div>
        ) : (
            // isolated = not in modal; e.g. no user is logged in
            <div className="form-container-isolated">
                <h2 className="form-title">Log Into Your Account</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="username-input">Username</label>
                            <input
                                placeholder="Username"
                                type="text"
                                id="username-input"
                                value={usernameInput}
                                onChange={(event: SyntheticEvent) => { handleNoteFormInputFieldChange(event, "USERNAME") }}/>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="password-input">Password</label>
                            <input
                                placeholder="Password"
                                type="password"
                                id="password-input"
                                value={passwordInput}
                                onChange={(event: SyntheticEvent) => { handleNoteFormInputFieldChange(event, "PASSWORD") }}/>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-input-container">
                        <div className="form-button-group">
                            <input onClick={handleFormSubmit} type="submit" value="Log in" />
                        </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    );
}

export default UserLoginForm;