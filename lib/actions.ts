"use server";

import type { CreateOrderResponse, ApiErrorResponse } from "@/lib/types";
import { CROSSMINT_ENV, CROSSMINT_CLIENT_API_KEY, CROSSMINT_BASE_URL } from "@/lib/config";

const SERVER_API_KEY = (() => {
  const value = process.env.CROSSMINT_SERVER_SIDE_API_KEY;
  if (value == null) throw new Error("CROSSMINT_SERVER_SIDE_API_KEY is not set");
  return value;
})();

const USDC_LOCATOR =
  CROSSMINT_ENV === "production"
    ? "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
    : "solana:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export async function linkWallet(
  email: string,
  walletAddress: string
): Promise<ApiErrorResponse | undefined> {
  const userLocator = `email:${email}`;

  const res = await fetch(
    `${CROSSMINT_BASE_URL}/api/2025-06-09/users/${encodeURIComponent(userLocator)}/linked-wallets/${encodeURIComponent(walletAddress)}`,
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
    return { error: data?.message || "Failed to link wallet" };
  }
}

export async function createCrossmintOrder(
  amountUsd: string,
  email: string,
  walletAddress: string
): Promise<CreateOrderResponse | ApiErrorResponse> {
  const res = await fetch(`${CROSSMINT_BASE_URL}/api/2022-06-09/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": CROSSMINT_CLIENT_API_KEY,
    },
    body: JSON.stringify({
      lineItems: [
        {
          tokenLocator: USDC_LOCATOR,
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
