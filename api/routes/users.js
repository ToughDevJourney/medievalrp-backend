const express = require("express");
const auth = require("../middleware/auth");
const User = require("../models/user.js");
const Token = require("../models/token.js");
const errorHandler = require("../../helpers/error-handler");
const app = express();

app.post("/list", /*auth,*/ (req, res, next) => list(req, res, next));
app.post("/list2",/* auth,*/ (req, res, next) => list2(req, res, next));
app.patch("/:userId", /* auth,*/ (req, res, next) => setSkin(req, res, next));

function setSkin(req, res, next) {
  const userId = req.params.userId;

  console.log(userId)

  User.update({ _id: userId }, { $set: req.body })
    .exec()
    .then((result) => {
      res.status(201).json({
        message: "success",
        result
      });
    })
    .catch((err) => errorHandler(res, err, 500));
}


function list(req, res, next) {
  User.find()
    .then((result) => {
      res.status(200).json({
        result,
      });
    })
    .catch((err) => errorHandler(res, err));
}
//К УДАЛЕНИЮ
function list2(req, res, next) {
  Token.find()
    .then((result) => {
      res.status(200).json({
        result,
      });
    })
    .catch((err) => errorHandler(res, err));
}


module.exports = app;
