import React, { useState, useEffect } from 'react';

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


interface Date
{
    year: number;
    month: number;
    day: number;
};


function DateTimeFilter()
{
    const dispatch = useAppDispatch();
    const filters = useAppSelector(selectFilters);
    const [selectedYear, setSelectedYear] = useState((new Date()).getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(1);
    const [selectedDay, selectDay] = useState<number>(1);
    const [isSelectingEndDateActive, setSelectingEndDateActive] = useState<boolean>(false);

    // temporary
    // const [selectedStartDate, setSelectedStartDate] = useState<string>("---");
    // const [selectedEndDate, setSelectedEndDate] = useState<string>("---");
    const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null);
    const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null);

    const [draftDateStart, setDraftDateStart] = useState<Date | null>(null);
    const [draftDateEnd, setDraftDateEnd] = useState<Date | null>(null);

    // modal
    const [isDateRangePickerModalOpen, setDateRangePickerModalOpen] = useState<boolean>(false);

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

    useEffect(() =>
    {
        setSelectedStartDate(filters.dateRange ? convertStringToDate(filters.dateRange!.start) : null);
        setSelectedEndDate(filters.dateRange ? convertStringToDate(filters.dateRange!.end) : null);
    }, [filters]);

    function convertStringToDate(date: string): Date
    {
        const dateStr = date.split(" ")[0] as string;
        const splitDateStr = dateStr.split("-");

        if (splitDateStr.length === 1)
        {
            // console.log("splitDateStr.length = 1");
            return {
                year: parseInt(splitDateStr[0].slice(0, 4)),
                month: parseInt(splitDateStr[0].slice(4, 6)),
                day: parseInt(splitDateStr[0].slice(6))
            };
        }
        else
        {
            return {
                year: parseInt(splitDateStr[0]),
                month: parseInt(splitDateStr[1]),
                day: parseInt(splitDateStr[2])
            };
        }
    }

    function isLeapYear(year: number)
    {
        return (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0));
    }

    function getDaysInYear(year: number)
    {
        return isLeapYear(year) ? 366 : 365;
    }

    function getNumberOfDaysInMonth(year: number, month: number)
    {
        const daysOfMonthArray: number[] = [
            31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
        ];
        return daysOfMonthArray[month-1];
    }

    /**
     * computes and returns the number of the first day of the week for a given month and year
     * Monday = `1`, Tuesday = `2`, ..., Sunday = `7`
     * @param {number} year
     * @param {number} month
     */
    function fdm(year: number, month: number)
    {
        const baseDate =
        {
            month: 1,
            year: 2000,
            fdm: 6
        };
        const DAYS_IN_A_WEEK = 7;
        let yearDifference = year - baseDate.year;
        let monthDiff: number;
        const isLeap = isLeapYear(year);
        const daysOfMonthArray: number[] = [
            31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
        ];
        let sumOfDays: number = baseDate.fdm;

        if (yearDifference === 0)
        {
            if (month === baseDate.month) return baseDate.fdm;
                monthDiff = month - baseDate.month;
            if (monthDiff < 0) throw new Error("Month difference is less than 0.");
            for (let i = 0; i < monthDiff; i++)
            {
                sumOfDays += daysOfMonthArray[i];
            }
            return (sumOfDays % DAYS_IN_A_WEEK) === 0 ? DAYS_IN_A_WEEK : sumOfDays % DAYS_IN_A_WEEK;
        }
        else if (yearDifference > 0)
        {
            sumOfDays = baseDate.fdm;
            for (let i = 0; i < yearDifference; i++)
                sumOfDays += getDaysInYear(baseDate.year + i);
            for (let i = 0; i < month-1; i++)
                sumOfDays += daysOfMonthArray[i];
            return (sumOfDays % DAYS_IN_A_WEEK) === 0 ? DAYS_IN_A_WEEK : sumOfDays % DAYS_IN_A_WEEK;
        }
        else
        {
            yearDifference = Math.abs(yearDifference);
            sumOfDays = baseDate.fdm;
            for (let i = 1; i < yearDifference; i++)
            {
                if (isLeapYear(baseDate.year - i))
                    sumOfDays -= 2; // 366 % 7 == 2
                else
                    sumOfDays -= 1; // 365 % 7 == 1
            }
            for (let i = daysOfMonthArray.length-1; i >= month-1; i--)
            {
                sumOfDays -= daysOfMonthArray[i];
            }
            // return (7 - Math.abs(sumOfDays-1) % 7) + 1;
            return ((((sumOfDays-1) % DAYS_IN_A_WEEK) + DAYS_IN_A_WEEK) % DAYS_IN_A_WEEK) +1;
        }
        return -1;
    }

    const handleDebugBtnClick = () =>
    {
        const firstDay = fdm(selectedYear, selectedMonth);
        console.log(`${months[selectedMonth-1]}, ${selectedYear}; fdm = ${firstDay}`);
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
        {
            // setSelectedMonth(12);
            setSelectedMonth(1);
            setSelectedYear(selectedYear+1);
        }
        else
            setSelectedMonth(selectedMonth + 1);
    }

    function handleDecreaseMonth()
    {
        if (selectedMonth - 1 < 1)
        {
            // setSelectedMonth(1);
            setSelectedMonth(12);
            setSelectedYear(selectedYear-1);
        }
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

    function handleDayClick(dayNumber: number)
    {
        selectDay(dayNumber);
        const newDate: Date =
        {
            year: selectedYear,
            month: selectedMonth,
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

    function formatDateString2(date: Date | null, separator = "")
    {
        if (date == null) return "null";
        let str: string = "";
        let yearStr = String(date.year);
        let monthStr = date.month >= 10 ? String(date.month) : `0${String(date.month)}`;
        let dayStr = date.day >= 10 ? String(date.day) : `0${String(date.day)}`;
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
            // start: formatDateString2(selectedStartDate),
            // end: formatDateString2(selectedEndDate)
            start: formatDateString2(draftDateStart),
            end: formatDateString2(draftDateEnd)
        };
        // console.log(dateRange);
        dispatch(setDateRangeFilter(dateRange));
    }

    // modal
    function handleShowDateRangePickerModal()
    {
        setDateRangePickerModalOpen(true);
    }

    function handleHideDateRangePickerModal()
    {
        setDateRangePickerModalOpen(false);
    }

    function handleDateRangePickerApplyChangesBtnClick()
    {

    }
    // end: modal

    return (
        <React.Fragment>
        {/* <MuiButton
            onClick={handleShowDateRangePickerModal}
            variant="contained"
        >select date range</MuiButton> */}

        <div className="date-range-picker-init-container">
            <div className="wrapper-1">
            <div className="wrapper-2">
                <span className="daterange-start">{selectedStartDate != null ? formatDateString2(selectedStartDate, "-") : "null"}</span>
                <span> - </span>
                <span className="daterange-end">{selectedEndDate != null ? formatDateString2(selectedEndDate, "-") : "null"}</span>
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
                        {/* { insertEmptyDayElements(5) } */}
                        { insertEmptyDayElements(fdm(selectedYear, selectedMonth)-1) }
                        {/* { insertDayElements(31) } */}
                        { insertDayElements(getNumberOfDaysInMonth(selectedYear, selectedMonth)) }
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
                        <p>start date: {draftDateStart != null ? formatDateString2(draftDateStart, "-") : "null"}</p>
                        <p>end date: {draftDateEnd != null ? formatDateString2(draftDateEnd, "-") : "null"}</p>
                    </div>
                </div>
            </div>
            </BtsrpModal.Body>
        </BtsrpModal>
        </React.Fragment>
    );
}

export default DateTimeFilter;