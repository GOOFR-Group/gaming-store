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

export const userAccountDetailsSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username is required",
    })
    .max(50, {
      message: "Username must be shorter than 50 characters",
    }),
  email: z
    .string()
    .email({
      message: "Please enter a valid email address",
    })
    .max(320, {
      message: "Email must be shorter than 320 characters",
    }),
  displayName: z
    .string()
    .min(1, {
      message: "Full name is required",
    })
    .max(100, {
      message: "Full name must be shorter than 100 characters",
    }),
  dateOfBirth: z.date({
    required_error: "Date of birth is required",
  }),
  country: z.string().min(1, {
    message: "Country is required",
  }),
  address: z
    .string()
    .min(1, {
      message: "Address is required",
    })
    .max(100, {
      message: "Address must be shorter than 100 characters",
    }),
  vatin: z
    .string()
    .min(1, {
      message: "VAT No. is required",
    })
    .refine((vatin) => vatin.length === 9 && !Number.isNaN(Number(vatin)), {
      message: "VAT No. must be 9 digits",
    }),
});

export const publisherAccountDetails = z.object({
  name: z.string().min(1, {
    message: "Name is required",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  country: z.string().min(1, {
    message: "Country is required",
  }),
  address: z.string().min(1, {
    message: "Address is required",
  }),
  vatin: z
    .string()
    .min(1, {
      message: "VAT No. is required",
    })
    .refine((vatin) => vatin.length === 9 && !Number.isNaN(Number(vatin)), {
      message: "VAT No. must be 9 digits",
    }),
});
