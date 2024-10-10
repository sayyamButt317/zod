'use client';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounceValue } from 'usehooks-ts'
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/schema/signUpSchema";
import axios, { AxiosError } from "axios";
import { ApiResponse } from "@/types/ApiResponse";

const Page = () => {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedUsername = useDebounceValue(username, 300)
  const { toast } = useToast()
  const router = useRouter()

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',

    }
  })

  useEffect(() => {
    const checkUsernameUnique = async () => {
      if (debouncedUsername) {
        setIsCheckingUsername(true)
        setUsernameMessage('')
        try {
          const response = await axios.get(`/api/check-username-unique?username=${debouncedUsername}`)
          console.log(response)
          setUsernameMessage(response.data.messaage)
        }
        catch (error) {
          const axiosError = error as AxiosError<ApiResponse>;
          setUsernameMessage(
            axiosError.response?.data.message ?? "Error checking username")
        } finally {
          setIsCheckingUsername(false)
        }
      }
      checkUsernameUnique()
    }
  }, [debouncedUsername]
  )
  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true)
    try {
      const resposnse = await axios.post<ApiResponse>(`/api/sign-up`, data)
      console.log(data)
      toast({
        title: "Success",
        description: resposnse.data.message,
        duration: 5000,
      })
      router.replace(`/verify/${username}`)
    } catch (error) {
      console.error("Error in signup of user ",error)
      const axiosError = error as AxiosError<ApiResponse>;
    }
  }
  return (
    <div>Page</div>
  );
}

export default Page;
