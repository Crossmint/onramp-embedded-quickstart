"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CreateOrderResponse, GetOrderResponse, ApiErrorResponse } from "./types";
import { startPolling } from "./utils/poll";

const POLLING_INTERVAL_MS = 4000;

export type OnrampStatus =
  | "not-created"
  | "creating-order"
  | "requires-kyc"
  | "polling-kyc"
  | "awaiting-payment"
  | "polling-payment"
  | "delivering"
  | "success"
  | "payment-failed"
  | "manual-kyc"
  | "rejected-kyc"
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
  const [personaConfig, setPersonaConfig] = useState<any | null>(null);
  const [totalUsd, setTotalUsd] = useState<string | null>(null);
  const [effectiveAmount, setEffectiveAmount] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [checkoutSession, setCheckoutSession] = useState<any | null>(null);
  const [checkoutPublicKey, setCheckoutPublicKey] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  const statusRef = useRef<OnrampStatus>(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const createOrder = useCallback(
    async (amountUsd: string) => {
      setStatus("creating-order");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amountUsd,
          receiptEmail: email,
          walletAddress,
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

      const paymentStatus = orderData.order.payment.status;
      if (paymentStatus === "requires-kyc") {
        const kyc = orderData.order.payment.preparation.kyc;
        setPersonaConfig(kyc);
        setStatus("requires-kyc");
      } else if (paymentStatus === "awaiting-payment") {
        setStatus("awaiting-payment");
        const prep = orderData.order.payment.preparation as any;
        setCheckoutSession(prep.checkoutcomPaymentSession || null);
        setCheckoutPublicKey(prep.checkoutcomPublicKey || null);
      } else {
        setStatus(paymentStatus as OnrampStatus);
      }
    },
    [email, walletAddress]
  );

  const pollOrder = useCallback(async () => {
    const res = await fetch(`/api/orders/${orderId}`);
    const data: GetOrderResponse | ApiErrorResponse = await res.json();
    if (!res.ok) {
      setError((data as ApiErrorResponse).error);
      setStatus("error");
      return;
    }
    
    const orderData = data as GetOrderResponse;
    const paymentStatus = orderData.payment.status;
    const deliveryStatus = orderData.lineItems[0].delivery.status;
    
    if (paymentStatus === "awaiting-payment") {
      setCheckoutSession(orderData.payment.preparation.checkoutcomPaymentSession || null);
      setCheckoutPublicKey(orderData.payment.preparation.checkoutcomPublicKey || null);
      setStatus("awaiting-payment");
    } else if (paymentStatus === "rejected-kyc") {
      setStatus("rejected-kyc");
    } else if (paymentStatus === "manual-kyc") {
      setStatus("manual-kyc");
    } else if (paymentStatus === "completed") {
      if (deliveryStatus === "completed") {
        setStatus("success");

        const txId = orderData.lineItems[0].delivery.txId;
        setTxId(txId);
      } else {
        setStatus("delivering");
      }
    } else if (paymentStatus === "failed") {
      setStatus("payment-failed");
    }
  }, [orderId]);

  const startKycPolling = useCallback(() => {
    setStatus("polling-kyc");
    startPolling({
      intervalMs: POLLING_INTERVAL_MS,
      tick: async () => {
        await pollOrder();
      },
      shouldStop: () => statusRef.current === "awaiting-payment",
    });
  }, [pollOrder]);

  const startPaymentPolling = useCallback(() => {
    setStatus("polling-payment");
    startPolling({
      intervalMs: POLLING_INTERVAL_MS,
      tick: async () => {
        await pollOrder();
      },
      shouldStop: () =>
        statusRef.current === "success" || statusRef.current === "payment-failed",
    });
  }, [pollOrder]);

  const resetOrder = useCallback(() => {
    setStatus("not-created");
    setOrderId(null);
    setError(null);
    setPersonaConfig(null);
    setTotalUsd(null);
    setEffectiveAmount(null);
    setTxId(null);
    setCheckoutSession(null);
    setCheckoutPublicKey(null);
  }, []);

  return {
    order: {
      status,
      error,
      totalUsd,
      effectiveAmount,
      txId,
    },
    orderId,
    clientSecret,
    createOrder,
    resetOrder,
    checkout: {
      session: checkoutSession,
      publicKey: checkoutPublicKey,
      startPaymentPolling,
    },
    persona: personaConfig
      ? {
          config: personaConfig,
          startKycPolling,
        }
      : null,
  } as const;
}


