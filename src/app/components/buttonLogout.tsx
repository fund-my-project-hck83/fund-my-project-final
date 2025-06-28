"use client";

import { deleteCookie } from "@/app/login/action";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function LogoutButton() {
   const router = useRouter();
   const handleLogout = async () => {
      await deleteCookie("access_token");
      Swal.fire({
         icon: "success",
         title: "Logout Successful",
         text: "You have been logged out.",
      });
      router.push("/login");
   };

   return (
      <button
         onClick={handleLogout}
         className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
      >
         Logout
      </button>
   );
}
