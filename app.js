require('dotenv').config();
const express = require('express');
let app = express();

const con = require('./config/database');

//app
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//path to routes
let routes = require('./routes/v1/route');
app.use('/api/v1/', routes);

app.use("*", (req, res) => {
    res.status(404);
    res.send('404 Not Found');
});

//port
const port = process.env.PORT || 6065;
let server = app.listen(port);
server.setTimeout(50000);

console.log(`Test Running On at ${port}`);