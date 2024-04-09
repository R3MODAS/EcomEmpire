const express = require("express")
const app = express()

const cors = require("cors")
const cookieParser = require("cookie-parser")
const fileUpload = require("express-fileupload")

// Middlewares
app.use(express.json())
app.use(cookieParser())
app.use(cors())
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp"
}))

// Routes

module.exports = app
