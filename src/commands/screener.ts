import { CommandInteraction, EmbedBuilder } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import fetch from "node-fetch";
import log4js from "log4js";

const log = log4js.getLogger("SCREENER");
log.level = "debug";
log.info("LOGGER READY.");

type screenerType = {
  name: string,
  request: JSON,
  interval: number,
  interaction?: CommandInteraction,
  screener?: NodeJS.Timer | undefined,
  timeout?: NodeJS.Timer | undefined
}

const matcherOperator: {[k:string]:string}= {
  ">": "greater",
  ">=": "egreater",
  "==": "equal",
  "<=": "eless",
  "<": "less",
  "Crosses Above": "crosses_above",
  "Crosses Below": "crosses_below"
}

const timeframeValue: {[k:string]:string} = {
  "15m": "15",
  "30m": "30",
  "1h": "60",
  "1D": "1D"
}

@Discord()
class screener {
  settings: {[k: string]: any} = {
    discoveryTimeout: 600000
  }
  screeners: screenerType[] = [];
  timeouts: string[] = [];

  @Slash("add-screener", {description: "Screener methods"})
  async addScreener (  
    // @SlashChoice({name: "Add", value: "Add"})
    // @SlashChoice({name: "Modify", value: "Modify"})
    // @SlashChoice({name: "Delete", value: "Delete"})
    // @SlashOption("operation", {description: "Add, modify or delete a screnner."})
    // operation: string,

    @SlashOption("name", {description: "Name of the screener."})
    name: string,

    @SlashChoice({name: "SMA20", value:"SMA20"})
    @SlashChoice({name: "SMA50", value:"SMA50"})
    @SlashChoice({name: "SMA100", value:"SMA100"})
    @SlashChoice({name: "RSI", value:"RSI"})
    @SlashChoice({name: "change", value: "change"})
    @SlashOption("attribute", {description: "Screener attribute."})
    attribute: string,

    @SlashChoice({name: "Greater Than", value: ">"})
    @SlashChoice({name: "Greater Than or Equal", value: ">="})
    @SlashChoice({name: "Equal", value: ">="})
    @SlashChoice({name: "Less Than or Equal", value: "<="})
    @SlashChoice({name: "Less Than", value: "<"})
    @SlashChoice({name: "Crosses Above", value: "Crosses Above"})
    @SlashChoice({name: "Crosses Below", value: "Crosses Below"})
    @SlashOption("matcher", {description: "matcher"})
    matcher: string,

    @SlashOption("value", {description: "Screener attribute value. <Any Number | SMA20 | SMA50 | SMA100>"})
    value: string | "SMA20" | "SMA50" | "SMA100",
    
    @SlashChoice({name: "15m", value: "15"})
    @SlashChoice({name: "30m", value: "30"})
    @SlashChoice({name: "1h", value: "60"})
    @SlashChoice({name: "1D", value: "1D" })
    @SlashOption("timeframe", {description: "Screener timeframe."})
    timeframe: string,

    @SlashChoice({name: "10s", value: 10 * 1000})
    @SlashChoice({name: "2m", value: 120 * 1000})
    @SlashChoice({name: "5m", value: 300 * 1000})
    @SlashChoice({name: "15m", value: 900 * 1000})
    @SlashOption("interval", {description: "Interval at which data is acquired."})
    interval: number,

    interaction: CommandInteraction
  ): Promise<void> {
    let timeframeText = Object.keys(timeframeValue).find(
      key => timeframeValue[key] === timeframe
    );
    name = interaction.channel?.id + "." + name;
    let screener = this.screeners.find(
      obj => obj.name === name
    )
    if(screener) {
      await interaction.reply(`${name} is already used.`);
      return
    }
    log.info(`Adding new screener ${name} where ${attribute} is ${matcher} ${value} at ${timeframeText} timeframe every ${interval}ms`);
    let left = `${attribute}${timeframe==="1D"?"":"|" + timeframe}`;
    let right = value.includes("SMA")?`${value}${timeframe==="1D"?"":"|" + timeframe}`: parseFloat(value);
    
    let matchOperation = matcherOperator[matcher];

    let newRequest:any ={
      filter: [
        {
          left: "exchange",
          operation: "equal",
          right: "BINANCE"
        },
        {
          left: "name,description",
          operation: "match",
          right: "usdtperp"
        }
      ],
      options: {
        lang: "en"
      },
      markets: [
        "crypto"
      ],
      symbols: {
        query: {
          types: []
        },
        tickers: []
      },
      columns: [
        "name",
        "close"
      ],
      sort: {
        sortBy: "name",
        sortOrder: "desc"
      },
      range: [
        0,
        150
      ]
    }
    newRequest.filter.push({
      left: left,
      operation: matchOperation,
      right: right
    })
    newRequest.sort.sortBy = left;
    newRequest.columns.push(left);
    this.screeners.push({
      name: name,
      request: newRequest,
      interval: interval,
      interaction: interaction,
      screener: await this.setMonitor(name, newRequest, attribute, matcher, timeframe, interval, this.settings.discoveryTimeout)
    })
    await interaction.reply(`Screener added: ${name} - Success.`);
  }

  @Slash("remove-screener")
  async removeScreener (
    @SlashOption("name", {description: "Name of the screener."})
    name: string,
    interaction: CommandInteraction
  ) {
      let screener = this.screeners.find(
        obj => obj.name === name
      )
      if(screener && screener.screener) {
        clearTimeout(screener.screener);
        this.screeners.splice(this.screeners.indexOf(screener))
        log.info(`Screener removed: ${name}`);
      }
      await interaction.reply(`Screener removed: ${name} - Success.`);
  }

