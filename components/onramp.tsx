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
import { prepareStellarWallet } from "@/lib/actions";
import { useState, useEffect, useRef } from "react";
import UserTypeSelector from "@/components/user-type-selector";
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

type WalletPrep =
  | { status: "static" }
  | { status: "preparing" }
  | { status: "ready"; secret: string }
  | { status: "error"; message: string };

export default function Onramp() {
  const [userType, setUserType] = useState<"returning" | "new">("returning");
  const [receiptEmail, setReceiptEmail] = useState(RETURNING_USER_EMAIL);
  const [recipientWalletAddress, setRecipientWalletAddress] = useState(
    RETURNING_USER_RECIPIENT_WALLET
  );
  const [walletPrep, setWalletPrep] = useState<WalletPrep>({ status: "static" });
  const prepIdRef = useRef(0);

  const [amountUsd, setAmountUsd] = useState(DEFAULT_AMOUNT);
  const [showSuccess, setShowSuccess] = useState(false);
  const [txId, setTxId] = useState<string | undefined>();

  const startWalletPrep = () => {
    const prepId = ++prepIdRef.current;
    setRecipientWalletAddress("");
    setWalletPrep({ status: "preparing" });
    prepareStellarWallet().then((result) => {
      if (prepIdRef.current !== prepId) return;
      if ("error" in result) {
        setWalletPrep({ status: "error", message: result.error });
      } else {
        setRecipientWalletAddress(result.publicKey);
        setWalletPrep({ status: "ready", secret: result.secret });
      }
    });
  };

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
              <UserTypeSelector
                userType={userType}
                onUserTypeChange={(newType, email) => {
                  setUserType(newType);
                  setReceiptEmail(email);
                  setShowSuccess(false);
                  setTxId(undefined);
                  setAmountUsd(DEFAULT_AMOUNT);
                  resetOrder();
                  if (newType === "new") {
                    startWalletPrep();
                  } else {
                    prepIdRef.current++;
                    setRecipientWalletAddress(RETURNING_USER_RECIPIENT_WALLET);
                    setWalletPrep({ status: "static" });
                  }
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
                  disabled={userType === "new" && walletPrep.status !== "ready"}
                >
                  {userType === "new" && (
                    <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm">
                      {walletPrep.status === "preparing" && (
                        <p className="text-gray-600 text-center">
                          Preparing a Stellar testnet wallet (friendbot funding +
                          USDC trustline)...
                        </p>
                      )}
                      {walletPrep.status === "error" && (
                        <div className="text-center">
                          <p className="text-red-600">
                            Wallet setup failed: {walletPrep.message}
                          </p>
                          <button
                            type="button"
                            className="underline mt-1 text-gray-700"
                            onClick={startWalletPrep}
                          >
                            Retry
                          </button>
                        </div>
                      )}
                      {walletPrep.status === "ready" && (
                        <div>
                          <p className="text-gray-600">Recipient wallet (generated):</p>
                          <p className="font-mono text-xs break-all mt-1">
                            {recipientWalletAddress}
                          </p>
                          <details className="mt-2">
                            <summary className="cursor-pointer text-gray-600">
                              Secret key (import into a Stellar wallet to see the USDC
                              arrive)
                            </summary>
                            <p className="font-mono text-xs break-all mt-1">
                              {walletPrep.secret}
                            </p>
                          </details>
                        </div>
                      )}
                    </div>
                  )}
                </OnrampDeposit>
              )}

              {/* Step 2: Pay for existing order via embedded checkout */}
              {orderId && clientSecret && !showSuccess && (
                <>
                  <div>
                    <p className="text-sm text-center">
                      Use the test card for your region:
                    </p>
                    <div className="text-sm text-center mt-1">
                      <p>
                        <span className="text-gray-500">US (debit)</span>{" "}
                        <span className="font-semibold filter-green">
                          5200 8282 8282 8210
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">US</span>{" "}
                        <span className="font-semibold filter-green">
                          4000 0200 0000 0000
                        </span>
                      </p>
                      <p>
                        <span className="text-gray-500">Non-US</span>{" "}
                        <span className="font-semibold filter-green">
                          4242 4242 4242 4242
                        </span>
                      </p>
                    </div>
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
