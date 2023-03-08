import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';

// Redux imports
import { useAppDispatch } from "../../redux/hooks";
import { add as addAlert } from "../../redux/alertListSlice";

// Type imports
import {
    ICategory, CategoryFormInputsEnum,
    CategoryFormProps, IAlert, AlertTypesEnum
} from "../../types";
import apiUrls from "../../apiRoutes";

// Helper imports
import helper from '../../helper';
import { validateDateAddedField } from "../notes/NoteForm";

// Third party imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { IonIcon } from "react-ion-icon";


enum FormInputStatesEnum
{
    INITIAL = 0,
    ERROR,
    VALID,
    WARNING
}

interface IInput
{
    value: string;
    state: FormInputStatesEnum;
    errorMsg: string;
};

function CategoryForm({
    categoryToEdit, onFormSubmit, onFormClose
}: CategoryFormProps)
{
    const dispatch = useAppDispatch();
    const [formTitle, setFormTitle] = useState<string>("");

    const [nameInput, setNameInput] =
        useState<IInput>({
            value: "",
            state: FormInputStatesEnum.INITIAL,
            errorMsg: ""
        });

    const [dateAddedInput, setDateAddedInput] =
        useState<IInput>({
            value: "",
            state: FormInputStatesEnum.INITIAL,
            errorMsg: ""
        });

    useEffect(() =>
    {
        if (categoryToEdit)
        {
            setNameInput({
                ...nameInput,
                value: categoryToEdit.name
            });
            setDateAddedInput({
                ...dateAddedInput,
                value: categoryToEdit.date_added
            });
            setFormTitle("Edit Category");
        }
        else
        {
            setDateAddedInput({
                ...dateAddedInput,
                value: helper.getCurrentDateTimeString()
            });
            setFormTitle("Add New Category");
        }
    }, []);

    function handleFormInputFieldChange(
        event: SyntheticEvent, fieldName: CategoryFormInputsEnum)
    {
        const inputValue = (event.target as HTMLInputElement).value;
        if (fieldName === CategoryFormInputsEnum.NAME)
        {
            setNameInput({
                ...nameInput,
                value: inputValue
            });
        }
        else if (fieldName === CategoryFormInputsEnum.DATE_ADDED)
        {
            setDateAddedInput({
                ...dateAddedInput,
                value: inputValue
            });
        }
    };

    const handleFormInputBlur = async (
        event: SyntheticEvent, input: CategoryFormInputsEnum) =>
    {
        let inputValue = (event.target as HTMLInputElement).value;
        if (input === CategoryFormInputsEnum.NAME)
        {
            if (!inputValue)
            {
                setNameInput({
                    ...nameInput,
                    state: FormInputStatesEnum.ERROR,
                    errorMsg: "Category name is required."
                });
            }
            else if (!(await isCategoryAvailable(inputValue)))
            {
                setNameInput({
                    ...nameInput,
                    state: FormInputStatesEnum.ERROR,
                    errorMsg: "This category already exists."
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
        else if (input === CategoryFormInputsEnum.DATE_ADDED)
        {
            validateDateAddedField(inputValue, dateAddedInput, setDateAddedInput);
        }
    };

    const isCategoryAvailable = async (categoryName: string): Promise<boolean> =>
    {
        if (!categoryName) return false;

        const url = apiUrls.isCategoryAvailable + categoryName;

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
            return data.responseData.isCategoryNameAvailable;
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

        let alert: IAlert;
        let currentNameState = true;
        let currentDateAddedState = true;

        // if submit button clicked with unchanged inputs
        // then perform validation for initial fields
        if ((nameInput.state === FormInputStatesEnum.INITIAL ||
            nameInput.state === FormInputStatesEnum.VALID) &&
            (!nameInput.value || !(await isCategoryAvailable(nameInput.value))))
        {
            setNameInput({
                ...nameInput,
                state: FormInputStatesEnum.ERROR,
                errorMsg: "Either category name was not provided or this category already exists."
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
            if (categoryToEdit)
            {
                const categoryToEditSubmitted = {
                    id: categoryToEdit.id,
                    name: nameInput.value,
                    date_added: dateAddedInput.value
                } as ICategory;
                onFormSubmit(categoryToEditSubmitted);
            }
            else
            {
                onFormSubmit({
                    name: nameInput.value,
                    date_added: dateAddedInput.value
                } as ICategory);
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
                    htmlFor="category-name-input">Name</label>
                <input
                    required={true}
                    type="text"
                    id="category-name-input"
                    name="category-name-input"
                    className={
                        getFormInputClassBasedOnItsState(nameInput.state)
                    }
                    value={nameInput.value}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(
                            event, CategoryFormInputsEnum.NAME
                        );
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, CategoryFormInputsEnum.NAME)
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
                    htmlFor="category-dateadded-input">Date Added</label>
                <input
                    required={true}
                    type="text"
                    id="category-dateadded-input"
                    name="category-dateadded-input"
                    className={
                        getFormInputClassBasedOnItsState(dateAddedInput.state)
                    }
                    value={dateAddedInput.value}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(
                            event, CategoryFormInputsEnum.DATE_ADDED
                        );
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, CategoryFormInputsEnum.DATE_ADDED)
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

export default CategoryForm;