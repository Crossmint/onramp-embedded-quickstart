import { OnrampStatus } from "./useCrossmintOnramp";

export type Order = {
  status: OnrampStatus;
  error: string | null;
  totalUsd: string | null;
  effectiveAmount: string | null;
  txId: string | null;
};

// API Response Types
export type CreateOrderRequest = {
  amount: string;
  receiptEmail: string;
  walletAddress: string;
  paymentMethod: string;
};

export type CreateOrderResponse = {
  clientSecret: string;
  order: {
  orderId: string;
  payment: {
    status: string;
    preparation: {
      kyc?: PersonaConfig;
      checkoutcomPaymentSession?: string;
      checkoutcomPublicKey?: string;
    };
  };
  lineItems: Array<{
    quote: {
      totalPrice: {
        amount: string;
      };
      quantityRange: {
        lowerBound: string;
        upperBound: string;
      };
    };
  }>;
  quote: {
    totalPrice: {
        amount: string;
      };
    };
  };
};

export type GetOrderResponse = {
  orderId: string;
  phase: string;
  payment: {
    status: string;
    preparation: {
      checkoutcomPaymentSession?: string;
      checkoutcomPublicKey?: string;
    };
  };
  lineItems: Array<{
    quote?: {
      quantityRange?: {
        lowerBound?: string;
        upperBound?: string;
      };
    };
    delivery: {
      status: string;
      txId: string;
    };
  }>;
};

export type ApiErrorResponse = {
  error: string;
  details?: any;
};

export type PersonaConfig = {
  templateId: string;
  referenceId: string;
  environmentId: string;
};
