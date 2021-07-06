const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const usersRoutes = require("./api/routes/users.js");
const authRoutes = require("./api/routes/auth.js");
const { atlasPassword } = require("./config");
const app = express();

mongoose.connect(
  `mongodb+srv://dbAdmin:${atlasPassword}@cluster0.r10ty.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  { useNewUrlParser: true, useUnifiedTopology: true }
);

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); //кто может быть источником запроса?
  res.header("Access-Control-Allow-Headers", "*"); //какие хэдеры могут быть использованы?

  if (req.method == "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, GET, DELETE, PATCH"); //какие методы могут быть вызваны?
    return res.status(200).json({});
  }

  next();
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);

app.use((req, res, next) => {
  let error = new Error("NOT FOUND, BRUH, ITS 404");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: error.message,
  });
});

module.exports = app;
