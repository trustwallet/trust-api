import { Request, Response } from "express";
import { sendJSONresponse } from "../common/Utils";
import * as winston from "winston";
import * as BluebirbPromise from "bluebird";
import { IToken, IPrice, ICurrency } from "./Interfaces/ITokenPriceController";
import { contracts } from "../common/tokens/contracts";

const CoinMarketCap = require("coinmarketcap-api");

export class TokenPriceController {
    private client = new CoinMarketCap();
    private refreshLimit: number = 600
    private lastestCoefficients: {[key: string]: number} = {}
    private coefficientUpdated: {[key: string]: number} = {}
    private latestUSDPrices: IPrice[] = []
    private isUpdating: {[key: string]: boolean} = {}
    private githubImageURL: string = "https://raw.githubusercontent.com/TrustWallet/tokens/master/images/";

    getTokenPrices = (req: Request, res: Response) => {
        const supportedCurrency: string[] = ["AUD", "BRL", "CAD", "CHF", "CLP", "CNY", "CZK", "DKK", "EUR", "GBP", "HKD", "HUF", "IDR", "ILS", "INR", "JPY", "KRW", "MXN", "MYR", "NOK", "NZD", "PHP", "PKR", "PLN", "RUB", "SEK", "SGD", "THB", "TRY", "TWD", "ZAR", "USD"]
        const currency: string = supportedCurrency.indexOf(req.body.currency.toUpperCase()) == -1 ? "USD" : req.body.currency.toUpperCase();
        const tokens = req.body.tokens;

        this.getRemotePrices(currency).then((prices: any) => {
            sendJSONresponse(res, 200, {
                status: true,
                response: this.filterTokenPrices(prices, tokens, currency),
            })
        }).catch((error: Error) => {
            sendJSONresponse(res, 500, {
                status: 500,
                error,
            });
        });
    }

    private filterTokenPrices(prices: any[], tokens: IToken[], currency: string): any {
        const coefficient: number = prices[1]
        const altContract: string = "0x0000000000000000000000000000000000000000"; // ETH, EHC, POA, CLO
        const pricesMap: IPrice[] = prices[0].reduce((map: any, ticker: any) => {
            map[ticker["website_slug"]] = ticker;
            return map;
        }, {});

        const altValues = {
            "ETH": "ethereum",
            "ETC": "ethereum-classic",
            "POA": "poa-network",
            "CLO": "callisto-network"
        }

        return tokens.map((token: IToken) => {
            const contract: string = token.contract.toLowerCase()
            const symbol: string = token.symbol.toUpperCase()

            if (contract === altContract && altValues.hasOwnProperty(symbol)) {
                const slug = altValues[token.symbol];
                const tokenPrice: IPrice = pricesMap[slug];
                const currencyPrice: any = tokenPrice.quotes.USD
                const price: string = (currencyPrice.price / coefficient).toString()
                const percent_change_24h: string = (currencyPrice.percent_change_24h / coefficient).toString() || "0"

                return {
                    id: tokenPrice["website_slug"],
                    name: tokenPrice.name,
                    symbol,
                    price,
                    percent_change_24h,
                    contract,
                    image: this.getImageUrl(token.contract),
                }
            } else if (contracts.hasOwnProperty(contract)) {
                const slug = contracts[contract].id;
                const tokenPrice: any = pricesMap[slug] || {};
                const currencyPrice = tokenPrice.quotes.USD
                const price: string = (currencyPrice.price / coefficient).toString() || ""
                const percent_change_24h: string = currencyPrice.percent_change_24h ? (currencyPrice.percent_change_24h / coefficient).toString() : "0"

                return {
                    id: tokenPrice["website_slug"] || "",
                    name: tokenPrice.name || "",
                    symbol: token.symbol || "",
                    price,
                    percent_change_24h,
                    contract,
                    image: this.getImageUrl(contract),
                }
            } else {
                return {
                    id: "",
                    name: "",
                    symbol,
                    price: "0",
                    percent_change_24h: "0",
                    contract,
                    image: this.getImageUrl(contract),
                }
             }
        })
    }

    private getImageUrl(contract: string): string {
        return `${this.githubImageURL}${contract.toLowerCase()}.png`;
    }

    private async updateUSDPrices() {
        winston.info(`Updating USD prices ... `)
        try {
            this.isUpdating.USD = true
            const prices: any = await this.getAllTokensPricesInUSD().timeout(6000);
            this.latestUSDPrices = prices.data
            this.lastestCoefficients.USD = 1
            this.coefficientUpdated.USD = Date.now()
            this.isUpdating.USD = false
        } catch (error) {
            winston.error(`Error updating USD prices`, error)
        }
    }

    private async updateCoefficietns(currency: string) {
        winston.info(`Updating coefficient for currency`, currency)
        try {
            this.isUpdating[currency] = true
            this.lastestCoefficients[currency] = await this.getCoefficient(currency)
            this.coefficientUpdated[currency] = Date.now()
            this.isUpdating[currency] = false
        } catch (error) {
            winston.error(`Error updating coefficient for currency ${currency}`, error)
        }
    }

    private isUSDUpdated(): boolean {
        const lastUpdatedTime: number = this.coefficientUpdated.USD || 0
        const difference: number = (Date.now() - lastUpdatedTime) / 1000
        const isUpdating: boolean = this.isUpdating.USD || false
        return !(difference >= this.refreshLimit) && !isUpdating
    }

    private isCoefficientUpdated(currency: string): boolean {
        const lastUpdatedTime: number = this.coefficientUpdated[currency] || 0
        const difference: number = Math.floor((lastUpdatedTime - this.coefficientUpdated.USD) / 1000)
        const isUpdating: boolean = this.isUpdating[currency] || false
        return Number.isInteger(difference) && Math.abs(difference) <= this.refreshLimit && !isUpdating
    }

    private async getRemotePrices(currency: string): Promise<[IPrice[], number]> {
        try {
            if (this.isUSDUpdated()) {
                if (currency === "USD" ) return [this.latestUSDPrices, 1]

                if (this.isCoefficientUpdated(currency)) {
                    return [this.latestUSDPrices, this.lastestCoefficients[currency]]
                }

                await this.updateCoefficietns(currency)
                return this.getRemotePrices(currency)
            } else {
                await this.updateUSDPrices()
                return this.getRemotePrices(currency)
            }
        } catch (error) {
            winston.error(`Error getRemotePrices `, error)
            Promise.reject(error)
        }

    }

    private getAllTokensPricesInUSD() {
        return new BluebirbPromise((resolve, reject) => {
            this.client.getTicker({limit: 0, structure: "array"}).then((prices: any) => {
                resolve(prices);
            }).catch((error: Error) => {
                reject(error);
            });
        });
    }

    private async getCoefficient(currency: string): Promise<number> {
        try {
            const prices = await this.client.getTicker({limit: 1, convert: currency, structure: "array"})
                const quotes: ICurrency = prices.data[0].quotes
                const coefficient: number = quotes.USD.price / quotes[currency].price
                return coefficient
        } catch (error) {
            Promise.reject(`Error getting coefficient for currecny "${currency}" ${error}`)
        }
    }
}
