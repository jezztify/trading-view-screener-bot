import log4js, {Logger} from "log4js";
import {tLogLevel} from "@screener-types/logging";

const createLogger = (name: string, logLevel?: tLogLevel): Logger => {
  const logger: Logger = log4js.getLogger(name);
    logger.level = logLevel?logLevel:"INFO";
    return logger
}


export {
  createLogger
}