const fs = require("fs");
const readline = require("readline");
const path = require("path");
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

//////////////////////////////////////////////////////////////////////////
//                      DATABASE TABLE DEFINITIONS
//////////////////////////////////////////////////////////////////////////
const NoteSQLTable = {
    "table_name": "note",
    "columns": [
        { "name": "id", "type": "INTEGER PRIMARY KEY" },
        { "name": "title", "type": "TEXT" },
        { "name": "contents", "type": "TEXT" },
        { "name": "date_added", "type": "DATETIME" },
        { "name": "category_id", "type": "INTEGER" },
        { "name": "user_id", "type": "INTEGER" }
    ]
};

const CategorySQLTable = {
    "table_name": "category",
    "columns": [
        { "name": "id", "type": "INTEGER PRIMARY KEY" },
        { "name": "name", "type": "TEXT" },
        { "name": "date_added", "type": "DATETIME" },
        { "name": "user_id", "type": "INTEGER" }
    ]
};

const TagSQLTable = {
    "table_name": "tag",
    "columns": [
        { "name": "id", "type": "INTEGER PRIMARY KEY" },
        { "name": "name", "type": "TEXT" },
        { "name": "date_added", "type": "DATETIME" },
        { "name": "user_id", "type": "INTEGER" }
    ]
};

const NoteTagSQLTable = {
    "table_name": "note_tag",
    "columns": [
        { "name": "id", "type": "INTEGER PRIMARY KEY" },
        { "name": "note_id", "type": "INTEGER" },
        { "name": "tag_id", "type": "INTEGER" }
    ]
};

const UsersSQLTable = {
    "table_name": "users",
    "columns": [
        { "name": "id", "type": "INTEGER PRIMARY KEY" },
        { "name": "username", "type": "TEXT UNIQUE" },
        { "name": "hashed_password", "type": "BLOB" },
        { "name": "salt", "type": "BLOB" },
        { "name": "name", "type": "TEXT" },
        { "name": "email", "type": "TEXT UNIQUE" },
        { "name": "email_verified", "type": "INTEGER" },
    ]
};

const SessionsSQLTable = {
    "table_name": "sessions",
    "columns": [
        { "name": "id", "type": "INTEGER PRIMARY KEY" },
        { "name": "sid", "type": "VARCHAR" },
        { "name": "expires", "type": "DATETIME" },
        { "name": "createdAt", "type": "DATETIME" },
        { "name": "updatedAt", "type": "DATETIME" },
        { "name": "data", "type": "VARCHAR" },
    ]
};
//////////////////////////////////////////////////////////////////////////
//                   end: DATABASE TABLE DEFINITIONS
//////////////////////////////////////////////////////////////////////////

function createDbConnection(filename)
{
    return sqliteOpen({
        filename: filename,
        driver: sqlite3.Database
    });
}

function convertJsonSqlTableToQueryString(databaseTableJson)
{
    let queryString = `CREATE TABLE ${databaseTableJson.table_name} ( `;
    let i, column;
    for (i = 0; i < databaseTableJson.columns.length - 1; i++)
    {
        column = databaseTableJson.columns[i];
        queryString += `${column.name} ${column.type}, `;
    }
    column = databaseTableJson.columns[i];
    queryString += `${column.name} ${column.type} );`;
    return queryString;
}

async function setupDatabase(dbTables, databasePath)
{
    let queryString, queryResult;
    let databaseHandle;

    try
    {
        sqlite3.verbose();
        databaseHandle = await createDbConnection(databasePath);

        for (let dbTable of dbTables)
        {
            queryString = convertJsonSqlTableToQueryString(dbTable);
            queryResult = await databaseHandle.run(queryString);
        }
    }
    catch (error)
    {
        console.error(error);
    }
    finally
    {
        databaseHandle.close();
    }
}

//////////////////////////////////////////////////////////////////////////
//                      running the script
//////////////////////////////////////////////////////////////////////////
const __projectDir = path.join(__dirname, "./");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const DATABASE_NAME = projectSettings.database.filename;

const MSG_DATABASE_EXISTS = "Do you want to overwrite the existing SQLite database (y/n)? ";

const databaseTablesToCreate = [
    NoteSQLTable, CategorySQLTable,
    TagSQLTable, NoteTagSQLTable,
    UsersSQLTable, SessionsSQLTable
];

(async function()
{
    if (fs.existsSync(path.join(__projectDir, DATABASE_NAME)))
    {
        console.log(`database \"${DATABASE_NAME}\" already exists.`);
        rl.question(MSG_DATABASE_EXISTS, function(readInput)
        {
            switch (readInput)
            {
                case "y":
                case "Y":
                case "t":
                case "T":
                    (async function()
                    {
                        console.log(`deleting \"${DATABASE_NAME}\"...`);
                        fs.unlinkSync(path.join(__projectDir, DATABASE_NAME));
                        console.log(`done.`);
                        console.log(`creating new database file: \"${DATABASE_NAME}\"...`);
                        await setupDatabase(databaseTablesToCreate, path.join(__projectDir, DATABASE_NAME));
                        console.log(`done.`);
                    })();
                break;
                default:
                    console.log("aborting");
                break;
            }
            rl.close();
        });
    }
    else
    {
        console.log(`creating \"${DATABASE_NAME}\" database file...`);
        await setupDatabase(databaseTablesToCreate, path.join(__projectDir, DATABASE_NAME));
        console.log(`done.`);
    }
})();