import React, { useState } from "react";
import MuiButton from "@mui/material/Button";
import MuiFormControl from "@mui/material/FormControl";
import MuiInputLabel from "@mui/material/InputLabel";
import MuiSelect from "@mui/material/Select";
import MuiMenuItem from "@mui/material/MenuItem";
import MuiTextField from "@mui/material/TextField";
import MuiButtonGroup from "@mui/material/ButtonGroup";
import MuiCheckbox from "@mui/material/Checkbox"
import MuiFormControlLabel from "@mui/material/FormControlLabel"

import { useAppSelector, useAppDispatch } from "../../redux/hooks";
import { selectFilters, setDateRangeFilter } from "../../redux/filterSlice";

function DateTimeFilter()
{
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilters);
    const [selectedYear, setSelectedYear] = useState((new Date()).getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedDay, selectDay] = useState<number>(1);
    const [isSelectingEndDateActive, setSelectingEndDateActive] = useState<boolean>(false);

    const [selectedStartDate, setSelectedStartDate] = useState<string>("---");
    const [selectedEndDate, setSelectedEndDate] = useState<string>("---");

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

    function getMonthMenuItems()
    {
        return months.map((monthName: string, index: number) =>
        {
            return (<MuiMenuItem key={index} value={index+1}>{monthName}</MuiMenuItem>);
        });
    }

    function handleMonthSelectChange(event: any)
    {
        setSelectedMonth(event.target.value);
    }

    function handleIncreaseMonth()
    {
        if (selectedMonth + 1 > 12)
            setSelectedMonth(12);
        else
        setSelectedMonth(selectedMonth + 1);
    }

    function handleDecreaseMonth()
    {
        if (selectedMonth - 1 < 1)
            setSelectedMonth(1);
        else
        setSelectedMonth(selectedMonth - 1);
    }

    function handleIncreaseYear()
    {
        setSelectedYear(selectedYear + 1);
    }

    function handleDecreaseYear()
    {
        setSelectedYear(selectedYear - 1);
    }

    function changeYearInput(event: any)
    {
        const yearFromInput = Number(event.target.value);
        if (!isNaN(yearFromInput))
            setSelectedYear(yearFromInput);
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
            if (i+1 === selectedDay)
                classStr = "day day-number active";
            else if (i+1 === (new Date).getDate())
                classStr = "day day-number today";
            else
                classStr = "day day-number"

            dayElements.push(
                <div
                    onClick={() => { handleDayClick(i+1) }}
                    key={i}
                    className={classStr}
                >{i+1}</div>
            );
        }
        return dayElements;
    }

    function handleDayClick(dayNumber: number)
    {
        selectDay(dayNumber);
        if (!isSelectingEndDateActive)
        {
            setSelectedStartDate(
                formatDateString(
                    selectedYear,
                    selectedMonth,
                    dayNumber, ""));
        }
        else
        {
            setSelectedEndDate(
                formatDateString(
                    selectedYear,
                    selectedMonth,
                    dayNumber, ""));
        }
    }

    // temporary
    function formatDateString(year: number, month: number, day: number, separator = "")
    {
        let str: string = "";
        let yearStr = String(year);
        let monthStr = month >= 10 ? String(month) : `0${String(month)}`;
        let dayStr = day >= 10 ? String(day) : `0${String(day)}`;
        str = `${yearStr}${separator}${monthStr}${separator}${dayStr}`;
        return str
    }

    function handleDateRangePickerApplyBtnClick()
    {
        // const dateRange = {
        //     start: "20220814",
        //     end: "20220822"
        // };
        const dateRange = {
            start: selectedStartDate,
            end: selectedEndDate
        };
        // console.log(dateRange);
        dispatch(setDateRangeFilter(dateRange));
    }

    // temporary
    function handleIsSelectingEndDate(event: any)
    {
        // console.log(event.target.checked);
        if (event.target.checked)
            setSelectingEndDateActive(true);
        else
            setSelectingEndDateActive(false);
    }   

    return (
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
                            value={selectedMonth}
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
                        onChange={changeYearInput}
                        label="Year"
                        value={selectedYear}    
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
                    { insertEmptyDayElements(5) }
                    { insertDayElements(31) }
                </div>
            </div>
            <div className="datetime-filter-footer">
                {/* <MuiCheckbox {...label} defaultChecked /> */}
                <MuiFormControlLabel
                    control={
                        <MuiCheckbox
                            onChange={handleIsSelectingEndDate} />
                    }
                    label="selecting end date" />
                <MuiButton
                    onClick={() => { console.log("cancel picking date range"); }}
                    variant="text"
                >Cancel</MuiButton>
                <MuiButton
                    onClick={handleDateRangePickerApplyBtnClick}
                    variant="contained"
                >OK</MuiButton>
                <div style={ {display: "block"} }>
                    <p>start date: {selectedStartDate}</p>
                    <p>end date: {selectedEndDate}</p>
                </div>
            </div>
        </div>
    );
}

export default DateTimeFilter;