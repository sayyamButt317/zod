import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";


export async function POST(request: Request) {
await dbConnect()

const {username,content} = await request.json()

try {
    const user = await UserModel.findOne({ username });
    if (!user) {
        return Response.json({
            success: false,
            message: "User Not Found"
        }, { status: 404 })
    }
    //is user accepting the message
    if(!user.isAcceptingMessage){
        return Response.json({
            success: false,
            message: "User is Not accepting the messages"
        }, { status: 403 })
    }
    const newMessage = {content,createdAt: new Date()}
    user.messages.push(newMessage as Message)
    await user.save()
    return Response.json({
        success: true,
        message: "message send successfully"
    }, { status: 200 })
} catch (error) {
    console.log("Error in sending message", error)
    return Response.json({
        success: false,
        message: "Internal Server Error"
    }, { status:  500})
}

}