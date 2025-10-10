"use server";

import {auth, db} from "@/firebase/admin";
import {cookies} from "next/headers";

// Constants
const SESSION_DURATION = 60 * 60 * 24 * 7; // 1 week in seconds
const USERS_COLLECTION = "users";

// Cookie configuration
const getCookieOptions = () => ({
  maxAge: SESSION_DURATION,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  sameSite: "lax" as const,
});

// Set session cookie after authentication
export async function setSessionCookie(idToken: string) {
  try {
    const cookieStore = await cookies();

    // Create Firebase session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION * 1000,
    });

    // Store in browser
    cookieStore.set("session", sessionCookie, getCookieOptions());

    return {success: true};
  } catch (error) {
    console.error("Failed to set session cookie:", error);
    return {success: false, message: "Failed to create session"};
  }
}

// Sign up new user
export async function signUp(params: SignUpParams) {
  const {uid, name, email} = params;

  try {
    // Check if user already exists
    const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();

    if (userDoc.exists) {
      return {
        success: false,
        message: "User already exists. Please sign in.",
      };
    }

    // Create new user document
    await db.collection(USERS_COLLECTION).doc(uid).set({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    return {
      success: true,
      message: "Account created successfully. Please sign in.",
    };
  } catch (error) {
    console.error("Sign up error:", error);

    return {
      success: false,
      message: "Failed to create account. Please try again.",
    };
  }
}

// Sign in existing user
export async function signIn(params: SignInParams) {
  const {email, idToken} = params;

  try {
    // Verify user exists
    const userRecord = await auth.getUserByEmail(email);

    if (!userRecord) {
      return {
        success: false,
        message: "User does not exist. Please create an account.",
      };
    }

    // Set session cookie
    const result = await setSessionCookie(idToken);

    if (!result.success) {
      return {
        success: false,
        message: "Failed to create session. Please try again.",
      };
    }

    return {
      success: true,
      message: "Signed in successfully.",
    };
  } catch (error) {
    console.error("Sign in error:", error);

    return {
      success: false,
      message: "Failed to sign in. Please try again.",
    };
  }
}

// Sign out user
export async function signOut() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");

    return {success: true};
  } catch (error) {
    console.error("Sign out error:", error);
    return {success: false};
  }
}

// Get current authenticated user
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) return null;

    // Verify session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Fetch user data from database
    const userDoc = await db
      .collection(USERS_COLLECTION)
      .doc(decodedClaims.uid)
      .get();

    if (!userDoc.exists) return null;

    return {
      id: userDoc.id,
      ...userDoc.data(),
    } as User;
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

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

    // If we're excluding a user we must order by userId before ordering by createdAt
    let query = db.collection("interviews").where("finalized", "==", true);

    // Exclude specific user if provided
    if (excludeUserId) {
      // required: order by the field used with "!="
      query = query.orderBy("userId").where("userId", "!=", excludeUserId);
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
