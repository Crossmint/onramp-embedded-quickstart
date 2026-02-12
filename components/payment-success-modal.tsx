interface PaymentSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactionHash?: string;
  amount: string;
  walletAddress: string;
}

export default function PaymentSuccessModal({
  isOpen,
  onClose,
  transactionHash,
  amount,
  walletAddress,
}: PaymentSuccessModalProps) {
  if (!isOpen) return null;

  const explorerUrl = transactionHash
    ? `https://explorer.solana.com/tx/${transactionHash}?cluster=devnet`
    : `https://explorer.solana.com/address/${walletAddress}?cluster=devnet`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h2>

          <p className="text-gray-600 mb-6">
            Your deposit of ${amount} USDC has been processed successfully.
          </p>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-gray-500 mb-1">Recipient Address</p>
            <p className="text-sm font-mono text-gray-900 break-all">
              {walletAddress}
            </p>
          </div>

          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors mb-3"
          >
            View on Solana Explorer
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          <button
            onClick={onClose}
            className="w-full py-3 px-4 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
