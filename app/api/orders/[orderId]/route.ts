import { NextResponse } from "next/server";

const CROSSMINT_SERVER_SIDE_API_KEY =
  process.env.CROSSMINT_SERVER_SIDE_API_KEY ?? "";
const CROSSMINT_ENV = process.env.CROSSMINT_ENV || "staging";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    if (!CROSSMINT_SERVER_SIDE_API_KEY) {
      return NextResponse.json(
        {
          error:
            "Server misconfiguration: CROSSMINT_SERVER_SIDE_API_KEY missing",
        },
        { status: 500 },
      );
    }

    const { orderId } = await params;
    const baseUrl =
      CROSSMINT_ENV === "production"
        ? "https://www.crossmint.com"
        : "https://staging.crossmint.com";
    const response = await fetch(
      `${baseUrl}/api/2022-06-09/orders/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": CROSSMINT_SERVER_SIDE_API_KEY,
        },
      },
    );

    const data = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || "Failed to fetch order", details: data },
        { status: response.status },
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: "Unexpected error fetching order", details: message },
      { status: 500 },
    );
  }
}
