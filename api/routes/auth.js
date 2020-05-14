const mongoose = require("mongoose");
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const { secretKey } = require("../../config");
const errorHandler = require("../../helpers/error-handler");
const auth = require("../middleware/auth");

const User = require("../models/user");
const Token = require("../models/token");

const app = express();

app.post("/signup", (req, res, next) => signup(req, res, next));
app.post("/signin", (req, res, next) => signin(req, res, next));
app.post("/refresh", (req, res, next) => refresh(req, res, next));
app.post("/logout", auth, (req, res, next) => logout(req, res, next));
//app.post("/delete", (req, res, next) => deleteToken(req, res, next));



function signup(req, res, next) {
  User.find({ email: req.body.email })
    .then((result) => {
      if (result.length >= 1) {
        errorHandler(res, "email exists", 409);
      } else {
        bcrypt.hash(req.body.password, 7, (err, hash) => {
          if (err) {
            return errorHandler(res, "encrypt failed", 500);
          } else {
            const user = new User({
              _id: mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "success",
                });
              })
              .catch((err) => errorHandler(res, err));
          }
        });
      }
    })
    .catch((err) => errorHandler(res, err));
}

function signin(req, res, next) {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        errorHandler(res, "auth failed", 403);
      } else {
        bcrypt.compare(req.body.password, user.password, (err, same) => {
          if (same) {
            return issueTokenPair(res, user._id);
          }
          return errorHandler(res, "auth failed", 403);
        });
      }
    })
    .catch((err) => errorHandler(res, err));
}

function refresh(req, res, next) {
  Token.findOne({ refreshToken: req.body.refreshToken })
    .exec()
    .then((token) => {      
      if (token) {
        issueTokenPair(res, token.userId);
      }
      else{
        errorHandler(res, "token not found", 404);
      }
    })
    .catch((err) => errorHandler(res, err));
}

function logout(req, res, next) {
  Token.deleteMany({ userId: req.userData.userId })
    .exec()
    .then((result) => {      
      console.log(result);
      res.status(200).json({
        message: "logout succeeded"
      });
    })
    .catch((err) => errorHandler(res, err));
}

function issueTokenPair(res, userId) {
  const refreshToken = uuid();
  const accessToken = jwt.sign({ userId: userId }, secretKey, {
    expiresIn: "15m",
  });
  const newToken = new Token({
    _id: mongoose.Types.ObjectId(),
    userId,
    refreshToken,
  });


  Token.deleteMany({ userId })
    .exec()
    .then(() => {
      newToken
        .save()
        .then(() => {
          res.status(200).json({
            accessToken,
            refreshToken,
          });
        })
        .catch((err) => errorHandler(res, err));
    })
    .catch((err) => errorHandler(res, err));    
}

module.exports = app;








// function deleteToken(req, res, next){
//   Token.deleteOne()
//   .exec()
//   .then(result => {
//     console.log(result.deletedCount)
//     return res.status(201).json({
//       mes: result
//     })
//   })
//   .catch((err) => errorHandler(res, err));
// }
