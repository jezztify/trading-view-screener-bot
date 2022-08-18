import { Interaction } from "discord.js";
import {DiscordService} from "../../../src/services/discordService";
import {tTradingViewScreenerParameters, tScreenerResponseData} from "../../../src/types/tradingViewScreenerTypes";
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
describe("Discord Service Class", () => {
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
  const mockedResponseData: tScreenerResponseData = {
    "s": "BINANCE:DARUSDTPERP",
    "d": [
      "DARUSDTPERP",
      0.41,
      30.87412827
    ]
  }

  // Subject Under Test
  const sut = new DiscordService(mockedInteraction);

  it("should not add % sign when forming embedded messages for indicators that do not need them.", () => {
    let embeddedMessage = sut.formEmbeddedMessage(mockedResponseData, mockedParameters);
    let expectedEmbeddedMessage = {
      title: ':exclamation:DARUSDTPERP [$0.41]',
      description: '`RSI` == `70` in the past `15`\n' +
        '[[TradingView](https://www.tradingview.com/chart?symbol=DARUSDTPERP)]'
    }
    expect(embeddedMessage.toJSON()).toStrictEqual(expectedEmbeddedMessage);
  })

  it("should add % sign when forming embedded messages for indicators that do not need them.", () => {
    mockedParameters.attribute = "change";
    let embeddedMessage = sut.formEmbeddedMessage(mockedResponseData, mockedParameters);
    let expectedEmbeddedMessage = {
      title: ':exclamation:DARUSDTPERP [$0.41]',
      description: '`change` reached `31%` in the past `15`\n' +
        '[[TradingView](https://www.tradingview.com/chart?symbol=DARUSDTPERP)]'
    }
    expect(embeddedMessage.toJSON()).toStrictEqual(expectedEmbeddedMessage);
  })
})