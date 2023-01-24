import React, { useState, useEffect, SyntheticEvent } from 'react';

// Redux imports
import { useAppDispatch } from "../../redux/hooks";
import {
    add as addTag,
    edit as editTag,
    selectTagList
} from "../../redux/tagSlice";
import { add as addAlert } from "../../redux/alertListSlice";

// Type imports
import {
    ITag, TagFormInputsEnum, TagFormProps,
    IFormInput, FormInputStatesEnum,
    IAlert, AlertTypesEnum
} from "../../types";

// Helper imports
import helper from '../../helper';
import { validateDateAddedField } from "../notes/NoteForm";
import apiUrls from "../../apiRoutes";

// Third party imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { IonIcon } from "react-ion-icon";


function TagForm({ tagToEdit, onFormClose }: TagFormProps)
{
    const dispatch = useAppDispatch();
    const [formTitle, setFormTitle] = useState<string>("");

    const [nameInput, setNameInput] =
        useState<IFormInput>({
            value: "",
            state: FormInputStatesEnum.INITIAL,
            errorMsg: ""
        });

    const [dateAddedInput, setDateAddedInput] =
        useState<IFormInput>({
            value: "",
            state: FormInputStatesEnum.INITIAL,
            errorMsg: ""
        });

    useEffect(() =>
    {
        if (tagToEdit)
        {
            setNameInput({
                ...nameInput,
                value: tagToEdit.name
            });
            setDateAddedInput({
                ...dateAddedInput,
                value: tagToEdit.date_added
            });
            setFormTitle("Edit Tag");
        }
        else
        {
            setDateAddedInput({
                ...dateAddedInput,
                value: helper.getCurrentDateTimeString()
            });
            setFormTitle("Add New Tag");
        }
    }, []);

    function handleFormInputFieldChange(
        event: SyntheticEvent, fieldName: TagFormInputsEnum)
    {
        const inputValue = (event.target as HTMLInputElement).value;
        if (fieldName === TagFormInputsEnum.NAME)
        {
            setNameInput({
                ...nameInput,
                value: inputValue
            });
        }
        else if (fieldName === TagFormInputsEnum.DATE_ADDED)
        {
            setDateAddedInput({
                ...dateAddedInput,
                value: inputValue
            });
        }
    };

    const handleFormInputBlur = async (
        event: SyntheticEvent, input: TagFormInputsEnum) =>
    {
        let inputValue = (event.target as HTMLInputElement).value;
        if (input === TagFormInputsEnum.NAME)
        {
            if (!inputValue)
            {
                setNameInput({
                    ...nameInput,
                    state: FormInputStatesEnum.ERROR,
                    errorMsg: "Tag name is required."
                });
            }
            else if (!(await isTagAvailable(inputValue)))
            {
                setNameInput({
                    ...nameInput,
                    state: FormInputStatesEnum.ERROR,
                    errorMsg: "This tag already exists."
                });
            }
            else
            {
                setNameInput({
                    ...nameInput,
                    state: FormInputStatesEnum.VALID,
                    errorMsg: ""
                });
            }
        }
        else if (input === TagFormInputsEnum.DATE_ADDED)
        {
            validateDateAddedField(inputValue, dateAddedInput, setDateAddedInput);
        }
    };

    const isTagAvailable = async (tagName: string): Promise<boolean> =>
    {
        if (!tagName) return false;

        const url = `/api/is-tag-available/${tagName}`;

        const init = {
            method: "GET",
            headers: {
                'Content-Type': 'application/json'
            }
        };
        try
        {
            const response = await fetch(url, init);
            if (response.status !== 200) throw new Error("Response status is not 200");
            const data = await response.json();
            return data.responseData.isTagNameAvailable;
        }
        catch (error: any)
        {
            console.log(error.message);
            return false;
        }
    }

    async function handleFormSubmit(event: SyntheticEvent)
    {
        event.preventDefault();

        let tagToSubmit;
        let payload;

        let alert: IAlert;
        let currentNameState = true;
        let currentDateAddedState = true;

        // if submit button clicked with unchanged inputs
        // then perform validation for initial fields
        if ((nameInput.state === FormInputStatesEnum.INITIAL ||
            nameInput.state === FormInputStatesEnum.VALID) &&
            (!nameInput.value || !(await isTagAvailable(nameInput.value))))
        {
            setNameInput({
                ...nameInput,
                state: FormInputStatesEnum.ERROR,
                errorMsg: "Either tag name was not provided or this tag already exists."
            });
            currentNameState = false;
        }
        if (dateAddedInput.state === FormInputStatesEnum.INITIAL)
        {
            if(!validateDateAddedField(dateAddedInput.value, dateAddedInput, setDateAddedInput))
                currentDateAddedState = false;
        }


        // if any required form input field is incorrect
        if ((nameInput.state === FormInputStatesEnum.ERROR || !currentNameState) ||
            (dateAddedInput.state === FormInputStatesEnum.ERROR || !currentDateAddedState))
        {
            alert = 
            {
                id: (new Date()).getTime(),
                type: AlertTypesEnum.Error,
                message: "at least one form field is invalid"
            };
            dispatch(addAlert(alert));
        }
        else // all required fields are valid
        {
            if (tagToEdit)
            {
                tagToSubmit = {
                    id: tagToEdit.id,
                    name: nameInput.value,
                    date_added: dateAddedInput.value,
                };
                payload = JSON.stringify({ "tagToEdit": tagToSubmit });
                const init = {
                    method: "PUT",
                    body: payload,
                    headers: { "Content-Type": "application/json" }
                };
                const response = await fetch(apiUrls.editTag, init);
                // if (!response.ok) // ...
                const data = await response.json();

                dispatch(editTag(tagToSubmit));
            }
            else
            {
                tagToSubmit = {
                    name: nameInput.value,
                    date_added: dateAddedInput.value,
                };
                payload = JSON.stringify({ newTag: tagToSubmit });
                const init = {
                    method: "POST",
                    body: payload,
                    headers: { "Content-Type": "application/json" }
                };
                const response = await fetch(apiUrls.addTag, init);
                // if (!response.ok) // ...
                const data = await response.json();

                dispatch(addTag({
                    ...tagToSubmit,
                    id: data.responseData.id,
                }));
            }
        }
    }

    const handleCloseFormButtonClick = (event: SyntheticEvent) =>
    {
        event.preventDefault();
        onFormClose();
    };

    const getFormInputClassBasedOnItsState = (inputState: FormInputStatesEnum) =>
    {
        if (inputState === FormInputStatesEnum.INITIAL)
            return "form__input-field";
        else if (inputState === FormInputStatesEnum.ERROR)
            return "form__input-field form__input-field--invalid";
        else if (inputState === FormInputStatesEnum.VALID)
            return "form__input-field form__input-field--validated";
        else if (inputState === FormInputStatesEnum.WARNING)
            return "form__input-field form__input-field--warning";
    }

    return (
        <form>
            <h2 className="form__title">{formTitle}</h2>
            <div className="form__container">
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="tag-name-input">Name</label>
                <input
                    required={true}
                    type="text"
                    id="tag-name-input"
                    name="tag-name-input"
                    className={
                        getFormInputClassBasedOnItsState(nameInput.state)
                    }
                    value={nameInput.value}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(
                            event, TagFormInputsEnum.NAME
                        );
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, TagFormInputsEnum.NAME)
                    }}
                />
                <div className={
                    (nameInput.state === FormInputStatesEnum.VALID) ||
                    (nameInput.state === FormInputStatesEnum.INITIAL) ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }>
                    <div
                        className={nameInput.state !== FormInputStatesEnum.ERROR ?
                            "form__error-message-container" :
                            "form__error-message-container " +
                            "form__error-message-container--invalid"
                        }
                    >
                        <IonIcon name="warning-outline" />
                        <p
                            className="form__error-message"
                        >{nameInput.errorMsg}</p>
                    </div>
                </div>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="tag-dateadded-input">Date Added</label>
                <input
                    required={true}
                    type="text"
                    id="tag-dateadded-input"
                    name="tag-dateadded-input"
                    className={
                        getFormInputClassBasedOnItsState(dateAddedInput.state)
                    }
                    value={dateAddedInput.value}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(
                            event, TagFormInputsEnum.DATE_ADDED
                        );
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, TagFormInputsEnum.DATE_ADDED)
                    }}
                />
                <div className={
                    (dateAddedInput.state === FormInputStatesEnum.VALID) ||
                    (dateAddedInput.state === FormInputStatesEnum.INITIAL) ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }>
                    <div
                        className={dateAddedInput.state !== FormInputStatesEnum.ERROR ?
                            "form__error-message-container" :
                            "form__error-message-container " +
                            "form__error-message-container--invalid"
                        }
                    >
                        <IonIcon name="warning-outline" />
                        <p
                            className="form__error-message"
                        >{dateAddedInput.errorMsg}</p>
                    </div>
                </div>
            </div>
            <div className="form__button-group">
                <button
                    className="form__button daterange-picker__ok-button"
                    type="submit"
                    onClick={handleFormSubmit}
                >submit</button>
                <button
                    className="form__button daterange-picker__ok-button"
                    onClick={handleCloseFormButtonClick}
                >close</button>
            </div>
            </div>
        </form>
    );
}

export default TagForm;