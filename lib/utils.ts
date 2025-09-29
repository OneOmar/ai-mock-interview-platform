import { interviewCovers, mappings } from "@/constants";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// ✅ Merge Tailwind classes safely
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const ICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// ✅ Convert a tech name to its mapping key
const normalizeTechName = (tech: string) =>
  mappings[
    tech
      .toLowerCase()
      .replace(/\.js$/, "")
      .replace(/\s+/g, "") as keyof typeof mappings
  ];

// ✅ Check if an icon exists on the CDN
const iconExists = async (url: string) => {
  try {
    return (await fetch(url, { method: "HEAD" })).ok;
  } catch {
    return false;
  }
};

// ✅ Get valid logo URLs for a list of tech names
export const getTechLogos = async (techs: string[]) =>
  Promise.all(
    techs.map(async (tech) => {
      const name = normalizeTechName(tech);
      const url = `${ICON_BASE}/${name}/${name}-original.svg`;
      return { tech, url: (await iconExists(url)) ? url : "/tech.svg" };
    }),
  );

// ✅ Pick a random interview cover image
export const getRandomInterviewCover = () =>
  `/covers${interviewCovers[Math.floor(Math.random() * interviewCovers.length)]}`;
