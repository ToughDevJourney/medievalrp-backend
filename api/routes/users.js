const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/user.js");
const errorHandler = require("../../helpers/error-handler");
const app = express();

app.post("/list", auth, (req, res, next) => list(req, res, next));

function list(req, res, next) {
  User.find()
    .then((result) => {
      res.status(200).json({
        result,
      });
    })
    .catch((err) => errorHandler(res, err));
}

module.exports = app;
