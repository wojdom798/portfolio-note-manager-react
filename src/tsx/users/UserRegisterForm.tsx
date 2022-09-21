import React, { SyntheticEvent, useState } from "react";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import helper from '../../helper';

import { useAppDispatch } from "../../redux/hooks";
import { add as addAlert,  } from "../../redux/alertListSlice";
import { AlertTypes } from "../alerts/alertTypes";

function UserRegiserForm(props: any)
{
    const dispatch = useAppDispatch();
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");

    function handleFormInputFieldChange(event: any, fieldName: any)
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
        else if (fieldName === "CONFIRM_PASSWORD")
        {
            if (typeof event.target.value === "string")
                setConfirmPasswordInput(event.target.value);
        }
    };

    async function handleFormSubmit(event: any)
    {
        event.preventDefault();
        let alert;

        if (passwordInput !== confirmPasswordInput)
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypes.Error,
                message: "passwords don't match"
            };
            dispatch(addAlert(alert));
        }
        else
        {
            const url = `/api/auth/sign-up`;

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
    }

    return (
        !props.isolated ? (
            <Form>
                <Form.Group className="mb-3">
                    <Form.Label htmlFor="login-username-input">Username</Form.Label>
                    <Form.Control
                        defaultValue={usernameInput}
                        onChange={(event: any) => { handleFormInputFieldChange(event, "USERNAME") }}
                        id="login-username-input"
                        type="text"/>
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label  htmlFor="login-password-input">Password</Form.Label>
                    <Form.Control
                        defaultValue={passwordInput}
                        onChange={(event: any) => { handleFormInputFieldChange(event, "PASSWORD") }}
                        id="login-password-input"
                        type="password" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label  htmlFor="login-repeatpassword-input">Confirm Password</Form.Label>
                    <Form.Control
                        defaultValue={confirmPasswordInput}
                        onChange={(event: any) => { handleFormInputFieldChange(event, "CONFIRM_PASSWORD") }}
                        id="login-repeatpassword-input"
                        type="password" />
                </Form.Group>
                <Button
                    onClick={handleFormSubmit}
                    variant="primary"
                    type="submit"
                >Sign Up</Button>
            </Form>
        ) : props.includeOptionalButton ? (
            // isolated = not in modal; e.g. no user is logged in
            <div className="form-container-isolated">
                <h2 className="form-title">Create New Account</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="username-input">Username</label>
                            <input
                                placeholder="Username"
                                type="text"
                                id="username-input"
                                value={usernameInput}
                                onChange={(event: SyntheticEvent) => { handleFormInputFieldChange(event, "USERNAME") }}/>
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
                                onChange={(event: SyntheticEvent) => { handleFormInputFieldChange(event, "PASSWORD") }}/>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="confirm-password-input">Confirm Password</label>
                            <input
                                placeholder="Confirm Password"
                                type="password"
                                id="confirm-password-input"
                                value={confirmPasswordInput}
                                onChange={(event: SyntheticEvent) => { handleFormInputFieldChange(event, "CONFIRM_PASSWORD") }}/>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-input-container">
                        <div className="form-button-group">
                            <input onClick={handleFormSubmit} type="submit" value="Sign up" />
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
                <h2 className="form-title">Create New Account</h2>
                <form onSubmit={handleFormSubmit}>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="username-input">Username</label>
                            <input
                                placeholder="Username"
                                type="text"
                                id="username-input"
                                value={usernameInput}
                                onChange={(event: SyntheticEvent) => { handleFormInputFieldChange(event, "USERNAME") }}/>
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
                                onChange={(event: SyntheticEvent) => { handleFormInputFieldChange(event, "PASSWORD") }}/>
                        </div>
                    </div>
                    <div className="form-row">
                        <div className="form-input-container">
                            <label htmlFor="confirm-password-input">Confirm Password</label>
                            <input
                                placeholder="Password"
                                type="password"
                                id="confirm-password-input"
                                value={confirmPasswordInput}
                                onChange={(event: SyntheticEvent) => { handleFormInputFieldChange(event, "CONFIRM_PASSWORD") }}/>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-input-container">
                        <div className="form-button-group">
                            <input onClick={handleFormSubmit} type="submit" value="Sign up" />
                        </div>
                        </div>
                    </div>
                </form>
            </div>
        )
    );
}

export default UserRegiserForm;