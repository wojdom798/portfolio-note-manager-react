const fs = require("fs");
const path = require("path");
const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open; // allows async/await calls
const router = express.Router();

const __projectDir = path.join(__dirname, "../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const passport = require("passport");

const { Pool, Client } = require("pg");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/get-date-range
router.get("/",
// passport.authenticate("local", { failureRedirect: "/api/auth/unauthorized" }),
async function (req, res)
{
    let queryArray = [];
    let query = "";
    let queryResult;

    let userId = req.session.passport.user.id;
    // let userId = 1;

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename));
            
            queryArray = 
            [
                `SELECT `,
                `MIN(nt.date_added) AS min_date, `,
                `MAX(nt.date_added) AS max_date `,
                `FROM note nt `,
                `WHERE user_id = ${userId};`
            ];
            for (let line of queryArray)
            {
                query += line;
            }

            queryResult = await databaseHandle.all(query);
            await databaseHandle.close();

            res.json({  
                responseMsg: "Success",
                responseData: {
                    minDate: queryResult[0].min_date,
                    maxDate: queryResult[0].max_date,
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
        try
        {
            queryArray = 
            [
                `SELECT `,
                `TO_CHAR(MIN(nt.date_added), 'YYYY-MM-DD HH24:MI:SS') AS min_date, `,
                `TO_CHAR(MAX(nt.date_added), 'YYYY-MM-DD HH24:MI:SS') AS max_date `,
                `FROM note nt `,
                `WHERE user_id = ${userId};`
            ];
            for (let line of queryArray)
            {
                query += line;
            }

            queryResult = (await postgresPool.query(query)).rows;

            res.json({  
                responseMsg: "Success",
                responseData: {
                    minDate: queryResult[0].min_date,
                    maxDate: queryResult[0].max_date,
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


    
}); // end route


function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;