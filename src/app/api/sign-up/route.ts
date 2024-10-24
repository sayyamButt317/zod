import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    // Check if user exists and is verified
    const existingUserVerifiedByUser = await UserModel.findOne({
      username,
      isVerified: true
    });

    if (existingUserVerifiedByUser) {
      return NextResponse.json(
        {
          success: false,
          message: 'User already exists and is verified'
        },
        { status: 400 }
      );
    }

    // Check if user exists by email
    const existingUserByEmail = await UserModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: 'User already exists with this email'
          },
          { status: 400 }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUserByEmail.save();
      }
    } else {
      // Hash the password 
      const hashedPassword = await bcrypt.hash(password, 10);
      // Set password expiry 
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);
      // Create new user and save to database
      const newUser = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false,
        isAcceptingMessage: true,
        messages: [],
      });
      await newUser.save();
    }

    // Send verification email 
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'User registered successfully. Please check your email for verification',
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error Registering User', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error registering user'
      },
      { status: 500 }
    );
  }
}