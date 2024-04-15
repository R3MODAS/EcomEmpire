const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

module.exports = app