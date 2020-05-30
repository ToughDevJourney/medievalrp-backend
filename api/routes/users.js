const express = require("express");
const auth = require("../middleware/auth");
const isAdmin = require("../middleware/isAdmin")
const User = require("../models/user.js");
const Token = require("../models/token.js");
const errorHandler = require("../../helpers/error-handler");
const app = express();
const { adminKey } = require("../../config")

//app.post("/list", /*auth,*/ (req, res, next) => list(req, res, next));
//app.post("/list2",/* auth,*/ (req, res, next) => list2(req, res, next));
app.patch("/ban", auth, isAdmin, (req, res, next) => ban(req, res, next));
app.patch("/role/admin", auth, (req, res, next) => setRoleAdmin(req, res, next));
app.patch("/skin/poor_peasant", auth, (req, res, next) => setSkinPoorPeasant(req, res, next));
app.patch("/skin/peasant", auth, (req, res, next) => setSkinPeasant(req, res, next));
app.patch("/skin/admin", auth, isAdmin, (req, res, next) => setSkinAdmin(req, res, next));

function ban(req, res, next) {
  User.findOne({ nickname: req.body.nickname })
    .select("_id")
    .then((user) => {
      req._id = user._id;
      User.updateOne({ _id: req._id }, { $set: { banned: true } })
        .exec()
        .then(() => {
          deleteTokens(req, res, next);
        })
        .catch((err) => errorHandler(res, err, 500));
    })
    .catch((err) => errorHandler(res, err, 500));
}

function deleteTokens(req, res, next) {
  Token.deleteMany({ userId: req._id })
    .exec()
    .then((result) => {
      res.status(201).json({
        message: "success",
        result
      });
    })
    .catch((err) => errorHandler(res, err));
}

function setSkinPoorPeasant(req, res, next) {
  req.skin = "poor-peasant";
  updateSkin(req, res, next)
}

function setSkinPeasant(req, res, next) {
  req.skin = "peasant";
  updateSkin(req, res, next)
}

function setSkinAdmin(req, res, next) {
  req.skin = "admin";
  updateSkin(req, res, next);
}

function updateSkin(req, res, next) {
  const userId = req.userData.userId;
  User.updateOne({ _id: userId }, { $set: { skin: req.skin } })
    .exec()
    .then(() => {
      res.status(201).json({
        message: "success"        
      });
    })
    .catch((err) => errorHandler(res, err, 500));
}

function setRoleAdmin(req, res, next){
  if(req.body.adminKey == adminKey){
    req.role = "admin"
    updateRole(req, res, next)
  }
  else{
    errorHandler(res, "wrong password", 403)
  }  
}

function updateRole(req, res, next) {
  const userId = req.userData.userId;

  User.updateOne({ _id: userId }, { $set: { role: req.role } })
    .exec()
    .then(() => {
      res.status(201).json({
        message: "success"        
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
