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
      if (!body.username)
         return redirect("/register?error=Username is required");
      if (!body.email) return redirect("/register?error=Email is required");
      if (!body.password)
         return redirect("/register?error=Password is required");
      const resp = await fetch("http://localhost:3000/api/register", {
         method: "POST",
         headers: {
            "Content-Type": "application/json",
         },
         body: JSON.stringify(body),
      });
      const data = await resp.json();
      if (!resp.ok) {
         return redirect(
            `/register?error=${data.message || "Something went wrong"}`
         );
      }
      redirect("/login");
   };
   return (
      <div className="min-h-screen bg-black flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
         <div className="max-w-md w-full space-y-8 bg-white rounded-xl shadow-2xl p-8 border border-gray-200">
            <div className="text-center">
               <h1 className="text-3xl font-bold text-black mb-2">
                  Create Account
               </h1>
               <p className="text-gray-600 text-sm">
                  Join us today and get started
               </p>
            </div>

            {error && (
               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
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
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>

                  <div>
                     <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>

                  <div>
                     <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>

                  <div>
                     <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>

                  <div>
                     <input
                        type="text"
                        name="profilePicture"
                        placeholder="Profile Picture URL (optional)"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition duration-200 text-black bg-white placeholder-gray-500"
                     />
                  </div>
               </div>

               <button
                  type="submit"
                  className="w-full bg-black text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
               >
                  Create Account
               </button>
            </form>

            <div className="text-center">
               <p className="text-gray-600 text-sm">
                  Already have an account?
                  <Link
                     href="/login"
                     className="text-black font-semibold hover:underline transition duration-200"
                  >
                     Sign in here
                  </Link>
               </p>
            </div>
         </div>
      </div>
   );
}
