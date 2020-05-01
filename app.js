const express = require("express");

const app = express();

app.use((req, res, next) => {
    let error = new Error('NOT FOUND, BRUH, ITS 404');
    error.status = 404;
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: error.message
    });
});

module.exports = app;