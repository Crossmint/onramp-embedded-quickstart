import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { emailSchema, stellarAddressSchema } from "@/lib/validation";

const CROSSMINT_SERVER_SIDE_API_KEY = process.env.CROSSMINT_SERVER_SIDE_API_KEY as string;
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "staging";
const USDC_STAGING = "stellar:CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA";
const USDC_PROD = "stellar:CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75";

const orderRequestSchema = z.object({
  amount: z.string().refine((val) => {
    const num = Number.parseFloat(val);
    return !Number.isNaN(num) && num >= 1 && num <= 10000;
  }, "Amount must be between $1 and $10,000"),
  receiptEmail: emailSchema,
  walletAddress: stellarAddressSchema,
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
    const parsed = orderRequestSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? "Invalid request";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { amount, receiptEmail, walletAddress } = parsed.data;

    const tokenLocator =
      (CROSSMINT_ENV === "production" ? USDC_PROD : USDC_STAGING);

    const baseUrl = CROSSMINT_ENV === "production" ? "https://www.crossmint.com" : "https://staging.crossmint.com";
    const response = await fetch(
      `${baseUrl}/api/2022-06-09/orders`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CROSSMINT_SERVER_SIDE_API_KEY,
        },
        body: JSON.stringify({
          lineItems: [
            {
              tokenLocator,
              executionParameters: {
                mode: "exact-in",
                amount,
              },
            },
          ],
          payment: {
            method: "card",
            receiptEmail,
          },
          recipient: {
            walletAddress,
          },
        }),
      }
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to create order", details: data },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Unexpected error creating order", details: message },
      { status: 500 }
    );
  }
}


