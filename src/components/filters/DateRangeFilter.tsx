import React, { useState, useEffect, SyntheticEvent } from 'react';

// Type imports
import { IDate } from "../../types";

// Redux imports
import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectFilters, setDateRangeFilter } from "../../redux/filterSlice";

// Bootstrap imports
import {
    Modal as BtsrpModal,
    Button as BtsrpButton
} from "react-bootstrap/";

// Material Design imports
import MuiButton from "@mui/material/Button";
import MuiFormControl from "@mui/material/FormControl";
import MuiInputLabel from "@mui/material/InputLabel";
import MuiSelect from "@mui/material/Select";
import MuiMenuItem from "@mui/material/MenuItem";
import MuiTextField from "@mui/material/TextField";
import MuiButtonGroup from "@mui/material/ButtonGroup";
import MuiCheckbox from "@mui/material/Checkbox"
import MuiFormControlLabel from "@mui/material/FormControlLabel"
import ButtonBase from "@mui/material/ButtonBase";

// Other 3rd party imports
import { IonIcon } from "react-ion-icon";

// helper functions/utils imports
import helper from "../../helper";

const months = [
    "January", "February", "March", "April", "May", "June", "July",
    "August", "September", "October", "November", "December"
];

const daysOfTheWeek = {
    en: [
        { long: "Monday", short: "M" },
        { long: "Tuesday", short: "T" },
        { long: "Wednesday", short: "W" },
        { long: "Thursday", short: "T" },
        { long: "Friday", short: "F" },
        { long: "Saturday", short: "S" },
        { long: "Sunday", short: "S" }
    ]
};

