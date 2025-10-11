import {Metadata} from "next";
import {redirect} from "next/navigation";
import Image from "next/image";

import Agent from "@/components/Agent";
import InterviewTechIcons from "@/components/InterviewTechIcons";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {getInterviewById} from "@/lib/actions/general.action";
import {getRandomInterviewCover} from "@/lib/utils";

// Page metadata
export const metadata: Metadata = {
  title: "Interview Details - PrepWise",
  description: "Start your AI-powered mock interview session.",
};

interface InterviewDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function InterviewDetailsPage({
                                                     params,
                                                   }: InterviewDetailsProps) {
  // Get interview ID
  const {id} = await params;

  // Get current user
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in");

  // Get interview details
  const interview = await getInterviewById(id);
  if (!interview) redirect("/");

  // Capitalize type for display
  const displayType =
    interview.type.charAt(0).toUpperCase() + interview.type.slice(1);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Interview Header */}
      <div className="flex flex-row gap-4 justify-between">
        {/* Left: Role & Tech Stack */}
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt={`${interview.role} interview`}
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h1 className="capitalize">
              {interview.role} Interview
            </h1>
          </div>

          <InterviewTechIcons techStack={interview.techstack}/>
        </div>

        {/* Right: Type Badge */}
        <span className="bg-gray-700 px-4 py-2 rounded-lg h-fit">
          {displayType}
        </span>
      </div>

      {/* Agent Component */}
      <Agent
        userName={user.name}
        userId={user.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
      />
    </div>
  );
}
