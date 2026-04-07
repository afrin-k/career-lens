// "use server";

// import { db } from "@/lib/prisma";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// const model = genAI.getGenerativeModel({
//     model:"gemini-2.5-flash",
// })

// export async function generateQuiz(numQuestions=5, topic="", difficulty="Medium") {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//         where:{
//             clerkUserId: userId,
//         },
//     });
    
//     if(!user) throw new Error("User not found");

//     try {
//         const topicLine = topic?.trim()
//             ? `The questions should focus specifically on the topic: "${topic.trim()}".`
//             : "";

//         const prompt = `
//             Generate ${numQuestions} ${difficulty}-difficulty technical intervew questions for a ${user.industry} professional 
//             ${user.skills?.length ? ` with expertise in ${user.skills.join(", ")}` : " "}.
//             ${topicLine}

//             Each question should be MCQ with 4 options.

//             Return the response in this JSON format only, no additional text: 
//             {
//                 "questions": [
//                     {
//                         "question": "string",
//                         "options": ["string", "string", "string", "string"],
//                         "correctAnswer": "string",
//                         "explanation": "string"
//                     }
//                 ]
//             }
//         `;

//         const result = await model.generateContent(prompt);
//         const response = result.response;
//         const text = response.text();
//         const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
//         const quiz = JSON.parse(cleanedText);

//         return quiz.questions;
//     } catch(error) {
//         console.error("Error generating quiz: ",error);
//         throw new Error("Failed to generate quiz questions.");
//     }
// }

// export async function saveQuizResult(questions, answers, score){
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//         where:{
//             clerkUserId: userId,
//         },
//     });
    
//     if(!user) throw new Error("User not found");
    
//     const questionResults = questions.map((q, index) => ({
//         question: q.question,
//         answer: q.correctAnswer,
//         userAnswer: answers[index],
//         isCorrect: q.correctAnswer === answers[index],
//         explanation: q.explanation,
//     }));

//     const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
//     let improvementTip = null;

//     if (wrongAnswers.length > 0){
//         const wrongQuestionsText = wrongAnswers.map((q) =>
//             `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
//         ).join("\n\n");

//         const improvementPrompt = `
//             The user got the following ${user.industry} technical interview questions wrong: 

//             ${wrongQuestionsText}

//             Based on these mistakes provide a concise, specific improvement tip.
//             Focus on the knowledge gaps revealed by these wrong answers.
//             Keep the response under 2 sentences and make it encouraging.
//             Don't explicitly mention the mistakes, instead focus on what to learn/practice.
//         `;

//         try {
//             const result = await model.generateContent(improvementPrompt);
//             const response = result.response;
//             improvementTip = response.text().trim();

//         } catch(error) {
//             console.error("Error generating improvement tip: ", error);
//         }
//     }

//     try {
//         const assessment = await db.assessment.create({
//             data: {
//                 userId: user.id,
//                 quizScore: score,
//                 questions: questionResults,
//                 category: "Technical",
//                 improvementTip,    
//             },
//         });

//         return assessment;
//     } catch(error) {
//         console.error("Error saving quiz result: ",error);
//         throw new Error("Failed to save quiz result.");
//     }
// }

// export async function getAssessments() {
//     const { userId } = await auth();
//     if (!userId) throw new Error("Unauthorized");

//     const user = await db.user.findUnique({
//         where:{
//             clerkUserId: userId,
//         },
//     });
    
//     if(!user) throw new Error("User not found");

//     try {
//         const assessments = await db.assessment.findMany({
//             where: {
//                 userId: user.id,
//             },
//             orderBy: {
//                 createdAt: "desc",
//             },
//         });
//         return assessments;
//     } catch(error) {
//         console.error("Error fetching assessments: ", error);
//         throw new Error("Failed to fetch assessments.");

//     }
// }

"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
});

