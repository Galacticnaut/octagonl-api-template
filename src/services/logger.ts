import pino from "pino";
import { getEnv } from "../config.js";

export const logger = pino({
  level: getEnv().LOG_LEVEL,
  formatters: {
    level(label) {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export type Logger = typeof logger;
