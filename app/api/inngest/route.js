export const dynamic = "force-dynamic";

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/functions";

export const runtime = "nodejs";

//creating an api that serves functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    generateIndustryInsights,
  ],
});
