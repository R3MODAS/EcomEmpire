const Category = require("../models/Category");

// Create a Category
exports.createCategory = async (req, res) => {
  try {
    // get data from request body
    const { name, description } = req.body;

    // validation of the data
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "Please fill all the data properly",
      });
    }

    // create an entry for category in db
    const createdCategory = await Category.create({
      name,
      description,
    });

    // return the response
    return res.status(200).json({
      success: true,
      message: "Category is created successfully",
      category: createdCategory,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating a category",
      error: err.message,
    });
  }
};

// Get all Categories
exports.getAllCategories = async (req, res) => {
  try {
    // get all the categories with name and description
    const allCategories = await Category.find(
      {},
      { name: true, description: true }
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Got all the Categories successfully",
      categories: allCategories,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching all the categories",
      error: err.message,
    });
  }
};
