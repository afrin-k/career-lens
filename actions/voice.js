"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomInterviewCover } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function generateVoiceInterview(data) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: clerkId },
  });

  if (!user) throw new Error("User not found");

  const prompt = `
    Prepare exactly ${data.amount} interview questions for a ${data.role} position.
    Experience Level: ${data.level}.
    Tech Stack: ${data.techstack}.
    Focus: ${data.type}.
    
    Return ONLY a JSON array of strings. Do not use special characters like * or /.
    Example format: ["Question 1", "Question 2"]
  `;

  try {
    const result = await model.generateContent(prompt);
    const questionsText = result.response.text().trim();
    const questions = JSON.parse(questionsText);

    const interview = await db.voiceInterview.create({
      data: {
        userId: user.id,
        role: data.role,
        level: data.level,
        techstack: data.techstack.split(",").map(s => s.trim()),
        type: data.type,
        questions: questions,
        coverImage: getRandomInterviewCover(),
        status: "STARTED",
      },
    });

    return interview;
  } catch (error) {
    console.error("Voice Gen Error:", error);
    throw new Error("Failed to start interview");
  }
}

export async function getUserInterviews() {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: clerkId } });
  
  return await db.voiceInterview.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
}