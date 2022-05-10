import { CommandInteraction } from "discord.js";
import { Discord, Slash, SlashChoice, SlashOption } from "discordx";
import fetch from 'node-fetch';

type screenerType = {
  name: string,
  request: JSON,
  interval: number,
  interaction?: CommandInteraction,
  screener?: NodeJS.Timer | undefined
}
let screeners: screenerType[] = [];
let timeouts: string[] = [];

let matcherOperator: {[k:string]:string}= {
  ">": "greater",
  ">=": "egreater",
  "==": "equal",
  "<=": "eless",
  "<": "less"
}

let timeframeValue: {[k:string]:string} = {
  "30m": "30",
  "1h": "60",
  "1D": "1D"
}

@Discord()
class screener {
  settings: {[k: string]: any} = {
    discoveryTimeout: 600000
  }

  @Slash("add-screener", {description: "Screener methods"})
  async addScreener (  
    // @SlashChoice({name: "Add", value: "Add"})
    // @SlashChoice({name: "Modify", value: "Modify"})
    // @SlashChoice({name: "Delete", value: "Delete"})
    // @SlashOption("operation", {description: "Add, modify or delete a screnner."})
    // operation: string,

    @SlashOption("name", {description: "Name of the screener."})
    name: string,
    
    @SlashChoice({name: "RSI", value:"RSI"})
    @SlashChoice({name: "change", value: "change"})
    @SlashOption("attribute", {description: "Screener attribute."})
    attribute: string,

    @SlashChoice({name: "Greater Than", value: ">"})
    @SlashChoice({name: "Greater Than or Equal", value: ">="})
    @SlashChoice({name: "Equal", value: ">="})
    @SlashChoice({name: "Less Than or Equal", value: "<="})
    @SlashChoice({name: "Less Than", value: "<"})
    @SlashOption("matcher", {description: "matcher"})
    matcher: string,

    @SlashOption("value", {description: "Screener attribute value."})
    value: number,
    
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
    let screener = screeners.find(
      obj => obj.name === name
    )
    if(screener) {
      interaction.reply(`${name} is already used.`);
      return
    }
    console.log(`Adding new screener ${name} where ${attribute} is ${matcher} ${value} at ${timeframeText} timeframe] every ${interval}ms`);
    let left = `${attribute}${timeframe==="1D"?"":"|" + timeframe}`;
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
      right: value
    })
    newRequest.sort.sortBy = left;
    newRequest.columns.push(left);
    screeners.push({
      name: name,
      request: newRequest,
      interval: interval,
      interaction: interaction,
      screener: undefined
    })
    await setMonitor(name, interaction, newRequest, attribute, timeframe, matcher, interval, this.settings.discoveryTimeout);
    await this.showScreeners(interaction, "last");
    interaction.channel?.send(`Success.`);
  }

  @Slash("remove-screener")
  async removeScreener (
    @SlashOption("name", {description: "Name of the screener."})
    name: string,
    interaction:CommandInteraction
  ) {
      let screener = screeners.find(
        obj => obj.name === name
      )
      if(screener && screener.screener) {
        clearTimeout(screener.screener);
        screeners.splice(screeners.indexOf(screener))
        console.log(`Screener removed: ${JSON.stringify(screener, null, 2)}`);
      }
      interaction.reply(`Success.`);
  }
  
  @Slash("show-screeners", {description: "Show all screeners"})
  async showScreeners (
    interaction: CommandInteraction,
    show?: "last" | "all"
  ) {
    if(show === "last") {
      let scr = screeners[screeners.length - 1];
      let msg = {
        name: scr.name,
        request: scr.request,
        interval: scr.interval
      }

      interaction.channel?.send("```" + JSON.stringify(msg, null, 2) + "```");
    } else {

      let screenerList: screenerType[] = [];
      screeners.forEach(
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
      if(screenerList) {
        screenerList.forEach(
          (scr, index)  => {
            let msg = {
              name: scr.name,
              request: scr.request,
              interval: scr.interval
            }
            interaction.channel?.send("```#" + (index + 1) + "\n" + JSON.stringify(msg, null, 2) + "```")
          }
        )
        interaction.reply("Screener List");
      } else {
        interaction.reply("No screeners yet.");
      }
    }
  }
}

const setMonitor = async (
  name: string,
  interaction: CommandInteraction,
  newRequest:JSON, 
  attribute:string, 
  timeframe:string, 
  matcher:string,
  interval:number,
  discoveryTimeout: number): Promise<any> => {

  return setTimeout(
    async () => {
      await formReply(name, interaction, newRequest, attribute,timeframe,matcher,interval,discoveryTimeout)
    },
    interval
  )

}


const formReply = async (
  name: string,
  interaction: CommandInteraction,
  newRequest:JSON, 
  attribute:string, 
  timeframe:string, 
  matcher:string,
  interval: number,
  discoveryTimeout: number): Promise<any> => {
  let timeframeText = Object.keys(timeframeValue).find(key => timeframeValue[key] === timeframe);

  let response = await fetch( 
    `https://scanner.tradingview.com/crypto/scan`,
    {
      body: JSON.stringify(newRequest),
      method: 'POST'
    }
  )
  let resp = await response.json();
  console.log(JSON.stringify(resp, null, 2));

  for(let i in resp.data) {
    let data = resp.data[i];
    console.log(data);
    let sign = "";
    let percentSign = "";
    if(["change"].includes(attribute)) {
      percentSign = "%";
    }
    
    let thisScreener = screeners.find(
      obj => obj.name === name
    )
    let thisDataString = thisScreener?.interaction?.channel?.id + "." + data.s;
    if(!timeouts.includes(thisDataString)) {
      await thisScreener?.interaction?.channel?.send(`:exclamation: \`${data.s} ${attribute} reached ${data.d[2].toPrecision(2)}${percentSign} in the past ${timeframeText}\``);
      console.log(`Adding timeout for ${thisDataString}`);
      timeouts.push(thisDataString);
      setTimeout(() => {
        timeouts.splice(timeouts.indexOf(thisDataString));
        console.log(`Removing timeout for ${thisDataString}`);
      }, discoveryTimeout)
    }
  }   

  let screener = screeners.find(
    obj => obj.name === name
  )
  if(screener) {
    let screenerIndex = screeners.indexOf(screener);
    screeners[screenerIndex].screener = setTimeout( async () => {
        await formReply(name, interaction, newRequest, attribute,timeframe,matcher,interval,discoveryTimeout)
      },
      interval
    )
  }
}