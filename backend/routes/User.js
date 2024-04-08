const { Router } = require("express")
const router = Router()

const { sendOtp, signup, login, changePassword } = require("../controllers/Auth")
const { auth } = require("../middlewares/auth")

router.post('/send-otp', sendOtp)
router.post("/signup", signup)
router.post("/login", login)
router.post("/change-password", auth, changePassword)

module.exports = router