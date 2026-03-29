import { createApp } from "./app.js";
import { getEnv } from "./config.js";
import { logger } from "./services/logger.js";

const env = getEnv();
const app = createApp();

app.listen(env.PORT, () => {
  logger.info(
    { port: env.PORT, env: env.NODE_ENV },
    `API listening on port ${env.PORT}`,
  );
});
