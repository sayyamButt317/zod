import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import z from "zod";
import { usernameValidation } from "@/schema/signUpSchema";


const UsernameQuerySchema = z.object({
    username: usernameValidation
})

export async function Get(request: Request) {
    await dbConnect();

    try {
        //get the username from URL 
        const { searchParams } = new URL(request.url)
        const queryParam = {
            username: searchParams.get('username')
        }
        //validation with zod 
        const result = UsernameQuerySchema.safeParse(queryParam)
        console.log(result)
        if (!result.success) {
            //user name format error check
            const usernameErrors = result.error.format().username?._errors || []
            return Response.json({
                success: false,
                message: usernameErrors?.length > 0 ? usernameErrors.join(',') : 'Invalid query parameters',
            }, { status: 400 })
        }
        //check usernmae is exist and verified in db
        const { username } = result.data;
        const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });
        if (existingVerifiedUser) {
            return Response.json({
                success: true,
                message: "Username already exists and is verified"
            }, { status: 400 })
        }
        return Response.json({
            success: true,
            message: "Username is Unique and is Available"
        }, { status: 400 })
    } catch (error) {
        console.log("Error checking username", error)
        return Response.json(
            {
                success: false,
                message: "Error checking Username"
            },
            {
                status: 500
            }
        )
    }
}