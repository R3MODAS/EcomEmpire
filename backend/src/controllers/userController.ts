import { Request, Response, NextFunction } from "express";
import UserModel from "../models/userModel.js";
import { RegisterUserRequestBody } from "../types/authTypes.js";

// Register a user
export const registerUser = async (
    req: Request<{}, {}, RegisterUserRequestBody>,
    res: Response,
    next: NextFunction
) => {
    try {
        {
            // get data from request body
            const { name, email, photo, gender, dob, _id } = req.body;

            // create an entry for user in db
            const user = await UserModel.create({
                name,
                email,
                photo,
                gender,
                dob: new Date(dob),
                _id,
            });

            // return the response
            return res.status(201).json({
                success: true,
                message: "User is registered",
            });
        }
    } catch (err: any) {
        console.log(`Error: ${err}`);
        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
