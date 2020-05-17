const jwt = require("jsonwebtoken");
const errorHandler = require("../../helpers/error-handler");

module.exports = (req, res, next) => {
  try {
    const decoded = jwt.verify(req.get("Authorization"), process.env.JWT_KEY);
    req.userData = decoded;
    next();
  } catch (err) {
    errorHandler(res, err, 401);
  }
};
