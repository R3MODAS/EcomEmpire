const jwt = require("jsonwebtoken")
const User = require("../models/User")

// auth
exports.auth = async (req,res,next) => {
    try{    
        // get the token
        const token = req.cookies.token

        // validation of token
        if(!token || token === undefined){
            return res.status(401).json({
                success: false,
                message: "Invalid Token"
            })
        }

        // get the payload from the token
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
        }
        catch(err){
            return req.status(500).json({
                success: false,
                message: "Failed to verify the token and decode the value"
            })
        }
        next()
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Error while Authenticating",
            error: err.message
        })
    }
}

// student
exports.isStudent = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(401).json({
                success: false,
                message: "Failed to authorize as Student"
            })
        }
        next()
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Error while authenticating for student role",
            error: err.message
        })
    }
}

// instructor
exports.isInstructor = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(401).json({
                success: false,
                message: "Failed to authorize as Instructor"
            })
        }
        next()
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Error while authenticating for instructor role",
            error: err.message
        })
    }
}

// admin
exports.isAdmin = async (req,res,next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(401).json({
                success: false,
                message: "Failed to authorize as Admin"
            })
        }
        next()
    }catch(err){
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Error while authenticating for admin role",
            error: err.message
        })
    }
}