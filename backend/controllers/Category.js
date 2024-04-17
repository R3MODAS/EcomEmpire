const Category = require("../models/Category");

// Create Category
exports.createCategory = async (req, res) => {
  try {
    // get data from request body
    const { name, description } = req.body;

    // validation of the data
    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // create an entry for category in db
    const createdCategory = await Category.create({ name, description });

    // return the response
    return res.status(200).json({
      success: true,
      message: "Created the Category successfully",
      category: createdCategory,
    });
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the category",
      error: err.message,
    });
  }
};

// Get all the Categories
exports.getAllCategories = async (req, res) => {
  try {
    // get all the categories from the db
    const allcategories = await Category.find(
      {},
      { name: true, description: true }
    );

    // return the response
    return res.status(200).json({
      success: true,
      message: "Got all the categories successfully",
      categories: allcategories,
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
