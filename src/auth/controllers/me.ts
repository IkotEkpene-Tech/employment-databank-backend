import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";
import responseUtilities from "../../configurations/response";
import { StatusCodes } from "../../configurations/statusCodes";
import { User } from "../User";
import { serializeUser } from "../auth.helpers";

const me = errorUtilities.withControllerErrorHandling(
  async (request: Request, response: Response) => {
    const user = await User.findByPk(request.user!.id);

    if (!user) {
      throw errorUtilities.createError("User not found", StatusCodes.NOT_FOUND);
    }

    return responseUtilities.responseHandler(
      response,
      "User fetched successfully",
      StatusCodes.OK,
      serializeUser(user),
    );
  },
);

export default me;
