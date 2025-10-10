import {NextRequest, NextResponse} from "next/server";

/**
 * POST /api/vapi/workflow/start
 *
 * Purpose:
 * - Starts a VAPI workflow call from the server-side
 * - Acts as a proxy to VAPI API to keep secret keys secure
 * - Forwards workflow variables and returns call details
 *
 * Use Cases:
 * - Initiate AI-powered interview workflows
 * - Pass user-specific variables (name, role, tech stack)
 * - Get call ID for tracking and management
 *
 * Security:
 * - Uses server-side secret key (not exposed to client)
 * - Validates required environment variables
 */

export async function POST(request: NextRequest) {
  try {
    // Extract input variables from request
    const {input = {}} = await request.json();

    // Get VAPI credentials from environment
    const workflowId = process.env.VAPI_WORKFLOW_ID;
    const secretKey = process.env.VAPI_SECRET_KEY;

    // Validate required credentials
    if (!workflowId || !secretKey) {
      return NextResponse.json(
        {success: false, error: "VAPI credentials not configured"},
        {status: 500},
      );
    }

    console.log("Starting VAPI workflow:", workflowId);
    console.log("Input variables:", input);

    // Call VAPI API to start workflow
    const response = await fetch("https://api.vapi.ai/call", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${secretKey}`,
      },
      body: JSON.stringify({
        workflowId,
        type: "webCall",
        workflowOverrides: {
          variableValues: input,
        },
      }),
    });

    // Parse VAPI response
    const data = await response.json();

    console.log("VAPI response:", response.status, data);

    // Return VAPI response to client
    return NextResponse.json(data, {status: response.status});
  } catch (error) {
    console.error("Workflow start error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to start workflow",
        details: error instanceof Error ? error.message : String(error),
      },
      {status: 500},
    );
  }
}
