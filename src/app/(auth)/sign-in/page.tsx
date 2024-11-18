"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { signInSchema } from "@/schema/signInSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import GOOGLE from "../../../../public/icons/google.png";
import GITHUB from "../../../../public/icons/github.png";

// Main component for the sign-in page
const Page = () => {
  // State to manage form submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Hook for displaying toast notifications
  const { toast } = useToast();
  // Hook for programmatic navigation
  const router = useRouter();

  // Set up form handling with Zod schema validation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // Function to handle form submission
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    // Attempt to sign in using NextAuth
    const result = await signIn("credentials", {
      redirect: false,
      identifier: data.identifier,
      password: data.password,
    });

    // Handle sign-in failure
    if (result?.error) {
      toast({
        title: "Login Failed",
        description: "Incorrect username or password",
        variant: "destructive",
      });
    }

    // Handle successful sign-in
    if (result?.url) {
      router.replace("/dashboard");
    }
  };

  // Render the sign-in form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Join Mystery Message
          </h1>
          <p className="mb-4">Sign In to start your anonymous adventure</p>
        </div>
        {/* Form component with form state management */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Email/Username input field */}
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email/username"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Password input field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Submit button with loading state */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                </>
              ) : (
                "SignIn"
              )}
            </Button>
          </form>
        </Form>
        {/* Link to sign-up page */}
        <div className="text-center mt-4">
          <p>
            Create new Account?{" "}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign Up
            </Link>
          </p>
        </div>
        <div className="mt-6 flex flex-col items-center">
            <div className="relative w-full">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
            <div className="mt-6 flex justify-center space-x-4">
              <Button
                variant="outline"
                onClick={() => signIn("google")}
                className="w-12 h-12 p-0"
              >
                <Image src={GOOGLE} alt="Google" width={24} height={24} />
              </Button>
              <Button
                variant="outline"
                onClick={() => signIn("github")}
                className="w-12 h-12 p-0"
              >
                <Image src={GITHUB} alt="GitHub" width={24} height={24} />
              </Button>
            </div>
          </div>
      </div>
      ;
    </div>
  );
};

export default Page;
