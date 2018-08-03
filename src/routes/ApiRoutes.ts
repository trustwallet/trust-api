import  * as express from "express";
import path = require("path");
import { DAppsController } from "../controllers/DAppsController";
import { TokenPriceController } from "../controllers/TokenPriceController";
import { AppCheck } from "../controllers/AppCheck";
import { TokenInfo } from "../controllers/TokenInfo";
import { Redirect } from "../controllers/RedirectController";
import { Tickers } from "../controllers/TickersController";
const router = express.Router();

const dAppsController = new DAppsController();
const priceController = new TokenPriceController();
const appCheck = new AppCheck();
const tokenInfo = new TokenInfo();
const redirect = new Redirect()
const tickers = new Tickers()

// Serve docmentation
router.use("/docs", express.static(path.join(__dirname, "/../../apidoc")))

router.get("/dapps/main", dAppsController.main);
router.get("/dapps/category/:id", dAppsController.byCategoryID);
/**
 * @api {post} /tokenPrices
 * @apiVersion 0.1.0
 * @apiName GetTokenPrices
 * @apiGroup Tokens
 * @apiPermission none
 *
 *
 *
 * @apiExample {curl} Example usage
 * curl -X POST -S -H 'Content-Type: application/json' -d '{"currency":"USD","tokens":[{"contract":"0x1d462414fe14cf489c7a21cac78509f4bf8cd7c0","symbol":"CAN"}]}' -s 'https://public.trustwalletapp.com/tokenPrices'
 *
 * @apiParam {String} currency="USD" For valid fiat currency values refer to https://coinmarketcap.com/api/. Price updates every 5 minutes.
 * @apiParam {Object[]} tokens Token object
 * @apiParam {String} tokens.contract Smart contract address
 * @apiParam {String} tokens.symbol Smart contract symbol
 *
 * @apiParamExample {json} Request-Example:
 * {
 *      "currency": "USD",
 *      "tokens": [
 *          {
 *              "contract": "0x1a0f2ab46ec630f9fd638029027b552afa64b94c",
 *              "symbol": "PIE"
 *          }
 *      ]
 * }
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HTTPS  200 OK
 * {
 *  "status": true,
 *  "response": [
 *      {
 *          "id": "aston",
 *          "name": "Aston",
 *          "symbol": "PIE",
 *          "price": "0.0312211978",
 *          "percent_change_24h": "-9.74",
 *          "contract": "0x1a0f2ab46ec630f9fd638029027b552afa64b94c",
 *          "image": "https://raw.githubusercontent.com/TrustWallet/tokens/master/images/0x1a0f2ab46ec630f9fd638029027b552afa64b94c.png"
 *       }
 *  ]
 * }
 */
router.post("/tokenPrices", priceController.getTokenPrices);
router.get("/appcheck/android", appCheck.android);
// Token info
router.get("/tokeninfo/:networkid/:address?", tokenInfo.getTokenInfo);

// Redirect routes

/**
 * @api {get} /:networkId/transactions
 * @apiVersion 0.1.0
 * @apiName GetTransactions
 * @apiGroup Transactions
 * @apiPermission none
 *
 * @apiParam {Number} networkId Network id, supported networks are: ethereum, classic, poa, callisto
 *
 * @apiParam {String} address Address
 * @apiParam {Number} [startBlock=1] Block number to select transaction from
 * @apiParam {Number} [endBlock=9999999999] Block number to select transaction till
 * @apiParam {Number} [page=1] Number of page
 * @apiParam {Number{25..50}} [limit=25] Limit transactions per page
 * @apiParam {String} [contract] Select address transactions on specific contract
 *
 * @apiExample {curl} Example usage
 *  curl -i https://public.trustwalletapp.com/ethereum/transactions?address=0x1a007089523cc763d8e7c8a2f33429b28cdae5d5
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HTTPS  200 OK
 * {
 *  "docs": [
 *       {
 *          "operations": [],
 *          "contract": null,
 *          "_id": "0xd11ed968bc6be87239ca0478c4c43c83f90fdacfe2c1090fa1627d23af3fa3f9",
 *          "blockNumber": 6030708,
 *          "timeStamp": "1532568764",
 *          "nonce": 38686,
 *          "from": "0xce85247b032f7528ba97396f7b17c76d5d034d2f",
 *          "to": "0x1a007089523cc763d8e7c8a2f33429b28cdae5d5",
 *          "value": "5000000000000000000",
 *          "gas": "150000",
 *          "gasPrice": "180000000000",
 *          "gasUsed": "21004",
 *          "input": "0x00",
 *          "error": "",
 *          "id": "0xd11ed968bc6be87239ca0478c4c43c83f90fdacfe2c1090fa1627d23af3fa3f9",
 *          "coin": 60
 *       }
 *   ]
 * }
 */
