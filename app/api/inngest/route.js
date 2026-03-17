export const dynamic = "force-dynamic";

import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { generateIndustryInsights } from "@/lib/inngest/functions";

//creating an api that serves zero functions
export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [
        /* your functions will be passed here later */
        generateIndustryInsights,
    ],
});
