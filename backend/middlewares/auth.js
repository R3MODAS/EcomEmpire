const jwt = require("jsonwebtoken");

// Auth middleware
exports.auth = async (req, res, next) => {
  try {
    // get the token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorization").replace("Bearer ", "");

    // validation of the token
    if (!token || token === undefined) {
      return res.status(400).json({
        success: false,
        message: "Token is missing",
      });
    }

    // decode the payload
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = payload;
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid Token",
      });
    }

    next();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Failed to authorize the User",
    });
  }
};

// Instructor middleware
exports.isInstructor = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(400).json({
        success: false,
        message: "Failed to authorize as a Instructor",
      });
    }
    next();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Error while authorizing as a Instructor",
    });
  }
};

// Student middleware
exports.isStudent = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(400).json({
        success: false,
        message: "Failed to authorize as a Student",
      });
    }
    next();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Error while authorizing as a Student",
    });
  }
};

// Admin middleware
exports.isAdmin = async (req, res, next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(400).json({
        success: false,
        message: "Failed to authorize as a Admin",
      });
    }
    next();
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Error while authorizing as a Admin",
    });
  }
};
