import mongoose, { Schema, Document } from "mongoose";
import validator from "validator";

// Type for user schema
interface User extends Document {
    _id: string;
    name: string;
    email: string;
    photo: string;
    role: "admin" | "user";
    gender: "male" | "female";
    dob: Date;
    createdAt: Date;
    updatedAt: Date;
    age: number; // Virtual data
}

const userSchema: Schema<User> = new Schema(
    {
        _id: {
            type: String,
            required: [true, "Please provide a id"],
        },
        name: {
            type: String,
            trim: true,
            required: [true, "Please provide a name"],
        },
        email: {
            type: String,
            unique: true,
            trim: true,
            required: [true, "Please provide a email"],
            validate: validator.default.isEmail,
        },
        photo: {
            type: String,
            required: [true, "Please provide a photo"],
        },
        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        dob: {
            type: Date,
            required: [true, "Please provide a date of birth"],
        },
        gender: {
            type: String,
            enum: ["male", "gender"],
            required: [true, "Please provide a gender"],
        },
    },
    { timestamps: true }
);

userSchema.virtual("age").get(function () {
    const today = new Date();
    const dob = this.dob;
    let age = today.getFullYear() - dob.getFullYear();

    if (
        today.getMonth() < dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate())
    ) {
        age--;
    }
    return age;
});

const UserModel = mongoose.model<User>("User", userSchema);
export default UserModel;
