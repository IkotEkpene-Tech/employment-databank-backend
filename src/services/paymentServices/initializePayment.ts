// services/paymentServices/initializePayment.ts
import axios from "axios";
import { errorUtilities } from "../../utilities";
import responseUtilities from "../../utilities/responseHandlers/response.utilities";
import { StatusCodes } from "../../constants";
import configurations from "../../configurations";
import Transactions from "../../models/transactions";
import { v4 } from "uuid";
import { formatNigerianPhone } from "../../utilities/utils";

const initializePaystackPaymentService =
  errorUtilities.withServiceErrorHandling(
    async (phoneNumber: string, email: string) => {
      const amount = 50000; // amount in kobo

      const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
          email,
          amount,
          metadata: {
            phoneNumber: formatNigerianPhone(phoneNumber),
          },
          callback_url: configurations.PAYSTACK_CALLBACK_URL,
        },
        {
          headers: {
            Authorization: `Bearer ${configurations.PAYSTACK_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const { authorization_url, reference } = response.data.data;

      await Transactions.create({
        id: v4(),
        phoneNumber:formatNigerianPhone(phoneNumber),
        reference,
        amount,
        status: "pending",
      });

      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "Payment initialized",
        { authorization_url, reference },
      );
    },
  );

export default initializePaystackPaymentService;
