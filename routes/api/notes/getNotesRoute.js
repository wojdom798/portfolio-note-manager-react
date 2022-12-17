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

const passport = require("passport");

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/notes/get
// or
// /api/notes/get/?items-per-page=[...]&page=[...]
// or
// /api/notes/get/?items-per-page=[...]&page=[...]&categories=[...]
router.get("/",
// passport.authenticate("local", { failureRedirect: "/api/auth/logout" }),
// passport.authenticate("local", { failureRedirect: "/api/auth/unauthorized" }),
async function (req, res)
{
    let queryArray = [];
    let query = "";
    let queryResult;

    let filterStr = "";
    let notes;
    let numberOfAllNotes;
    let pageOffset;

    let userId = req.session.passport.user.id;
    // let userId = 1;

    if (projectSettings.database.selected_database === "sqlite")
    {
        if (req.query.hasOwnProperty("items-per-page") &&
            req.query.hasOwnProperty("page"))
        {
            if (req.query.hasOwnProperty("categories") ||
                (req.query.hasOwnProperty("date-range-start") &&
                req.query.hasOwnProperty("date-range-end")))
            {
                filterStr = `WHERE user_id = ${req.session.passport.user.id} AND `;

                if (req.query.hasOwnProperty("categories"))
                {
                    const categories = JSON.parse(req.query["categories"]);
                    for (let i = 0; i < categories.length; i++)
                    {
                        if (i === 0)
                            filterStr += `(category_id = ${categories[i]}`;
                        else if ((i === categories.length-1) && (categories.length > 1))
                            filterStr += ` OR category_id = ${categories[i]}`;
                        else
                            filterStr += ` OR category_id = ${categories[i]}`;
                    }
                    filterStr += ") ";
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
                    `SELECT `,
                    `n.*, `,
                    `'[' || group_concat(nt.tag_id, ',') || ']' as tags `,
                    `FROM note n `,
                    `LEFT JOIN note_tag nt ON n.id = nt.note_id `,
                    `${filterStr} `,
                    `GROUP BY n.id `,
                    `ORDER BY n.id ASC `,
                    `LIMIT ${req.query["items-per-page"]} `,
                    `OFFSET ${pageOffset};`
                ];

                // console.log(queryArray);
            }
            else // no filters
            {
                pageOffset = req.query["items-per-page"] * (req.query["page"] - 1);
                // queryArray = 
                // [
                //     `SELECT * FROM note ORDER BY id ASC `,
                //     `LIMIT ${req.query["items-per-page"]} `,
                //     `OFFSET ${pageOffset};`
                // ];
                queryArray = 
                [
                    `SELECT `,
                    `n.*, `,
                    `'[' || group_concat(nt.tag_id, ',') || ']' as tags `,
                    `FROM note n `,
                    `LEFT JOIN note_tag nt ON n.id = nt.note_id `,
                    `WHERE user_id = ${req.session.passport.user.id} `,
                    `GROUP BY n.id `,
                    `ORDER BY n.id ASC `,
                    `LIMIT ${req.query["items-per-page"]} `,
                    `OFFSET ${pageOffset};`
                ];
            }
            for (let line of queryArray)
            {
                query += line;
            }
        }
        else // no pagination
        {
            // queryArray = 
            // [
            //     `SELECT * FROM note ORDER BY id ASC;`
            // ];
            queryArray = 
            [
                `SELECT `,
                `n.*, `,
                `'[' || group_concat(nt.tag_id, ',') || ']' as tags `,
                `FROM note n `,
                `LEFT JOIN note_tag nt ON n.id = nt.note_id `,
                `WHERE user_id = ${req.session.passport.user.id} `,
                `GROUP BY n.id `,
                `ORDER BY id ASC;`
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
                path.join(__projectDir, projectSettings.database.sqlite.filename));
            
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
                queryArray = 
                [
                    `SELECT COUNT(*) count FROM note ${filterStr};`
                ];
            }
            else
            {
                queryArray = 
                [
                    `SELECT COUNT(*) count FROM note `,
                    `WHERE user_id = ${req.session.passport.user.id};`,
                ];
            }

            query = "";
            for (let line of queryArray)
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
    }
    else if (projectSettings.database.selected_database === "postgresql")
    {
        if (req.query.hasOwnProperty("items-per-page") &&
            req.query.hasOwnProperty("page"))
        {
            if (req.query.hasOwnProperty("categories") ||
                (req.query.hasOwnProperty("date-range-start") &&
                req.query.hasOwnProperty("date-range-end")))
            {
                // filterStr = `WHERE user_id = ${req.session.passport.user.id} AND `;
                filterStr = `WHERE user_id = ${userId} AND `;

                if (req.query.hasOwnProperty("categories"))
                {
                    const categories = JSON.parse(req.query["categories"]);
                    for (let i = 0; i < categories.length; i++)
                    {
                        if (i === 0)
                            filterStr += `(category_id = ${categories[i]}`;
                        else if ((i === categories.length-1) && (categories.length > 1))
                            filterStr += ` OR category_id = ${categories[i]}`;
                        else
                            filterStr += ` OR category_id = ${categories[i]}`;
                    }
                    filterStr += ") ";
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
                    filterStr += `(TO_CHAR(date_added, 'YYYYMMDD') >= '${dateRangeStartStr}' AND `;
                    filterStr += `TO_CHAR(date_added, 'YYYYMMDD') <= '${dateRangeEndStr}') `;
                }

                pageOffset = req.query["items-per-page"] * (req.query["page"] - 1);
                queryArray = 
                [
                    `SELECT `,
                    `n.*, `,
                    `TO_CHAR(n.date_added, 'YYYY-MM-DD HH24:MI:SS') AS date_added, `,
                    `CONCAT('[', STRING_AGG(nt.tag_id::text, ','), ']') AS tags `,
                    `FROM note n `,
                    `LEFT JOIN note_tag nt ON n.id = nt.note_id `,
                    `${filterStr} `,
                    `GROUP BY n.id, n.title, n.contents, n.date_added, n.category_id, n.user_id `,
                    `ORDER BY n.id ASC `,
                    `LIMIT ${req.query["items-per-page"]} `,
                    `OFFSET ${pageOffset};`
                ];

                // console.log(queryArray);
            }
            else // no filters
            {
                pageOffset = req.query["items-per-page"] * (req.query["page"] - 1);
                // queryArray = 
                // [
                //     `SELECT * FROM note ORDER BY id ASC `,
                //     `LIMIT ${req.query["items-per-page"]} `,
                //     `OFFSET ${pageOffset};`
                // ];
                queryArray = 
                [
                    `SELECT `,
                    `n.*, `,
                    `TO_CHAR(n.date_added, 'YYYY-MM-DD HH24:MI:SS') AS date_added, `,
                    `CONCAT('[', STRING_AGG(nt.tag_id::text, ','), ']') AS tags `,
                    `FROM note n `,
                    `LEFT JOIN note_tag nt ON n.id = nt.note_id `,
                    // `WHERE user_id = ${req.session.passport.user.id} `,
                    `WHERE user_id = ${userId} `,
                    `GROUP BY n.id, n.title, n.contents, n.date_added, n.category_id, n.user_id `,
                    `ORDER BY n.id ASC `,
                    `LIMIT ${req.query["items-per-page"]} `,
                    `OFFSET ${pageOffset};`
                ];
            }
            for (let line of queryArray)
            {
                query += line;
            }
        }
        else // no pagination
        {
            // queryArray = 
            // [
            //     `SELECT * FROM note ORDER BY id ASC;`
            // ];
            queryArray = 
            [
                `SELECT `,
                `n.*, `,
                `TO_CHAR(n.date_added, 'YYYY-MM-DD HH24:MI:SS') AS date_added, `,
                `CONCAT('[', STRING_AGG(nt.tag_id::text, ','), ']') AS tags `,
                `FROM note n `,
                `LEFT JOIN note_tag nt ON n.id = nt.note_id `,
                // `WHERE user_id = ${req.session.passport.user.id} `,
                `WHERE user_id = ${userId} `,
                `GROUP BY n.id, n.title, n.contents, n.date_added, n.category_id, n.user_id `,
                `ORDER BY id ASC;`
            ];
            for (let line of queryArray)
            {
                query += line;
            }
        }

        try
        {
            // console.log(query);
            notes = (await postgresPool.query(query)).rows;

            if (req.query.hasOwnProperty("categories") ||
                (req.query.hasOwnProperty("date-range-start") && 
                req.query.hasOwnProperty("date-range-end")))
            {
                queryArray = 
                [
                    `SELECT COUNT(*) count FROM note ${filterStr};`
                ];
            }
            else
            {
                queryArray = 
                [
                    `SELECT COUNT(*) count FROM note `,
                    // `WHERE user_id = ${req.session.passport.user.id};`,
                    `WHERE user_id = ${userId};`,
                ];
            }

            query = "";
            for (let line of queryArray)
            {
                query += line;
            }


            numberOfAllNotes = (await postgresPool.query(query)).rows;

            res.json({  
                responseMsg: "Success",
                responseData: {
                    notes: notes,
                    numberOfAllNotes: Number(numberOfAllNotes[0].count),
                    numberOfAllFilteredNotes: Number(numberOfAllNotes[0].count)
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
    } // end: else - database = postgres

}); // end route


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;