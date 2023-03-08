import React, { Fragment, SyntheticEvent, useState } from "react";

// Type imports
import { AlertTypesEnum } from "../../types";

// Redux imports
import { useAppDispatch } from "../../redux/hooks";
import { add as addAlert,  } from "../../redux/alertListSlice";

// Helper functions
import helper from '../../helper';
import apiUrls from "../../apiRoutes";

// App component imports
// [...]

// Bootstrap imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';

import { IonIcon } from "react-ion-icon";

enum FormInputStatesEnum
{
    INITIAL = 0,
    ERROR,
    VALID,
    ERROR_TO_VALID
}

enum LanguagesEnum
{
    ENGLISH = "en",
    POLISH = "pl"
}

const formInputValidationMessages =
{
    usernameRequired:
    {
        en: "The username field is required.",
        pl: "Pole nazwy użytkownika jest wymagane."
    },
    usernameExists:
    {
        en: "This username already exists.",
        pl: "Ta nazwa użytkownika jest już zajęta."
    },
    passwordRequired: {
        en: "Password is required",
        pl: "Hasło jest wymagane"
    },
    passwordTooShort: {
        en: "Password is too short (at least 6 characters)",
        pl: "Hasło jest zbyt krótkie (co najmniej 6 znaków)"
    },
    passwordConfirmationRequired: {
        en: "Password confirmation is required",
        pl: "Potwierdzenie hasła jest wymagane"
    },
    passwordsDontMatch: {
        en: "Passwords don't match",
        pl: "Hasła się nie zgadzają"
    },
    mainPasswordInvalid: {
        en: "Main password field is invalid",
        pl: "Hasło w głównym polu jest niepoprawne"
    },
}

let g_language: LanguagesEnum;
// g_language = LanguagesEnum.POLISH;
g_language = LanguagesEnum.ENGLISH;

