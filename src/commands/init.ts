import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";

@Discord()
class initBot {
    @Slash("init-bot", { description: "initialize bot"})
    async initBot(
        interaction: CommandInteraction
    ) {
        await interaction.channel?.send("/add-screener name:rsi32 attribute:RSI matcher:Less Than or Equal value:32 timeframe:1h interval:10s");
        await interaction.channel?.send("/add-screener name:rsi68 attribute:RSI matcher:Greater Than or Equal value:68 timeframe:1h interval:10s");
        await interaction.channel?.send("/add-screener name:change-5% attribute:change matcher:Less Than or Equal value:-5 timeframe:1h interval:10s");
        await interaction.channel?.send("/add-screener name:change+5% attribute:change matcher:Greater Than or Equal value:5 timeframe:1h interval:10s");

    }
}