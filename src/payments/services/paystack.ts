import axios from "axios";
import configurations from "../../configurations";

export interface InitializeTransactionParams {
  email: string;
  amountKobo: number;
  metadata: Record<string, any>;
  callbackUrl?: string;
}

export const initializeTransaction = async ({
  email,
  amountKobo,
  metadata,
  callbackUrl,
}: InitializeTransactionParams): Promise<{
  authorizationUrl: string;
  reference: string;
}> => {
  const response = await axios.post(
    "https://api.paystack.co/transaction/initialize",
    {
      email,
      amount: amountKobo,
      metadata,
      callback_url: callbackUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${configurations.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    },
  );

  return {
    authorizationUrl: response.data.data.authorization_url,
    reference: response.data.data.reference,
  };
};

export const fetchTransactionStatus = async (
  reference: string,
): Promise<{ status: string }> => {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${configurations.PAYSTACK_SECRET_KEY}`,
      },
    },
  );

  return { status: response.data.data.status };
};
