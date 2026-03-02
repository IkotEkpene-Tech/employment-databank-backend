// import { errorUtilities } from "../../utilities";
// import { AdminServiceResponses } from "../../types/responseTypes/adminServiceResponses";
// import { StatusCodes } from "../../constants";
// import handleServicesResponse from "../../utilities/responseHandlers/response.utilities";
// import {
//   establishmentRepositories,
//   userRepositories,
// } from "../../repositories";
// import { Roles, TokenDuration } from "../../types/userModelTypes";
// import { v4 } from "uuid";
// import { hash } from "bcryptjs";
// import { generalHelpers } from "../../helpers";
// import { RegistrationStatus } from "../../types/hospitalityEstablishmentsModelTypes";
// import moment from "moment";
// import { Op, fn, col, literal } from "sequelize";
// import HospitalityEstablishment from "../../models/hospitalityEstablishments/hospitalityEstablishments";

// const createAdminService = errorUtilities.withServiceErrorHandling(
//   async (adminDetails: Record<string, any>): Promise<Record<string, any>> => {
//     const checkAdmin = await userRepositories.userRepositories.getOne({
//       email: adminDetails.email,
//     });

//     if (checkAdmin) {
//       throw errorUtilities.createError(
//         AdminServiceResponses.EMAIL_ALREADY_IN_USE,
//         StatusCodes.BAD_REQUEST,
//       );
//     }

//     const newUserId = v4();

//     const tokenData = {
//       userId: newUserId,
//       role: Roles.Admin,
//       email: adminDetails.email,
//     };

//     const refreshToken = generalHelpers.generateTokens(
//       tokenData,
//       TokenDuration.refreshTokenDuration,
//     );

//     const newAdmin = await userRepositories.userRepositories.create({
//       ...adminDetails,
//       id: newUserId,
//       role: Roles.Admin,
//       password: await generalHelpers.hashData(adminDetails.password),
//       refreshToken,
//     });

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.CREATED,
//       AdminServiceResponses.ADMIN_CREATED_SUCCESSFULLY,
//       {
//         admin:
//           await userRepositories.userRepositories.extractUserDetails(newAdmin),
//       },
//     );
//   },
// );

// const loginAdminService = errorUtilities.withServiceErrorHandling(
//   async (adminDetails: Record<string, any>): Promise<Record<string, any>> => {
//     const { email, password } = adminDetails;

//     const admin: any = await userRepositories.userRepositories.getOne({
//       email,
//     });

//     if (!admin) {
//       throw errorUtilities.createError(
//         AdminServiceResponses.WRONG_CREDENTIALS,
//         StatusCodes.UNAUTHORIZED,
//       );
//     }

//     const isPasswordValid = await generalHelpers.validatePassword(
//       password,
//       admin.password,
//     );

//     if (!isPasswordValid) {
//       throw errorUtilities.createError(
//         AdminServiceResponses.WRONG_CREDENTIALS,
//         StatusCodes.UNAUTHORIZED,
//       );
//     }

//     const tokenData = {
//       userId: admin.id,
//       role: Roles.Admin,
//       email: admin.email,
//     };

//     const accessToken = generalHelpers.generateTokens(
//       tokenData,
//       TokenDuration.accessTokenDuration,
//     );

//     const adminData: any =
//       await userRepositories.userRepositories.extractUserDetails(admin);

//     adminData.accessToken = accessToken;

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.OK,
//       AdminServiceResponses.PROCESS_SUCCESSFULL,
//       adminData,
//     );
//   },
// );

// const getAllEstablishmentsService = errorUtilities.withServiceErrorHandling(
//   async (): Promise<Record<string, any>> => {
//     const establishments = await establishmentRepositories.getMany({});

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.OK,
//       AdminServiceResponses.ESTABLISHMENTS_FETCHED_SUCCESSFULLY,
//       establishments,
//     );
//   },
// );

// const getSingleEstablishmentService = errorUtilities.withServiceErrorHandling(
//   async (establishmentId: string): Promise<Record<string, any>> => {
//     const establishment = await establishmentRepositories.getOne({
//       id: establishmentId,
//     });

