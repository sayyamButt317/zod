import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { CodeBlock } from "@react-email/components";

export async function POST(request: Request) {
    await dbConnect();
    try {
        const { username, code } = await request.json()
        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({ username: decodedUsername })
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User Not Found"
                },
                { status: 500 }
            )
        }
        const isCodeValid = user.verifyCode === code
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date()

        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true
            await user.save()
            return Response.json(
                {
                    success: true,
                    message: "User Account verified successfully"
                },
                { status: 200 }
            )
        }
        else if (!isCodeNotExpired) {
            return Response.json(
                {
                    success: false,
                    message: "Verificarion Code Expired please signup Again"
                },
                { status: 400 }
            )
        } else {
            return Response.json(
                {
                    success: false,
                    message: "InCorrect Verificarion Code "
                },
                { status: 400 }
            )
        }

    } catch (error) {
        console.log("Error Verifying user", error)
        return Response.json(
            {
                success: false,
                message: "Error verifying user"
            },
            { status: 500 }
        )
    }
}