import Image from "next/image";
import { cn, getTechLogos } from "@/lib/utils";

interface InterviewTechIconsProps {
  techStack: string[];
  maxIcons?: number;
}

export default async function InterviewTechIcons({
  techStack,
  maxIcons = 3,
}: InterviewTechIconsProps) {
  // Fetch tech logos
  const techIcons = await getTechLogos(techStack);
  const displayIcons = techIcons.slice(0, maxIcons);
  const remainingCount = techStack.length - maxIcons;

  return (
    <div className="flex flex-row items-center">
      {/* Tech stack icons */}
      {displayIcons.map(({ tech, url }, index) => (
        <div
          key={tech}
          className={cn(
            "relative group bg-dark-300 rounded-full p-2 flex flex-center",
            index >= 1 && "-ml-3",
          )}
        >
          {/* Tooltip */}
          <span className="tech-tooltip">{tech}</span>

          {/* Tech logo */}
          <Image
            src={url}
            alt={`${tech} logo`}
            width={100}
            height={100}
            className="size-5"
          />
        </div>
      ))}

      {/* Remaining count badge */}
      {remainingCount > 0 && (
        <div className="relative group bg-dark-300 rounded-full p-2 flex flex-center -ml-3 min-w-[36px]">
          <span className="tech-tooltip">
            {techStack.slice(maxIcons).join(", ")}
          </span>
          <span className="text-xs font-medium text-gray-300">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
}