//     return handleServicesResponse.handleServicesResponse(
//       StatusCodes.OK,
//       AdminServiceResponses.PROCESS_SUCCESSFULL,
//       establishment,
//     );
//   },
// );

// const approveEntityRegistrationService =
//   errorUtilities.withServiceErrorHandling(
//     async (establishmentId: string): Promise<Record<string, any>> => {
//       const entity: any = await establishmentRepositories.getOne({
//         id: establishmentId,
//       });

//       if (!entity) {
//         throw errorUtilities.createError(
//           AdminServiceResponses.ESTABLISHMENT_NOT_FOUND,
//           StatusCodes.NOT_FOUND,
//         );
//       }

//       let establishmentUpdate;
//       if (
//         entity.registrationStatus === RegistrationStatus.Pending ||
//         entity.registrationStatus === RegistrationStatus.Rejected ||
//         !entity.registrationStatus ||
//         entity.registrationStatus === RegistrationStatus.UnderReview
//       ) {
//         establishmentUpdate = await establishmentRepositories.updateOne(
//           { id: establishmentId },
//           { registrationStatus: RegistrationStatus.Approved },
//         );
//       } else {
//         establishmentUpdate = await establishmentRepositories.updateOne(
//           { id: establishmentId },
//           { registrationStatus: RegistrationStatus.Rejected },
//         );
//       }

//       return handleServicesResponse.handleServicesResponse(
//         StatusCodes.OK,
//         AdminServiceResponses.PROCESS_SUCCESSFULL,
//         establishmentUpdate,
//       );
//     },
//   );

// const getEstablishmentAnalyticsService =
//   errorUtilities.withServiceErrorHandling(
//     async (): Promise<Record<string, any>> => {
//       const startOfMonth = moment().startOf("month").toDate();
//       const endOfMonth = moment().endOf("month").toDate();

//       /** TOTAL ENTITIES */
//       const totalEntities = await HospitalityEstablishment.count();
//       /** ENTITY TYPE COUNTS */
//       const entityTypeCounts: any = await HospitalityEstablishment.findAll({
//         attributes: ["entityType", [fn("COUNT", col("id")), "count"]],
//         group: ["entityType"],
//         raw: true,
//       });

//       const getCountByType = (type: string) =>
//         Number(
//           entityTypeCounts.find((e: any) => e.entityType === type)?.count || 0,
//         );
//       const totalHotels = getCountByType("hotel");
//       const totalRestaurants = getCountByType("restaurant");
//       const totalBarsAndLounges =
//         getCountByType("bar") + getCountByType("lounge");

//       /** REGISTRATIONS THIS MONTH */
//       const totalRegistrationsThisMonth = await HospitalityEstablishment.count({
//         where: {
//           submittedAt: {
//             [Op.between]: [startOfMonth, endOfMonth],
//           },
//         },
//       });

//       /** TOP LOCAL GOVERNMENT */
//       const topLocalGovernmentRegistered: any =
//         await HospitalityEstablishment.findOne({
//           attributes: ["localGovernment", [fn("COUNT", col("id")), "count"]],
//           group: ["localGovernment"],
//           order: [[literal("count"), "DESC"]],
//           raw: true,
//         });

//       const analyticsData = {
//         totalEntities,
//         totalHotels,
//         totalRestaurants,
//         totalBarsAndLounges,
//         totalRegistrationsThisMonth,
//         topLocalGovernmentRegistered: topLocalGovernmentRegistered
//           ? {
//               localGovernment: topLocalGovernmentRegistered?.localGovernment,
//               count: Number(topLocalGovernmentRegistered?.count),
//             }
//           : null,
//       };

//       return handleServicesResponse.handleServicesResponse(
//         StatusCodes.OK,
//         AdminServiceResponses.PROCESS_SUCCESSFULL,
//         analyticsData,
//       );
//     },
//   );

// export default {
//   getAllEstablishmentsService,
//   createAdminService,
//   getSingleEstablishmentService,
//   loginAdminService,
//   approveEntityRegistrationService,
//   getEstablishmentAnalyticsService,
// };
