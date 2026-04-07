import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Agent from "../_components/agent";

export default async function VInterviewPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8 p-6">
      <div className="w-full max-w-5xl">
        <h1 className="text-3xl font-bold gradient-title mb-8">
          Interview Generation
        </h1>
        
        <Agent 
          userName={user.firstName || "Candidate"} 
          userId={user.id} 
          type="generate" 
        />
      </div>
    </div>
  );
}