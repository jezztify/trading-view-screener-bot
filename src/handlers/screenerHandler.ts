import { DiscordService } from "@screener-services/discordService";
import { TradingViewScreenerService } from "@screener-services/tradingViewScreenerService";
import { tScreener, tTradingViewScreenerParameters } from "@screener-types/tradingViewScreenerTypes";
import { createLogger } from "@screener-utils/logging";
import { Interaction } from "discord.js";
import { Logger } from "log4js";

interface iScreenerHandler {
  generate(
    discordInteraction: Interaction, 
    tvScreenerParameters: tTradingViewScreenerParameters,
    logging?: Logger
  ): tScreener
}

class ScreenerHandler implements iScreenerHandler {
  generate = (discordInteraction: Interaction, tvScreenerParameters: tTradingViewScreenerParameters, logging?: Logger) => {
      if(!logging) {
        logging = createLogger(`ScreenerHandler_${discordInteraction.createdTimestamp}`);
      }
      const discordService = new DiscordService(discordInteraction);
      const tradingViewScreenerService = new TradingViewScreenerService(tvScreenerParameters);
      const screener: tScreener = {
        discordService: discordService,
        tradingViewScreenerService: tradingViewScreenerService,
        logging: logging
      }

      return screener
  }
}

export {
  ScreenerHandler
}