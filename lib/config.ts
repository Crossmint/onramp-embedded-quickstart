// Environment

export const CROSSMINT_ENV = process.env.NEXT_PUBLIC_CROSSMINT_ENV || "staging";

export const CROSSMINT_CLIENT_API_KEY = (() => {
  const value = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY;
  if (value == null) throw new Error("NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY is not set");
  return value;
})();

export const CROSSMINT_BASE_URL =
  CROSSMINT_ENV === "production"
    ? "https://www.crossmint.com"
    : "https://staging.crossmint.com";

// Demo constants

export const RETURNING_USER_EMAIL = "demos+onramp-existing-user@crossmint.com";
export const RETURNING_USER_RECIPIENT_WALLET = "GBmPTj6S4vvLV4xpYpRce1nnbR3NPyQUT4ZzxgPWt2aS";
export const DEFAULT_AMOUNT = "5.00";
export const LIGHT_KYC_THRESHOLD_USD = 100;
