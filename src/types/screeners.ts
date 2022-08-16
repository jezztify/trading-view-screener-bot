import { markets } from "./markets"; "@screener-types/markets"

type tScreenerParameters = {
  name: string;
  market: markets;
  attribute: "SMA20" | "SMA50" | "SMA100" | "RSI" | "change";
  matcher: ">" | ">=" | "=" | "<" | "<=" | "Crosses Above" | "Crosses Below" | "equal" | "match";
  value: string;
  timeframe: "15" | "30" | "60" | "1D";
  interval: 10000 | 120000 | 300000 | 900000;
  filters?: tScreenerRequestFilter[]
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
  markets: markets[];
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
export { 
  tScreenerParameters,
  tScreenerRequest,
  tMatcherTypes
}