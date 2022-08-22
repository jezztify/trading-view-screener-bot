import {ScreenerHandler} from "../../../src/handlers/screenerHandler";
import {tTradingViewScreenerParameters} from "../../../src/types/tradingViewScreenerTypes";
import { DiscordService } from "../../../src/services/discordService";
import { TradingViewScreenerService } from "../../../src/services/tradingViewScreenerService";
import { createLogger } from "../../../src/utils/logging";
import {Interaction} from "discord.js";
import DiscordMock from "../../mocks/discordMock";

/**
 * Mocks
 */
const mockedCommand = {
  "id": "config",
  "name": "config",
  "type": 1,
  "options": [
    {
      "type": 1,
      "name": "set",
      "options": [{
        "value": "en",
        "type": 3,
        "name": "lang"
      }],
    }
  ]
};
const mockedDiscord = new DiscordMock(mockedCommand);
const mockedInteraction = mockedDiscord.getInteraction() as Interaction;
/**
 * Main Test
 */
describe("Screener Handler Class", () => {
  // Variables
  const mockedParameters: tTradingViewScreenerParameters = {
    name: "test screener",
    filters: [],
    market: "crypto",
    attribute: "RSI",
    matcher: "==",
    timeframe: "15",
    value: "70",
    interval: 10000
  }
  let sut = new ScreenerHandler()
  it("should generate a screener handler object successfully without a logger object", () => {
    let testScreener = sut.generate(mockedInteraction, mockedParameters);
    expect(testScreener).toHaveProperty("discordService");
    expect(testScreener).toHaveProperty("tradingViewScreenerService");
    expect(testScreener).toHaveProperty("logging");
    expect(testScreener.discordService).toBeInstanceOf(DiscordService);
    expect(testScreener.tradingViewScreenerService).toBeInstanceOf(TradingViewScreenerService);
    expect(testScreener.logging.category).toContain("ScreenerHandler_");
  })

  it("should generate a screener handler object successfully with a logger object", () => {
    let testLogger = createLogger("testLogger");
    let testScreener = sut.generate(mockedInteraction, mockedParameters, testLogger);
    expect(testScreener).toHaveProperty("discordService");
    expect(testScreener).toHaveProperty("tradingViewScreenerService");
    expect(testScreener).toHaveProperty("logging");
    expect(testScreener.discordService).toBeInstanceOf(DiscordService);
    expect(testScreener.tradingViewScreenerService).toBeInstanceOf(TradingViewScreenerService);
    expect(testScreener.logging.category).toBe("testLogger");
  })
})

