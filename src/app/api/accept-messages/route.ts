import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { json } from "stream/consumers";

// POST request handler for updating user's message acceptance status
export async function POST(request: Request) {
    // Connect to the database
    await dbConnect()

    // Get the current user's session
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User;

    // Check if the user is authenticated
    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 })
    }

    const userId = user?._id;
    // Extract acceptMessages from the request body
    const { acceptMessages } = await request.json()

    try {
        // Update the user's isAcceptingMessage status in the database
        const updatedUser = await UserModel.findByIdAndUpdate(userId, { isAcceptingMessage: acceptMessages }, { new: true })
        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: "Failed to update user status to accept messages"
                },
                { status: 401 }
            )
        }
        // Return success response with updated user data
        return Response.json(
            {
                success: true,
                message: "Message acceptance status updated successfully",
                updatedUser
            },
            { status: 200 }
        )
    }
    catch (error) {
        console.log("failed to update user status to accept messages")
        // Return error response if update fails
        return Response.json(
            {
                success: false,
                message: "Failed to update user status to accept messages"
            },
            { status: 500 }
        )
    }
}

// GET request handler for retrieving user's message acceptance status
export async function GET(request: Request) {
    // Connect to the database
    await dbConnect()

    // Get the current user's session
    const session = await getServerSession(authOptions)
    const user: User = session?.user as User;

    try {
        // Check if the user is authenticated
        if (!session || !session.user) {
            return Response.json({
                success: false,
                message: "Unauthorized"
            }, { status: 401 })
        }

        const userId = user?._id;
        // Find the user in the database
        const foundUser = await UserModel.findById(userId)
        if (!foundUser) {
            return Response.json(
                {
                    success: false,
                    message: "User Not Found"
                },
                { status: 404 }
            )
        }
        // Return the user's message acceptance status
        return Response.json(
            {
                success: true,
                isAcceptingMessage: foundUser.isAcceptingMessage
            },
            { status: 200 }
        )
    } catch (error) {
        // Return error response if retrieval fails
        return Response.json(
            {
                success: false,
                message: "Error in getting message acceptance status"
            },
            { status: 500 }
        )
    }
}