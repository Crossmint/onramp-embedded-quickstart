"use server";

import { CreateOrderResponse, ApiErrorResponse } from "./types";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY!;
const CROSSMINT_ENV = process.env.NEXT_PUBLIC_CROSSMINT_ENV || "staging";
const USDC_STAGING = "solana:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_PROD = "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function createCrossmintOrder(
  amountUsd: string,
  email: string,
  walletAddress: string
): Promise<CreateOrderResponse | ApiErrorResponse> {
  const baseUrl =
    CROSSMINT_ENV === "production"
      ? "https://www.crossmint.com"
      : "https://staging.crossmint.com";
  const tokenLocator = CROSSMINT_ENV === "production" ? USDC_PROD : USDC_STAGING;

  const res = await fetch(`${baseUrl}/api/2022-06-09/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CLIENT_API_KEY,
    },
    body: JSON.stringify({
      lineItems: [
        {
          tokenLocator,
          executionParameters: {
            mode: "exact-in",
            amount: amountUsd,
          },
        },
      ],
      payment: {
        method: "card",
        receiptEmail: email,
      },
      recipient: {
        walletAddress,
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return data as ApiErrorResponse;
  }
  return data as CreateOrderResponse;
}
