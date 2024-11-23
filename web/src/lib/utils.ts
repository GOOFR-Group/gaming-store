import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function camelCaseToTitleCase(s: string) {
  const result = s.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Formats a value into a currency format
 * @param value Value to be formatted.
 * @returns Formatted value.
 */
export function formatCurrency(value: number) {
  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  });
  return currencyFormat.format(value);
}

/**
 * Extracts the initials from a given name.
 * @param name Full name from which to extract initials.
 * @returns The initials derived from the name.
 */
export function getInitials(name: string) {
  const words = name.split(" ");
  if (words.length < 2) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
}
