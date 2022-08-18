import {Logging} from "../../../src/utils/logger";
import {tLogLevel} from "../../../src/types/loggers.type";
/**
 * Mocks
 */

/**
* Main Test
*/
describe("Logging Class", () => {
  // Subject Under Test
  const sut = new Logging();

  it("should be able to use 'INFO' as the default log level", () => {
    let thisLogger = sut.createLogger("testLogger");
    let expectedLevel = "INFO"
    expect(thisLogger.level.toString()).toBe(expectedLevel);
  })

  it("should create loggers with the correct name", () => {
    let thisLogger = sut.createLogger("testLogger");
    expect(thisLogger.category).toBe("testLogger");
  })
  
  it("should create loggers with the correct log level", () => {
    let expectedLevel:tLogLevel = "ERROR";
    let thisLogger = sut.createLogger("testLogger", expectedLevel);
    expect(thisLogger.level.toString()).toStrictEqual(expectedLevel);
  })
})