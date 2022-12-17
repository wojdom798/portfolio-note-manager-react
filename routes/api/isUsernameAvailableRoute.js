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

// route: /api/is-username-available/:username
router.get("/:username",
async function (req, res, next)
{
    let queryArray = [];
    let query = "";
    let queryResult;

    if (!req.params.username)
    {
        res.status(404).json({
            responseMsg: "incorrect list of parameters."
        });
    }
    

    if (projectSettings.database.selected_database === "sqlite")
    {
        try
        {
            sqlite3.verbose();
            const databaseHandle = await createDbConnection(
                path.join(__projectDir, projectSettings.database.sqlite.filename)
            );
            
            query = "SELECT id FROM users WHERE username = ?";

            queryResult = await databaseHandle.all(query, [req.params.username]);

            await databaseHandle.close();

            res.json({  
                responseMsg: "Success",
                responseData: {
                    isUsernameAvailable: (queryResult.length === 0)
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
            query = "SELECT id FROM users WHERE username = $1";

            queryResult = (await postgresPool.query(query, [req.params.username])).rows;

            res.json({  
                responseMsg: "Success",
                responseData: {
                    isUsernameAvailable: (queryResult.length === 0)
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