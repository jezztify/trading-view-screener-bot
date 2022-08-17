import { tvScreenerConfig } from "@screener-config/tvScreenerConfig";
import { tScreenerResponseData, tScreenerParameters, tScreenerRequest } from "@screener-types/screeners"
import fetch from "node-fetch";



interface iTvScreener {
  parameters: tScreenerParameters;
  request: tScreenerRequest;
  responseData: tScreenerResponseData;
  formRequest(parameters: tScreenerParameters): tScreenerRequest;
  fetchData(): Promise<void>;
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
  responseData: tScreenerResponseData;

  /**
   * TODO: Add Logger object injection
   */
  constructor(parameters: tScreenerParameters) {
    this.responseData = null;
    this.parameters = parameters;
    this.request = this.formRequest(
      parameters
    );
  }

  formRequest = (parameters: tScreenerParameters): tScreenerRequest => {
    // Initialize request body
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
    
    // Insert filters
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
    
    // Update sorting
    request.sort.sortBy = left;
    
    // Insert additional expected columns
    request.columns.push(left);  


    return request
  }

  fetchData = async () => {
    // Get Webservice Endpoint
    let endpointType = "global";
    if(this.parameters.market === "forex" || this.parameters.market === "crypto") {
      endpointType = this.parameters.market;
    }
    let endpoint = tvScreenerConfig.endpoints[endpointType];
    
    // Fetch data
    try {
      let fetchResp = await fetch(
        endpoint,
        {
          body: JSON.stringify(this.request),
          method: "POST"
        }
      );
      let resp = JSON.parse(await fetchResp.json());
      if(resp.totalCount > 0) {
        this.responseData = resp.data;
      }

    } catch(e){
      throw new Error(`An error occurred while fetching data from ${endpoint}: ${e}`);
    }

  }
}

export {
  TvScreener
}