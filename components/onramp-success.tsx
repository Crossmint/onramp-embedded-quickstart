"use client";

type OnrampSuccessProps = {
  totalUsd: string;
  effectiveAmount: string;
  walletAddress: string;
  txId?: string;
  onStartNew: () => void;
};

function formatUsdc(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return num.toFixed(2);
}

function truncateAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function OnrampSuccess({
  totalUsd,
  effectiveAmount,
  walletAddress,
  txId,
  onStartNew,
}: OnrampSuccessProps) {
  const explorerUrl = txId
    ? `https://explorer.solana.com/tx/${txId}?cluster=devnet`
    : `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`;
  const formattedUsdc = formatUsdc(effectiveAmount);
  const formattedUsd = formatUsdc(totalUsd);

  return (
    <div className="flex flex-col items-center py-2">
      {/* Animated checkmark */}
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center animate-in zoom-in duration-500">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-1">
        Payment successful
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Your USDC has been delivered
      </p>

      {/* Amount display */}
      <div className="w-full bg-gray-50 rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">You paid</span>
          <span className="text-sm font-medium text-gray-900">
            ${formattedUsd}
          </span>
        </div>
        <div className="border-t border-gray-200 my-3" />
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-500">You received</span>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
              <span className="text-[8px] font-bold text-white">$</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {formattedUsdc} USDC
            </span>
          </div>
        </div>
        <div className="border-t border-gray-200 my-3" />
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Delivered to</span>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-mono text-green-600 hover:text-green-700 hover:underline transition-colors"
          >
            {truncateAddress(walletAddress)}
          </a>
        </div>
      </div>

      {/* Actions */}
      <div className="w-full space-y-2.5">
        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full py-2.5 px-4 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
        >
          View on Explorer
          <svg
            className="w-3.5 h-3.5 ml-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        </a>

        <button
          onClick={onStartNew}
          className="w-full py-2.5 px-4 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          New transaction
        </button>
      </div>
    </div>
  );
}
