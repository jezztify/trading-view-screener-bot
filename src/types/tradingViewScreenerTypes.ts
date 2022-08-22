import { DiscordService } from "@screener-services/discordService";
import { TradingViewScreenerService } from "@screener-services/tradingViewScreenerService";
import { Logger } from "log4js";

type tMarkets = "crypto" |
                      "forex" |
                      "america" |
                      "uk" |
                      "india" |
                      "spain" |
                      "russia" |
                      "australia" |
                      "brazil" |
                      "japan" |
                      "newzealand" |
                      "turkey" |
                      "switzerland" |
                      "hongkong" |
                      "taiwan" |
                      "netherlands" |
                      "belgium" |
                      "portugal" |
                      "france" |
                      "mexico" |
                      "canada" |
                      "colombia" |
                      "uae" |
                      "nigeria" |
                      "singapore" |
                      "germany" |
                      "peru" |
                      "poland" |
                      "italy" |
                      "argentina" |
                      "israel" |
                      "egypt" |
                      "serbia" |
                      "chile" |
                      "china" |
                      "malaysia" |
                      "ksa" |
                      "bahrain" |
                      "qatar" |
                      "indonesia" |
                      "finland" |
                      "iceland" |
                      "denmark" |
                      "romania" |
                      "hungary" |
                      "sweden" |
                      "slovakia" |
                      "lithuania" |
                      "luxembourg" |
                      "estonia" |
                      "latvia" |
                      "vietnam" |
                      "rsa" |
                      "thailand" |
                      "korea" |
                      "norway" |
                      "philippines" |
                      "greece" |
                      "venezuela";
                      
type tTradingViewScreenerParameters = {
  name: string;
  market: tMarkets;
  attribute: "SMA20" | "SMA50" | "SMA100" | "RSI" | "change";
  matcher: ">" | ">=" | "==" | "<" | "<=" | "Crosses Above" | "Crosses Below" | "equal" | "match";
  value: string;
  timeframe: "15" | "30" | "60" | "1D";
  interval: 10000 | 120000 | 300000 | 900000;
  filters: tScreenerRequestFilter[]
}

type tScreenerRequestFilter = {
  left: string;
  operation: string;
  right: string | number
}

type tScreenerRequest = {
  filter: tScreenerRequestFilter[];
  options: {
    lang: "en"
  };
  markets: tMarkets[];
  symbols: {
    query: {
      types: []
    },
    tickers: []
  },
  columns: string[],
  sort: {
    sortBy: string,
    sortOrder: string
  },
  range: [
    0,
    150
  ]
}

type tScreenerResponseData = {
  s: string;
  d: [
    string,
    number,
    number
  ]
}

type tScreener = {
  discordService: DiscordService,
  tradingViewScreenerService: TradingViewScreenerService,
  logging: Logger
}

export { 
  tTradingViewScreenerParameters,
  tScreenerRequest,
  tScreenerResponseData,
  tMarkets,
  tScreener
}