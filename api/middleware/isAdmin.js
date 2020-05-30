const User = require("../models/user.js");
const errorHandler = require("../../helpers/error-handler");

module.exports = (req, res, next) => {
  User.findOne({ _id: req.userData.userId })
    .then((user) => {
      if (user.role === "admin") {
        next()
      } else {
        errorHandler(res, "no responsibility", 403);
      }
    })
    .catch((err) => errorHandler(res, err, 500));
};
