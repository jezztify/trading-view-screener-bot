import {createLogger} from "../../../src/utils/logging";
import {tLogLevel} from "../../../src/types/logging";
/**
 * Mocks
 */

/**
* Main Test
*/
describe("Logging Class", () => {

  it("should be able to use 'INFO' as the default log level", () => {
    let thisLogger = createLogger("testLogger");
    let expectedLevel:tLogLevel = "INFO"
    expect(thisLogger.level.toString()).toBe(expectedLevel);
  })

  it("should create loggers with the correct name", () => {
    let thisLogger = createLogger("testLogger");
    expect(thisLogger.category).toBe("testLogger");
  })
  
  it("should create loggers with the correct log level", () => {
    let expectedLevel:tLogLevel = "ERROR";
    let thisLogger = createLogger("testLogger", expectedLevel);
    expect(thisLogger.level.toString()).toStrictEqual(expectedLevel);
  })
})