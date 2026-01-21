"use client";

import React from "react";
import { Order } from "@/lib/types";
import Tooltip from "@/components/tooltip";

type Props = {
  amountUsd: string;
  setAmountUsd: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  walletAddress: string;
  setWalletAddress: (v: string) => void;
  order: Order;
  onContinue: () => void;
  children?: React.ReactNode;
};

// This number should match with the value of the environment variable
// ONRAMP_LIGHT_KYC_THRESHOLD_USD
const LIGHT_KYC_THRESHOLD_NUMBER = 100;

function PricingInfo({ effectiveAmount, totalUsd }: { effectiveAmount: string | null; totalUsd: string | null }) {
  if (effectiveAmount === null || totalUsd === null) return null;

  const addedToBalance = parseFloat(effectiveAmount);
  const totalAmountUsd = parseFloat(totalUsd);
  const feesUsd = totalAmountUsd - addedToBalance;

  return (
    <div className="mt-6 bg-gray-50 rounded-lg p-4">
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Added to your balance</span>
          <span className="text-gray-900 font-medium">${addedToBalance.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600 text-sm">Fees</span>
          <div className="flex items-center gap-2">
            {feesUsd <= 0.01 && (
              <Tooltip 
                content="No fees in staging. Contact sales to discuss rates for production."
                className="text-xs w-5 h-5 inline-flex items-center justify-center rounded-full border border-gray-300 text-gray-600 cursor-default"
              >
                ?
              </Tooltip>
            )}
            <span className="text-gray-900 font-medium">${feesUsd.toFixed(2)}</span>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-900 font-medium">Total amount</span>
          <span className="text-gray-900 font-semibold text-lg">${totalAmountUsd.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}

export default function OnrampDeposit({
  amountUsd,
  setAmountUsd,
  email,
  setEmail,
  walletAddress,
  setWalletAddress,
  order,
  onContinue,
  children,
}: Props) {
  const isLightKyc = Number(amountUsd) <= LIGHT_KYC_THRESHOLD_NUMBER;

  return (
    <div className="px-6">
      <h2 className="text-lg font-semibold text-center">Deposit</h2>

      {children}

      <div className="mt-4 flex items-center justify-center gap-2">
        <div className="text-5xl text-gray-500">$</div>
        <input
          className="text-5xl font-semibold text-gray-800 text-center outline-none min-w-[120px] max-w-[300px] w-auto"
          type="number"
          min={0}
          step={1}
          value={amountUsd}
          onChange={(e) => setAmountUsd(e.target.value)}
          disabled={order.status !== "not-created"}
        />
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800 text-center">
          {isLightKyc
            ? "This amount will use the light KYC experience. Select more than $100 to try full KYC."
            : "This amount will use the full KYC experience. Select less than $101 to try light KYC."}
        </p>
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={order.status !== "not-created"}
          />
        </div>

        <div>
          <label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Solana Wallet Address
          </label>
          <input
            id="walletAddress"
            type="text"
            required
            placeholder="Enter Solana wallet address"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-black"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            disabled={order.status !== "not-created"}
          />
        </div>
      </div>

      <PricingInfo effectiveAmount={order.effectiveAmount} totalUsd={order.totalUsd} />

      {order.totalUsd == null && (
        <div className="mt-6">
          <button
            className="bg-black text-white rounded-full px-5 py-2 text-sm w-full disabled:opacity-50"
            onClick={onContinue}
            disabled={order.status === "creating-order"}
          >
            {order.status === "creating-order" ? "Creating order..." : "Continue"}
          </button>
        </div>
      )}
    </div>
  );
}


