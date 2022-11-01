// import { Date } from "./types";
interface Date
{
    year: number;
    month: number;
    day: number;
};

export default (function()
{

function getCurrentDateTimeString(): string
{
    let currentDateTime = new Date();
    let year = currentDateTime.getFullYear();
    let month = currentDateTime.getMonth() + 1 < 10 ? `0${currentDateTime.getMonth() + 1}` : currentDateTime.getMonth() + 1;
    let day = currentDateTime.getDate() < 10 ? `0${currentDateTime.getDate()}` : currentDateTime.getDate();
    let hours = currentDateTime.getHours() < 10 ? `0${currentDateTime.getHours()}`: currentDateTime.getHours();
    let minutes = currentDateTime.getMinutes() < 10 ? `0${currentDateTime.getMinutes()}`: currentDateTime.getMinutes();
    let seconds = currentDateTime.getSeconds() < 10 ? `0${currentDateTime.getSeconds()}`: currentDateTime.getSeconds();

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
 * computes and returns the number representing the first day of the week for a given month and year
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


return {
    getCurrentDateTimeString: getCurrentDateTimeString,
    fdm: fdm,
    getNumberOfDaysInMonth: getNumberOfDaysInMonth,
    convertStringToDate: convertStringToDate,
    formatDateString: formatDateString2
};

})();