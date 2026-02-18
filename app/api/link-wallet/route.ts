import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { emailSchema, solanaAddressSchema } from "@/lib/validation";

const CROSSMINT_SERVER_SIDE_API_KEY = process.env.CROSSMINT_SERVER_SIDE_API_KEY as string;
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "staging";

const linkWalletRequestSchema = z.object({
  email: emailSchema,
  walletAddress: solanaAddressSchema,
});

export async function POST(req: NextRequest) {
  try {
    if (!CROSSMINT_SERVER_SIDE_API_KEY) {
      return NextResponse.json(
        { error: "Server misconfiguration: CROSSMINT_SERVER_SIDE_API_KEY missing" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const parsed = linkWalletRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, walletAddress } = parsed.data;
    const userLocator = `email:${email}`;

    const baseUrl = CROSSMINT_ENV === "production"
      ? "https://www.crossmint.com"
      : "https://staging.crossmint.com";

    const response = await fetch(
      `${baseUrl}/api/2025-06-09/users/${encodeURIComponent(userLocator)}/linked-wallets/${walletAddress}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CROSSMINT_SERVER_SIDE_API_KEY,
        },
        body: JSON.stringify({
          chainType: "solana",
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.message || "Failed to link wallet", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Unexpected error linking wallet", details: error?.message },
      { status: 500 }
    );
  }
}
