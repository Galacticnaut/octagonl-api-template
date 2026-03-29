import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";
import type { Request } from "express";
import type { AuthenticatedRequest } from "./auth.js";
import { logger } from "../services/logger.js";

/**
 * Structured request logging with request ID correlation.
 */
export const requestLogger = pinoHttp({
  logger,
  genReqId: (req: Request) => {
    return (req.headers["x-request-id"] as string) || uuidv4();
  },
  customProps: (req: Request) => {
    const authReq = req as AuthenticatedRequest;
    return {
      request_id: req.id,
      ...(authReq.user && {
        entra_oid: authReq.user.oid,
      }),
    };
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      headers: {
        "user-agent": req.headers["user-agent"],
        "x-request-id": req.headers["x-request-id"],
      },
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
});
