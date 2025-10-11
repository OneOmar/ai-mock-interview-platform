import {db} from "@/firebase/admin";

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
    const {excludeUserId, limit = 10} = params || {};

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
    return doc.exists ? ({id: doc.id, ...doc.data()} as Interview) : null;
  } catch (error) {
    console.error("Error fetching interview:", error);
    return null;
  }
}
