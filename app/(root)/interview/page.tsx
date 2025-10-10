import { Metadata } from "next";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { redirect } from "next/navigation";

// Page metadata
export const metadata: Metadata = {
  title: "Generate Interview - PrepWise",
  description: "Create a personalized AI-powered mock interview tailored to your role and tech stack."
};

export default async function InterviewPage() {
  // Get authenticated user
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Generate Interview</h1>
        <p className="text-gray-600">
          Create a personalized mock interview based on your target role and technology stack.
        </p>
      </div>

      {/* Agent Component */}
      <Agent
        userId={user?.id}
        userName={user?.name}
        type="generate"
      />
    </div>
  );
}