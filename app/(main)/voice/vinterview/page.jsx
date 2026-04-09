import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Agent from "../_components/agent";
import Link from "next/link";
import { ChevronLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default async function VInterviewPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="container mx-auto px-4 py-2 space-y-4">
      <div className="flex flex-col gap-2">
        <Link href="/voice">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Interviews
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <h1 className="font-bold gradient-title text-4xl md:text-5xl">
            Interview Generation
          </h1>
        </div>
      </div>

      <Alert className="bg-muted/50 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          You are about to start a <strong>General Screening</strong>. The AI will ask you a series of baseline questions to gauge your profile before generating specialized sessions.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center justify-center min-h-[50vh] bg-card/30 border border-border/50 rounded-3xl p-8 md:p-12 shadow-inner">
        <div className="w-full">
          <Agent 
            userName={user.firstName || "Candidate"} 
            userId={user.id} 
            type="generate" 
          />
        </div>
      </div>

      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs text-muted-foreground uppercase">
          Ensure your microphone is connected and you are in a quiet environment. <br/>
          Your responses will be analyzed to build your career insights.
        </p>
      </div>
    </div>
  );
}