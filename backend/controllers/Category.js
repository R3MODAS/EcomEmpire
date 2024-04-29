const Category = require("../models/Category")

// Create Category
exports.createCategory = async (req,res) => {
    try {
        // get name and description from request body
        const {name, description} = req.body

        // validation of the data
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "Name/Description is required"
            })
        }

        // create the category
        const category = await Category.create({ name, description})

        // return the response
        return res.status(200).json({
            success: true,
            message: "Category is created successfully",
            category
        })
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the category",
            error: err.message
        })
    }
}

// Show all Categories
exports.showAllCategories = async (req,res) => {
    try{
        // find all the categories
        const allCategories = await Category.find({}, {name: true, description: true})

        // return the response
        return res.status(200).json({
            success: true,
            message: "Got all the Categories successfully",
            allCategories
        })
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while fetching all the categories",
            error: err.message
        })
    }
}