function DateRangeFilter()
{
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilters);
    const [activeYear, setActiveYear] = useState((new Date()).getFullYear());
    const [activeMonth, setActiveMonth] = useState(1);
    const [activeDay, setActiveDay] = useState<number>(1);
    const [isSelectingEndDateActive, setSelectingEndDateActive] = useState<boolean>(false);
    
    const [selectedStartDate, setSelectedStartDate] = useState<IDate | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<IDate | null>(null);
    const [draftDateStart, setDraftDateStart] = useState<IDate | null>(null);
    const [draftDateEnd, setDraftDateEnd] = useState<IDate | null>(null);

    // modal
    const [isDateRangePickerModalOpen, setDateRangePickerModalOpen] = useState<boolean>(false);

    useEffect(() =>
    {
        setSelectedStartDate(filters.dateRange ? helper.convertStringToDate(filters.dateRange!.start) : null);
        setSelectedEndDate(filters.dateRange ? helper.convertStringToDate(filters.dateRange!.end) : null);
    }, [filters]);

    function getMonthMenuItems(monthNames: string[])
    {
        return monthNames.map((monthName: string, index: number) =>
        {
            // return (<MuiMenuItem key={index} value={index+1}>{monthName}</MuiMenuItem>);
            return (<option key={index} value={index+1}>{monthName}</option>);
        });
    }

    function getDayNameElements()
    {
        // return daysOfTheWeek.en.map((name: { short: string }, i: number) =>
        // {
        //     return <div key={i} className="day day-name">{name.short}</div>;
        // });
        return daysOfTheWeek.en.map((name: { short: string }, i: number) =>
        {
            return <div key={i} className="daterange-picker__day daterange-picker__day-of-the-week">{name.short}</div>;
        });
    }

    function insertEmptyDayElements(count: number)
    {
        const emptyDays: any[] = [];
        for (let i = 0; i < count; i++)
        {
            emptyDays.push(<div key={i} className="daterange-picker__day"></div>);
        }
        return emptyDays;
    }

    function insertDayElements(count: number)
    {
        const dayElements: any[] = [];
        let classStr: string = "";
        for (let i = 0; i < count; i++)
        {   
            if (i+1 === activeDay)
                classStr = "daterange-picker__day daterange-picker__day-number daterange-picker__day-number--active";
            else if (i+1 === (new Date).getDate())
                classStr = "daterange-picker__day daterange-picker__day-number daterange-picker__day-number--today";
            else
                classStr = "daterange-picker__day daterange-picker__day-number"

            dayElements.push(
                // <div
                //     onClick={() => { handleDayClick(i+1) }}
                //     key={i}
                //     className={classStr}
                // >{i+1}</div>
                <ButtonBase
                    component="div"
                    onClick={() => { handleDayClick(i+1) }}
                    key={i}
                    className={classStr}
                >{i+1}</ButtonBase>
            );
        }
        return dayElements;
    }


    //***************************************************************
    //                      Event Handlers
    //***************************************************************
    const handleDebugBtnClick = () =>
    {
        const firstDay = helper.fdm(activeYear, activeMonth);
        console.log(`${months[activeMonth-1]}, ${activeYear}; fdm = ${firstDay}`);
        console.log("debug - cleaning up the component");
    };

    function handleMonthSelectChange(event: SyntheticEvent)
    {
        setActiveMonth(Number((event.currentTarget as HTMLSelectElement).value));
    }

    function handleIncreaseMonth()
    {
        if (activeMonth + 1 > 12)
        {
            // setActiveMonth(12);
            setActiveMonth(1);
            setActiveYear(activeYear+1);
        }
        else
            setActiveMonth(activeMonth + 1);
    }

    function handleDecreaseMonth()
    {
        if (activeMonth - 1 < 1)
        {
            // setActiveMonth(1);
            setActiveMonth(12);
            setActiveYear(activeYear-1);
        }
        else
            setActiveMonth(activeMonth - 1);
    }

    function handleYearInputChange(event: any)
    {
        const yearFromInput = Number(event.target.value);
        if (!isNaN(yearFromInput))
            setActiveYear(yearFromInput);
    }

    function handleIncreaseYear()
    {
        setActiveYear(activeYear + 1);
    }

    function handleDecreaseYear()
    {
        setActiveYear(activeYear - 1);
    }

    function handleDayClick(dayNumber: number)
    {
        setActiveDay(dayNumber);
        const newDate: IDate =
        {
            year: activeYear,
            month: activeMonth,
            day: dayNumber
        };
        if (!isSelectingEndDateActive)
        {
            setDraftDateStart(newDate);
            setSelectingEndDateActive(true);
            // setSelectedStartDate(newDate);
        }
        else
        {
            setDraftDateEnd(newDate);
            setSelectingEndDateActive(false);
            // setSelectedEndDate(newDate);
        }
    }

    function handleDateRangePickerApplyBtnClick()
    {
        // const dateRange = {
        //     start: "20220814",
        //     end: "20220822"
        // };
        const dateRange = {
            // start: helper.formatDateString(selectedStartDate),
            // end: helper.formatDateString(selectedEndDate)
            start: helper.formatDateString(draftDateStart),
            end: helper.formatDateString(draftDateEnd)
        };
        // console.log(dateRange);
        dispatch(setDateRangeFilter(dateRange));
        setDateRangePickerModalOpen(false);
    }

    function handleShowDateRangePickerModal()
    {
        setDateRangePickerModalOpen(true);
    }

    function handleHideDateRangePickerModal()
    {
        setDateRangePickerModalOpen(false);
    }

    return (
        <React.Fragment>
        <div className="date-range-picker-init-container">
            <div className="wrapper-1">
            <div className="wrapper-2">
                <span className="daterange-start">{selectedStartDate != null ? helper.formatDateString(selectedStartDate, "-") : "null"}</span>
                <span> - </span>
                <span className="daterange-end">{selectedEndDate != null ? helper.formatDateString(selectedEndDate, "-") : "null"}</span>
            </div>
            </div>
            <div className="calendar-icon-container">
                {/* <ButtonBase
                    component="span"
                    onClick={handleShowDateRangePickerModal}
                    className="temporary-span"></ButtonBase> */}
                <div
                    className=""
                    onClick={handleShowDateRangePickerModal}>
                    <IonIcon name="calendar-outline" />
                </div>
                
            </div>
        </div>
        
        <BtsrpModal
            show={isDateRangePickerModalOpen}
            onHide={handleHideDateRangePickerModal}
            backdrop="static"
            keyboard={false}>
            <BtsrpModal.Body className="daterange-picker__bootstrap-modal-body--padding-0">
            <div className="daterange-picker__main-container">
                <div className="daterange-picker__header">
                    <div className="daterange-picker__month-selector-container">
                        <button
                            className="daterange-picker__btn daterange-picker__decrease-month-btn"
                            onClick={handleDecreaseMonth}>
                            <IonIcon name="chevron-back-outline" />
                        </button>
                        <select
                            className="daterange-picker__month-dropdown-menu"
                            onChange={(event: any) => { handleMonthSelectChange(event) }}
                            value={activeMonth}
                        >
                            { getMonthMenuItems(months) }
                        </select>
                        <button
                            className="daterange-picker__btn daterange-picker__increase-month-btn"
                            onClick={handleIncreaseMonth}>
                            <IonIcon name="chevron-forward-outline" />
                        </button>
                    </div>
                    <div className="daterange-picker__year-selector-container">
                        <input
                            className="daterange-picker__year-input-field"
                            type="number"
                            value={activeYear}
                            size={5}
                            onChange={handleYearInputChange}
                        />
                        <div className="daterange-picker__button-group daterange-picker__button-group--vertical">
                            <button
                                className="daterange-picker__btn"
                                onClick={handleIncreaseYear}>
                                <IonIcon name="chevron-up-outline" />
                            </button>
                            <button
                                className="daterange-picker__btn"
                                onClick={handleDecreaseYear}>
                                <IonIcon name="chevron-down-outline" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="daterange-picker__body">
                    <div className="daterange-picker__day-grid-container">
                        { getDayNameElements() }
                        { insertEmptyDayElements(helper.fdm(activeYear, activeMonth)-1) }
                        { insertDayElements(helper.getNumberOfDaysInMonth(activeYear, activeMonth)) }
                    </div>
                </div>

                <div className="daterange-picker__footer">
                    <div className="">
                        from 
                        <span
                            className={isSelectingEndDateActive ? "daterange-picker__start-end-date-selector" : "daterange-picker__start-end-date-selector daterange-picker__start-end-date-selector--active"}
                            onClick={() => { if (isSelectingEndDateActive) setSelectingEndDateActive(false); }}
                        >{draftDateStart != null ? helper.formatDateString(draftDateStart, "-") : "null"}</span> 
                        to 
                        <span
                            className={isSelectingEndDateActive ? "daterange-picker__start-end-date-selector daterange-picker__start-end-date-selector--active" : "daterange-picker__start-end-date-selector"}
                            onClick={() => { if (!isSelectingEndDateActive) setSelectingEndDateActive(true); }}
                        >{draftDateEnd != null ? helper.formatDateString(draftDateEnd, "-") : "null"}</span>
                    </div>
                    <div className="daterange-picker__footer-button-container">
                        <button
                            className="daterange-picker__ok-button"
                            onClick={handleDateRangePickerApplyBtnClick}
                        >ok</button>
                        <button
                            className="daterange-picker__cancel-button"
                            onClick={handleHideDateRangePickerModal}
                        >cancel</button>
                    </div>
                </div>
            </div>
            </BtsrpModal.Body>
        </BtsrpModal>

        </React.Fragment>
    );
}

export default DateRangeFilter;