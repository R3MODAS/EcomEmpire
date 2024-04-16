const jwt = require("jsonwebtoken");

// Auth
exports.auth = async (req,res,next) => {
    try{
        // get the token
        const token = req.body.token || req.cookies.token || req.header("Authorization").replace("Bearer ", "")

        // validation of the token
        if(!token || token === undefined){
            return res.status(400).json({
                success: false,
                message: "Invalid Token"
            })
        }

        // decode the token for payload
        try{
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            req.user = decoded
        }catch(err){
            return res.status(500).json({
                success: false,
                message: "Something went wrong while decoding the value"
            })
        }
        next()
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while authorizing the user"
        })
    }
}

// Student
exports.isStudent = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Student"){
            return res.status(400).json({
                success: false,
                message: "Failed to authorize as Student"
            })
        }
        next()
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while authorizing as Student",
            error: err.message
        })
    }
}

// Admin
exports.isAdmin = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Admin"){
            return res.status(400).json({
                success: false,
                message: "Failed to authorize as Admin"
            })
        }
        next()
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while authorizing as Admin",
            error: err.message
        })
    }
}

// Instructor
exports.isInstructor = async(req,res,next) => {
    try{
        if(req.user.accountType !== "Instructor"){
            return res.status(400).json({
                success: false,
                message: "Failed to authorize as Instructor"
            })
        }
        next()
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while authorizing as Instructor",
            error: err.message
        })
    }
}