import { RegistrationDraft } from "../../auth/RegistrationDraft";
import { User, ApplicationStatus } from "../../auth/User";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";

export const getDraftService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    const draft = await RegistrationDraft.findOne({ where: { userId } });

    if (!draft) {
      return responseUtilities.handleServicesResponse(
        StatusCodes.OK,
        "No saved draft",
        null,
      );
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.OK,
      "Draft fetched successfully",
      {
        values: draft.get("values"),
        step: draft.get("step"),
        updatedAt: draft.get("updatedAt"),
      },
    );
  },
);

export const saveDraftService = errorUtilities.withServiceErrorHandling(
  async (userId: string, values: Record<string, any>, step: number) => {
    const existing = await RegistrationDraft.findOne({ where: { userId } });

    if (existing) {
      await existing.update({ values, step });
    } else {
      await RegistrationDraft.create({ userId, values, step } as any);
    }

    const user = await User.findByPk(userId);
    const currentStatus = user?.get("applicationStatus");
    if (
      user &&
      currentStatus !== ApplicationStatus.InProgress &&
      currentStatus !== ApplicationStatus.Submitted
    ) {
      user.set("applicationStatus", ApplicationStatus.InProgress);
      await user.save();
    }

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Draft saved",
    );
  },
);

export const deleteDraftService = errorUtilities.withServiceErrorHandling(
  async (userId: string) => {
    await RegistrationDraft.destroy({ where: { userId } });

    return responseUtilities.handleServicesResponse(
      StatusCodes.NO_CONTENT,
      "Draft cleared",
    );
  },
);
