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
import { fetchNotes } from "../../redux/noteListSlice";
import { fetchCategories } from "../../redux/categorySlice";
import { fetchTags } from "../../redux/tagSlice";
import { fetchMaxDateRange } from "../../redux/filterSlice";


// Helper functions
import helper from '../../helper';
import {
    setUserInStorage,
    setSessionExpirationDateInLocalStorage
} from "../../localStorageUtils";
import apiUrls from "../../apiRoutes";

// App component imports
// [...]

// Third party component imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { IonIcon } from "react-ion-icon";


enum LoginFormInputsEnum
{
    USERNAME = "USERNAME",
    PASSWORD = "PASSWORD"
};

enum FormInputStatesEnum
{
    INITIAL = 0,
    ERROR,
    VALID
}

interface IInputValidation
{
    state: FormInputStatesEnum;
    errorMsg: string;
};

function UserLoginForm(props: any)
{
    const dispatch = useAppDispatch();
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");

    const [usernameValidation, setUsernameValidation] =
        useState<IInputValidation>(
            {
                state: FormInputStatesEnum.INITIAL,
                errorMsg: ""
            });

    const [passwordValidation, setPasswordValidation] =
        useState<IInputValidation>(
            {
                state: FormInputStatesEnum.INITIAL,
                errorMsg: ""
            });

    function handleFormInputFieldChange(
        event: SyntheticEvent,
        fieldName: LoginFormInputsEnum)
    {
        const inputValue = (event.target as HTMLInputElement).value;
        if (fieldName === LoginFormInputsEnum.USERNAME)
        {
            setUsernameValidation({
                state: FormInputStatesEnum.INITIAL,
                errorMsg: ""
            });
            if (typeof inputValue === "string")
                setUsernameInput(inputValue);
        }
        else if (fieldName === LoginFormInputsEnum.PASSWORD)
        {
            setPasswordValidation({
                state: FormInputStatesEnum.INITIAL,
                errorMsg: ""
            });
            if (typeof inputValue === "string")
                setPasswordInput(inputValue);
        }
    };

    async function handleFormSubmit(event: SyntheticEvent)
    {
        event.preventDefault();
        
        let alert;

        const userToLogIn = {
            username: usernameInput,
            password: passwordInput
        };

        const init = {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userToLogIn),
            mode: "cors" as RequestMode
        };
        try
        {
            let alertType: AlertTypesEnum = AlertTypesEnum.Success;
            const response = await fetch(apiUrls.login, init);
            // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
            const data = await response.json();
            if (response.status === 401) // unauthorized
            {
                alertType = AlertTypesEnum.Error;

                const validationErrorObj = {
                    state: FormInputStatesEnum.ERROR,
                    errorMsg: "Incorrect username and/or password."
                };
                setUsernameValidation(validationErrorObj);
                setPasswordValidation(validationErrorObj);
            }
            else
            {
                const user = { 
                    id: data.user.id,
                    username: data.user.username
                } as { id: number, username: string };

                setUserInStorage(user); // save logged-in user to local storage
                setSessionExpirationDateInLocalStorage(new Date(`${data.sessionExpirationDate}`));
                dispatch(setUser(user));

                const validationSuccessObj = {
                    state: FormInputStatesEnum.VALID,
                    errorMsg: ""
                };
                setUsernameValidation(validationSuccessObj);
                setPasswordValidation(validationSuccessObj);

                await dispatch(fetchMaxDateRange);
                await dispatch(fetchCategories);
                await dispatch(fetchTags);
                await dispatch(fetchNotes);

                props.onUserLoggedIn(data.username);
            }
            
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

    const getFormInputClassBasedOnItsState = (inputState: FormInputStatesEnum) =>
    {
        if (inputState === FormInputStatesEnum.INITIAL)
            return "form__input-field";
        else if (inputState === FormInputStatesEnum.ERROR)
            return "form__input-field form__input-field--invalid";
        else if (inputState === FormInputStatesEnum.VALID)
            return "form__input-field form__input-field--validated";
    }


    return (
        <div className="form__padding-container">
        <form
            className="form__main-container"
        >
            <h2 className="form__title">Log Into Your Account</h2>
            <div className="form__container">
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="username-input">Username</label>
                <input
                    required={true}
                    placeholder="Username"
                    type="text"
                    id="username-input"
                    name="username-input"
                    className={getFormInputClassBasedOnItsState(usernameValidation.state)}
                    value={usernameInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(event, LoginFormInputsEnum.USERNAME)
                    }}
                    // onBlur={(event: SyntheticEvent) => {
                    //     handleFormInputBlur(event, LoginFormInputsEnum.USERNAME)
                    // }}
                />
                <div className={
                    (usernameValidation.state === FormInputStatesEnum.VALID) ||
                    (usernameValidation.state === FormInputStatesEnum.INITIAL) ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }>
                    <div
                        className={"form__error-message-container"}
                    >
                        <IonIcon name="warning-outline" />
                        <p
                            className="form__error-message"
                        >{usernameValidation.errorMsg}</p>
                    </div>
                </div>
                
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="password-input">Password</label>
                <input
                    required={true}
                    placeholder="Password"
                    type="password"
                    id="password-input"
                    name="password-input"
                    className={getFormInputClassBasedOnItsState(passwordValidation.state)}
                    value={passwordInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(event, LoginFormInputsEnum.PASSWORD)
                    }}
                    // onBlur={(event: SyntheticEvent) => {
                    //     handleFormInputBlur(event, LoginFormInputsEnum.PASSWORD)
                    // }}
                />
                <div className={
                    (passwordValidation.state === FormInputStatesEnum.VALID) ||
                    (passwordValidation.state === FormInputStatesEnum.INITIAL) ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }>
                    <div
                        className={"form__error-message-container"}
                    >
                        <IonIcon name="warning-outline" />
                        <p
                            className="form__error-message"
                        >{passwordValidation.errorMsg}</p>
                    </div>
                </div>
            </div>

            <div className="form__button-group form__button-group--centered">
                <input
                    className="form__button daterange-picker__ok-button"
                    onClick={handleFormSubmit}
                    type="submit"
                    value={"Log in"}
                />
            </div>

            <div className="form-row">
                <div className="form-input-container">
                    <button
                        className="form-type-change-btn"
                        onClick={props.handleOnOptionalBtnClick}
                    >{props.optionalBtnText}</button> 
                </div>
            </div>
            </div>
        </form>
        </div>
    );
}

export default UserLoginForm;