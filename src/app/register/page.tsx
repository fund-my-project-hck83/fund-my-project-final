import Navbar from "@/components/Navbar";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { error } = await searchParams;
  const handleRegister = async (param: FormData) => {
    "use server";
    const body = {
      name: param.get("name"),
      username: param.get("username"),
      email: param.get("email"),
      password: param.get("password"),
      profilePicture: param.get("profilePicture") || "",
    };
    if (!body.name) return redirect("/register?error=Name is required");
    if (!body.username) return redirect("/register?error=Username is required");
    if (!body.email) return redirect("/register?error=Email is required");
    if (!body.password) return redirect("/register?error=Password is required");
    const resp = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );
    const data = await resp.json();
    if (!resp.ok) {
      return redirect(
        `/register?error=${data.message || "Something went wrong"}`
      );
    }
    redirect("/login");
  };
  return (
   <>
   <Navbar/>
    <div className="bg-white pt-24 pb-24 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8 bg-white border border-black rounded-lg p-8">
          <div className="text-center">
            <h1 className="text-3xl font-medium text-black mb-2">
              Create Account
            </h1>
            <p className="text-gray-600 text-sm font-normal">Join us today and get started</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm font-normal">
              {error}
            </div>
          )}

          <form action={handleRegister} className="space-y-6">
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>

              <div>
                <input
                  type="text"
                  name="profilePicture"
                  placeholder="Profile Picture URL (optional)"
                  className="w-full px-4 py-3 border border-black rounded-full focus:outline-none focus:border-gray-800 transition-colors text-black bg-white placeholder-gray-500 font-normal"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-full font-normal hover:bg-gray-800 transition-colors"
            >
              Create Account
            </button>
          </form>

          <div className="text-center">
            <p className="text-gray-600 text-sm font-normal">
              Already have an account?{' '}
              <Link
                href="/login"
                className="text-black font-normal hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
