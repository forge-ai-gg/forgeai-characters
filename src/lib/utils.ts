import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const logError = (...args: any[]) => {
  console.error("\x1b[31m", ...args, "\x1b[0m");
};

export const logWarn = (...args: any[]) => {
  console.warn("\x1b[33m", ...args, "\x1b[0m");
};

export const logSuccess = (...args: any[]) => {
  console.log("\x1b[32m", ...args, "\x1b[0m");
};

export function getEffectiveSex(sex: string | undefined): string {
  switch (sex) {
    case "teen":
    case "pregnant":
      return "female";
    case "muscular":
      return "male";
    default:
      return sex || "male";
  }
}
