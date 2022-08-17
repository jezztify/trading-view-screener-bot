type tTvScreenerConfig = {
  endpoints: {
    [k:string]:string
  }
}

export const tvScreenerConfig: tTvScreenerConfig = {
  "endpoints": {
    crypto: "https://scanner.tradingview.com/crypto/scan",
    forex: "https://scanner.tradingview.com/forex/scan",
    stocks: "https://scanner.tradingview.com/global/scan"
  }
}