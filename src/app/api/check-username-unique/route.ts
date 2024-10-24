import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { z } from "zod";
import { usernameValidation } from "@/schema/signUpSchema";

const UsernameQuerySchema = z.object({
  username: usernameValidation,
});

export async function GET(request: Request) {
  await dbConnect();

  try {
    // Get the username from URL
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return Response.json({
        success: false,
        message: 'Username is required',
      }, { status: 400 });
    }

    // Validation with Zod
    const result = UsernameQuerySchema.safeParse({ username });

    if (!result.success) {
      // Username format error check
      const usernameErrors = result.error.format().username?._errors || [];
      return Response.json({
        success: false,
        message: usernameErrors.length > 0 ? usernameErrors.join(', ') : 'Invalid username format',
      }, { status: 400 });
    }

    // Check if username exists and is verified in DB
    const existingVerifiedUser = await UserModel.findOne({ username, isVerified: true });

    if (existingVerifiedUser) {
      return Response.json({
        success: false,
        message: "Username already exists and is verified",
      }, { status: 200 });
    }

    return Response.json({
      success: true,
      message: "Username is available",
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking username:", error);
    return Response.json({
      success: false,
      message: "An error occurred while checking the username",
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}