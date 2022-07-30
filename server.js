const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const portNumber = process.env.PORT || 8001;

const jsonParser = bodyParser.json();
let urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(express.urlencoded( { extended: true } ));

app.get('/', function(req, res, next) {
    console.log(`Request: [${req.method}], `, req.originalUrl);
    res.sendFile('index.html', { root: path.join(__dirname, "public") });
});


app.listen(portNumber);
console.log(new Date().toLocaleString("pl-PL",
  { hour12: false }) + ", starting server on port:", portNumber);