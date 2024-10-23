"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceCallback } from "usehooks-ts";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { signUpSchema } from "../../../schema/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";


const Page = () => {
  const [username, setUsername] = useState("");
  const [usernameMessage, setUsernameMessage] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const debouncedUsername = useDebounceCallback(username, 300);
  const { toast } = useToast();
  const router = useRouter();

  //zod implementation
  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });
//check username is unique 
  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername()) {
        setIsCheckingUsername(true);
        setUsernameMessage("");
        //api call to check username
        try {
          const response = await axios.get(
            `/api/check-username-unique?username=${debouncedUsername}`
          );
          setUsernameMessage(response.data.message);
        } catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error Checking username"
          );
        } finally {
          setIsCheckingUsername(false);
        }
      }
    };
    checkUsernameUnique();
  }, [debouncedUsername]);


  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try{
      const response = await axios.post<ApiResponse>('/api/sign-up',data)
      toast({
        title:"Success",
        description: response.data.message
      })
      //replace the route and navigate
      router.replace(`/verify/${username}`)
    } catch(error){
      console.log("Error in signing of user",error)
      const axiosError = error as AxiosError<ApiResponse>;
      let errorMessage =axiosError.response?.data.message
      toast({
      title:"Signup Failed",
      description: errorMessage,
      variant: "destructive"
      })
      setIsSubmitting(false)
    }
  };
  return <div>Page</div>;
};

export default Page;
