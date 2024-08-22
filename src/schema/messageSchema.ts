import {z} from "zod";

export const MessageSchema = z.object({
    content:z.string()
    .min(10,"Message must be atleast 10 character long")
    .max(1000,"Message must be at most 300 character long")
})