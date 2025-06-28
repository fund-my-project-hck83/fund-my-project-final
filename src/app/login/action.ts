"use server";

import { cookies } from "next/headers";

export async function setCookie(name: string, value: string) {
   try {
      const cookieStore = await cookies();
      cookieStore.set(name, value, {
         httpOnly: false, // Agar bisa dilihat di browser inspect
         secure: process.env.NODE_ENV === "production", // HTTPS di production
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7, // 7 hari
         path: "/",
      });
   } catch (error) {
      console.error("Error setting cookie:", error);
   }
}

export async function getCookie(name: string) {
   const cookieStore = await cookies();
   return cookieStore.get(name);
}

export async function deleteCookie(name: string) {
   try {
      const cookieStore = await cookies();
      cookieStore.delete(name);
   } catch (error) {
      console.error("Error deleting cookie:", error);
   }
}
