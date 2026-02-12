export type Order = {
  status: "not-created" | "creating-order" | "awaiting-payment" | "error";
  error: string | null;
  totalUsd: string | null;
  effectiveAmount: string | null;
};

// API Response Types
export type CreateOrderResponse = {
  clientSecret: string;
  order: {
    orderId: string;
    payment: {
      status: string;
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

export type ApiErrorResponse = {
  error: string;
  details?: any;
};
