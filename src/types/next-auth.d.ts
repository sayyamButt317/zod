import 'next-auth'
import { DefaultSession } from 'next-auth'


declare module 'next-auth' {
    interface User extends NextAuth.SessionUser {
        _id?: string,
        username?: string,
        isVerified?: boolean,
        isAcceptingMessage?: boolean,
    }
    interface Session extends NextAuth.Session {
        user: {
            _id?: string,
            username?: string,
            isVerified?: boolean,
            isAcceptingMessage?: boolean,
        } & DefaultSession ['user']
    }
}
declare module 'next-auth/jwt'{
    interface JWT {
        _id?: string,
        username?: string,
        isVerified?: boolean,
        isAcceptingMessage?: boolean,
    }
}