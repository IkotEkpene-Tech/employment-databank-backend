import { Request, Response } from "express";
import errorUtilities from "../../configurations/error-handler";

// Stateless logout: the bearer token has already been verified by the
// `authenticate` middleware by the time this handler runs. There is no
// server-side session/token registry to clear — the frontend is responsible
// for discarding the token; it simply expires on its own after that.
const logout = errorUtilities.withControllerErrorHandling(
  async (_request: Request, response: Response) => {
    return response.status(204).send();
  },
);

export default logout;
