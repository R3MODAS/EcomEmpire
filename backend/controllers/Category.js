const Category = require("../models/Category");

// create category
exports.createCategory = async (req,res) => {
    try{
        // get the data from request body
        const {name, description} = req.body

        // validation of the data
        if(!name || !description){
            return res.status(400).json({
                success: false,
                message: "Please fill the details properly"
            })
        }

        // create an entry for category in db
        await Category.create({name: name, description: description})

        // return the response
        return res.status(200).json({
            success: true,
            message: "Category is created successfully"
        })

    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while creating the category",
            error: err.message
        })
    }
}

// get all categories
exports.getAllCategories = async (req,res) => {
    try{
        // get all the categories
        const categories = await Category.find({}, {name: true, description: true})

        // return the response
        return res.status(200).json({
            success: true,
            message: "Got all the categories successfully",
            data: categories
        })
    }catch(err){
        console.log(err.message);
        return res.status(500).json({
            success: false,
            message: "Something went wrong while getting the category",
            error: err.message
        })
    }
}