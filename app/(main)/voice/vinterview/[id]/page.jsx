import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/prisma";
import Agent from "../../_components/agent";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Mic2 } from "lucide-react";

export default async function InterviewPage({ params }) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) redirect("/sign-in");

  const interview = await db.voiceInterview.findUnique({
    where: { id },
  });

  if (!interview || interview.userId !== dbUser.id) redirect("/voice");

  return (
    <div className="container mx-auto px-4 py-2 space-y-8">
      <div className="flex flex-col gap-2">
        <Link href="/voice">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Exit to Dashboard
          </Button>
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                Live Assessment
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Mic2 className="h-3 w-3" />
                Audio Enabled
              </span>
            </div>
            <h1 className="font-bold gradient-title text-4xl md:text-5xl capitalize">
              {interview.role} Practice
            </h1>
          </div>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-[60vh] bg-card/20 border border-border/50 rounded-3xl p-6 md:p-12 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="w-full max-w-4xl">
          <Agent
            userName={user.firstName || "Candidate"}
            userId={user.id}
            interviewId={id}
            type="interview"
            questions={interview.questions}
          />
        </div>
      </div>

      <div className="max-w-xl mx-auto text-center">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 leading-relaxed">
          This session is recorded for AI synthesis. <br />
          Your feedback will be available immediately after the call ends.
        </p>
      </div>
    </div>
  );
}