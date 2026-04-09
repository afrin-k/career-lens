import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import dayjs from "dayjs";
import { 
  Trophy, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ChevronLeft, 
  RotateCcw,
  BarChart3,
  Quote
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getVoiceInterviewById } from "@/actions/voice";
import { db } from "@/lib/prisma";

export default async function FeedbackPage({ params }) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { clerkUserId: user.id },
  });

  if (!dbUser) redirect("/sign-in");

  const interview = await getVoiceInterviewById(id);
  if (!interview || interview.userId !== dbUser.id) redirect("/voice");

  const feedback = await db.voiceFeedback.findUnique({
    where: { interviewId: id },
  });

  if (!feedback || feedback.userId !== dbUser.id) redirect(`/voice/vinterview/${id}`);

  return (
    <div className="container mx-auto px-4 py-2 space-y-4 max-w-7xl">
      <div className="flex flex-col gap-2">
        <Link href="/voice">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Interviews
          </Button>
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-2">
          <div className="space-y-2">
            <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
              Performance Review
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold gradient-title capitalize">
              {interview.role} Feedback
            </h1>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <Card className="flex-1 md:min-w-[180px] border-primary/20 bg-primary/5">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Trophy className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Score</p>
                  <p className="text-2xl font-bold">{feedback.totalScore}<span className="text-sm font-normal text-muted-foreground">/100</span></p>
                </div>
              </CardContent>
            </Card>

            <Card className="flex-1 md:min-w-[180px]">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-2 bg-muted rounded-lg text-muted-foreground">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Date</p>
                  <p className="text-sm font-bold pt-1">
                    {feedback.createdAt ? dayjs(feedback.createdAt).format("MMM D, YYYY") : "N/A"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Card className="border-l-4 border-l-primary bg-muted/20">
        <CardContent className="p-8">
          <div className="flex gap-4">
            <Quote className="h-8 w-8 text-primary/20 shrink-0" />
            <p className="text-lg leading-relaxed italic text-foreground">
              {feedback.finalAssessment}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Category Analysis</h2>
          </div>
          <div className="space-y-4">
            {feedback.categoryScores?.map((category, index) => (
              <Card key={index} className="border-none bg-muted/30">
                <CardContent className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-sm">{category.name}</span>
                    <span className="font-bold text-sm">{category.score}%</span>
                  </div>
                  <Progress value={category.score} className="h-1.5" />
                  <p className="text-sm text-muted-foreground leading-snug">
                    {category.comment}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <div className="space-y-8">
          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-green-500">
              <CheckCircle2 className="h-5 w-5" />
              Key Strengths
            </h3>
            <ul className="grid gap-3">
              {feedback.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 mt-1.5 shrink-0" />
                  {strength}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="flex items-center gap-2 text-lg font-bold text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Improvement Areas
            </h3>
            <ul className="grid gap-3">
              {feedback.areasForImprovement?.map((area, index) => (
                <li key={index} className="flex items-start gap-3 p-3 rounded-lg bg-yellow-500/5 border border-yellow-500/10 text-sm">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  {area}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
        <Button variant="outline" size="lg" className="flex-1 rounded-xl h-14" asChild>
          <Link href="/voice">
            Back to Dashboard
          </Link>
        </Button>

        <Button size="lg" className="flex-1 rounded-xl h-14 btn-primary" asChild>
          <Link href={`/voice/vinterview/${id}`}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Interview
          </Link>
        </Button>
      </div>
    </div>
  );
}