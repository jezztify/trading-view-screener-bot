import {TvScreenerService} from "../../../src/services/tradingViewScreenerService";
import {tScreenerParameters} from "../../../src/types/screeners";
import {tvScreenerConfig} from "../../../src/config/tvScreenerConfig";
import fetch, {Response} from "node-fetch";
/**
 * Mocks
 */
jest.mock("node-fetch");

/**
 * Main Test
 */
describe("TV Screener Service Class", () => {
  // Variables
  const mockedParameters: tScreenerParameters = {
    name: "test screener",
    filters: [],
    market: "crypto",
    attribute: "RSI",
    matcher: "==",
    timeframe: "15",
    value: "70",
    interval: 10000
  }
  const mockedResponse = {
    "totalCount": 4,
    "data": [
      {
        "s": "BINANCE:DARUSDTPERP",
        "d": [
          "DARUSDTPERP",
          0.41,
          30.87412827
        ]
      }
    ]
  }

  // Subject Under Test
  const sut = new TvScreenerService(mockedParameters);

  it("should store the passed parameters into a parameters class variable", () => {
    expect(sut.parameters).toBe(mockedParameters);
  })

  it("should process the parameters into a request and store it into a request class variable", () => {
    let expectedRequest = {
      filter: [ 
        {
          left: "RSI|15",
          operation: "equal",
          right: 70 
        } 
      ],
      markets: [ 
        "crypto" 
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
        "close", 
        "RSI|15" 
      ],
      sort: { 
        sortBy: "RSI|15", 
        sortOrder: "desc" 
      },
      range: [ 0, 150 ]
    };
    expect(sut.request).toStrictEqual(expectedRequest);
  })

  it("should be able to fetch data and store the 'data' part in responseData class variable", async () => {
    const mockedFetch = async () => {
      const res:Response = new Response();
      res.json = jest.fn().mockReturnValue(JSON.stringify(mockedResponse))
      return res
    }
    jest.mocked(fetch).mockImplementationOnce(mockedFetch);
    await sut.fetchData();
    expect(sut.responseData).toStrictEqual(mockedResponse.data);
  })

  it("should be able to fetch data and throw an error if it encounters a problem", async () => {
    let expectedEndpoint = tvScreenerConfig.endpoints[mockedParameters.market];
    let expectedErrorMsg = "MOCKED ERROR"
    const mockedError = async () => {
      throw new Error(expectedErrorMsg);
    }
    jest.mocked(fetch).mockImplementationOnce(mockedError);
   
    try {
      await sut.fetchData();
    } catch(e) {
      let expectedError = `An error occurred while fetching data from ${expectedEndpoint}: Error: ${expectedErrorMsg}`;
      expect(e).toStrictEqual(new Error(expectedError));
    }
  })

})
