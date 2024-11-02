import mongoose, { Schema, Document, Mongoose } from "mongoose";

export interface Message extends Document {
    _id: string;
    content: string;
    createdAt: Date
}

const MessageSchema: Schema<Message> = new Schema({
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
})

export interface User extends Document {
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifyCodeExpiry: Date;
    isVerified: boolean;
    isAcceptingMessage: boolean;
    messages: Message[]
}

const UserSchema: Schema<User> = new Schema({
    username: { type: String, required: [true, "Username is Required"], trim: true, unique: true },
    email: { type: String, required: [true, "Email is Required"], unique: true, match: [/.+\@.+\..+/, "Please use a Valid Email Address"] },
    password: { type: String, required: [true, "password is Required"] },
    verifyCode: { type: String, required: [true, "Verify Code is Required"] },
    verifyCodeExpiry: { type: Date, required: [true, "Verify Code Expiry is Rquired"] },
    isVerified: { type: Boolean, default: false },
    isAcceptingMessage: { type: Boolean, default: true },
    messages: [MessageSchema]
})

const UserModel = (mongoose.models.User as mongoose.Model<User> || mongoose.model<User>("User", UserSchema))
export default UserModel;