router.get(`/:networkId/transactions`, redirect.getTransactions)


/**@api {get} /tokens/list
 * @apiVersion 0.1.0
 * @apiName GetTokensList
 * @apiGroup Tokens
 * @apiPermission none
 *
 *
 * @apiParam {String} query Query to match condition
 * @apiParam {String} networks Comma delimited list of coin index (https://github.com/satoshilabs/slips/blob/master/slip-0044.md): networks=60,61
 * @apiParam {Boolean=true,false} [verified=true] Return only verified (meaning listed on https://coinmarketcap.com/) ERC20 contracts. If specified `false` will return both verified and not verified contracts.
 *
 * @apiExample {curl} Example usage
 *  curl -i https://public.trustwalletapp.com/tokens/list?query=TRX&networks=60
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HTTPS  200 OK
 * {
 *  "docs": [
 *       {
 *          "verified": true,
 *           "enabled": true,
 *           "_id": "5aa590051125720640037236",
 *           "address": "0xf230b790e05390fc8295f4d3f60332c93bed42e2",
 *           "symbol": "TRX",
 *           "decimals": 6,
 *           "totalSupply": "100000000000000000",
 *           "name": "Tronix",
 *           "coin": 60,
 *           "type": "ERC20"
 *       }
 *   ]
 * }
 *
 *
 */
router.get(`/tokens/list`, redirect.getTokensList)

/**
 * @api {post} /tokens
 *
 * @apiVersion 0.1.0
 * @apiName GetTokens
 * @apiGroup Tokens
 * @apiPermission none
 *
 * @apiParam (Request body) {String[]} networkIndex Array of addresses as a string
 *
 * @apiParamexample {json} Request Body Example
 *  {
 *    "60": ["0xac4df82fe37ea2187bc8c011a23d743b4f39019a"],
 *    "178": ["0xf88cf13f77794f15cb48b809c1bbe467fa708807"]
 *  }
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HtTPS 200 OK
 * {
 *  "docs": [
 *       {
 *          "balance": "0",
 *           "contract": {
 *               "contract": "0xf4eced2f682ce333f96f2d8966c613ded8fc95dd",
 *              "address": "0xf4eced2f682ce333f96f2d8966c613ded8fc95dd",
 *               "name": "MistCoin",
 *                "decimals": 2,
 *               "symbol": "MC",
 *               "coin": 60,
 *               "type": "ERC20"
 *           }
 *       },
 *       {
 *          "balance": "0",
 *           "contract": {
 *               "contract": "0x3111c94b9243a8a99d5a867e00609900e437e2c0",
 *              "address": "0x3111c94b9243a8a99d5a867e00609900e437e2c0",
 *               "name": "TEST",
 *               "decimals": 18,
 *               "symbol": "TEST",
 *               "coin": 178,
 *               "type": "ERC20"
 *           }
 *        }
 *   ]
 * }
 *
 *
 */
router.post(`/tokens`, redirect.getAddressAllTokens)

/**@api {get} /assets
 * @apiVersion 0.1.0
 * @apiName GetAddressAssets
 * @apiGroup Assets
 * @apiPermission none
 *
 *
 * @apiParam {String} address Address
 *
 * @apiExample {curl} Example usage
 *  curl -i https://public.trustwalletapp.com/assets?address=0xe47494379c1d48ee73454c251a6395fdd4f9eb43
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HTTPS  200 OK
 * {
 *   "docs": [
 *      {
 *          "name": "CryptoKitties",
 *          "id": "0x06012c8cf97bead5deae237070f9587f8e7a266d",
 *          "items": [
 *              {
 *                   "token_id": "511939",
 *                   "contract_address": "0x06012c8cf97bead5deae237070f9587f8e7a266d",
 *                  "category": "CryptoKitties",
 *                   "image_url": "https://s3.us-east-2.amazonaws.com/trustwallet/0x06012c8cf97bead5deae237070f9587f8e7a266d-511939.png",
 *                  "name": "CryptoKitty #511939",
 *                   "external_link": "https://www.cryptokitties.co/kitty/511939",
 *                  "description": "Top o' the muffin to ya! I'm Kitty #511939. I've never told anyone this, but I once meowed for a dog. In my last job, I batted my paw at my manager. Needless to say I was looking for work soon after. It's pawesome to meet you!"
 *               }
 *           ]
 *       }
 *   ]
 * }
 *
 *
 */
