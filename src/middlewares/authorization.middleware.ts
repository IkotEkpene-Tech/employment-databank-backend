// import { Response, NextFunction } from "express";
// import jwt, { JwtPayload } from "jsonwebtoken";
// import { generalHelpers } from "../helpers";
// import { TokenDuration } from "../types/applicantModelTypes";
// import Applicants from "../models/applicants/applicantModel";

// export const generalAuthFunction = async (
//   request: JwtPayload,
//   response: Response,
//   next: NextFunction,
// ): Promise<any> => {
//   try {
//     const authorizationHeader = request.headers.authorization;

//     const refreshToken = request.headers["x-refresh-token"];

//     if (!authorizationHeader) {
//       return response.status(401).json({
//         message: "Please login again",
//       });
//     }

//     const authorizationToken = authorizationHeader.split(" ")[1];
//     if (!authorizationToken) {
//       return response.status(401).json({
//         status: "Failed",
//         message: "Login required",
//       });
//     }

//     let verifiedUser: any;
//     try {
//       verifiedUser = jwt.verify(
//         authorizationToken,
//         `${process.env.APP_SECRET}`,
//       );
//     } catch (error: any) {
//       if (error.message === "jwt expired") {
//         if (!refreshToken) {
//           return response.status(401).json({
//             status: "error",
//             message: "Refresh Token not found. Please login again.",
//           });
//         }

//         let refreshVerifiedUser: any;
//         try {
//           refreshVerifiedUser = jwt.verify(
//             refreshToken,
//             `${process.env.APP_SECRET}`,
//           );
//         } catch (refreshError: any) {
//           return response.status(401).json({
//             status: "error",
//             message: "Refresh Token Expired. Please login again.",
//           });
//         }

//         const filter = { id: refreshVerifiedUser.userId };

//         const projection = ["refreshToken", "isVerified"];

//         const applicantDetails: any = await Applicants.findOne({
//           where: filter,
//           attributes: projection,
//         });

//         const compareRefreshTokens =
//           refreshToken === applicantDetails.refreshToken;

//         if (compareRefreshTokens === false) {
//           return response.status(401).json({
//             status: "error",
//             message: "Please login again.",
//           });
//         }

//         const tokenPayload = {
//           userId: refreshVerifiedUser.userId,
//           email: refreshVerifiedUser.email,
//           role: refreshVerifiedUser.role,
//         };

//         const newAccessToken = generalHelpers.generateTokens(
//           tokenPayload,
//           TokenDuration.accessTokenDuration,
//         );

//         const newRefreshToken = generalHelpers.generateTokens(
//           tokenPayload,
//           TokenDuration.refreshTokenDuration,
//         );

//         response.setHeader("x-access-token", newAccessToken);

//         response.setHeader("x-refresh-token", newRefreshToken);

//         await userRepositories.userRepositories.updateOne(
//           { id: refreshVerifiedUser.userId },
//           { refreshToken },
//         );

//         request.user = refreshVerifiedUser;

//         return next();
//       }

//       return response.status(401).json({
//         status: "error",
//         message: `Login Again, Invalid Token: ${error.message}`,
//       });
//     }

//     request.user = verifiedUser;

//     return next();
//   } catch (error: any) {
//     return response.status(500).json({
//       status: "error",
//       message: `Internal Server Error: ${error.message}`,
//     });
//   }
// };

// export function rolePermit(roles: string[]) {
//   return async (
//     request: JwtPayload,
//     response: Response,
//     next: NextFunction,
//   ): Promise<any> => {
//     const userRole = request.user.role;
//     const { userId } = request.user;
//     if (!userRole || !userId) {
//       return response.status(401).json({
//         status: "error",
//         message: "User Not Authorized. Please login again",
//       });
//     }

//     const isAuthorized = roles.includes(userRole);
//     if (!isAuthorized) {
//       return response.status(401).json({
//         status: "error",
//         message: "Not Permitted For Action",
//       });
//     }

//     next();
//   };
// }
