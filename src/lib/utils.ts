import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function simpleHash(str: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i); // XOR with the character code
    hash = (hash * 16777619) | 0; // FNV prime multiplier
    hash = (hash << 5) | (hash >>> 27); // Left rotate (circular shift)
  }
  return hash >>> 0; // Ensure non-negative integer
}

export const getTagColor = (tag: string): string => {
  const hash = simpleHash(tag);
  return hashtagColors[hash % hashtagColors.length];
};

export const getBorderColor = (tag: string): string => {
  const hash = simpleHash(tag);
  return borderColors[hash % borderColors.length];
};

export const extractTags = (text: string): string[] => {
  const tagRegex = /#(\w+)/g;
  const matches = text.match(tagRegex);
  return matches ? matches.map((tag) => tag.slice(1)) : [];
};

export const hashtagColors = [
  // Reds
  "text-red-400",
  "text-red-600",
  // Pinks
  "text-pink-400",
  "text-pink-600",
  // Purples
  "text-purple-400",
  "text-purple-600",
  // Deep Purples
  "text-indigo-400",
  "text-indigo-600",
  // Blues
  "text-blue-400",
  "text-blue-600",
  // Light Blues
  "text-sky-400",
  "text-sky-600",
  // Cyans
  "text-cyan-400",
  "text-cyan-600",
  // Teals
  "text-teal-400",
  "text-teal-600",
  // Greens
  "text-green-400",
  "text-green-600",
  // Light Greens
  "text-lime-400",
  "text-lime-600",
  // Yellows
  "text-yellow-400",
  "text-yellow-600",
  // Ambers
  "text-amber-400",
  "text-amber-600",
  // Oranges
  "text-orange-400",
  "text-orange-600",
  // Deep Oranges
  "text-rose-400",
  "text-rose-600",
];

export const borderColors = [
  // Reds
  "border-red-400",
  "border-red-600",
  // Pinks
  "border-pink-400",
  "border-pink-600",
  // Purples
  "border-purple-400",
  "border-purple-600",
  // Deep Purples
  "border-indigo-400",
  "border-indigo-600",
  // Blues
  "border-blue-400",
  "border-blue-600",
  // Light Blues
  "border-sky-400",
  "border-sky-600",
  // Cyans
  "border-cyan-400",
  "border-cyan-600",
  // Teals
  "border-teal-400",
  "border-teal-600",
  // Greens
  "border-green-400",
  "border-green-600",
  // Light Greens
  "border-lime-400",
  "border-lime-600",
  // Yellows
  "border-yellow-400",
  "border-yellow-600",
  // Ambers
  "border-amber-400",
  "border-amber-600",
  // Oranges
  "border-orange-400",
  "border-orange-600",
  // Deep Oranges
  "border-rose-400",
  "border-rose-600",
];
