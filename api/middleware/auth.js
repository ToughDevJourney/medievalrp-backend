const jwt = require("jsonwebtoken");
const errorHandler = require("../../helpers/error-handler");
const {secretKey} = require("../../config");

module.exports = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.get("Authorization"), secretKey);
    req.userData = decoded;
    next();
  } catch (err) {
    errorHandler(res, err, 401);
  }
};
