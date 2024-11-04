'use client'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { verifySchema } from "@/schema/verifySchema";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import axios, { AxiosError } from "axios";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Component for account verification
const VerifyAccount = () => {
  // Hooks for routing and accessing URL parameters
  const router = useRouter();
  const params = useParams<{ username: string }>();
  // Hook for displaying toast notifications
  const { toast } = useToast();

  // Set up form handling with Zod schema validation
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
  });

  // Function to handle form submission
  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      // Send verification code to the API
      const response = await axios.post(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });
      // Display success message
      toast({
        title: "Success",
        description: response.data.message,
      });
      // Redirect to sign-in page after successful verification
      router.replace("sign-in");
    } catch (error) {
      console.log("Error in signing of user", error);
      const axiosError = error as AxiosError<ApiResponse>;

      // Show a toast message if verification failed
      toast({
        title: "Signup Failed",
        description: axiosError.response?.data.message,
        variant: "destructive",
      });
    }
  };

  // Render the verification form
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Verify Your Account
          </h1>
          <p className="mb-4">Enter the Verification Code sent to your email</p>
        </div>
        {/* Form component with form state management */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Verification code input field */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input placeholder="code" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Submit button */}
            <Button type="submit">Submit</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default VerifyAccount;