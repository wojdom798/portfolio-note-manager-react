import React, { useState, useEffect } from 'react';

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

    function getMonthMenuItems()
    {
        return months.map((monthName: string, index: number) =>
        {
            return (<MuiMenuItem key={index} value={index+1}>{monthName}</MuiMenuItem>);
        });
    }

    function getDayNameElements()
    {
        return daysOfTheWeek.en.map((name: { short: string }, i: number) =>
        {
            return <div key={i} className="day day-name">{name.short}</div>;
        });
    }

    function insertEmptyDayElements(count: number)
    {
        const emptyDays: any[] = [];
        for (let i = 0; i < count; i++)
        {
            emptyDays.push(<div key={i} className="day"></div>);
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
                classStr = "day day-number active";
            else if (i+1 === (new Date).getDate())
                classStr = "day day-number today";
            else
                classStr = "day day-number"

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

    function handleMonthSelectChange(event: any)
    {
        setActiveMonth(event.target.value);
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
        {/* <MuiButton
            onClick={handleShowDateRangePickerModal}
            variant="contained"
        >select date range</MuiButton> */}

        <div className="date-range-picker-init-container">
            <div className="wrapper-1">
            <div className="wrapper-2">
                <span className="daterange-start">{selectedStartDate != null ? helper.formatDateString(selectedStartDate, "-") : "null"}</span>
                <span> - </span>
                <span className="daterange-end">{selectedEndDate != null ? helper.formatDateString(selectedEndDate, "-") : "null"}</span>
            </div>
            </div>
            <div className="calendar-icon-container">
                <ButtonBase
                    component="span"
                    onClick={handleShowDateRangePickerModal}
                    className="temporary-span"></ButtonBase>
            </div>
        </div>

        <BtsrpModal
            show={isDateRangePickerModalOpen}
            onHide={handleHideDateRangePickerModal}
            dialogClassName="modal-custom-width"
            backdrop="static"
            keyboard={false}>
            <BtsrpModal.Body>
            <div className="datetime-filter-main-container">
                <div className="datetime-filter-header">
                    <div className="datetime-filter-main-interface">
                        {/* <button>&#x3C;</button> */}
                        <MuiButton
                            onClick={handleDecreaseMonth}
                            variant="outlined">&#x3C;</MuiButton>

                        <MuiFormControl>
                            <MuiInputLabel id="select-month-label">Month</MuiInputLabel>
                            <MuiSelect
                                labelId="select-month-label"
                                id="select-month"
                                value={activeMonth}
                                onChange={(event: any) => { handleMonthSelectChange(event) }}
                            >
                                { getMonthMenuItems() }
                            </MuiSelect>
                        </MuiFormControl>

                        {/* <button>&#x3E;</button> */}
                        <MuiButton
                            onClick={handleIncreaseMonth}
                            variant="outlined">&#x3E;</MuiButton>
                        <MuiTextField
                            onChange={handleYearInputChange}
                            label="Year"
                            value={activeYear}    
                        />
                        <MuiButtonGroup
                            orientation="vertical"
                        >
                            <MuiButton
                                onClick={handleIncreaseYear}
                            >&#x2B;</MuiButton>
                            <MuiButton
                                onClick={handleDecreaseYear}
                            >&#8722;</MuiButton>
                        </MuiButtonGroup>
                    </div>
                </div>
                <div className="datetime-filter-body">
                    <div className="day-container">
                        { getDayNameElements() }
                        {/* { insertEmptyDayElements(5) } */}
                        { insertEmptyDayElements(helper.fdm(activeYear, activeMonth)-1) }
                        {/* { insertDayElements(31) } */}
                        { insertDayElements(helper.getNumberOfDaysInMonth(activeYear, activeMonth)) }
                    </div>
                </div>
                <div className="datetime-filter-footer">
                    <MuiButton
                        onClick={handleHideDateRangePickerModal}
                        variant="text"
                    >Cancel/close</MuiButton>
                    <MuiButton
                        onClick={handleDateRangePickerApplyBtnClick}
                        variant="contained"
                    >OK</MuiButton>
                    <MuiButton
                        onClick={handleDebugBtnClick}
                        variant="contained"
                    >debug</MuiButton>
                    <div style={ {display: "block"} }>
                        <p>start date: {draftDateStart != null ? helper.formatDateString(draftDateStart, "-") : "null"}</p>
                        <p>end date: {draftDateEnd != null ? helper.formatDateString(draftDateEnd, "-") : "null"}</p>
                    </div>
                </div>
            </div>
            </BtsrpModal.Body>
        </BtsrpModal>
        </React.Fragment>
    );
}

export default DateRangeFilter;