import { z } from "zod/v4";

export const emailSchema = z.email("Please enter a valid email address");

export const solanaAddressSchema = z
  .string()
  .regex(
    /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
    "Please enter a valid Solana wallet address"
  );

export const depositFormSchema = z.object({
  email: emailSchema,
  walletAddress: solanaAddressSchema,
});

export type DepositFormErrors = {
  email?: string;
  walletAddress?: string;
};

export function validateDepositForm(email: string, walletAddress: string): DepositFormErrors {
  const result = depositFormSchema.safeParse({ email, walletAddress });
  if (result.success) return {};

  const errors: DepositFormErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as keyof DepositFormErrors;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
