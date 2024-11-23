import { RefinementCtx, z } from "zod";

/**
 * Refines a given password to check if it contains at least one regular character,
 * one number and one special character.
 * @param password Password to be validated.
 * @param ctx Zod refinement context.
 */
export function passwordRefinement(password: string, ctx: RefinementCtx) {
  const characters = password.split("");
  let hasLetter = false;
  let hasDigit = false;
  let hasSpecial = false;

  characters.forEach((char) => {
    const charCode = char.charCodeAt(0);
    const isLetter =
      (charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122);
    const isDigit = charCode >= 48 && charCode <= 57;
    const isSpecial = !isLetter && !isDigit;

    if (isLetter) {
      hasLetter = true;
    }

    if (isDigit) {
      hasDigit = true;
    }

    if (isSpecial) {
      hasSpecial = true;
    }
  });

  if (!hasLetter) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must have at least one regular character",
    });

    return z.NEVER;
  }

  if (!hasDigit) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must have at least one number",
    });

    return z.NEVER;
  }

  if (!hasSpecial) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Password must have at least one special character",
    });

    return z.NEVER;
  }
}
