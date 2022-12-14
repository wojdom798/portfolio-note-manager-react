const fs = require("fs");
const path = require("path");
const express = require("express");
const sqlite3 = require("sqlite3");
const sqliteOpen = require("sqlite").open;
const router = express.Router();

const __projectDir = path.join(__dirname, "../../../");
const projectSettingsFileName = "project_settings.json";
const settingsFilePath = path.join(__projectDir, projectSettingsFileName);
const projectSettings = JSON.parse(fs.readFileSync(settingsFilePath, "utf8"));

const passport = require("passport");

// route: /api/auth/login
router.post("/",
passport.authenticate("local", { 
    failureRedirect: "/api/auth/unauthorized",
    failureMessage: true 
}),
async function (req, res, next)
{
    // console.log(req.session.cookie._expires);

    // console.log("req.user =");
    // console.log(req.user);
    // console.log("req.session.passport.user =");
    // console.log(req.session.passport.user);

    // if (!req.hasOwnProperty("user"))
    // {
    //     res.json({
    //         responseData: {
    //             requestObject: req,
    //             responseObject: res
    //         }
    //     });
    // }

    res.json({
        responseMsg: `Successfully authenticated ${req.session.passport.user.username}`,
        isAuthorized: true,
        user: {
            id: req.session.passport.user.id,
            username: req.session.passport.user.username
        },
        sessionExpirationDate: req.session.cookie._expires
    });
});

module.exports = router;