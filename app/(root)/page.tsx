import {Metadata} from "next";
import Image from "next/image";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";
// import { dummyInterviews } from "@/constants";
import {getCurrentUser} from "@/lib/actions/auth.action";
import {redirect} from "next/navigation";
import {getInterviewsByUserId, getLatestInterviews,} from "@/lib/actions/general.action";

// Page metadata for SEO
export const metadata: Metadata = {
  title: "Home - PrepWise",
  description:
    "Practice job interviews with AI-powered feedback. Get interview-ready with realistic mock interviews and instant performance insights.",
};

export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const [userInterviews, latestInterviews] = await Promise.all([
    await getInterviewsByUserId(user?.id),
    getLatestInterviews({excludeUserId: user.id, limit: 10}),
  ]);

  const hasInterviews = (userInterviews ?? []).length > 0;
  const hasUpcomingInterviews = (latestInterviews ?? []).length > 0;

  return (
    <div className="space-y-12">
      {/* Hero CTA Section */}
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h1 className="text-4xl font-bold leading-tight">
            Get Interview-Ready with AI-Powered Practice & Feedback
          </h1>
          <p className="text-lg text-gray-600">
            Practice real interview questions and get instant feedback to ace
            your next interview.
          </p>
          <Button asChild className="btn-primary w-fit max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>

        <Image
          src="/robot.png"
          alt="AI interview assistant robot"
          width={400}
          height={400}
          className="max-sm:hidden"
          priority
        />
      </section>

      {/* Your Interviews Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Your Interviews</h2>
          {hasInterviews && (
            <Link
              href="/"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              View all →
            </Link>
          )}
        </div>

        {hasInterviews ? (
          <div className="interviews-section">
            {userInterviews?.slice(0, 3).map((interview) => (
              <InterviewCard
                interviewId={interview.id}
                key={interview.id}
                {...interview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">
              You haven&apos;t taken any interviews yet
            </p>
            <Button asChild className="mt-4">
              <Link href="/interview">Take Your First Interview</Link>
            </Button>
          </div>
        )}
      </section>

      {/* Available Interviews Section */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Available Interviews</h2>

        {hasUpcomingInterviews ? (
          <div className="interviews-section">
            {latestInterviews?.map((interview) => (
              <InterviewCard
                interviewId={interview.id}
                key={interview.id}
                {...interview}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed">
            <p className="text-gray-500">No available interviews yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
