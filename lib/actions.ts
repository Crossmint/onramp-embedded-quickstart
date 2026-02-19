"use server";

import { CreateOrderResponse, ApiErrorResponse } from "./types";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY!;
const SERVER_API_KEY = process.env.CROSSMINT_SERVER_SIDE_API_KEY!;
const CROSSMINT_ENV = process.env.NEXT_PUBLIC_CROSSMINT_ENV || "staging";
const USDC_STAGING = "solana:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_PROD = "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export async function linkWallet(
  email: string,
  walletAddress: string
): Promise<void | ApiErrorResponse> {
  const baseUrl =
    CROSSMINT_ENV === "production"
      ? "https://www.crossmint.com"
      : "https://staging.crossmint.com";

  const userLocator = `email:${email}`;

  const res = await fetch(
    `${baseUrl}/api/2025-06-09/users/${encodeURIComponent(userLocator)}/linked-wallets/${walletAddress}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": SERVER_API_KEY,
      },
      body: JSON.stringify({
        chainType: "solana",
      }),
    }
  );

  if (!res.ok) {
    const data = await res.json();
    return { error: data?.message || "Failed to link wallet" } as ApiErrorResponse;
  }
}

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
