import { User } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";

const employmentAccessStatusService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const user = await User.findByPk(userId);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    const accessCodeHash = user.get("accessCodeHash") as string | null;
    const expiresAt = user.get("accessCodeExpiresAt") as Date | null;
    const accessCodeExpired = Boolean(
      expiresAt && new Date(expiresAt).getTime() < Date.now(),
    );

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Employment access status fetched",
      {
        applicationStatus: user.get("applicationStatus"),
        hasAccessCode: Boolean(accessCodeHash),
        accessCodeExpiresAt: expiresAt
          ? new Date(expiresAt).toISOString()
          : undefined,
        accessCodeExpired,
      },
    );
  },
);

export default employmentAccessStatusService;
