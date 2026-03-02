"use client";

import {
  CrossmintProvider,
  CrossmintEmbeddedCheckout,
  CrossmintCheckoutProvider,
  useCrossmintCheckout,
} from "@crossmint/client-sdk-react-ui";
import OnrampDeposit from "@/components/onramp-deposit";
import OnrampSuccess from "@/components/onramp-success";
import { useCrossmintOnramp } from "@/lib/useCrossmintOnramp";
import { useState, useEffect, useRef } from "react";
import UserTypeSelector from "@/components/user-type-selector";
import { Keypair } from "@solana/web3.js";
import {
  CROSSMINT_CLIENT_API_KEY,
  RETURNING_USER_EMAIL,
  RETURNING_USER_RECIPIENT_WALLET,
  DEFAULT_AMOUNT,
} from "@/lib/config";

function CheckoutWithListener({
  orderId,
  clientSecret,
  receiptEmail,
  onCompleted,
}: {
  orderId: string;
  clientSecret: string;
  receiptEmail: string;
  onCompleted: (txId?: string) => void;
}) {
  const { order } = useCrossmintCheckout();
  const onCompletedRef = useRef(onCompleted);
  onCompletedRef.current = onCompleted;

  useEffect(() => {
    if (order?.phase === "completed") {
      const delivery = order.lineItems[0]?.delivery;
      const txId = delivery?.status === "completed" ? delivery.txId : undefined;
      onCompletedRef.current(txId);
    }
  }, [order]);

  return (
    <div className="max-w-[450px] w-full mx-auto">
      <CrossmintEmbeddedCheckout
        orderId={orderId}
        clientSecret={clientSecret}
        payment={{
          receiptEmail,
          crypto: { enabled: false },
          fiat: { enabled: true },
          defaultMethod: "fiat",
        }}
      />
    </div>
  );
}

export default function Onramp() {
  const [userType, setUserType] = useState<"returning" | "new">("returning");
  const [receiptEmail, setReceiptEmail] = useState(RETURNING_USER_EMAIL);
  const [recipientWalletAddress, setRecipientWalletAddress] = useState(RETURNING_USER_RECIPIENT_WALLET);

  const [amountUsd, setAmountUsd] = useState(DEFAULT_AMOUNT);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txId, setTxId] = useState<string | undefined>();

  const { order, createOrder, orderId, clientSecret, resetOrder } = useCrossmintOnramp({
    email: receiptEmail,
    walletAddress: recipientWalletAddress,
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
                  if (newType === "new") {
                    const wallet = Keypair.generate();
                    setRecipientWalletAddress(wallet.publicKey.toBase58());
                  } else {
                    setRecipientWalletAddress(RETURNING_USER_RECIPIENT_WALLET);
                  }
                  resetOrder();
                }}
              />

              {/* Step 1: Create order */}
              {orderId == null && !showSuccess && (
                <OnrampDeposit
                  amountUsd={amountUsd}
                  setAmountUsd={setAmountUsd}
                  order={order}
                  onContinue={() => createOrder(amountUsd)}
                  userType={userType}
                />
              )}

              {/* Step 2: Pay for existing order via embedded checkout */}
              {orderId && clientSecret && !showSuccess && (<>
                <div>
                  <p className="text-sm text-center">Use this card to test the payment process:</p>
                  <p className="text-sm font-semibold filter-green text-center">4242 4242 4242 4242.</p>
                </div>
                <hr className="mt-4 mb-4" />
                <CrossmintProvider apiKey={CROSSMINT_CLIENT_API_KEY}>
                  <CrossmintCheckoutProvider>
                    <CheckoutWithListener
                      orderId={orderId}
                      clientSecret={clientSecret}
                      receiptEmail={receiptEmail}
                      onCompleted={(deliveryTxId) => {
                        if (deliveryTxId) setTxId(deliveryTxId);
                        setShowSuccess(true);
                      }}
                    />
                  </CrossmintCheckoutProvider>
                </CrossmintProvider>
              </>)}

              {/* Step 3: Custom success screen */}
              {showSuccess && (
                <OnrampSuccess
                  totalUsd={order.totalUsd ?? amountUsd}
                  effectiveAmount={order.effectiveAmount ?? amountUsd}
                  walletAddress={recipientWalletAddress}
                  txId={txId}
                  onStartNew={() => {
                    setShowSuccess(false);
                    setTxId(undefined);
                    resetOrder();
                    setAmountUsd(DEFAULT_AMOUNT);
                    setUserType("returning");
                    setReceiptEmail(RETURNING_USER_EMAIL);
                    setRecipientWalletAddress(RETURNING_USER_RECIPIENT_WALLET);
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
