"use server";

import { db } from "@/firebase/admin";
import { generateObject } from "ai";
import { feedbackSchema } from "@/constants";
import { google } from "@ai-sdk/google";

// Get user's interviews from Firestore
export async function getInterviewsByUserId(
  userId?: string,
): Promise<Interview[] | null> {
  // Validate user ID
  if (!userId) return [];

  try {
    // Fetch interviews ordered by creation date
    const snapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    // Map documents to Interview objects
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching user interviews:", error);
    return [];
  }
}

// Get latest finalized interviews (optionally exclude specific user)
export async function getLatestInterviews(params?: {
  excludeUserId?: string;
  limit?: number;
}): Promise<Interview[]> {
  try {
    const { excludeUserId, limit = 10 } = params || {};

    // Build base query for finalized interviews
    let query = db.collection("interviews").where("finalized", "==", true);

    // Exclude specific user if provided
    if (excludeUserId) {
      // Order by userId first (required for != operator)
      query = query
        .orderBy("userId")
        .where("userId", "!=", excludeUserId)
        .orderBy("createdAt", "desc");
    } else {
      // No exclusion, just order by date
      query = query.orderBy("createdAt", "desc");
    }

    // Fetch limited results
    const snapshot = await query.limit(limit).get();

    // Map documents to Interview objects
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return [];
  }
}

// Fetch a single interview by its ID
export async function getInterviewById(id: string): Promise<Interview | null> {
  if (!id) return null; // Validate input

  try {
    const doc = await db.collection("interviews").doc(id).get();

    // Return interview data if it exists
    return doc.exists ? ({ id: doc.id, ...doc.data() } as Interview) : null;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}

// Create or update interview feedback using AI analysis
export async function createFeedback(params: CreateFeedbackParams) {
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Format transcript for AI analysis
    const formattedTranscript = transcript
      .map((sentence) => `- ${sentence.role}: ${sentence.content}`)
      .join("\n");

    // Generate AI feedback with structured output
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}
        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
    });

    // Prepare feedback document
    const feedback = {
      interviewId,
      userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    // Create or update feedback document
    const feedbackRef = feedbackId
      ? db.collection("feedback").doc(feedbackId)
      : db.collection("feedback").doc();

    await feedbackRef.set(feedback);

    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    console.error("Error creating feedback:", error);
    return { success: false };
  }
}

// Get feedback for a specific interview and user
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams,
): Promise<Feedback | null> {
  try {
    const { interviewId, userId } = params;

    // Query feedback by interview and user
    const snapshot = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    // Return null if no feedback found
    if (snapshot.empty) return null;

    // Return feedback with document ID
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Feedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}

// Get all feedback for a specific user
export async function getFeedbacksByUserId(
  userId: string,
): Promise<Feedback[]> {
  try {
    const snapshot = await db
      .collection("feedback")
      .where("userId", "==", userId)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Feedback[];
  } catch (error) {
    console.error("Error fetching user feedbacks:", error);
    return [];
  }
}