router.get(`/assets`, redirect.getAssets)

/**
 * @api {post} /notifications/register
 *
 * @apiVersion 0.1.0
 * @apiName RegisterDevice
 * @apiGroup Notifications
 * @apiPermission none
 *
 * @apiParam (Request body) {String} deviceID Unique device id
 * @apiParam (Request body) {String} token Token generated by device
 * @apiParam (Request body) {Object=60,61,178,820} netwoks List of key and value, where key is
 * coin type (https://github.com/satoshilabs/slips/blob/master/slip-0044.md), and value array
 * of addresses
 * @apiParam (Request body) {String="ios","android"} type Device type
 *
 *
 * @apiParamexample {json} Request Body Example for regestering iOS device
 * {
 *      "deviceID": "B14BD907-324A-4A40-98A1-A255C26D2BE52",
 *      "token": "4a47fc7f78f55e2d9932abd7bb7259364356affeaa3aa28efc73f9955e9233e2",
 *      "networks": {
 * 	        "60": ["0x33923a7888c0b885768b3ed578f4d443b17182ee"]
 *      },
 *      "type": "ios"
 * }
 *
 * @apiParamexample {json} Request Body Example for regestering Android device
 * {
 *      "token": "4a47fc7f78f55e2d9932abd7bb7259364356affeaa3aa28efc73f9955e9233e2",
 *      "networks": {
 * 	        "60": ["0x33923a7888c0b885768b3ed578f4d443b17182ee"]
 *      },
 *      "type": "android"
 * }
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HTTPS 200 OK
 *
 *
 *
 */
router.post(`/notifications/register`, redirect.register)

/**
 * @api {post} /notifications/unregister
 *
 * @apiVersion 0.1.0
 * @apiName UnregisterDevice
 * @apiGroup Notifications
 * @apiPermission none
 *
 * @apiParam (Request body) {String} deviceID Unique device id
 * @apiParam (Request body) {String} token Token generated by device
 * @apiParam (Request body) {String="ios","android"} type Device type
 * @apiParam (Request body) {Number[]} networks="[]" Array of network indexes (https://github.com/satoshilabs/slips/blob/master/slip-0044.md)
 * If specified empty array, unsubscribe will happen on all supported networks
 *
 * @apiParamexample {json} Request Body Example for unsubscribe iOS device
 * {
 *      "deviceID": "B14BD907-324A-4A40-98A1-A255C26D2BE52",
 *      "networks": []
 * }
 *
 * @apiParamexample {json} Request Body Example for unsubscribe Android device
 * {
 *      "token": "4a47fc7f78f55e2d9932abd7bb7259364356affeaa3aa28efc73f9955e9233e2",
 *      "networks": []
 *      "type": "android"
 * }
 *
 * @apiSuccessExample {json} Sucess-Response:
 *      HTTPS 200 OK
 *
 *
 *
 */
router.post(`/notifications/unregister`, redirect.unregister)

/**
 * @api {get} /tickers
 *
 * @apiVersion 0.1.0
 * @apiName GetTickers
 * @apiGroup Market
 * @apiPermission none
 *
 * @apiParam {String="AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR", "USD"} currency=USD Coin value in curreny. Supported currency
 *
 * @apiExample {curl} Example usage
 * https://public.trustwalletapp.com/tickers?currency=USD
 *
 * @apiSuccessExample {json} Sucess-Response:
 *  HTTPS  200 OK
 *  {
 *      "status": true,
 *      "currency": "EUR",
 *      "docs": [
 *          {
 *           "website_slug": "bitcoin",
 *           "last_updated": 1533239327,
 *           "percent_change_7d": -6.85,
 *           "percent_change_24h": -0.07,
 *           "percent_change_1h": 0.38,
 *           "market_cap": 7109455615213.157,
 *           "volume_24h": 247847316304.44513,
 *           "price": 413674.14790895366,
 *           "total_supply": 939532504.2292902,
 *           "circulating_supply": 939532504.2292902,
 *           "rank": 1,
 *           "symbol": "BTC",
 *          "name": "Bitcoin",
 *           "id": 1
 *          }
 *      ]
 *  }
 *
 */

 router.get(`/tickers`, tickers.getTickers)


export {
    router
};