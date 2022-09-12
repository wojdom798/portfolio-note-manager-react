const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const session = require("express-session");
const Sequelize = require("sequelize");
const SequelizeStore = require("connect-session-sequelize")(session.Store);

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite3"
});


async function testDbSequelize()
{
  try
  {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  }
  catch (error)
  {
    console.log("unable to connect to the database: ", error);
  }
}

// sequelize.close();
testDbSequelize();


const app = express();
const portNumber = process.env.PORT || 8001;

const jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

app.use(
  session({
    secret: "secret message",
    store: new SequelizeStore({ db: sequelize }),
    resave: false,
    proxy: true
  }),
);

app.get('/', function(req, res, next) {
    console.log(`Request: [${req.method}], `, req.originalUrl);
    res.sendFile('index.html', { root: path.join(__dirname, "public") });
});


const apiController = require("./server_controllers/api/apiController");
app.use("/api", apiController);


app.listen(portNumber);
console.log(new Date().toLocaleString("pl-PL",
  { hour12: false }) + ", starting server on port:", portNumber);