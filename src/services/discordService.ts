
import { tScreenerParameters, tScreenerResponseData } from "@screener-types/screeners.type";
import {Interaction, EmbedBuilder} from "discord.js";

interface iDiscordService {
  sendReplyMessage(message: EmbedBuilder, discordInteraction: Interaction): Promise<void>;
  formEmbeddedMessage(data:tScreenerResponseData, parameters: tScreenerParameters ): EmbedBuilder;
}

class DiscordService implements iDiscordService {
  sendReplyMessage = async (message: any, discordInteraction: Interaction) => {
      try {
        let msg = message;
        if(message instanceof EmbedBuilder) {
          msg = {
            embeds: [message]
          }
        }
        discordInteraction.channel?.send(msg);
      } catch(e) {
        throw new Error(`An error occurred while sending ${message} to Discord: ${e}`)
      }
  }

  formEmbeddedMessage = (data: tScreenerResponseData, parameters: tScreenerParameters) => {
    let shouldIncludePercent = false;
    if(["change"].includes(parameters.attribute)) {
      shouldIncludePercent = true;
    }

    let textMessage = `\`${parameters.attribute}\` ${parameters.matcher} \`${parameters.value}\` in the past \`${parameters.timeframe}\``;
    if(shouldIncludePercent) {
      textMessage =   `\`${parameters.attribute}\` reached \`${data.d[2].toPrecision(2)}%\` in the past \`${parameters.timeframe}\``;
    }


    let hyperlink = `[[TradingView](https://www.tradingview.com/chart?symbol=${data.d[0]})]`;
    const embeddedMessage: EmbedBuilder = new EmbedBuilder()
                          .setTitle(`:exclamation:${data.d[0]} [$${data.d[1]}]`)
                          .setDescription(textMessage + "\n" + hyperlink);
    return embeddedMessage
  }
}

export {
  DiscordService
}