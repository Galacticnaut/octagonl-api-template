import pinoHttp from "pino-http";
import { v4 as uuidv4 } from "uuid";
import type { IncomingMessage } from "http";
import type { Request } from "express";
import type { AuthenticatedRequest } from "./auth.js";
import { logger } from "../services/logger.js";

/**
 * Structured request logging with request ID correlation.
 */
export const requestLogger = (pinoHttp as unknown as typeof pinoHttp.default)({
  logger,
  genReqId: (req: IncomingMessage) => {
    return ((req as Request).headers["x-request-id"] as string) || uuidv4();
  },
  customProps: (req: IncomingMessage) => {
    const authReq = req as AuthenticatedRequest;
    return {
      request_id: (req as Request & { id?: string }).id,
      ...(authReq.user && {
        entra_oid: authReq.user.oid,
      }),
    };
  },
  serializers: {
    req: (req: Record<string, unknown>) => ({
      method: req.method,
      url: req.url,
      headers: {
        "user-agent": (req.headers as Record<string, unknown>)?.["user-agent"],
        "x-request-id": (req.headers as Record<string, unknown>)?.["x-request-id"],
      },
    }),
    res: (res: Record<string, unknown>) => ({
      statusCode: res.statusCode,
    }),
  },
});
