import React, { useState, useEffect, Fragment, SyntheticEvent } from 'react';
import { createPortal } from "react-dom";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectCategoryList } from "../../redux/categorySlice";
import { add as addAlert } from "../../redux/alertListSlice";

// Type imports
import { NoteFormProps, AlertTypesEnum, ICategory, IAlert } from "../../types";

// Helper funtions / Utils
import helper from '../../helper';

// App component imports
// [...]

// Third party imports
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { IonIcon } from "react-ion-icon";


enum NoteFormInputsEnum
{
    TITLE = "TITLE",
    CONTENTS = "CONTENTS",
    DATE_ADDED = "DATE_ADDED",
    CATEGORY = "CATEGORY",
};

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

export const validateDateAddedField = (
    dateAddedStr: string,
    dateAddedInput: IInput,
    setDateAddedInput: React.Dispatch<React.SetStateAction<IInput>>
    ): boolean =>
{
    const dateRegex = new RegExp(/^\d+-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/);
    if (!dateAddedStr)
    {
        setDateAddedInput({
            ...dateAddedInput,
            state: FormInputStatesEnum.ERROR,
            errorMsg: "This field is required. Correct format: YYYY-MM-DD hh:mm:ss"
        });
        return false;
    }
    else if (!dateRegex.test(dateAddedStr))
    {
        setDateAddedInput({
            ...dateAddedInput,
            state: FormInputStatesEnum.ERROR,
            errorMsg: "Incorrect date format. This format is correct: YYYY-MM-DD hh:mm:ss"
        });
        return false;
    }
    else if (!isDateTimeStringValid(dateAddedStr))
    {
        setDateAddedInput({
            ...dateAddedInput,
            state: FormInputStatesEnum.ERROR,
            errorMsg: "Incorrect date or time. Make sure that month is within 1 and 12, day number is correct for given month, hours are within 0 and 23, minutes and seconds are within 0 and 59"
        });
        return false;
    }
    else // field is valid
    {
        setDateAddedInput({
            ...dateAddedInput,
            state: FormInputStatesEnum.VALID,
            errorMsg: ""
        });
        return true;
    }
}

export const isDateTimeStringValid = (dtStr: string): boolean =>
{
    const dateTimeRegex = new RegExp(/^\d+-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}$/);
    if (!dateTimeRegex.test(dtStr)) return false

    const date = dtStr.split(" ")[0];
    const time = dtStr.split(" ")[1];

    const year = Number(date.split("-")[0]);
    const month = Number(date.split("-")[1]);
    const day = Number(date.split("-")[2]);

    const hour = Number(time.split(":")[0]);
    const minutes = Number(time.split(":")[1]);
    const seconds = Number(time.split(":")[2]);

    if ((month <= 0) || (month > 12)) return false;

    const numOfDaysinMonth = helper.getNumberOfDaysInMonth(year, month);
    if ((day <= 0) || (day > numOfDaysinMonth)) return false;

    if ((hour < 0) || (hour >= 24)) return false;
    if ((minutes < 0) || (minutes >= 60)) return false;
    if ((seconds < 0) || (seconds >= 60)) return false;

    return true;
}


