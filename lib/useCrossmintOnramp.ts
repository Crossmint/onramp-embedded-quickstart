"use client";

import { useCallback, useState } from "react";
import { CreateOrderResponse, ApiErrorResponse } from "./types";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY!;
const CROSSMINT_ENV = process.env.NEXT_PUBLIC_CROSSMINT_ENV || "staging";
const USDC_STAGING = "solana:4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
const USDC_PROD = "solana:EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export type OnrampStatus =
  | "not-created"
  | "creating-order"
  | "awaiting-payment"
  | "error";

type UseCrossmintOnrampArgs = {
  email: string;
  walletAddress: string;
};

export function useCrossmintOnramp({
  email,
  walletAddress,
}: UseCrossmintOnrampArgs) {
  const [status, setStatus] = useState<OnrampStatus>("not-created");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [totalUsd, setTotalUsd] = useState<string | null>(null);
  const [effectiveAmount, setEffectiveAmount] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const createOrder = useCallback(
    async (amountUsd: string) => {
      setStatus("creating-order");

      const baseUrl = CROSSMINT_ENV === "production"
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

      const data: CreateOrderResponse | ApiErrorResponse = await res.json();
      if (!res.ok) {
        setError((data as ApiErrorResponse).error);
        setStatus("error");
        return;
      }

      const orderData = data as CreateOrderResponse;
      setOrderId(orderData.order.orderId);
      setClientSecret(orderData.clientSecret);

      const total = orderData.order.quote.totalPrice.amount;
      const lineItem = orderData.order.lineItems[0];
      const effective = lineItem.quote.quantityRange.lowerBound;
      setTotalUsd(total);
      setEffectiveAmount(effective);

      setStatus("awaiting-payment");
    },
    [email, walletAddress]
  );

  const resetOrder = useCallback(() => {
    setStatus("not-created");
    setOrderId(null);
    setError(null);
    setTotalUsd(null);
    setEffectiveAmount(null);
    setClientSecret(null);
  }, []);

  return {
    order: {
      status,
      error,
      totalUsd,
      effectiveAmount,
    },
    orderId,
    clientSecret,
    createOrder,
    resetOrder,
  } as const;
}
