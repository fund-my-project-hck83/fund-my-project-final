"use client";

import { ILogin } from "@/server/models/UserModel";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import AuthButton from "../components/buttonGoogle";
import { signIn } from "next-auth/react";

export default function LoginPage() {
   const [input, setInput] = useState<ILogin>({
      email: "",
      password: "",
   });
   const router = useRouter();

   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setInput({
         ...input,
         [name]: value,
      });
   };
   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
         const result = await signIn("credentials", {
            email: input.email,
            password: input.password,
            redirect: false,
         });

         if (result?.error) {
            Swal.fire({
               icon: "error",
               title: "Login Failed",
               text: "Invalid email or password",
            });
            return;
         }

         if (result?.ok) {
            Swal.fire({
               icon: "success",
               title: "Login Successful",
               text: "Welcome back!",
            });
            router.push("/");
         }
      } catch (error) {
         console.error("Login error:", error);
         Swal.fire({
            icon: "error",
            title: "Login Failed",
            text: "Something went wrong. Please try again.",
         });
      }
   };

   return (
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-black mb-2">
                  Welcome Back
               </h1>
               <p className="text-gray-600 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
               <div className="space-y-4">
                  <div>
                     <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={input.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>

                  <div>
                     <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={input.password}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>
               </div>
               <AuthButton />
               <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
               >
                  Sign In
               </button>
            </form>

            <div className="text-center">
               <p className="text-gray-600 text-sm">
                  Don&apos;t have an account?
                  <Link
                     href="/register"
                     className="text-black font-semibold hover:underline transition duration-200"
                  >
                     Create one here
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
}
