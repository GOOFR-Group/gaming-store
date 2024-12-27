import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { Multimedia, TemporaryMultimedia } from "@/domain/multimedia";

import { COUNTRIES_MAP, LANGUAGES_MAP } from "./constants";

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
 * @param [tax=0] Value of the tax to be applied.
 * @returns Formatted value.
 */
export function formatCurrency(value: number, tax: number = 0) {
  const currencyFormat = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "EUR",
  });
  return currencyFormat.format(value * (1 + tax));
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

/**
 * Retrieves the country name of a given country code.
 * If the code is not found, returns null.
 * @param code Country code.
 * @returns Country name.
 */
export function getCountryName(code: string) {
  const codeUpperCase = code.toUpperCase();

  if (codeUpperCase in COUNTRIES_MAP) {
    return COUNTRIES_MAP[codeUpperCase as keyof typeof COUNTRIES_MAP].name;
  }

  return null;
}

/**
 * Retrieves the language name of a given language code.
 * If the code is not found, returns null.
 * @param code Language code.
 * @returns Language name.
 */
export function getLanguageName(code: string) {
  const codeUpperCase = code.toUpperCase();

  if (codeUpperCase in LANGUAGES_MAP) {
    return LANGUAGES_MAP[codeUpperCase as keyof typeof LANGUAGES_MAP].name;
  }

  return null;
}

/**
 * Retrieves the name of a given multimedia.
 * @param multimedia Multimedia.
 * @returns Multimedia name.
 */
export function getMultimediaName(
  multimedia: Multimedia | TemporaryMultimedia | File,
) {
  if ("url" in multimedia) {
    const paths = multimedia.url.split("/");
    const lastPath = paths[paths.length - 1];

    const searchParamsIndex = lastPath.indexOf("?");
    if (searchParamsIndex > -1) {
      return lastPath.substring(0, searchParamsIndex);
    }

    return lastPath;
  }

  if (multimedia instanceof File) {
    return multimedia.name;
  }

  return multimedia.file.name;
}
