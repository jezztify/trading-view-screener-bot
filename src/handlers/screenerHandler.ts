import { DiscordService } from "@screener-services/discordService"
import { TradingViewScreenerService } from "@screener-services/tradingViewScreenerService"
import { tScreener, tTradingViewScreenerParameters } from "@screener-types/tradingViewScreenerTypes"
import { Interaction } from "discord.js"

interface iScreenerHandler {
  generate(discordInteraction: Interaction, tvScreenerParameters: tTradingViewScreenerParameters): tScreener
}

class ScreenerHandler implements iScreenerHandler {
  generate = (discordInteraction: Interaction, tvScreenerParameters: tTradingViewScreenerParameters) => {
      const discordService = new DiscordService(discordInteraction);
      const tradingViewScreenerService = new TradingViewScreenerService(tvScreenerParameters);
      const screener: tScreener = {
        discordService: discordService,
        tradingViewScreenerService: tradingViewScreenerService
      }

      return screener
  }
}

export {
  ScreenerHandler
}