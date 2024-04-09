const Category = require("../models/Category")

// create category
exports.createCategory = async (req, res) => {
    try {
        // get the category name and desc from request body (user)
        const { name, description } = req.body

        // validation of the data
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "Please fill the name/description properly"
            })
        }

        // create an entry for category in db
        await Category.create({ name: name, description })

        // return the response
        return res.status(200).json({
            success: true,
            message: "Category has been created successfully"
        })
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the category",
            error: err.message
        })
    }
}

// get all categories
exports.getAllCategories = async (req, res) => {
    try {
        // get all the categories
        const allCategories = await Category.find({}, { name: true, courses: true })

        // return the response
        return res.status(200).json({
            success: true,
            message: "All Categories has been fetched successfully",
            data: allCategories
        });

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching all the categories",
            error: err.message
        })
    }
}