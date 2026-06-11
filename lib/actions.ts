"use server";

import type { CreateOrderResponse, ApiErrorResponse } from "@/lib/types";
import { CROSSMINT_ENV, CROSSMINT_BASE_URL } from "@/lib/config";

const SERVER_API_KEY = (() => {
  const value = process.env.CROSSMINT_SERVER_SIDE_API_KEY;
  if (value == null) throw new Error("CROSSMINT_SERVER_SIDE_API_KEY is not set");
  return value;
})();

const USDC_LOCATOR =
  CROSSMINT_ENV === "production"
    ? "stellar:CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"
    : "stellar:CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";

const HORIZON_TESTNET_URL = "https://horizon-testnet.stellar.org";
const FRIENDBOT_URL = "https://friendbot.stellar.org";
// Circle's USDC issuer on Stellar testnet - the classic asset behind the SAC in USDC_LOCATOR
const USDC_TESTNET_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";

// Stellar delivery requires the recipient account to exist on-chain and hold a USDC
// trustline (Crossmint validates this at delivery time, not at order creation), so a
// throwaway recipient must be funded and trustlined before the order completes.
export async function prepareStellarWallet(): Promise<
  { publicKey: string; secret: string } | ApiErrorResponse
> {
  if (CROSSMINT_ENV === "production") {
    return { error: "On-demand wallet generation is testnet-only. Use a real wallet in production." };
  }

  try {
    // Dynamic import so a stellar-sdk load failure can never break the other
    // server actions in this module (linkWallet / createCrossmintOrder).
    const { Asset, BASE_FEE, Horizon, Keypair, Networks, Operation, TransactionBuilder } =
      await import("@stellar/stellar-sdk");

    const keypair = Keypair.random();

    const fund = await fetch(`${FRIENDBOT_URL}?addr=${keypair.publicKey()}`);
    if (!fund.ok) {
      return { error: `Friendbot funding failed (HTTP ${fund.status})` };
    }

    const server = new Horizon.Server(HORIZON_TESTNET_URL);
    const account = await server.loadAccount(keypair.publicKey());
    const trustlineTx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({ asset: new Asset("USDC", USDC_TESTNET_ISSUER) })
      )
      .setTimeout(60)
      .build();
    trustlineTx.sign(keypair);
    await server.submitTransaction(trustlineTx);

    return { publicKey: keypair.publicKey(), secret: keypair.secret() };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Stellar wallet preparation failed" };
  }
}

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
        chain: "stellar",
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
      "x-api-key": SERVER_API_KEY,
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
