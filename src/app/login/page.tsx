"use client";

import { ILogin } from "@/server/models/UserModel";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from "sweetalert2";
import Link from "next/link";
import AuthButton from "@/components/buttonGoogle";
import { setCookie } from "./action";
import Navbar from "@/components/Navbar";

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
      const resp = await fetch("/api/login", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          email: input.email,
          password: input.password,
        }),
      });

      const result = await resp.json();

      await setCookie("access_token", result.token);

      if (!resp.ok) {
        Swal.fire({
          icon: "error",
          title: "Login Failed",
          text: "Invalid email or password",
        });
        return;
      }
      if (resp?.ok) {
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
    <>
      <Navbar />
      <div className="bg-white pt-24 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white border border-black rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-medium text-black mb-2">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm font-normal">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <AuthButton />

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="flex-shrink mx-4 text-gray-400 text-sm font-normal">
                or
              </span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>
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
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={input.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-full font-normal hover:bg-gray-800 transition-colors"
            >
              Sign In
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm font-normal">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-black font-normal hover:underline transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
