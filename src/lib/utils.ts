import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function VALID_DOMAIN() {
  const validDomains = ["gmail.com", "outlook.com", "yahoo.com", "hotmail.com"];
  return validDomains;
}
