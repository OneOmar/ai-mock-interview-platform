import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Star } from "lucide-react";

import { Button } from "./ui/button";
import InterviewTechIcons from "./InterviewTechIcons";
import { cn, getRandomInterviewCover } from "@/lib/utils";

// Type badge color mapping
const TYPE_COLORS = {
  behavioral: "bg-blue-100 text-blue-700",
  mixed: "bg-purple-100 text-purple-700",
  technical: "bg-green-100 text-green-700",
} as const;

export default function InterviewCard({
  interviewId,
  role,
  type,
  techstack,
  createdAt,
  feedback = null,
}: InterviewCardProps) {
  // Normalize interview type to lowercase
  const normalizedType = /mix/gi.test(type) ? "mixed" : type.toLowerCase();

  // Capitalize for display
  const displayType =
    normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);

  // Get badge color
  const badgeColor =
    TYPE_COLORS[normalizedType as keyof typeof TYPE_COLORS] ||
    TYPE_COLORS.mixed;

  // Format date
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now(),
  ).format("MMM D, YYYY");

  // Determine card state
  const hasCompleted = !!feedback;
  const linkHref = hasCompleted
    ? `/interview/${interviewId}/feedback`
    : `/interview/${interviewId}`;
  const buttonText = hasCompleted ? "View Feedback" : "Start Interview";

  return (
    <article className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div className="space-y-6">
          {/* Type Badge */}
          <span
            className={cn(
              "absolute top-0 right-0 px-4 py-2 rounded-bl-lg text-sm font-medium",
              badgeColor,
            )}
          >
            {displayType}
          </span>

          {/* Cover Image */}
          <div className="flex items-center">
            <Image
              src={getRandomInterviewCover()}
              alt={`${role} interview cover`}
              width={90}
              height={90}
              className="rounded-full object-cover size-[90px]"
            />
          </div>

          {/* Interview Role */}
          <h3 className="text-xl font-semibold capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex items-center gap-5 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="size-4" />
              <span>{formattedDate}</span>
            </div>

            <div className="flex items-center gap-2">
              <Star className="size-4" />
              <span className="font-medium">
                {hasCompleted ? `${feedback.totalScore}/100` : "Not taken"}
              </span>
            </div>
          </div>

          {/* Feedback or Placeholder */}
          <p className="line-clamp-2 text-gray-600 min-h-[3rem]">
            {feedback?.finalAssessment ||
              "Start this interview to practice your skills and receive AI-powered feedback."}
          </p>
        </div>

        {/* Footer: Tech Icons & CTA */}
        <div className="flex items-center justify-between pt-4 border-t">
          <InterviewTechIcons techStack={techstack} />

          <Button asChild className="btn-primary">
            <Link href={linkHref}>{buttonText}</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
