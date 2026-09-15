import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { hashForLookup } from "../../configurations/encryption";
import { serializeUser } from "../../auth/auth.helpers";
import verifyNIN from "../../configurations/nin-provider";
import {
  assertLiveAccessCode,
  isAlreadyConfirmedForNin,
} from "./verify.service";
import moment from "moment";

const confirmEmploymentAccessService = errorUtilities.withServiceErrorHandling(
  async (userId: string, nin: string, accessCode: string) => {
    const user = await assertLiveAccessCode(userId, nin, accessCode);

    if (isAlreadyConfirmedForNin(user, nin)) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "NIN already confirmed",
        serializeUser(user),
      );
    }

    const ninHash = hashForLookup(nin);

    const conflict = await User.findOne({ where: { ninHash } });
    if (conflict && conflict.get("id") !== userId) {
      throw errorUtilities.createError(
        "This NIN has already been confirmed on another account",
        StatusCodes.BAD_REQUEST,
      );
    }

    const ninData = await verifyNIN(nin.trim());

    user.set("nin", nin.trim());
    user.set("ninHash", ninHash);
    user.set("firstName", ninData.firstname ?? user.get("firstName"));
    user.set("surname", ninData.lastname ?? user.get("surname"));
    user.set("otherName", ninData.middlename ?? user.get("otherName"));
    user.set("gender", ninData.gender ?? user.get("gender"));
    if (ninData.birthdate) {
      const parsed = moment(ninData.birthdate, "DD-MM-YYYY", true);
      if (parsed.isValid()) {
        user.set("dateOfBirth", parsed.format("YYYY-MM-DD") as any);
      }
    }
    user.set("applicationStatus", ApplicationStatus.NinVerified);
    await user.save();

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "NIN confirmed",
      serializeUser(user),
    );
  },
);

export default confirmEmploymentAccessService;
