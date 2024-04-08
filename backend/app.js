const express = require("express")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const UserRouter = require("./routes/User")

const app = express()
app.use(express.json())
app.use(cors())
app.use(cookieParser())

app.use("/", UserRouter)

module.exports = app
