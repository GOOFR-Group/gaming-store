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

/**
 * Retrieves the list of the pages to display in the table pagination.
 * @param pages Pagination pages.
 * @param pageIndex Page index.
 * @param [size=5] Size of visible pages.
 * @returns List of the pages to display in the table pagination.
 */
export function getVisiblePages(
  pages: number[],
  pageIndex: number,
  size: number = 5,
): number[] {
  const half = Math.floor(size / 2);

  const remainderRightSide =
    half - Math.min(half, pages.length - 1 - pageIndex);
  const remainderLeftSide = Math.max(0, half - pageIndex);

  const startIndex = Math.max(0, pageIndex - half - remainderRightSide);
  const endIndex = Math.min(
    pages.length - 1,
    pageIndex + half + remainderLeftSide,
  );

  return pages.slice(startIndex, endIndex + 1);
}

/**
 * Updates the current URL with new search params.
 * @param searchParams Search params to be set in the URL.
 */
export function updateSearchParams(searchParams: URLSearchParams) {
  const url = new URL(window.location.href);

  url.search = searchParams.toString();

  window.history.pushState(null, "", url);
}

/**
 * Debounces a given callback with a given time.
 * @template TCallback Type of the callback function.
 * @param callback Callback after the debounce.
 * @param [waitFor=100] Number of milliseconds to wait for the debounce.
 * @returns Debounced callback.
 */
export function debounce<
  TCallback extends (...args: Parameters<TCallback>) => ReturnType<TCallback>,
>(callback: TCallback, waitFor: number = 100) {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<TCallback>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback(...args), waitFor);
  };
}
