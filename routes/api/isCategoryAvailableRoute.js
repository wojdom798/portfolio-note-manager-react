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
const { session } = require("passport");
const postgresPool = new Pool(projectSettings.database.postgresql);

// route: /api/is-category-available/:name
router.get("/:name",
// (req, res, next) => {console.log("bodyparser", req.body); next();},
async function (req, res, next)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let query = "";
    let queryResult;

    // console.log(req.session);

    if (req.session.passport)
    {
        // const username = req.session.passport.user.username;
        const userId = req.session.passport.user.id;
        const categoryName = req.params.name;

        if (projectSettings.database.selected_database === "sqlite")
        {
            try
            {
                sqlite3.verbose();
                const databaseHandle = await createDbConnection(
                    path.join(__projectDir, projectSettings.database.sqlite.filename)
                );
                
                query = "SELECT id FROM category WHERE (name = ?) AND (user_id = ?)";

                queryResult = await databaseHandle.all(query, [categoryName, userId]);

                await databaseHandle.close();

                res.json({  
                    responseMsg: "Success",
                    responseData: {
                        isCategoryNameAvailable: (queryResult.length === 0)
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
                query = "SELECT id FROM category WHERE (name = $1) AND (user_id = $2)";

                queryResult = (await postgresPool.query(query, [categoryName, userId])).rows;

                res.json({  
                    responseMsg: "Success",
                    responseData: {
                        isCategoryNameAvailable: (queryResult.length === 0)
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
    }
    else
    {
        res.status(401).json({
            responseMsg: "Unauthorized access.",
            responseData: {
                isCategoryNameAvailable: false
            }
        });
    }
}); // end route

router.use(function (req, res, next)
{
    console.log("next middleware (test)");
    next();
});

function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

module.exports = router;