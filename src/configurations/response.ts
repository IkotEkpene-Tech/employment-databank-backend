import { Response } from "express";

export interface ResponseDetails {
  message: string;
  statusCode: number;
  data?: any;
  details?: any;
  info?: any;
}

/**
 * Response Handler:
 * Sends a standardized JSON response to the client: { status, message, data }.
 * Used to send responses from controllers back to the frontend/client.
 */
const responseHandler = (
  response: Response,
  message: string,
  statusCode: number,
  data?: any,
) => {
  return response.status(statusCode).json({
    status: statusCode === 201 || statusCode === 200 ? "success" : "error",
    message: message,
    data: data ?? null,
  });
};

const handleServicesResponse = (
  statusCode: number,
  message: string,
  data?: any,
) => {
  const responseHandler: ResponseDetails = {
    statusCode: 0,
    message: "",
    data: {},
  };
  responseHandler.message = message;
  responseHandler.statusCode = statusCode;
  responseHandler.data = data;
  return responseHandler;
};

export default {
  responseHandler,
  handleServicesResponse,
};
