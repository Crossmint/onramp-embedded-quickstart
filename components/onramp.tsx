"use client";

import { CrossmintProvider, CrossmintEmbeddedCheckout } from "@crossmint/client-sdk-react-ui";
import OnrampDeposit from "@/components/onramp-deposit";
import { useCrossmintOnramp } from "@/lib/useCrossmintOnramp";
import { useState } from "react";
import UserTypeSelector from "@/components/user-type-selector";
import PaymentSuccessModal from "@/components/payment-success-modal";

const CLIENT_API_KEY = process.env.NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY;
if (CLIENT_API_KEY == null) {
  throw new Error("NEXT_PUBLIC_CROSSMINT_CLIENT_SIDE_API_KEY is not set");
}

const USER_RECIPIENT_WALLET = "HEDZpt7fh7PsBVyYjTPBno3JSRN6TE8kBY3Zm2UWEszU"; // Crossmint-managed wallet for demos+onramp-existing-user@crossmint.com
const DEFAULT_AMOUNT = "5.00";

export default function Onramp() {
  const [userType, setUserType] = useState<"returning" | "new">("returning");
  const [receiptEmail, setReceiptEmail] = useState<string>("demos+onramp-existing-user@crossmint.com");

  const [amountUsd, setAmountUsd] = useState(DEFAULT_AMOUNT);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const { order, createOrder, orderId, clientSecret, resetOrder } = useCrossmintOnramp({
    email: receiptEmail,
    walletAddress: USER_RECIPIENT_WALLET,
  });

  return (
    <div className="flex items-center justify-center bg-gray-50 px-6 py-12 col-span-1 lg:col-span-3">
      <div className="w-full max-w-md mt-10">
        <div className="bg-white rounded-3xl border shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col">
              <UserTypeSelector
                userType={userType}
                onUserTypeChange={(newType, email) => {
                  setUserType(newType);
                  setReceiptEmail(email);
                  resetOrder();
                }}
              />

              {/* Step 1: Create order */}
              {orderId == null && (
                <OnrampDeposit
                  amountUsd={amountUsd}
                  setAmountUsd={setAmountUsd}
                  order={{
                    status: order.status,
                    error: order.error,
                    totalUsd: order.totalUsd,
                    effectiveAmount: order.effectiveAmount,
                  }}
                  onContinue={() => createOrder(amountUsd)}
                  userType={userType}
                />
              )}

              {/* Step 2: Pay for existing order via embedded checkout */}
              {orderId && (<>
                <div>
                  <p className="text-sm text-center">Use this card to test the payment process:</p>
                  <p className="text-sm font-semibold filter-green text-center">4242 4242 4242 4242.</p>
                </div>
                <hr className="mt-4 mb-4" />
                <CrossmintProvider apiKey={CLIENT_API_KEY!}>
                  <div className="max-w-[450px] w-full mx-auto">
                    <CrossmintEmbeddedCheckout
                      orderId={orderId}
                      // @ts-ignore
                      clientSecret={clientSecret}
                      payment={{
                        receiptEmail,
                        crypto: { enabled: false },
                        fiat: { enabled: true },
                        defaultMethod: "fiat",
                      }}
                      // @ts-ignore
                      onEvent={(event) => {
                        if (event.type === "payment:succeeded") {
                          setShowSuccessModal(true);
                        }
                      }}
                    />
                  </div>
                </CrossmintProvider>
              </>)}
            </div>
          </div>
        </div>
      </div>
      <PaymentSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          resetOrder();
          setAmountUsd(DEFAULT_AMOUNT);
        }}
        amount={amountUsd}
        walletAddress={USER_RECIPIENT_WALLET}
      />
    </div>
  );
}