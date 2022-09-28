const fs = require("fs");
const path = require("path");
const express = require("express");
// const sqlite3 = require("sqlite3").verbose();
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open; // allows for async/await calls
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

// helper functions
const h = require(path.join(__projectDir, "routes", "server_helper.js"));

// route: /api/categories/edit
router.put("/",
async function (req, res)
{
    let currentTime = new Date().toLocaleString("pl-PL",{ hour12: false });
    console.log(`[${req.method}] (${currentTime}) ${req.originalUrl}`);

    let queryTable = [];
    let query = "";
    let queryResult;

    const categoryToEdit = req.body.categoryToEdit;

    try
    {
        sqlite3.verbose();
        const databaseHandle = await createDbConnection(
            path.join(__projectDir, projectSettings.database.filename));

        queryTable = 
        [
            `UPDATE category `,
            `SET `,
            `name = '${h.sanitizeText(categoryToEdit.name)}', `,
            `date_added = '${categoryToEdit.date_added}' `,
            `WHERE id = ${categoryToEdit.id};`
        ];
        for (let line of queryTable)
        {
            query += line;
        }
        queryResult = await databaseHandle.run(query);
        lastID = queryResult.lastID;

        await databaseHandle.close();

        res.json({  
            responseMsg: "Success",
            responseData: {
                updatedCategoryId: categoryToEdit.id
            }
        });
    
    }
    catch (error)
    {
        console.error(error);
        res.status(404);
        // res.send("<h1>404</h1><p>Something went wrong.</p>");
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