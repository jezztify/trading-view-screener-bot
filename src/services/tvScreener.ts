import { tMatcherTypes, tScreenerParameters, tScreenerRequest } from "@screener-types/screeners"
import fetch from "node-fetch";

interface iTvScreener {
  parameters: tScreenerParameters;
  request: tScreenerRequest;
  formRequest(parameters: tScreenerParameters): tScreenerRequest;
  fetchData(): Promise<JSON>;
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

class TvScreener implements iTvScreener {
  parameters: tScreenerParameters;
  request: tScreenerRequest;

  constructor(parameters: tScreenerParameters) {
    this.parameters = parameters;
    this.request = this.formRequest(
      parameters
    );
  }

  formRequest = (parameters: tScreenerParameters): tScreenerRequest => {
    let request:tScreenerRequest = {
      filter: [],
      markets: [
        parameters.market
      ],
      options: {
        lang: "en"
      },
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
        0,150
      ]
    };
    
    // filters
    if(parameters.filters) {
      request.filter = [...parameters.filters]
    }
    
    let left = `${parameters.attribute}${parameters.timeframe==="1D"?"":"|" + parameters.timeframe}`;
    let right = parameters.value.includes("SMA")?`${parameters.value}${parameters.timeframe==="1D"?"":"|" + parameters.timeframe}`: parseFloat(parameters.value);
    let matchOperation = matcherOperator[parameters.matcher];
    request.filter.push({
      left: left,
      operation: matchOperation,
      right: right
    })
    request.sort.sortBy = left;
    request.columns.push(left);
    

    return request
  }

  fetchData = () => {
    
  }
}

export {
  TvScreener
}