function UserRegiserForm(props: any)
{
    const dispatch = useAppDispatch();
    const [usernameInput, setUsernameInput] = useState<string>("");
    const [passwordInput, setPasswordInput] = useState<string>("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState<string>("");


    // Username validation
    const [isUsernameFieldValid, setIsUsernameFieldValid] = useState<boolean>(true);
    const [
        usernameFormFieldErrorMsg,
        setUsernameFormFieldErrorMsg
    ] = useState<string>("");

    const [usernameInputState, setUsernameInputState] =
        useState<FormInputStatesEnum>(FormInputStatesEnum.INITIAL);


    // Password validation
    const [passwordInputState, setPasswordInputState] =
        useState<FormInputStatesEnum>(FormInputStatesEnum.INITIAL);
    
    const [
            passwordFormFieldErrorMsg,
            setPasswordFormFieldErrorMsg
    ] = useState<string>("");


    // Confirm Password validation
    const [confirmPasswordInputState, setConfirmPasswordInputState] =
        useState<FormInputStatesEnum>(FormInputStatesEnum.INITIAL);
    
    const [
            confirmPasswordFormFieldErrorMsg,
            setConfirmPasswordFormFieldErrorMsg
    ] = useState<string>("");
    


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

        let tmpUserState = true, tmpPswdState = true, tmpConfPswd = true;

        if (usernameInputState === FormInputStatesEnum.INITIAL)
        {
            setUsernameInputState(FormInputStatesEnum.ERROR);
            tmpUserState = false;
            setUsernameFormFieldErrorMsg(
                formInputValidationMessages.usernameRequired[g_language]
            );
        }
        if (passwordInputState === FormInputStatesEnum.INITIAL)
        {
            setPasswordInputState(FormInputStatesEnum.ERROR);
            tmpPswdState = false;
            setPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordRequired[g_language]
            );
        }
        if (confirmPasswordInputState === FormInputStatesEnum.INITIAL)
        {
            setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
            tmpConfPswd = false;
            setConfirmPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordConfirmationRequired[g_language]
            );
        }

        // console.log(tmpUserState);
        // console.log(tmpPswdState);
        // console.log(tmpConfPswd);

        // console.log(usernameInputState);
        // console.log(passwordInputState);
        // console.log(confirmPasswordInputState);


        if ((usernameInputState === FormInputStatesEnum.ERROR || !tmpUserState) ||
            (passwordInputState === FormInputStatesEnum.ERROR || !tmpPswdState) ||
            (confirmPasswordInputState === FormInputStatesEnum.ERROR || !tmpConfPswd))
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Error,
                message: "at least one form field is invalid"
            };
            dispatch(addAlert(alert));
        }
        else
        {
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
                const response = await fetch(apiUrls.singup, init);
                // if (!response.ok) throw new Error(`Couldn't reach ${url}`);
                if (response.status === 401) alertType = AlertTypesEnum.Error;
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
                    type: AlertTypesEnum.Error,
                    message: error.message
                };
                dispatch(addAlert(alert));
            }
            finally
            {
                setUsernameInput("");
                setPasswordInput("");
                setConfirmPasswordInput("");
                setUsernameInputState(FormInputStatesEnum.INITIAL);
                setPasswordInputState(FormInputStatesEnum.INITIAL);
                setConfirmPasswordInputState(FormInputStatesEnum.INITIAL);
            }
        }
    }

    const handleToggleFieldInvalid = (ev: SyntheticEvent) =>
    {
        ev.preventDefault();
        setIsUsernameFieldValid(!isUsernameFieldValid);
    }

    const isUsernameAvailable = async (username: string): Promise<boolean> =>
    {
        // if empty string, then don't even bother sending an API request
        if (!username) return false;

        const url = apiUrls.isUsernameAvailable + username;

        const init = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            const data = await response.json();
            return data.responseData.isUsernameAvailable;
        }
        catch (error: any)
        {
            console.log(error.message);
            return false;
        }
    }

    const validateUsernameInput = async () =>
    {
        const isAvailable = await isUsernameAvailable(usernameInput);
        if (usernameInput !== "" && isAvailable)
        {
            setIsUsernameFieldValid(true);
            setUsernameInputState(FormInputStatesEnum.VALID);
        }
        else
        {
            setIsUsernameFieldValid(false);
            setUsernameInputState(FormInputStatesEnum.ERROR);
            if (usernameInput === "")
            {
                setUsernameFormFieldErrorMsg(
                    formInputValidationMessages.usernameRequired[g_language]
                );
            }
            else if (!isAvailable)
            {
                setUsernameFormFieldErrorMsg(
                    formInputValidationMessages.usernameExists[g_language]
                );
            }
        }
    }

    const validatePasswordInput = () =>
    {
        if (!passwordInput)
        {
            setPasswordInputState(FormInputStatesEnum.ERROR);
            setPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordRequired[g_language]
            );
            if (confirmPasswordInputState === FormInputStatesEnum.VALID)
            {
                setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
                setConfirmPasswordFormFieldErrorMsg(
                    formInputValidationMessages.mainPasswordInvalid[g_language]
                );
                setConfirmPasswordInput("");
            }
        }
        else if (passwordInput.length < 6)
        {
            setPasswordInputState(FormInputStatesEnum.ERROR);
            setPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordTooShort[g_language]
            );
            if (confirmPasswordInputState === FormInputStatesEnum.VALID)
            {
                setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
                setConfirmPasswordFormFieldErrorMsg(
                    formInputValidationMessages.mainPasswordInvalid[g_language]
                );
                setConfirmPasswordInput("");
            }
        }
        else
        {
            setPasswordInputState(FormInputStatesEnum.VALID);
            if (confirmPasswordInputState === FormInputStatesEnum.ERROR)
            {
                setConfirmPasswordFormFieldErrorMsg(
                    formInputValidationMessages.passwordsDontMatch[g_language]
                );
                if (passwordInput === confirmPasswordInput)
                {
                    setConfirmPasswordInputState(FormInputStatesEnum.VALID);
                }
            }
            else if (confirmPasswordInputState === FormInputStatesEnum.VALID &&
                passwordInput !== confirmPasswordInput)
            {
                setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
                setConfirmPasswordFormFieldErrorMsg(
                    formInputValidationMessages.passwordsDontMatch[g_language]
                );
            }
        }
    }

    const validateConfirmPasswordInput = () =>
    {
        if (!confirmPasswordInput)
        {
            setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
            setConfirmPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordConfirmationRequired[g_language]
            );
        }
        else if (passwordInputState === FormInputStatesEnum.ERROR)
        {
            setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
            setConfirmPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordsDontMatch[g_language]
            );
        }
        else if (confirmPasswordInput !== passwordInput)
        {
            setConfirmPasswordInputState(FormInputStatesEnum.ERROR);
            setConfirmPasswordFormFieldErrorMsg(
                formInputValidationMessages.passwordsDontMatch[g_language]
            );
        }
        else
        {
            setConfirmPasswordInputState(FormInputStatesEnum.VALID);
        }
    }

    const createFormInputErrorMessage = (errorMsg: string) =>
    {
        return (
            <div
                className={"form__error-message-container"}
            >
                <IonIcon name="warning-outline" />
                <p
                    className="form__error-message"
                >{errorMsg}</p>
            </div>
        );
    }

    const handleFormInputBlur = async (
        event: SyntheticEvent, inputName: string) =>
    {
        if (inputName === "USERNAME")
        {
            await validateUsernameInput();
        }
        else if (inputName === "PASSWORD")
        {
            validatePasswordInput();
        }
        else if (inputName === "CONFIRM_PASSWORD")
        {
            validateConfirmPasswordInput();
        }
    }

    const getInputClassStringBasedOnItsState = (inputState: FormInputStatesEnum) =>
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
            <h2 className="form__title">Create New Account</h2>
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
                    // className={isUsernameFieldValid ?
                    //     "form__input-field" :
                    //     "form__input-field form__input-field--invalid"
                    // }
                    className={getInputClassStringBasedOnItsState(usernameInputState)}
                    value={usernameInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(event, "USERNAME")
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, "USERNAME")
                    }}
                />
                {/* <div className={isUsernameFieldValid ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }> */}
                <div className={
                    (usernameInputState === FormInputStatesEnum.VALID) ||
                    (usernameInputState === FormInputStatesEnum.INITIAL) ?
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
                        >{usernameFormFieldErrorMsg}</p>
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
                    type="text"
                    id="password-input"
                    name="password-input"
                    className={getInputClassStringBasedOnItsState(passwordInputState)}
                    // className="form__input-field"
                    // className="form__input-field form__input-field--validated"
                    value={passwordInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(event, "PASSWORD")
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, "PASSWORD")
                    }}
                />
                <div className={
                    (passwordInputState === FormInputStatesEnum.VALID) ||
                    (passwordInputState === FormInputStatesEnum.INITIAL) ?
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
                        >{passwordFormFieldErrorMsg}</p>
                    </div>
                </div>
            </div>

            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="confirm-password-input">Confirm Password</label>
                <input
                    required={true}
                    placeholder="Password"
                    type="text"
                    id="confirm-password-input"
                    name="confirm-password-input"
                    className={
                        getInputClassStringBasedOnItsState(
                            confirmPasswordInputState
                        )
                    }
                    // className="form__input-field"
                    value={confirmPasswordInput}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(event, "CONFIRM_PASSWORD")
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, "CONFIRM_PASSWORD")
                    }}
                />
                <div className={
                    (confirmPasswordInputState === FormInputStatesEnum.VALID) ||
                    (confirmPasswordInputState === FormInputStatesEnum.INITIAL) ?
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
                        >{confirmPasswordFormFieldErrorMsg}</p>
                    </div>
                </div>
            </div>

            <div className="form__button-group form__button-group--centered">
                <input
                    className="form__button daterange-picker__ok-button"
                    onClick={handleFormSubmit}
                    type="submit"
                    value="Sign up"
                />
                {/* <button
                    className="form__button daterange-picker__ok-button"
                    onClick={handleToggleFieldInvalid}
                >toggle field state</button> */}
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

export default UserRegiserForm;