import log4js, {Logger} from "log4js";
import {tLogLevel} from "@screener-types/loggers";
interface iLogging {
  createLogger(name: string, logLevel?: tLogLevel): Logger
}

class Logging implements iLogging {
  createLogger = (name: string, logLevel?: tLogLevel) => {
    const logger = log4js.getLogger(name);
    logger.level = logLevel?logLevel:"INFO";
    return logger
  }
}

export {
  Logging
}