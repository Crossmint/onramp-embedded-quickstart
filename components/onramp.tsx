"use client";

import { CrossmintProvider, CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";
import OnrampDeposit from "@/components/onramp-deposit";
import { useCrossmintOnramp } from "@/lib/useCrossmintOnramp";
import { useState } from "react";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY;
if (CLIENT_API_KEY == null) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY is not set");
}

const DEFAULT_AMOUNT = "5.00";

export default function Onramp() {
  const [amountUsd, setAmountUsd] = useState(DEFAULT_AMOUNT);
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");

  const { order, createOrder, orderId, clientSecret } = useCrossmintOnramp();

  return (
    <div className="flex items-center justify-center bg-gray-50 px-6 py-12 col-span-1 lg:col-span-3">
      <div className="w-full max-w-md mt-10">
        <div className="bg-white rounded-3xl border shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col">
              {/* Step 1: Create order */}
              {orderId == null && (
                <OnrampDeposit
                  amountUsd={amountUsd}
                  setAmountUsd={setAmountUsd}
                  email={email}
                  setEmail={setEmail}
                  walletAddress={walletAddress}
                  setWalletAddress={setWalletAddress}
                  order={{
                    status: order.status,
                    error: order.error,
                    totalUsd: order.totalUsd,
                    effectiveAmount: order.effectiveAmount,
                  }}
                  onContinue={() => createOrder(amountUsd, email, walletAddress)}
                />
              )}

              {/* Step 2: Pay for existing order via embedded checkout */}
              {orderId && (<>
                <CrossmintProvider apiKey={CLIENT_API_KEY!}>
                  <div className="max-w-[450px] w-full mx-auto">
                    <CrossmintEmbeddedCheckout
                      orderId={orderId}
                      // @ts-ignore
                      clientSecret={clientSecret}
                      payment={{
                        receiptEmail: email,
                        crypto: { enabled: false },
                        fiat: { enabled: true },
                        defaultMethod: "fiat",
                      }}
                    />
                  </div>
                </CrossmintProvider>
              </>)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}