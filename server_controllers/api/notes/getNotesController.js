const fs = require("fs");
const path = require("path");
const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open; // allows async/await calls
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));


// route: /api/notes/get
// or
// /api/notes/get/?items-per-page=[...]&page=[...]
// or
// /api/notes/get/?items-per-page=[...]&page=[...]&categories=[...]
router.get("/",
async function (req, res)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let queryArray = [];
    let query = "";
    let queryResult;

    let filterStr = "";

    let notes;
    let numberOfAllNotes;

    let pageOffset;
    if (req.query.hasOwnProperty("items-per-page") &&
        req.query.hasOwnProperty("page"))
    {
        if (req.query.hasOwnProperty("categories") ||
            (req.query.hasOwnProperty("date-range-start") &&
            req.query.hasOwnProperty("date-range-end")))
        {
            filterStr = `WHERE `;

            if (req.query.hasOwnProperty("categories"))
            {
                const categories = JSON.parse(req.query["categories"]);
                for (let i = 0; i < categories.length; i++)
                {
                    if (i === 0)
                        filterStr += `(category_id = ${categories[i]} `;
                    else if ((i === categories.length-1) && (categories.length > 1))
                        filterStr += `OR category_id = ${categories[i]}) `;
                    else
                        filterStr += `OR category_id = ${categories[i]} `;
                }
            }
            if (req.query.hasOwnProperty("categories") &&
                req.query.hasOwnProperty("date-range-start"))
            {
                filterStr += `AND `;
            }
            if (req.query.hasOwnProperty("date-range-start"))
            {
                const dateRangeStartStr = JSON.parse(req.query["date-range-start"]);
                const dateRangeEndStr = JSON.parse(req.query["date-range-end"]);
                filterStr += `(strftime('%Y%m%d', date_added) >= '${dateRangeStartStr}' AND `;
                filterStr += `strftime('%Y%m%d', date_added) <= '${dateRangeEndStr}') `;
            }

            pageOffset = req.query["items-per-page"] * (req.query["page"] - 1);
            queryArray = 
            [
                `SELECT * FROM note `,
                `${filterStr}`,
                `ORDER BY id ASC `,
                `LIMIT ${req.query["items-per-page"]} `,
                `OFFSET ${pageOffset};`
            ];

            // console.log(queryArray);
        }
        else
        {
            pageOffset = req.query["items-per-page"] * (req.query["page"] - 1);
            queryArray = 
            [
                `SELECT * FROM note ORDER BY id ASC `,
                `LIMIT ${req.query["items-per-page"]} `,
                `OFFSET ${pageOffset};`
            ];
        }
        for (let line of queryArray)
        {
            query += line;
        }
    }
    else
    {
        queryArray = 
        [
            `SELECT * FROM note ORDER BY id ASC;`
        ];
        for (let line of queryArray)
        {
            query += line;
        }
    }

    try
    {
        sqlite3.verbose();
        const databaseHandle = await createDbConnection(
            path.join(__projectDir, projectSettings.database.filename));
        
        // queryArray = 
        // [
        //     `SELECT * FROM note ORDER BY id ASC;`
        // ];
        // for (let line of queryArray)
        // {
        //     query += line;
        // }
        
        // console.log(query);
        notes = await databaseHandle.all(query);

        if (req.query.hasOwnProperty("categories") ||
            (req.query.hasOwnProperty("date-range-start") && 
            req.query.hasOwnProperty("date-range-end")))
        {
            queryTable = 
            [
                `SELECT COUNT(*) count FROM note ${filterStr};`
            ];
        }
        else
        {
            queryTable = 
            [
                `SELECT COUNT(*) count FROM note;`
            ];
        }

        query = "";
        for (let line of queryTable)
        {
            query += line;
        }

        queryResult = await databaseHandle.prepare(query);
        numberOfAllNotes = (await queryResult.get()).count;
        await queryResult.finalize();

        await databaseHandle.close();

        res.json({  
            responseMsg: "Success",
            responseData: {
                notes: notes,
                numberOfAllNotes: numberOfAllNotes,
                numberOfAllFilteredNotes: numberOfAllNotes
            }
        });
    
    }
    catch (error)
    {
        console.error(error);
        res.status(404);
        // res.send("<h1>404</h1>");
        res.json({
            responseMsg: "An error occured during the querying of data.",
            errorMsg: error.message
        });
    }
}); // end route


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;