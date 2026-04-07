import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { getRandomInterviewCover } from "@/lib/utils";
import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET() {
  return Response.json({ success: true, data: "THANK YOU!" }, { status: 200 });
}

export async function POST(request) {
  try {
   
    const body = await request.json();
    const { type, role, level, techstack, amount } = body;

    const { userId: clerkId } = await auth();
    const incomingClerkId = clerkId || body.userid;

    if (!incomingClerkId) {
      return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    console.log("[DEBUG] clerkId resolved:", incomingClerkId);

    const user = await db.user.findUnique({
      where: { clerkUserId: incomingClerkId },
    });

    if (!user) {
      console.error("[DEBUG] No DB user for clerkId:", incomingClerkId);
      return Response.json({ success: false, error: "User not found" }, { status: 404 });
    }

    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt: `Prepare questions for a job interview.
        The job role is ${role}.
        The job experience level is ${level}.
        The tech stack used in the job is: ${techstack}.
        The focus between behavioural and technical questions should lean towards: ${type}.
        The amount of questions required is: ${amount}.
        
        Return ONLY a JSON array like:
        ["Question 1", "Question 2"]
        
        Do not include special characters like / or *.
      `,
    });

    console.log("[DEBUG] Raw AI text:", text);

    const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();

    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(cleanedText);
    } catch (err) {
      throw new Error("Failed to parse AI response");
    }

    const interview = await db.voiceInterview.create({
      data: {
        userId: user.id,
        role,
        level,
        type,
        techstack: techstack.split(",").map((t) => t.trim()),
        questions: parsedQuestions,
        transcript: [], 
        status: "STARTED",
        coverImage: getRandomInterviewCover(),
      },
    });

    console.log("[DEBUG] Interview created:", interview.id);

    return Response.json(
      { success: true, interviewId: interview.id },
      { status: 200 }
    );
  } catch (error) {
    console.error("Voice Interview Generation Error:", error);

    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}