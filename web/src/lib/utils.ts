import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to apply conditional styles using Tailwind CSS.
 * @param classes Tailwind CSS classes to be merged.
 * @returns Merged Tailwind CSS classes.
 */
export function cn(...classes: ClassValue[]) {
  return twMerge(clsx(classes));
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
  if (!name.length) {
    return "";
  }

  const words = name.split(" ");
  if (words.length < 2) {
    return words[0].charAt(0).toUpperCase();
  }

  return (
    words[0].charAt(0).toUpperCase() +
    words[words.length - 1].charAt(0).toUpperCase()
  );
}
