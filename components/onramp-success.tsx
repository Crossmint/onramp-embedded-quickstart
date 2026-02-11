"use client";

type OnrampSuccessProps = {
  orderId: string;
  totalUsd: string;
  effectiveAmount: string;
  walletAddress: string;
  onStartNew: () => void;
};

export default function OnrampSuccess({
  orderId,
  totalUsd,
  effectiveAmount,
  walletAddress,
  onStartNew,
}: OnrampSuccessProps) {
  return (
    <div className="space-y-6">
      {/* Success Icon and Message */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          Payment Successful!
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          Your USDC has been sent to your wallet
        </p>
      </div>

      {/* Transaction Details */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Order ID</span>
          <span className="text-sm font-mono text-gray-900 break-all text-right max-w-[60%]">
            {orderId}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Amount Paid</span>
            <span className="text-sm font-semibold text-gray-900">
              ${totalUsd} USD
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">USDC Received</span>
          <span className="text-sm font-semibold text-green-600">
            {effectiveAmount} USDC
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="flex flex-col space-y-1">
            <span className="text-sm text-gray-600">Destination Wallet</span>
            <span className="text-xs font-mono text-gray-900 break-all bg-white px-2 py-1 rounded border border-gray-200">
              {walletAddress}
            </span>
          </div>
        </div>
      </div>

      {/* Start New Transaction Button */}
      <button
        onClick={onStartNew}
        className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
      >
        Start New Transaction
      </button>

      {/* Optional: View on Explorer */}
      <p className="text-center text-xs text-gray-500">
        Your transaction will appear on the Solana blockchain shortly
      </p>
    </div>
  );
}
