import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"

// Configuration options for NextAuth
export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            // Function to authorize user credentials
            async authorize(credentials: any): Promise<any> {
                await dbConnect();
                try {
                    // Find user by email or username
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier },
                            { username: credentials.identifier }
                        ]
                    })
                    if (!user) {
                        throw new Error("User not found with this Email");
                    }
                    if (!user.isVerified) {
                        throw new Error("Please Verify your Account before login ");
                    }
                    // Compare provided password with stored hashed password
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
                    if (isPasswordCorrect) {
                        return user
                    } else {
                        throw new Error("Incorrect Password")
                    }
                }
                catch (err: any) {
                    throw new Error(err.message);
                }
            }
        }),
       GoogleProvider({
        clientId: process.env.GOOGLE_ID as string,
        clientSecret: process.env.GOOGLE_SECRET as string,
        authorization: {
            params: {
                prompt: "consent",
                access_type: "offline",
                response_type: "code"
            }
        }
       }),
       GithubProvider({
        clientId: process.env.GITHUB_ID as string,
        clientSecret: process.env.GITHUB_SECRET as string,
       }),
       
       
        
    ],
    callbacks: {
        // Callback to customize JWT token
        async jwt({ token, user, }) {
            if (user) {
                token._id = user._id?.toString();
                token.isVerified = user.isVerified;
                token.isAcceptingMessage = user.isAcceptingMessage;
                token.username = user.username;
            }
            return token;
        },
        // Callback to customize session object
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id
                session.user.isVerified = token.isVerified
                session.user.isAcceptingMessage = token.isAcceptingMessage
                session.user.username = token.username
            }
            return session
        },
    },
    // Custom pages for authentication
    pages: {
        signIn: '/sign-in'
    },
    // Session strategy
    session: {
        strategy: 'jwt'
    },
    // Secret for encrypting tokens, cookies, etc.
    secret: process.env.NEXTAUTH_SECRET
}