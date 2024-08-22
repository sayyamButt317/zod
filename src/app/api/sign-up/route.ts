import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";

export async function GET(request: Request) {
  await dbConnect()

  try {
    const { username, email, password } = await request.json();

    // Check if user exists and is verified
    const existingUserVerifiedByUser = await UserModel.findOne({
      username,
      isVerified: true
    })
    if (existingUserVerifiedByUser) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User already exists and is verified'
        }),
        {
          status: 400,
        }
      )
    }

    // Check if user exists by email
    const exisitingUserByEmail = await UserModel.findOne({ email })
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString()

    if (exisitingUserByEmail) {
      if (exisitingUserByEmail.isVerified) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'User already exists with this email'
          }),
          { status: 400 }
        )
      } else {
        const hashedPassword = await bcrypt.hash(password, 10)
        exisitingUserByEmail.password = hashedPassword;
        exisitingUserByEmail.verifyCode = verifyCode;
        exisitingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000)
        await exisitingUserByEmail.save();
      }
    } else {
      // Hash the password 
      const hashedPassword = await bcrypt.hash(password, 10)
      // Set password expiry 
      const expirydate = new Date()
      expirydate.setHours(expirydate.getHours() + 1)
      // Create new user and save to database
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expirydate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      })
      await newUser.save();
    }

    // Send verification email 
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    )

    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message
      }),
      {
        status: 500,
      }
    }

    return Response.json(
      {
        success: true,
        message: 'User registered successfully. Please check your email for verification',
      }),
    {
      status: 201
    }

  } catch (error) {
    console.error('Error Registering User', error);
    return Response.json({
      success: false,
      message: 'Error registering user'
    }),
    {
      status: 500,
    }

  }
}
