"use client";
import AuthButton from "./components/buttonGoogle";

export default function Home() {
   return (
      <>
         <h1 className="text-3xl font-bold">Welcome to the Home Page</h1>
         <p className="mt-4">This is the main content area.</p>

         <AuthButton />
      </>
   );
}