  @Slash("show-timeouts")
  async showTimeouts (
    interaction: CommandInteraction
  ) {
    log.info(JSON.stringify(this.timeouts, null, 2));
    await interaction.reply(`Timeouts logged - Success.`)
  }

  @Slash("stop-all")
  async stopAll (
    interaction: CommandInteraction
  ) {
    this.screeners.forEach(
      (scr, index) => {
        if(interaction.channel) {
          if(scr.name.includes(interaction.channel.id)){
            if(scr.screener) {
              clearInterval(scr.screener);
            }
            if(scr.timeout){
              clearTimeout(scr.timeout);
            }
            this.screeners.splice(index);
          }
        }
      }
    )
    await interaction.reply(`All screeners stopped - Success.`)
  }
  
  @Slash("show-screeners", {description: "Show all screeners"})
  async showScreeners (
    interaction: CommandInteraction,
    show?: "last" | "all"
  ) {
    if(show === "last") {
      let scr = this.screeners[this.screeners.length - 1];
      let msg = {
        name: scr.name,
        request: scr.request,
        interval: scr.interval
      }
      log.info(JSON.stringify(msg, null, 2));
      await interaction.channel?.send("```" + JSON.stringify(msg, null, 2) + "```");
    } else {
      let screenerList: screenerType[] = [];
      this.screeners.forEach(
        scr => {
          if(interaction.channel) {
            if(scr.name.includes(interaction?.channel?.id)) {
              screenerList.push({
                name: scr.name,
                request: scr.request,
                interval: scr.interval
              })
            }
          }
        }
      )
      if(screenerList.length > 0) {
        await interaction.reply("Screener List");
        screenerList.forEach(
          async (scr, index)  => {
            let msg = {
              name: scr.name,
              request: scr.request,
              interval: scr.interval
            }
            log.info(JSON.stringify(msg, null, 2))
            await interaction.channel?.send("```#" + (index + 1) + "\n" + JSON.stringify(msg, null, 2) + "```")
          }
        )
      } else {
        interaction.reply("No screeners yet.");
      }
    }
  }

  async setMonitor (
    name: string,
    newRequest: Object, 
    attribute:string, 
    matcher: string,
    timeframe:string, 
    interval:number,
    discoveryTimeout: number): Promise<NodeJS.Timer> {
  
    this.formReply(name,newRequest,attribute,matcher,timeframe,discoveryTimeout);
    return setInterval(
      this.formReply.bind(this),
      interval,
      name,newRequest,attribute,matcher,timeframe,discoveryTimeout
    )
  }

  async formReply (
    name: string,
    newRequest: any, 
    attribute:string, 
    matcher:string,
    timeframe:string, 
    discoveryTimeout: number): Promise<void> {
    let timeframeText = Object.keys(timeframeValue).find(key => timeframeValue[key] === timeframe);
    let fetchResp, resp:any;
    log.info(`Executing screener: ${name}`);
    try {
      log.debug(JSON.stringify(newRequest, null, 2));
      fetchResp = await fetch( 
        `https://scanner.tradingview.com/crypto/scan`,
        {
          body: JSON.stringify(newRequest),
          method: "POST"
        }
      )
      resp = await fetchResp.json();
      for(let i = 0; i < resp.data.length; i++) {
        var data = resp.data[i];
        console.log(data);
        
        var thisScreener = this.screeners.find(
          obj => obj.name === name
        )
        if(!thisScreener) {
          continue
        }
        let percentSign = "";
        if(["change"].includes(attribute)) {
          percentSign = "%";
        }
        var thisDataString = `${data.s}.${name}`;
        if(!this.timeouts.includes(thisDataString)) {
          this.timeouts.push(thisDataString);
          this.screeners[this.screeners.indexOf(thisScreener)].timeout = setTimeout(
            this.deleteTimeout.bind(this),
            discoveryTimeout,
            thisDataString, discoveryTimeout,thisScreener
          );
          let msg = "";
          if(attribute.includes("SMA")) {
            msg = `\`${attribute}\` ${matcher} \`${newRequest.filter[2].right}\` in the past \`${timeframeText}\``;
          } else {
            msg = `\`${attribute}\` reached \`${data.d[2].toPrecision(2)}${percentSign}\` in the past \`${timeframeText}\``;
          }
  
          let hyperlink = `[[TradingView](https://www.tradingview.com/chart?symbol=${data.d[0]})]`;
          log.info(`Sending to ${thisScreener?.interaction?.channel?.id}: ${msg}`);
          let embedMsg: EmbedBuilder = new EmbedBuilder()
                        .setTitle(`:exclamation:${data.d[0]} [$${data.d[1]}]`)
                        .setDescription(msg + "\n" + hyperlink)
                        
          await thisScreener.interaction?.channel?.send({embeds: [embedMsg]});
          log.info(`Adding ${discoveryTimeout}ms timeout for ${thisDataString}`);
        }
      }
    } catch(e) {
      log.error(`Failed to fetch data from trading view: ${e}`);
      return
    }

    
  
  }
  
  async clearTimeouts(
    interaction: CommandInteraction
  ): Promise<void> {
    this.timeouts = [];
    log.info(this.timeouts);
    interaction.reply("Timeouts cleared - Success.")
  }

  async deleteTimeout(dataString:string, discoveryTimeout: number, thisScreener:screenerType): Promise<void> {
    if(thisScreener.timeout) {
      clearTimeout(thisScreener.timeout);
    }

    this.timeouts = this.timeouts.filter((value) => {
      return !value.includes(dataString);
    })
    log.info(`Removing timeout for ${dataString} after ${discoveryTimeout}ms`);
  }
}
