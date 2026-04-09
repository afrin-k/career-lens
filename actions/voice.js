"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getRandomInterviewCover } from "@/lib/utils";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

async function generateWithRetry(prompt, retries = 3, delayMs = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      const isRetryable = error?.status === 429 || error?.status === 503;
      if (isRetryable && i < retries - 1) {
        console.log(`Attempt ${i + 1} failed (${error.status}), retrying in ${delayMs}ms...`);
        await new Promise((res) => setTimeout(res, delayMs));
      } else {
        throw error;
      }
    }
  }
}

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
    
    Return ONLY a JSON array of strings. Example format: ["Question 1", "Question 2"] 
    Do not use special characters like * or /.
    
  `;

  try {
    const questionsText = await generateWithRetry(prompt);
    const questions = JSON.parse(questionsText);

    const interview = await db.voiceInterview.create({
      data: {
        userId: user.id,
        role: data.role,
        level: data.level,
        techstack: data.techstack.split(",").map((s) => s.trim()),
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
    include: {feedback: true}, 
  });
}

// ── new functions ──────────────────────────────────────────────────────────────

export async function createVoiceFeedback({ interviewId, userId, transcript }) {
  try {
    // userId here is the Clerk ID — resolve to DB user first
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) throw new Error("User not found");

    const formattedTranscript = transcript
      .map((s) => `- ${s.role}: ${s.content}`)
      .join("\n");

    const prompt = `
      You are an AI interviewer analyzing a mock interview. Evaluate the candidate thoroughly and honestly.
      Do not be lenient — point out mistakes and areas for improvement clearly.

      Transcript:
      ${formattedTranscript}

      Score the candidate from 0 to 100 in exactly these 5 categories, no others:
      - Communication Skills: Clarity, articulation, structured responses.
      - Technical Knowledge: Understanding of key concepts for the role.
      - Problem-Solving: Ability to analyze problems and propose solutions.
      - Cultural & Role Fit: Alignment with company values and job role.
      - Confidence & Clarity: Confidence in responses, engagement, and clarity.

      Return ONLY valid JSON in exactly this shape, no markdown, no extra text:
      {
        "totalScore": <0-100>,
        "categoryScores": [
          { "name": "Communication Skills", "score": <0-100>, "comment": "<string>" },
          { "name": "Technical Knowledge", "score": <0-100>, "comment": "<string>" },
          { "name": "Problem-Solving", "score": <0-100>, "comment": "<string>" },
          { "name": "Cultural & Role Fit", "score": <0-100>, "comment": "<string>" },
          { "name": "Confidence & Clarity", "score": <0-100>, "comment": "<string>" }
        ],
        "strengths": ["<string>", "..."],
        "areasForImprovement": ["<string>", "..."],
        "finalAssessment": "<string>"
      }
    `;

    const raw = await generateWithRetry(prompt);
    const cleaned = raw.replace(/```(?:json)?\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const feedback = await db.voiceFeedback.upsert({
      where: { interviewId },
      update: {
        totalScore: parsed.totalScore,
        categoryScores: parsed.categoryScores,
        strengths: parsed.strengths,
        areasForImprovement: parsed.areasForImprovement,
        finalAssessment: parsed.finalAssessment,
      },
      create: {
        interviewId,
        userId: dbUser.id,        // ← Prisma DB id, not Clerk id
        totalScore: parsed.totalScore,
        categoryScores: parsed.categoryScores,
        strengths: parsed.strengths,
        areasForImprovement: parsed.areasForImprovement,
        finalAssessment: parsed.finalAssessment,
      },
    });

    await db.voiceInterview.update({
      where: { id: interviewId },
      data: { finalized: true, status: "COMPLETED", transcript },
    });

    return { success: true, feedbackId: feedback.id };
  } catch (error) {
    console.error("Error saving voice feedback:", error);
    return { success: false };
  }
}

export async function getVoiceFeedbackByInterviewId({ interviewId, userId }) {
  try {
    // userId is Clerk ID — resolve to DB user first
    const dbUser = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) return null;

    const feedback = await db.voiceFeedback.findUnique({
      where: { interviewId },
    });

    if (!feedback || feedback.userId !== dbUser.id) return null;

    return feedback;
  } catch (error) {
    console.error("Error fetching voice feedback:", error);
    return null;
  }
}

export async function getVoiceInterviewById(id) {
  try {
    return await db.voiceInterview.findUnique({ where: { id } });
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}