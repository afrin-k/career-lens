import { Inngest } from "inngest";

// creating a client to send and request events
export const inngest = new Inngest({
    id: "career-lens", 
    name: "Career Lens",
    credentials: {
        gemini: {
            apiKey: process.env.GEMINI_API_KEY,
        },
    },
});