async function generateWithRetry(prompt, retries = 4, baseDelayMs = 1500) {
    for (let i = 0; i < retries; i++) {
        try {
            const result = await model.generateContent(prompt);
            return result;
        } catch (error) {
            const status = error?.status ?? error?.httpStatus;
            const message = error?.message ?? "";
            const isRetryable =
                status === 503 ||
                status === 429 ||
                status === 500 ||
                message.includes("503") ||
                message.includes("429") ||
                message.includes("overloaded") ||
                message.includes("rate limit");

            if (isRetryable && i < retries - 1) {
                const wait = baseDelayMs * Math.pow(1.8, i); // 1.5s → 2.7s → 4.86s → ...
                console.warn(`Gemini ${status ?? "error"} — retrying in ${Math.round(wait)}ms (attempt ${i + 1}/${retries})`);
                await new Promise((res) => setTimeout(res, wait));
                continue;
            }
            // non-retryable or out of retries — bubble up
            throw error;
        }
    }
}

export async function generateQuiz(numQuestions = 5, topic = "", difficulty = "Medium") {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const topicLine = topic?.trim()
            ? `The questions should focus specifically on the topic: "${topic.trim()}".`
            : "";

        const prompt = `
            Generate ${numQuestions} ${difficulty}-difficulty technical interview questions for a ${user.industry} professional
            ${user.skills?.length ? `with expertise in ${user.skills.join(", ")}` : ""}.
            ${topicLine}

            Each question should be MCQ with 4 options.

            Return the response in this JSON format only, no additional text:
            {
                "questions": [
                    {
                        "question": "string",
                        "options": ["string", "string", "string", "string"],
                        "correctAnswer": "string",
                        "explanation": "string"
                    }
                ]
            }
        `;

        const result = await generateWithRetry(prompt);
        const text = result.response.text();
        const cleanedText = text.replace(/```(?:json)?\n?/g, "").trim();
        const quiz = JSON.parse(cleanedText);

        return quiz.questions;
    } catch (error) {
        console.error("Error generating quiz:", error);
        throw new Error("Failed to generate quiz questions.");
    }
}

export async function saveQuizResult(questions, answers, score) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const questionResults = questions.map((q, index) => ({
        question: q.question,
        answer: q.correctAnswer,
        userAnswer: answers[index],
        isCorrect: q.correctAnswer === answers[index],
        explanation: q.explanation,
    }));

    const wrongAnswers = questionResults.filter((q) => !q.isCorrect);
    let improvementTip = null;

    if (wrongAnswers.length > 0) {
        const wrongQuestionsText = wrongAnswers
            .map(
                (q) =>
                    `Question: "${q.question}"\nCorrect Answer: "${q.answer}"\nUser Answer: "${q.userAnswer}"`
            )
            .join("\n\n");

        const improvementPrompt = `
            The user got the following ${user.industry} technical interview questions wrong:

            ${wrongQuestionsText}

            Based on these mistakes provide a concise, specific improvement tip.
            Focus on the knowledge gaps revealed by these wrong answers.
            Keep the response under 2 sentences and make it encouraging.
            Don't explicitly mention the mistakes, instead focus on what to learn/practice.
        `;

        try {
            const result = await generateWithRetry(improvementPrompt);
            improvementTip = result.response.text().trim();
        } catch (error) {
            console.error("Error generating improvement tip:", error);
            // silent fallback — never block saving the result over a tip
            improvementTip =
                "Keep practicing the topics from this quiz — consistent effort will sharpen your skills quickly!";
        }
    }

    try {
        const assessment = await db.assessment.create({
            data: {
                userId: user.id,
                quizScore: score,
                questions: questionResults,
                category: "Technical",
                improvementTip,
            },
        });

        return assessment;
    } catch (error) {
        console.error("Error saving quiz result:", error);
        throw new Error("Failed to save quiz result.");
    }
}

export async function getAssessments() {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
        where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    try {
        const assessments = await db.assessment.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
        });
        return assessments;
    } catch (error) {
        console.error("Error fetching assessments:", error);
        throw new Error("Failed to fetch assessments.");
    }
}