function NoteForm({
    noteToEdit, onEditNoteFormSubmit,
    updateNoteList, onCloseButtonClick
}: NoteFormProps)
{
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategoryList);
    const [formTitle, setFormTitle] = useState<string>("");

    // form inputs
    const [titleInput, setTitleInput] =
        useState<IInput>({
            value: "",
            state: FormInputStatesEnum.INITIAL,
            errorMsg: ""
        });

    const [contentsInput, setContentsInput] =
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

    const [categoryInput, setCategoryInput] =
        useState<number>(Object.values(categories).length ?
        Object.values(categories)[0].id : -1);

    useEffect(() =>
    {
        if (noteToEdit)
        {
            setTitleInput({
                ...titleInput,
                value: noteToEdit.title
            });
            setContentsInput({
                ...contentsInput,
                value: noteToEdit.contents
            });
            setDateAddedInput({
                ...dateAddedInput,
                value: noteToEdit.date_added
            });

            setCategoryInput(noteToEdit.category_id);
            setFormTitle("Edit Note");
        }
        else
        {
            setDateAddedInput({
                ...dateAddedInput,
                value: helper.getCurrentDateTimeString()
            });
            setFormTitle("Add New Note");
        }
    }, []);

    function handleFormInputFieldChange(
        event: SyntheticEvent,
        fieldName: NoteFormInputsEnum)
    {
        // console.log(event.target.value + "; fieldName= " + fieldName);
        const inputValue = (event.target as HTMLInputElement).value;
        if (fieldName === NoteFormInputsEnum.TITLE)
        {
            if (typeof inputValue === "string")
                setTitleInput({ ...titleInput, value: inputValue });
        }
        else if (fieldName === NoteFormInputsEnum.CONTENTS)
        {
            setContentsInput({ ...contentsInput, value: inputValue });
        }
        else if (fieldName === NoteFormInputsEnum.DATE_ADDED)
        {
            setDateAddedInput({ ...dateAddedInput, value: inputValue });
        }
        else if (fieldName === NoteFormInputsEnum.CATEGORY)
        {
            const valueAsNumber = Number(inputValue);
            if (!isNaN(valueAsNumber))
                setCategoryInput(valueAsNumber);
        }
    };

    const handleFormInputBlur = (
        event: SyntheticEvent, input: NoteFormInputsEnum) =>
    {
        let inputValue = (event.target as HTMLInputElement).value;
        if (input === NoteFormInputsEnum.TITLE)
        {
            if (!inputValue)
            {
                setTitleInput({
                    ...titleInput,
                    state: FormInputStatesEnum.WARNING,
                    errorMsg: "Title can be left out. Was this your intention?"
                });
            }
            else
            {
                setTitleInput({
                    ...titleInput,
                    state: FormInputStatesEnum.VALID,
                    errorMsg: ""
                });
            }
        }
        else if (input === NoteFormInputsEnum.CONTENTS)
        {
            if (!inputValue)
            {
                setContentsInput({
                    ...contentsInput,
                    state: FormInputStatesEnum.WARNING,
                    errorMsg: "Contents can be left out. Was this your intention?"
                });
            }
            else
            {
                setContentsInput({
                    ...contentsInput,
                    state: FormInputStatesEnum.VALID,
                    errorMsg: ""
                });
            }
        }
        else if (input === NoteFormInputsEnum.DATE_ADDED)
        {
            validateDateAddedField(inputValue, dateAddedInput, setDateAddedInput);
        }
    };

    function handleFormSubmit(event: SyntheticEvent)
    {
        event.preventDefault();
        // console.log("Form submit:");
        // console.log("title= " + titleInput);
        // console.log("contents= " + contentsInput);

        let alert: IAlert;
        let currentTitleState = true;
        let currentContentsState = true;
        let currentDateAddedState = true;

        if (titleInput.state === FormInputStatesEnum.INITIAL)
        {
            setTitleInput({
                ...titleInput,
                state: FormInputStatesEnum.VALID // title is not required
            });
        }
        if (contentsInput.state === FormInputStatesEnum.INITIAL)
        {
            setContentsInput({
                ...contentsInput,
                state: FormInputStatesEnum.VALID // contents field is not required
            });
        }
        if (dateAddedInput.state === FormInputStatesEnum.INITIAL)
        {
            if(!validateDateAddedField(dateAddedInput.value, dateAddedInput, setDateAddedInput))
                currentDateAddedState = false;
        }

        if ((titleInput.state === FormInputStatesEnum.ERROR || !currentTitleState) ||
            (contentsInput.state === FormInputStatesEnum.ERROR || !currentContentsState) ||
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
        else
        {
            if (noteToEdit)
            {
                const submittedNoteToEdit = {
                    id: noteToEdit.id,
                    title: titleInput.value,
                    contents: contentsInput.value,
                    date_added: dateAddedInput.value,
                    category_id: categoryInput,
                    tagIds: noteToEdit.tagIds
                    // user_id: 1,
                }
                onEditNoteFormSubmit!(submittedNoteToEdit);
            }
            else
            {
                const submittedData = {
                    newNote: {
                        title: titleInput.value,
                        contents: contentsInput.value,
                        date_added: dateAddedInput.value,
                        category_id: categoryInput,
                        tagIds: null
                        // user_id: 1,
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
                    // console.log("NoteForm.tsx, handleFormSubmit() [response]");
                    // console.log(data);

                    updateNoteList!({
                        ...submittedData.newNote,
                        id: data.responseData.id,
                    });

                    const alert =
                    {
                        id: (new Date()).getTime(),
                        type: AlertTypesEnum.Success,
                        message: "New note has been created."
                    };
                    dispatch(addAlert(alert));
                })
                .catch(err => {
                    // console.log("Error [NoteForm.tsx, handleFormSubmit()]: ", err.message);
                    const alert =
                    {
                        id: (new Date()).getTime(),
                        type: AlertTypesEnum.Error,
                        message: "Error, couldn't create new note."
                    };
                    dispatch(addAlert(alert));
                });
            }
        }
    } // end: handleFormSubmit

    function renderCategorySelectOptions()
    {
        return Object.values(categories).map(({id, name}: ICategory) =>
        {
            return (
                <option key={id} value={id}>{name}</option>
            );
        });
    }

    const handleFormCloseButtonClick = (event: SyntheticEvent) =>
    {
        event.preventDefault();
        onCloseButtonClick();
    }

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
                    htmlFor="note-title-input">Title</label>
                <input
                    required={false}
                    type="text"
                    id="note-title-input"
                    name="note-title-input"
                    className={
                        getFormInputClassBasedOnItsState(titleInput.state)
                    }
                    value={titleInput.value}
                    onChange={(event: SyntheticEvent) => {
                        handleFormInputFieldChange(event, NoteFormInputsEnum.TITLE)
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, NoteFormInputsEnum.TITLE)
                    }}
                />
                <div className={
                    (titleInput.state === FormInputStatesEnum.VALID) ||
                    (titleInput.state === FormInputStatesEnum.INITIAL) ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }>
                    <div
                        className={titleInput.state !== FormInputStatesEnum.WARNING ?
                            "form__error-message-container" :
                            "form__error-message-container " +
                            "form__error-message-container--warning"
                        }
                    >
                        <IonIcon name="warning-outline" />
                        <p
                            className="form__error-message"
                        >{titleInput.errorMsg}</p>
                    </div>
                </div>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-contents-input">Contents</label>
                <textarea
                    required={false}
                    id="note-contents-input"
                    name="note-contents-input"
                    className={
                        getFormInputClassBasedOnItsState(contentsInput.state)
                    }
                    value={contentsInput.value}
                    onChange={(event: any) => {
                        handleFormInputFieldChange(event, NoteFormInputsEnum.CONTENTS)
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, NoteFormInputsEnum.CONTENTS)
                    }}></textarea>
                <div className={
                    (contentsInput.state === FormInputStatesEnum.VALID) ||
                    (contentsInput.state === FormInputStatesEnum.INITIAL) ?
                    "form__error-messages-container" :
                    "form__error-messages-container " +
                    "form__error-messages-container--active"
                }>
                    <div
                        className={contentsInput.state !== FormInputStatesEnum.WARNING ?
                            "form__error-message-container" :
                            "form__error-message-container " +
                            "form__error-message-container--warning"
                        }
                    >
                        <IonIcon name="warning-outline" />
                        <p
                            className="form__error-message"
                        >{contentsInput.errorMsg}</p>
                    </div>
                </div>
            </div>
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-dateadded-input">Date Added</label>
                <input
                    required={true}
                    type="text"
                    id="note-dateadded-input"
                    name="note-dateadded-input"
                    className={
                        getFormInputClassBasedOnItsState(dateAddedInput.state)
                    }
                    value={dateAddedInput.value}
                    onChange={(event: any) => {
                        handleFormInputFieldChange(event, NoteFormInputsEnum.DATE_ADDED)
                    }}
                    onBlur={(event: SyntheticEvent) => {
                        handleFormInputBlur(event, NoteFormInputsEnum.DATE_ADDED)
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
            <div className="form__field-container">
                <label
                    className="form__label"
                    htmlFor="note-category-input">Category</label>
                <select
                    name="note-category-input"
                    id="note-category-input"
                    className="form__input-field"
                    value={categoryInput}
                    onChange={(event: any) => {
                        handleFormInputFieldChange(event, NoteFormInputsEnum.CATEGORY)
                    }}
                >
                    { renderCategorySelectOptions() }
                </select>
            </div>
            <div className="form__button-group">
                <button
                    className="form__button daterange-picker__ok-button"
                    type="submit"
                    onClick={handleFormSubmit}
                >submit</button>
                <button
                    className="form__button daterange-picker__ok-button"
                    onClick={handleFormCloseButtonClick}
                >close</button>
            </div>
            </div>
        </form>
    );
}

export default NoteForm;