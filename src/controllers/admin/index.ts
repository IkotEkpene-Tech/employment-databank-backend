// import { JwtPayload } from "jsonwebtoken";
// import { adminService } from "../../services";
// import { errorUtilities, responseUtilities } from "../../utilities";
// import { Request, Response } from "express";
// import { StatusCodes } from "../../constants";
// import bulkAddEstablishmentsService from "../../services/adminServices/adminAddEstablishmentsService";

// const addAdminController = errorUtilities.withControllerErrorHandling(
//   async (request: Request, response: Response) => {
//     const adminDetails = request.body;

//     const createAdmin = await adminService.createAdminService(adminDetails);

//     return responseUtilities.responseHandler(
//       response,
//       createAdmin.message,
//       createAdmin.statusCode,
//       createAdmin.data,
//     );
//   },
// );

// const loginAdminController = errorUtilities.withControllerErrorHandling(
//   async (request: Request, response: Response) => {
//     const adminDetails = request.body;

//     const loginAdmin = await adminService.loginAdminService(adminDetails);

//     if (loginAdmin.statusCode === StatusCodes.OK) {
//       response.setHeader("x-access-token", loginAdmin.data.accessToken);
//     }

//     return responseUtilities.responseHandler(
//       response,
//       loginAdmin.message,
//       loginAdmin.statusCode,
//       loginAdmin.data,
//     );
//   },
// );

// const getAllEstablishments = errorUtilities.withControllerErrorHandling(
//   async (request: Request, response: Response) => {
//     const allEstablishments: any =
//       await adminService.getAllEstablishmentsService();

//     return responseUtilities.responseHandler(
//       response,
//       allEstablishments.message,
//       allEstablishments.statusCode,
//       allEstablishments.data,
//     );
//   },
// );

// const getSingleEstablishment = errorUtilities.withControllerErrorHandling(
//   async (request: Request, response: Response) => {
//     const { establishmentId } = request.params;
//     const singleEstablishment: any =
//       await adminService.getSingleEstablishmentService(establishmentId);

//     return responseUtilities.responseHandler(
//       response,
//       singleEstablishment.message,
//       singleEstablishment.statusCode,
//       singleEstablishment.data,
//     );
//   },
// );

// const approveEntityRegistrationController =
//   errorUtilities.withControllerErrorHandling(
//     async (request: Request, response: Response) => {
//       const { establishmentId } = request.params;
//       const approveEstablishment: any =
//         await adminService.approveEntityRegistrationService(establishmentId);

//       return responseUtilities.responseHandler(
//         response,
//         approveEstablishment.message,
//         approveEstablishment.statusCode,
//         approveEstablishment.data,
//       );
//     },
//   );

// const bulkEntityRegistrationController =
//   errorUtilities.withControllerErrorHandling(
//     async (request: JwtPayload, response: Response) => {
//       const { establishments } = request.body;
//       if (!establishments || !Array.isArray(establishments)) {
//         return responseUtilities.responseHandler(
//           response,
//           "Invalid request: establishments array is required",
//           StatusCodes.BAD_REQUEST,
//           null,
//         );
//       }

//       const result = await bulkAddEstablishmentsService(establishments);

//       return responseUtilities.responseHandler(
//         response,
//         result.message,
//         result.statusCode,
//         result.data,
//       );
//     },
//   );

// const getEntityAnalyticsDataController =
//   errorUtilities.withControllerErrorHandling(
//     async (request: Request, response: Response) => {
//       console.log("Fetching entity analytics data...");
//       const analyticsData: any =
//         await adminService.getEstablishmentAnalyticsService();
//       return responseUtilities.responseHandler(
//         response,
//         analyticsData.message,
//         analyticsData.statusCode,
//         analyticsData.data,
//       );
//     },
//   );

// export default {
//   addAdminController,
//   getAllEstablishments,
//   getSingleEstablishment,
//   loginAdminController,
//   approveEntityRegistrationController,
//   bulkEntityRegistrationController,
//   getEntityAnalyticsDataController,
// };
