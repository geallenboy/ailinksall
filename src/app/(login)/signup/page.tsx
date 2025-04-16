import React from "react";
import LoginImage from "@/components/login/login-image";
import SignUpForm from "@/components/login/signup-form";
// import { getUser } from "@/app/actions/user-action";
import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const SignupPage = async () => {
  // const supabase = await createServer();
  // const [user] = await Promise.all([getUser(supabase)]);

  // if (user) {
  //   return redirect("/dashboard");
  // }
  return (
    <main className="h-screen grid grid-cols-1 md:grid-cols-2 relative">
      <LoginImage />
      <div className="relative flex flex-col items-center justify-center p-8 h-full w-full">
        <div className=" w-full md:w-[400px] mx-auto">
          <SignUpForm />
        </div>
      </div>
    </main>
  );
};

export default SignupPage;
