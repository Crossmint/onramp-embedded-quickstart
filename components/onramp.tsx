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
  // TODO: Re-enable returning user flow once Persona data is fixed (missing phone number for US resident)
  const [userType, setUserType] = useState<"returning" | "new">("new");
  const [receiptEmail, setReceiptEmail] = useState("");
  const [recipientWalletAddress, setRecipientWalletAddress] = useState("");

  const [amountUsd, setAmountUsd] = useState(DEFAULT_AMOUNT);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txId, setTxId] = useState<string | undefined>();

  // Generate random email and wallet for new user on mount
  useEffect(() => {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    const randomPart = Array.from(bytes, (b) => (b % 36).toString(36)).join("");
    setReceiptEmail(`demos+onramp-new-user-${randomPart}@crossmint.com`);
    const wallet = Keypair.generate();
    setRecipientWalletAddress(wallet.publicKey.toBase58());
  }, []);

  const { order, createOrder, orderId, clientSecret, resetOrder } =
    useCrossmintOnramp({
      email: receiptEmail,
      walletAddress: recipientWalletAddress,
    });

  return (
    <div className="flex items-center justify-center bg-gray-50 px-6 py-12 col-span-1 lg:col-span-3">
      <div className="w-full max-w-md mt-10">
        <div className="bg-white rounded-3xl border shadow-lg overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col">
              {/* TODO: Re-enable returning user tab once Persona data is fixed (missing phone number for US resident)
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
                  setShowSuccess(false);
                  setTxId(undefined);
                  setAmountUsd(DEFAULT_AMOUNT);
                  resetOrder();
                }}
              /> */}

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
              {orderId && clientSecret && !showSuccess && (
                <>
                  <div>
                    <p className="text-sm text-center">
                      Use one of these test cards to complete the payment:
                    </p>
                    <p className="text-sm text-center">
                      Non-US KYC:{" "}
                      <span className="font-semibold filter-green">
                        4242 4242 4242 4242
                      </span>
                    </p>
                    <p className="text-sm text-center">
                      US KYC:{" "}
                      <span className="font-semibold filter-green">
                        4000 0200 0000 0000
                      </span>
                    </p>
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
                </>
              )}

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
                    // Generate fresh email and wallet for next new user flow
                    const bytes = new Uint8Array(8);
                    crypto.getRandomValues(bytes);
                    const randomPart = Array.from(bytes, (b) => (b % 36).toString(36)).join("");
                    setReceiptEmail(`demos+onramp-new-user-${randomPart}@crossmint.com`);
                    const wallet = Keypair.generate();
                    setRecipientWalletAddress(wallet.publicKey.toBase58());
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
