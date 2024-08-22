import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { User } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { json } from "stream/consumers"; 


export async function GET(request: Request) {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const user: User = session?.user as User;

    if (!session || !session.user) {
        return Response.json({
            success: false,
            message: "Unauthorized"
        }, { status: 401 })
    }

    const userId = user?._id;
}