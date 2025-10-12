import { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import dayjs from "dayjs";
import { Calendar, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";

// Page metadata
export const metadata: Metadata = {
  title: "Interview Feedback - PrepWise",
  description:
    "View your AI-powered interview feedback and performance analysis.",
};

interface FeedbackPageProps {
  params: Promise<{ id: string }>;
}

export default async function FeedbackPage({ params }: FeedbackPageProps) {
  // Get interview ID
  const { id } = await params;

  // Get current user
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Get interview details
  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // Get feedback
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id,
  });

  if (!feedback) redirect("/");

  // Format date
  const formattedDate = dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A");

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">
          Interview Feedback -{" "}
          <span className="capitalize">{interview.role}</span>
        </h1>

        {/* Meta Info */}
        <div className="flex flex-row justify-center gap-6 text-gray-600">
          <div className="flex items-center gap-2">
            <Star className="size-5 text-yellow-500" />
            <span>
              Overall Score:{" "}
              <span className="font-bold text-primary-200">
                {feedback.totalScore}
              </span>
              /100
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="size-5" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>

      <hr className="border-gray-200" />

      {/* Final Assessment */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Final Assessment</h2>
        <p className="text-gray-500 leading-relaxed">
          {feedback.finalAssessment}
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Performance Breakdown</h2>
        <div className="space-y-4">
          {feedback.categoryScores?.map((category, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-bold text-lg mb-2 text-gray-800">
                {index + 1}. {category.name} ({category.score}/100)
              </h3>
              <p className="text-gray-700">{category.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-green-600">Strengths</h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {feedback.strengths?.map((strength, index) => (
            <li key={index}>{strength}</li>
          ))}
        </ul>
      </div>

      {/* Areas for Improvement */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-orange-600">
          Areas for Improvement
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-700">
          {feedback.areasForImprovement?.map((area, index) => (
            <li key={index}>{area}</li>
          ))}
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <Button asChild variant="outline" className="flex-1">
          <Link href="/">Back to Dashboard</Link>
        </Button>

        <Button asChild className="flex-1 btn-primary">
          <Link href={`/interview/${id}`}>Retake Interview</Link>
        </Button>
      </div>
    </div>
  );
}
