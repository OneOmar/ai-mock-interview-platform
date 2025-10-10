import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

// POST: Generate interview questions using Gemini AI
export async function POST(request: NextRequest) {
  try {
    // Extract request parameters
    const { type, role, level, techstack, amount, userid } =
      await request.json();

    // Validate required fields
    if (!type || !role || !level || !techstack || !amount || !userid) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate questions with Gemini AI
    const { text: questions } = await generateText({
      model: google("gemini-2.0-flash-001"),
      prompt: `Generate ${amount} interview questions for a ${role} position.

Experience Level: ${level}
Tech Stack: ${techstack}
Question Type Focus: ${type}

Requirements:
- Return ONLY a JSON array of questions, no markdown formatting
- No code blocks, no backticks, no extra text
- No special characters (/, *, etc.) that break voice assistants
- Questions should be clear and conversational
- Format: ["Question 1", "Question 2", "Question 3"]

Important: Return the raw JSON array directly, not wrapped in \`\`\`json blocks.`
    });

    // Clean response - remove Markdown code blocks if present
    let cleanedQuestions = questions.trim();

    // Remove Markdown code blocks (```json ... ``` or ``` ... ```)
    cleanedQuestions = cleanedQuestions
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    // Parse AI response
    const parsedQuestions = JSON.parse(cleanedQuestions);

    // Validate it's an array
    if (!Array.isArray(parsedQuestions)) {
      throw new Error("Generated questions are not in array format");
    }

    // Create interview document
    const interview = {
      role,
      type,
      level,
      techstack: techstack.split(",").map((tech: string) => tech.trim()),
      questions: parsedQuestions,
      userId: userid,
      finalized: true,
      coverImage: getRandomInterviewCover(),
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    const docRef = await db.collection("interviews").add(interview);

    // Return success response
    return NextResponse.json(
      {
        success: true,
        interviewId: docRef.id,
        questionsCount: parsedQuestions.length
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Interview generation error:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate interview"
      },
      { status: 500 }
    );
  }
}

// GET: Health check endpoint
export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: "Interview generation API is running",
      version: "1.0.0"
    },
    { status: 200 }
  );
}
